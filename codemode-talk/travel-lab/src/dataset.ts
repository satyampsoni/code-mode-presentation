/** Deterministic conference fixtures, never live availability. Prices are INR per adult. */
export const DATASET_VERSION = "travel-fixtures-2026-11-v1";
export const flights = [
  {
    id: "NS-101",
    airline: "IndiGo",
    airlineCode: "6E",
    price: 29800,
    checkedKg: 15,
    seats: 8,
    via: "SIN",
    durationMinutes: 930,
  },
  {
    id: "NS-102",
    airline: "Air India",
    airlineCode: "AI",
    price: 36400,
    checkedKg: 25,
    seats: 6,
    via: "DEL",
    durationMinutes: 1080,
  },
  {
    id: "NS-103",
    airline: "Singapore Airlines",
    airlineCode: "SQ",
    price: 38900,
    checkedKg: 30,
    seats: 4,
    via: "SIN",
    durationMinutes: 870,
  },
  {
    id: "NS-104",
    airline: "Malaysia Airlines",
    airlineCode: "MH",
    price: 33700,
    checkedKg: 20,
    seats: 5,
    via: "KUL",
    durationMinutes: 960,
  },
  {
    id: "NS-105",
    airline: "Qantas",
    airlineCode: "QF",
    price: 43200,
    checkedKg: 30,
    seats: 7,
    via: null,
    durationMinutes: 690,
  },
  {
    id: "NS-106",
    airline: "SriLankan Airlines",
    airlineCode: "UL",
    price: 31900,
    checkedKg: 30,
    seats: 0,
    via: "CMB",
    durationMinutes: 1170,
  },
  {
    id: "NS-107",
    airline: "Thai Airways",
    airlineCode: "TG",
    price: 35200,
    checkedKg: 20,
    seats: 3,
    via: "BKK",
    durationMinutes: 1020,
  },
  {
    id: "NS-108",
    airline: "Scoot",
    airlineCode: "TR",
    price: 27300,
    checkedKg: 0,
    seats: 9,
    via: "SIN",
    durationMinutes: 1110,
  },
  {
    id: "NS-109",
    airline: "Cathay Pacific",
    airlineCode: "CX",
    price: 39500,
    checkedKg: 23,
    seats: 2,
    via: "HKG",
    durationMinutes: 1210,
  },
  {
    id: "NS-110",
    airline: "Air India",
    airlineCode: "AI",
    price: 37800,
    checkedKg: 25,
    seats: 1,
    via: "BOM",
    durationMinutes: 1000,
  },
].map((f) => ({
  ...f,
  from: "BLR",
  to: "SYD",
  currency: "INR",
  sampleData: true,
}));
export const airports: Record<
  string,
  { city: string; name: string; country: string }
> = {
  BLR: { city: "Bengaluru", name: "Kempegowda International", country: "IN" },
  SYD: { city: "Sydney", name: "Sydney Kingsford Smith", country: "AU" },
  SIN: { city: "Singapore", name: "Changi", country: "SG" },
  DEL: { city: "Delhi", name: "Indira Gandhi International", country: "IN" },
  KUL: {
    city: "Kuala Lumpur",
    name: "Kuala Lumpur International",
    country: "MY",
  },
  CMB: { city: "Colombo", name: "Bandaranaike International", country: "LK" },
  BKK: { city: "Bangkok", name: "Suvarnabhumi", country: "TH" },
  HKG: { city: "Hong Kong", name: "Hong Kong International", country: "HK" },
  BOM: {
    city: "Mumbai",
    name: "Chhatrapati Shivaji Maharaj International",
    country: "IN",
  },
};
export function airportCode(value: string) {
  const clean = value.trim().toUpperCase();
  return (
    (
      { BENGALURU: "BLR", BANGALORE: "BLR", SYDNEY: "SYD" } as Record<
        string,
        string
      >
    )[clean] || clean
  );
}
export function flightById(id: string) {
  const f = flights.find((f) => f.id === id);
  if (!f) throw new Error(`Unknown sample flight: ${id}`);
  return f;
}
export const expectedOptions = flights
  .filter((f) => f.price < 40000 && f.seats > 0 && f.checkedKg >= 20)
  .sort((a, b) => a.price - b.price)
  .slice(0, 3)
  .map((f) => f.id);
