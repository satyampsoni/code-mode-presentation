import {
  ControllerDecorator as Controller,
  ToolDecorator as Tool,
  z,
  type ExecutionContext,
} from "@nitrostack/core";
import { randomUUID } from "node:crypto";
import { TravelService, type Input } from "./travel.service.js";
const flightInput = z.object({
  flightId: z.string().describe("Sample flight ID returned by search_flights"),
});
export const definitions: {
  name: string;
  description: string;
  inputSchema: z.ZodTypeAny;
}[] = [
  {
    name: "search_flights",
    description:
      "Search sample flights by origin and destination (IATA or city). Returns an object {sampleData, dataset, flights: [{id, airline, airlineCode, price, seats, from, to, via, durationMinutes, currency}]}. Use result.flights; flight identifier is id. Results are sorted by price ascending and exclude sold-out flights by default; availableOnly:false includes them. Baggage must be looked up separately. Sample data, not live availability.",
    inputSchema: z.object({
      from: z.string().describe("Origin IATA or city, e.g. BLR or Bengaluru"),
      to: z.string().describe("Destination IATA or city, e.g. SYD or Sydney"),
      maxPrice: z
        .number()
        .positive()
        .optional()
        .describe("Exclusive upper price bound in INR"),
      availableOnly: z.boolean().default(true).describe("Return only flights with seats by default; false includes sold-out fixtures"),
    }),
  },
  {
    name: "get_flight_details",
    description:
      "Read complete details for one sample flight including its itinerary and baggage allowance.",
    inputSchema: flightInput,
  },
  {
    name: "compare_fares",
    description:
      "Compare and sort the total INR prices of specified sample flight IDs.",
    inputSchema: z.object({ flightIds: z.array(z.string()).min(1).max(30) }),
  },
  {
    name: "get_baggage_policy",
    description:
      "Look up included checked baggage kilograms and cabin baggage for a sample flight ID. Returns {sampleData, flightId, checkedKg, cabinKg, includedInFare}.",
    inputSchema: flightInput,
  },
  {
    name: "check_availability",
    description:
      "Read available sample seats and availability for one flight ID.",
    inputSchema: flightInput,
  },
  {
    name: "get_airline_details",
    description:
      "Read the sample airline directory by carrier IATA code, e.g. AI, MH, TG or SQ.",
    inputSchema: z.object({ airlineCode: z.string() }),
  },
  {
    name: "get_airport_details",
    description: "Read the sample airport directory by IATA or city name.",
    inputSchema: z.object({ airportCode: z.string() }),
  },
  {
    name: "get_cancellation_policy",
    description: "Read sample cancellation rules and fees for a flight ID.",
    inputSchema: flightInput,
  },
  {
    name: "get_refund_policy",
    description:
      "Read sample refund eligibility, fees and processing days for a flight ID.",
    inputSchema: flightInput,
  },
  {
    name: "get_layover_details",
    description:
      "Read sample stopover airports and connection durations for a flight ID.",
    inputSchema: flightInput,
  },
];
export const catalogSize = Number(process.env.TRAVEL_CATALOG_SIZE || 10);
if (![10, 100, 1000].includes(catalogSize))
  throw new Error("TRAVEL_CATALOG_SIZE must be 10, 100 or 1000");
const domains = [
  "hotel",
  "rail",
  "car_rental",
  "insurance",
  "visa",
  "cruise",
  "ferry",
  "tour",
  "loyalty",
  "transfer",
  "accessibility",
];
const regions = [
  "india",
  "australia",
  "singapore",
  "malaysia",
  "thailand",
  "japan",
  "uk",
  "france",
  "uae",
  "usa",
];
const facets = [
  "eligibility",
  "fees",
  "cancellation",
  "refund",
  "amenities",
  "availability",
  "documents",
  "support",
  "restrictions",
];
for (const domain of domains)
  for (const region of regions)
    for (const facet of facets) {
      if (definitions.length >= catalogSize) break;
      definitions.push({
        name: `reference__${domain}__${region}__${facet}`,
        description: `Read ${facet} reference records for ${domain.replaceAll("_", " ")} in ${region}. Local sample ${domain} policy directory. Accepts a reference ID and locale; returns deterministic reference records with region, category and policy. Not airline flight search or flight baggage.`,
        inputSchema: z.object({
          referenceId: z
            .string()
            .optional()
            .describe("Reference identifier, defaults to standard"),
          locale: z.string().optional().describe("Language locale, e.g. en-IN"),
        }),
      });
    }
@Controller({ prefix: "" })
export class TravelController {
  constructor(private readonly service: TravelService) {}
  async dispatch(name: string, input: Input, _ctx: ExecutionContext) {
    const id = randomUUID(),
      start = performance.now();
    process.stderr.write(
      `TRAVEL_EVENT ${JSON.stringify({ type: "tool.start", callId: id, name, args: input, timestamp: new Date().toISOString() })}\n`,
    );
    try {
      const result = await this.service.invoke(name, input);
      process.stderr.write(
        `TRAVEL_EVENT ${JSON.stringify({ type: "tool.end", callId: id, name, result, durationMs: performance.now() - start, timestamp: new Date().toISOString() })}\n`,
      );
      return result;
    } catch (error) {
      process.stderr.write(
        `TRAVEL_EVENT ${JSON.stringify({ type: "tool.error", callId: id, name, error: String(error), durationMs: performance.now() - start, timestamp: new Date().toISOString() })}\n`,
      );
      throw error;
    }
  }
}
// The real NitroStack method decorator is applied to the generated catalog as well.
for (const definition of definitions) {
  const key = definition.name;
  Object.defineProperty(TravelController.prototype, key, {
    value: function (
      this: TravelController,
      input: Input,
      ctx: ExecutionContext,
    ) {
      return this.dispatch(key, input, ctx);
    },
    configurable: true,
  });
  Tool({
    ...definition,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  })(
    TravelController.prototype,
    key,
    Object.getOwnPropertyDescriptor(TravelController.prototype, key)!,
  );
}
