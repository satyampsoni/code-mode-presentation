import { Injectable } from "@nitrostack/core";
import {
  airports,
  airportCode,
  DATASET_VERSION,
  flightById,
  flights,
} from "./dataset.js";
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
}
@Injectable()
export class TravelService {
  async invoke(name: string, input: Input): Promise<unknown> {
    if (name === "search_flights")
      return {
        sampleData: true,
        dataset: DATASET_VERSION,
        flights: flights
          .filter(
            (f) =>
              f.from === airportCode(input.from || "BLR") &&
              f.to === airportCode(input.to || "SYD") &&
              (!input.maxPrice || f.price < input.maxPrice) &&
              (input.availableOnly === false || f.seats > 0),
          )
          .sort((a,b)=>a.price-b.price)
          .map(({ checkedKg, ...f }) => ({...f,available:f.seats>0})),
      };
    if (name === "get_flight_details") return flightById(input.flightId!);
    if (name === "compare_fares")
      return {
        sampleData: true,
        currency: "INR",
        flights: input
          .flightIds!.map(flightById)
          .sort((a, b) => a.price - b.price)
          .map((f) => ({ flightId: f.id, price: f.price, seats: f.seats })),
      };
    if (name === "get_baggage_policy") {
      const f = flightById(input.flightId!);
      return {
        sampleData: true,
        flightId: f.id,
        checkedKg: f.checkedKg,
        cabinKg: 7,
        includedInFare: true,
      };
    }
    if (name === "check_availability") {
      const f = flightById(input.flightId!);
      return {
        sampleData: true,
        flightId: f.id,
        available: f.seats > 0,
        seats: f.seats,
      };
    }
    if (name === "get_airline_details") {
      const f = flights.find((f) => f.airlineCode === input.airlineCode);
      if (!f) throw new Error("Unknown sample airline");
      return {
        sampleData: true,
        code: f.airlineCode,
        name: f.airline,
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
      const f = flightById(input.flightId!);
      return {
        sampleData: true,
        flightId: f.id,
        currency: "INR",
        fee: 3500,
        allowedBeforeDepartureHours: 24,
      };
    }
    if (name === "get_refund_policy") {
      const f = flightById(input.flightId!);
      return {
        sampleData: true,
        flightId: f.id,
        refundable: true,
        processingBusinessDays: 7,
        feeINR: 3500,
      };
    }
    if (name === "get_layover_details") {
      const f = flightById(input.flightId!);
      return {
        sampleData: true,
        flightId: f.id,
        stops: f.via ? [{ airport: f.via, durationMinutes: 120 }] : [],
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
