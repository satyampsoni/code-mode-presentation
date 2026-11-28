import { Injectable } from "@nitrostack/core";
import { airportCode, airports } from "./dataset.js";
import {
  AIRLINE_SQL,
  analyzeFares,
  LATEST_OFFERS_SQL,
  OFFER_SQL,
  queryWarehouse,
} from "./exasol.js";
import { DATASET_VERSION } from "./dataset.js";
export interface Input {
  from?: string;
  to?: string;
  maxPrice?: number;
  flightId?: string;
  flightIds?: string[];
  airlineCode?: string;
  airportCode?: string;
  referenceId?: string;
  locale?: string;
  availableOnly?: boolean;
  historyMonths?: number;
}
@Injectable()
export class TravelService {
  async invoke(name: string, input: Input): Promise<unknown> {
    if (name === "search_flights") {
      const origin = airportCode(input.from || "BLR");
      const destination = airportCode(input.to || "SYD");
      if (input.historyMonths)
        return analyzeFares(origin, destination, input.historyMonths);
      const rows = (await queryWarehouse(LATEST_OFFERS_SQL, [
        origin,
        destination,
        input.maxPrice ?? null,
        input.maxPrice ?? null,
        input.availableOnly === false ? 0 : 1,
      ])) as Offer[];
      return {
        sampleData: true,
        dataset: DATASET_VERSION,
        flights: rows.map(({ checkedKg: _checkedKg, ...flight }) => flight),
      };
    }
    if (name === "get_flight_details") return offerById(input.flightId!);
    if (name === "compare_fares") {
      const offers = await Promise.all(input.flightIds!.map(offerById));
      return {
        sampleData: true,
        currency: "INR",
        flights: offers
          .sort((a, b) => a.price - b.price)
          .map((flight) => ({
            flightId: flight.id,
            price: flight.price,
            seats: flight.seats,
          })),
      };
    }
    if (name === "get_baggage_policy") {
      const flight = await offerById(input.flightId!);
      return {
        sampleData: true,
        flightId: flight.id,
        checkedKg: flight.checkedKg,
        cabinKg: 7,
        includedInFare: true,
      };
    }
    if (name === "check_availability") {
      const flight = await offerById(input.flightId!);
      return {
        sampleData: true,
        flightId: flight.id,
        available: flight.seats > 0,
        seats: flight.seats,
      };
    }
    if (name === "get_airline_details") {
      const code = input.airlineCode?.trim().toUpperCase();
      const rows = (await queryWarehouse(AIRLINE_SQL, [code])) as {
        airline: string;
        airlineCode: string;
      }[];
      const airline = rows[0];
      if (!airline) throw new Error("Unknown sample airline");
      return {
        sampleData: true,
        code: airline.airlineCode,
        name: airline.airline,
        cabin: "Economy",
        support: "Sample support directory",
      };
    }
    if (name === "get_airport_details") {
      const code = airportCode(input.airportCode!);
      if (!airports[code]) throw new Error("Unknown sample airport");
      return { sampleData: true, code, ...airports[code] };
    }
    if (name === "get_cancellation_policy") {
      const flight = await offerById(input.flightId!);
      return {
        sampleData: true,
        flightId: flight.id,
        currency: "INR",
        fee: 3500,
        allowedBeforeDepartureHours: 24,
      };
    }
    if (name === "get_refund_policy") {
      const flight = await offerById(input.flightId!);
      return {
        sampleData: true,
        flightId: flight.id,
        refundable: true,
        processingBusinessDays: 7,
        feeINR: 3500,
      };
    }
    if (name === "get_layover_details") {
      const flight = await offerById(input.flightId!);
      return {
        sampleData: true,
        flightId: flight.id,
        stops: flight.via ? [{ airport: flight.via, durationMinutes: 120 }] : [],
      };
    }
    const [, domain, region, facet] = name.split("__");
    return {
      sampleData: true,
      dataset: DATASET_VERSION,
      domain,
      region,
      facet,
      referenceId: input.referenceId || "standard",
      locale: input.locale || "en-IN",
      records: [
        {
          id: `${domain}-${region}-standard`,
          category: domain,
          region,
          policy: facet,
          title: `${region} ${domain} ${facet} reference`,
          description:
            "Deterministic read-only conference reference entry; verify with a real provider before travel.",
          currency: "INR",
          serviceWindowHours: 24,
        },
      ],
      total: 1,
    };
  }
}

interface Offer {
  id: string;
  airline: string;
  airlineCode: string;
  price: number;
  seats: number;
  from: string;
  to: string;
  via: string | null;
  durationMinutes: number;
  currency: string;
  checkedKg: number;
  available: boolean;
}

async function offerById(id: string) {
  const rows = (await queryWarehouse(OFFER_SQL, [id])) as Offer[];
  const flight = rows[0];
  if (!flight) throw new Error(`Unknown sample flight: ${id}`);
  return flight;
}
