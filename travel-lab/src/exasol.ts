import { flights } from "./dataset.js";

/** Latest month in the fare warehouse. History is the twelve months ending here. */
export const LATEST_MONTH = "2026-11";
const MONTHS = [
  "2025-12",
  "2026-01",
  "2026-02",
  "2026-03",
  "2026-04",
  "2026-05",
  "2026-06",
  "2026-07",
  "2026-08",
  "2026-09",
  "2026-10",
  "2026-11",
];
/** Same shift for every airline, so the cheapest month is a real aggregation, not one stored row. */
const MONTH_DELTA = [4200, 1800, -5600, 900, 2400, 3100, 1500, 800, 2600, 1900, 700, 0];

interface FareRow {
  offerId: string;
  origin: string;
  destination: string;
  month: string;
  airline: string;
  airlineCode: string;
  fare: number;
  seats: number;
  via: string | null;
  durationMinutes: number;
  checkedKg: number;
}

const fares: FareRow[] = MONTHS.flatMap((month, index) =>
  flights.map((flight) => ({
    offerId: month === LATEST_MONTH ? flight.id : `${flight.id}:${month}`,
    origin: flight.from,
    destination: flight.to,
    month,
    airline: flight.airline,
    airlineCode: flight.airlineCode,
    fare: flight.price + MONTH_DELTA[index],
    seats: flight.seats,
    via: flight.via,
    durationMinutes: flight.durationMinutes,
    checkedKg: flight.checkedKg,
  })),
);

const baggage = [
  ...new Map(
    flights.map((flight) => [
      flight.airlineCode,
      {
        airline: flight.airline,
        airlineCode: flight.airlineCode,
        checkedKg: flight.checkedKg,
        cabinKg: 7,
      },
    ]),
  ).values(),
];

export const LATEST_OFFERS_SQL = `SELECT offer_id, airline, airline_code, fare_inr, seats, via, duration_minutes, origin, destination
FROM fare_history
WHERE origin = ? AND destination = ? AND month = '${LATEST_MONTH}'
  AND (? IS NULL OR fare_inr < ?)
  AND (? = 0 OR seats > 0)
ORDER BY fare_inr, offer_id`;

export const MONTHLY_FARES_SQL = `SELECT f.month, f.airline, f.airline_code, f.fare_inr AS cheapest_fare
FROM fare_history f
JOIN (
  SELECT month, MIN(fare_inr) AS cheapest_fare
  FROM fare_history
  WHERE origin = ? AND destination = ? AND month >= ?
  GROUP BY month
) lowest ON lowest.month = f.month AND lowest.cheapest_fare = f.fare_inr
WHERE f.origin = ? AND f.destination = ?
ORDER BY cheapest_fare, f.airline_code`;

export const AIRLINE_COMPARISON_SQL = `SELECT b.airline, b.airline_code, b.checked_kg, MIN(f.fare_inr) AS fare
FROM fare_history f
JOIN baggage_policy b ON b.airline_code = f.airline_code
WHERE f.origin = ? AND f.destination = ? AND f.month = ? AND f.seats > 0 AND b.checked_kg >= ?
GROUP BY b.airline, b.airline_code, b.checked_kg
ORDER BY fare, b.airline_code`;

export const OFFER_SQL = `SELECT f.offer_id, f.airline, f.airline_code, f.fare_inr, f.seats, f.via, f.duration_minutes, f.origin, f.destination, b.checked_kg
FROM fare_history f
JOIN baggage_policy b ON b.airline_code = f.airline_code
WHERE f.offer_id = ? AND f.month = '${LATEST_MONTH}'`;

export const AIRLINE_SQL = `SELECT airline, airline_code, checked_kg, cabin_kg
FROM baggage_policy
WHERE airline_code = ?`;

function first(month: string) {
  const start = MONTHS.indexOf(month);
  return MONTHS.slice(Math.max(0, start));
}

function queryLocal(sql: string, params: unknown[]) {
  if (sql === LATEST_OFFERS_SQL) {
    const [origin, destination, maxPrice, , availableOnly] = params as [
      string,
      string,
      number | null,
      number | null,
      number,
    ];
    return fares
      .filter(
        (row) =>
          row.origin === origin &&
          row.destination === destination &&
          row.month === LATEST_MONTH &&
          (maxPrice == null || row.fare < maxPrice) &&
          (availableOnly === 0 || row.seats > 0),
      )
      .sort((a, b) => a.fare - b.fare || a.offerId.localeCompare(b.offerId))
      .map(offer);
  }
  if (sql === MONTHLY_FARES_SQL) {
    const [origin, destination, fromMonth] = params as [string, string, string];
    const window = first(fromMonth);
    return window
      .map((month) => {
        const rows = fares.filter(
          (row) =>
            row.origin === origin &&
            row.destination === destination &&
            row.month === month,
        );
        const cheapest = Math.min(...rows.map((row) => row.fare));
        return rows
          .filter((row) => row.fare === cheapest)
          .sort((a, b) => a.airlineCode.localeCompare(b.airlineCode))[0];
      })
      .sort((a, b) => a.fare - b.fare || a.airlineCode.localeCompare(b.airlineCode))
      .map((row) => ({
        month: row.month,
        airline: row.airline,
        airlineCode: row.airlineCode,
        cheapestFare: row.fare,
      }));
  }
  if (sql === AIRLINE_COMPARISON_SQL) {
    const [origin, destination, month, minKg] = params as [string, string, string, number];
    return baggage
      .filter((policy) => policy.checkedKg >= minKg)
      .map((policy) => {
        const rows = fares.filter(
          (row) =>
            row.airlineCode === policy.airlineCode &&
            row.origin === origin &&
            row.destination === destination &&
            row.month === month &&
            row.seats > 0,
        );
        if (!rows.length) return null;
        return {
          airline: policy.airline,
          airlineCode: policy.airlineCode,
          checkedKg: policy.checkedKg,
          fare: Math.min(...rows.map((row) => row.fare)),
        };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null)
      .sort((a, b) => a.fare - b.fare || a.airlineCode.localeCompare(b.airlineCode));
  }
  if (sql === OFFER_SQL) {
    const [offerId] = params as [string];
    const row = fares.find((fare) => fare.offerId === offerId && fare.month === LATEST_MONTH);
    return row ? [offer(row)] : [];
  }
  if (sql === AIRLINE_SQL) {
    const [code] = params as [string];
    return baggage
      .filter((policy) => policy.airlineCode === code)
      .map((policy) => ({
        airline: policy.airline,
        airlineCode: policy.airlineCode,
        checkedKg: policy.checkedKg,
        cabinKg: policy.cabinKg,
      }));
  }
  throw new Error("The travel warehouse does not implement that query.");
}

function offer(row: FareRow) {
  return {
    id: row.offerId,
    airline: row.airline,
    airlineCode: row.airlineCode,
    price: row.fare,
    seats: row.seats,
    from: row.origin,
    to: row.destination,
    via: row.via,
    durationMinutes: row.durationMinutes,
    currency: "INR",
    checkedKg: row.checkedKg,
    available: row.seats > 0,
  };
}

async function queryExasol(sql: string, params: unknown[]) {
  const host = process.env.EXASOL_HOST;
  const user = process.env.EXASOL_USER;
  const password = process.env.EXASOL_PASSWORD;
  if (!host || !user || !password)
    throw new Error("Set EXASOL_HOST, EXASOL_USER and EXASOL_PASSWORD to query Exasol.");
  const url =
    process.env.EXASOL_WEBSOCKET_URL ||
    `wss://${host}:${process.env.EXASOL_PORT || 8563}`;
  const driver = "exasol-websocket-api";
  const imported = (await import(driver)) as {
    Exasol: new (
      websocketUrl: string,
      user: string,
      password: string,
    ) => {
      query: (statement: string) => Promise<{ data?: Record<string, unknown>[] }>;
      close?: () => Promise<void>;
    };
  };
  const client = new imported.Exasol(url, user, password);
  try {
    const statement = sql.replace(/\?/g, () => {
      const value = params.shift();
      if (value == null) return "NULL";
      if (typeof value === "number") return String(value);
      return `'${String(value).replaceAll("'", "''")}'`;
    });
    const result = await client.query(statement);
    return (result.data || []) as Record<string, unknown>[];
  } finally {
    await client.close?.();
  }
}

export async function queryWarehouse(sql: string, params: unknown[]) {
  if (process.env.EXASOL_HOST) return queryExasol(sql, [...params]);
  return queryLocal(sql, params);
}

export async function analyzeFares(origin: string, destination: string, historyMonths = 12) {
  const count = Math.max(1, Math.min(12, historyMonths));
  const fromMonth = MONTHS[MONTHS.length - count];
  const months = (await queryWarehouse(MONTHLY_FARES_SQL, [
    origin,
    destination,
    fromMonth,
    origin,
    destination,
  ])) as { month: string; airline: string; airlineCode: string; cheapestFare: number }[];
  const cheapest = months[0];
  const airlines = (await queryWarehouse(AIRLINE_COMPARISON_SQL, [
    origin,
    destination,
    cheapest.month,
    20,
  ])) as { airline: string; airlineCode: string; checkedKg: number; fare: number }[];
  return {
    warehouse: process.env.EXASOL_HOST ? "exasol" : "exasol-sql",
    route: { from: origin, to: destination },
    months,
    cheapestMonth: cheapest.month,
    cheapestFare: cheapest.cheapestFare,
    cheapestAirline: cheapest.airline,
    airlines,
  };
}

export function expectedFareAnalysis() {
  const months = queryLocal(MONTHLY_FARES_SQL, ["BLR", "SYD", MONTHS[0], "BLR", "SYD"]) as {
    month: string;
    cheapestFare: number;
  }[];
  const cheapest = months[0];
  const airlines = queryLocal(AIRLINE_COMPARISON_SQL, ["BLR", "SYD", cheapest.month, 20]) as {
    airline: string;
    airlineCode: string;
    checkedKg: number;
    fare: number;
  }[];
  return { cheapestMonth: cheapest.month, cheapestFare: cheapest.cheapestFare, airlines };
}
