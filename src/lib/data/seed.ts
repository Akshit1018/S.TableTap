export type SeedRestaurant = {
  id: string;
  name: string;
  cuisine: string;
  neighborhood: string;
  address: string;
  coverImage: string;
  waitMins: number;
  partyMax: number;
  rating: number;
  priceLevel: number;
  description: string;
  hours: string;
  tags: string;
};

export const SEED_RESTAURANTS: SeedRestaurant[] = [
  {
    id: "amber",
    name: "Amber Courtyard",
    cuisine: "Rajasthani",
    neighborhood: "C-Scheme",
    address: "12 Bhagwan Das Rd, C-Scheme, Jaipur",
    coverImage: "/images/amber.jpg",
    waitMins: 35,
    partyMax: 10,
    rating: 4.8,
    priceLevel: 3,
    description:
      "Open-air haveli dining under sandstone arches. Laal maas, ker sangri, and a courtyard that cools after dusk.",
    hours: "12:30 – 23:30",
    tags: "Courtyard,Live folk,Vegetarian-friendly",
  },
  {
    id: "marigold",
    name: "The Marigold Room",
    cuisine: "Contemporary Indian",
    neighborhood: "Civil Lines",
    address: "4 Jacob Rd, Civil Lines, Jaipur",
    coverImage: "/images/marigold.jpg",
    waitMins: 22,
    partyMax: 8,
    rating: 4.7,
    priceLevel: 3,
    description:
      "A quiet, linen-set room for tasting menus that travel Rajasthan without the palace theatrics.",
    hours: "13:00 – 23:00",
    tags: "Tasting menu,Quiet,Date night",
  },
  {
    id: "lotus",
    name: "Lotus & Lime",
    cuisine: "Pan-Asian",
    neighborhood: "Malviya Nagar",
    address: "Gaurav Tower plaza, Malviya Nagar, Jaipur",
    coverImage: "/images/lotus.jpg",
    waitMins: 48,
    partyMax: 8,
    rating: 4.6,
    priceLevel: 2,
    description:
      "Broths, bao, and a lime-leaf kitchen. The wait is real on weekends — the rewards are too.",
    hours: "12:00 – 00:00",
    tags: "Baos,Cocktails,Late",
  },
  {
    id: "nukkad",
    name: "Nukkad House",
    cuisine: "Modern street",
    neighborhood: "Bani Park",
    address: "8 Chandpole, Bani Park, Jaipur",
    coverImage: "/images/nukkad.jpg",
    waitMins: 18,
    partyMax: 6,
    rating: 4.5,
    priceLevel: 2,
    description:
      "Tandoor glow, copper pots, and plates meant to share. Fast if you come early; generous if you wait.",
    hours: "11:30 – 22:30",
    tags: "Share plates,Casual,Family",
  },
  {
    id: "baradari",
    name: "Baradari",
    cuisine: "Rooftop grill",
    neighborhood: "Johari Bazaar",
    address: "Above 19 Johari Bazaar, Jaipur",
    coverImage: "/images/baradari.jpg",
    waitMins: 55,
    partyMax: 12,
    rating: 4.9,
    priceLevel: 4,
    description:
      "Pink-city lights, a marble terrace, and a grill that runs until the last party sits.",
    hours: "17:30 – 00:30",
    tags: "Rooftop,Sunset,Celebration",
  },
  {
    id: "verde",
    name: "Casa Verde",
    cuisine: "Mediterranean",
    neighborhood: "Vaishali Nagar",
    address: "21 Queens Rd, Vaishali Nagar, Jaipur",
    coverImage: "/images/verde.jpg",
    waitMins: 28,
    partyMax: 8,
    rating: 4.6,
    priceLevel: 3,
    description:
      "Olive trees, citrus, and wood-fired plates on a garden terrace. Soft light, long lunches.",
    hours: "12:00 – 22:30",
    tags: "Garden,Wine,Brunch",
  },
];

export const SEED_REWARDS: Array<{
  id: string;
  restaurantId: string;
  minWaitMins: number;
  kind: "discount_pct" | "free_item" | "gift";
  value: number;
  title: string;
  description: string;
}> = [
  { id: "rw-amber-20", restaurantId: "amber", minWaitMins: 20, kind: "discount_pct", value: 10, title: "10% off the bill", description: "Applied when you sit, no coupon code needed." },
  { id: "rw-amber-30", restaurantId: "amber", minWaitMins: 30, kind: "free_item", value: 0, title: "Free ker sangri", description: "A house plate on the house for the wait." },
  { id: "rw-amber-45", restaurantId: "amber", minWaitMins: 45, kind: "discount_pct", value: 15, title: "15% off + dessert", description: "Ghevar or malpua, chef’s pick." },
  { id: "rw-amber-60", restaurantId: "amber", minWaitMins: 60, kind: "gift", value: 500, title: "₹500 courtyard credit", description: "Plus a complimentary main for the table." },
  { id: "rw-marigold-20", restaurantId: "marigold", minWaitMins: 20, kind: "discount_pct", value: 10, title: "10% off tasting", description: "Auto-applied to the evening menu." },
  { id: "rw-marigold-30", restaurantId: "marigold", minWaitMins: 30, kind: "free_item", value: 0, title: "Amuse-bouche pair", description: "Two extra bites from the pass." },
  { id: "rw-marigold-60", restaurantId: "marigold", minWaitMins: 60, kind: "discount_pct", value: 25, title: "25% off + digestif", description: "A glass of house pour with the last course." },
  { id: "rw-lotus-20", restaurantId: "lotus", minWaitMins: 20, kind: "free_item", value: 0, title: "Free lime soda", description: "While you wait — or with the first plate." },
  { id: "rw-lotus-30", restaurantId: "lotus", minWaitMins: 30, kind: "discount_pct", value: 12, title: "12% off the bill", description: "Kitchen delay, kitchen apology." },
  { id: "rw-lotus-45", restaurantId: "lotus", minWaitMins: 45, kind: "free_item", value: 0, title: "Bao for the table", description: "Pork or mushroom, your call." },
  { id: "rw-lotus-60", restaurantId: "lotus", minWaitMins: 60, kind: "gift", value: 400, title: "₹400 bar credit", description: "Plus 20% off food." },
  { id: "rw-nukkad-20", restaurantId: "nukkad", minWaitMins: 20, kind: "free_item", value: 0, title: "Free masala chai", description: "Or a nimbu pani if it’s hot out." },
  { id: "rw-nukkad-30", restaurantId: "nukkad", minWaitMins: 30, kind: "discount_pct", value: 10, title: "10% off + papad", description: "The house stack, on us." },
  { id: "rw-nukkad-60", restaurantId: "nukkad", minWaitMins: 60, kind: "free_item", value: 0, title: "Complimentary kebab", description: "Chef sends a skewer from the tandoor." },
  { id: "rw-baradari-20", restaurantId: "baradari", minWaitMins: 20, kind: "discount_pct", value: 10, title: "10% off", description: "Sunset hour still counts." },
  { id: "rw-baradari-30", restaurantId: "baradari", minWaitMins: 30, kind: "free_item", value: 0, title: "Welcome mocktail", description: "A tall glass on the terrace." },
  { id: "rw-baradari-45", restaurantId: "baradari", minWaitMins: 45, kind: "discount_pct", value: 18, title: "18% off + dessert", description: "The chocolate millecake." },
  { id: "rw-baradari-60", restaurantId: "baradari", minWaitMins: 60, kind: "gift", value: 800, title: "₹800 terrace credit", description: "And a complimentary grill platter." },
  { id: "rw-verde-20", restaurantId: "verde", minWaitMins: 20, kind: "discount_pct", value: 8, title: "8% off the bill", description: "Small wait, small kindness." },
  { id: "rw-verde-30", restaurantId: "verde", minWaitMins: 30, kind: "free_item", value: 0, title: "Olive oil & bread", description: "The house loaf and citrus oil." },
  { id: "rw-verde-45", restaurantId: "verde", minWaitMins: 45, kind: "discount_pct", value: 15, title: "15% off + gelato", description: "A scoop between courses." },
  { id: "rw-verde-60", restaurantId: "verde", minWaitMins: 60, kind: "gift", value: 450, title: "₹450 garden credit", description: "Plus a complimentary pasta." },
];

export const SEED_TIERS: Array<{
  id: string;
  restaurantId: string;
  name: string;
  amount: number;
  discountPct: number;
  perk: string;
  sortOrder: number;
}> = [
  { id: "t-amber-flex", restaurantId: "amber", name: "Flex", amount: 0, discountPct: 0, perk: "Join the live list — no hold.", sortOrder: 0 },
  { id: "t-amber-reserve", restaurantId: "amber", name: "Reserve", amount: 199, discountPct: 10, perk: "15-minute arrival window, 10% off.", sortOrder: 1 },
  { id: "t-amber-prime", restaurantId: "amber", name: "Prime", amount: 499, discountPct: 18, perk: "Starter on the house + 18% off.", sortOrder: 2 },
  { id: "t-amber-cele", restaurantId: "amber", name: "Celebrate", amount: 1499, discountPct: 28, perk: "Skip the line, dessert, 28% off.", sortOrder: 3 },
  { id: "t-marigold-flex", restaurantId: "marigold", name: "Flex", amount: 0, discountPct: 0, perk: "Waitlist only.", sortOrder: 0 },
  { id: "t-marigold-reserve", restaurantId: "marigold", name: "Reserve", amount: 299, discountPct: 12, perk: "Held table, 12% off tasting.", sortOrder: 1 },
  { id: "t-marigold-prime", restaurantId: "marigold", name: "Prime", amount: 799, discountPct: 20, perk: "Wine pairing bite + 20% off.", sortOrder: 2 },
  { id: "t-lotus-flex", restaurantId: "lotus", name: "Flex", amount: 0, discountPct: 0, perk: "Remote waitlist.", sortOrder: 0 },
  { id: "t-lotus-reserve", restaurantId: "lotus", name: "Reserve", amount: 149, discountPct: 10, perk: "Booth hold, 10% off.", sortOrder: 1 },
  { id: "t-lotus-prime", restaurantId: "lotus", name: "Prime", amount: 399, discountPct: 16, perk: "Bao + 16% off.", sortOrder: 2 },
  { id: "t-nukkad-flex", restaurantId: "nukkad", name: "Flex", amount: 0, discountPct: 0, perk: "Walk-up style hold.", sortOrder: 0 },
  { id: "t-nukkad-reserve", restaurantId: "nukkad", name: "Reserve", amount: 99, discountPct: 8, perk: "Counter seat, 8% off.", sortOrder: 1 },
  { id: "t-nukkad-prime", restaurantId: "nukkad", name: "Prime", amount: 249, discountPct: 15, perk: "Thali add-on + 15% off.", sortOrder: 2 },
  { id: "t-baradari-flex", restaurantId: "baradari", name: "Flex", amount: 0, discountPct: 0, perk: "Join the terrace list.", sortOrder: 0 },
  { id: "t-baradari-reserve", restaurantId: "baradari", name: "Reserve", amount: 399, discountPct: 12, perk: "Sunset window, 12% off.", sortOrder: 1 },
  { id: "t-baradari-prime", restaurantId: "baradari", name: "Prime", amount: 899, discountPct: 20, perk: "Mocktail + 20% off.", sortOrder: 2 },
  { id: "t-baradari-cele", restaurantId: "baradari", name: "Celebrate", amount: 1999, discountPct: 30, perk: "Front rail table, platter, 30% off.", sortOrder: 3 },
  { id: "t-verde-flex", restaurantId: "verde", name: "Flex", amount: 0, discountPct: 0, perk: "Garden waitlist.", sortOrder: 0 },
  { id: "t-verde-reserve", restaurantId: "verde", name: "Reserve", amount: 249, discountPct: 10, perk: "Shaded table, 10% off.", sortOrder: 1 },
  { id: "t-verde-prime", restaurantId: "verde", name: "Prime", amount: 599, discountPct: 18, perk: "Bruschetta + 18% off.", sortOrder: 2 },
];

export const SEED_QUEUE: Array<{
  id: string;
  restaurantId: string;
  userId: string;
  guestName: string;
  partySize: number;
  quotedWait: number;
  offsetSec: number;
}> = [
  { id: "q-amber-1", restaurantId: "amber", userId: "seed-aditi", guestName: "Aditi Shah", partySize: 2, quotedWait: 35, offsetSec: 18 },
  { id: "q-amber-2", restaurantId: "amber", userId: "seed-rohan", guestName: "Rohan Mehta", partySize: 4, quotedWait: 40, offsetSec: 9 },
  { id: "q-amber-3", restaurantId: "amber", userId: "seed-kavya", guestName: "Kavya Iyer", partySize: 3, quotedWait: 32, offsetSec: 4 },
  { id: "q-marigold-1", restaurantId: "marigold", userId: "seed-neal", guestName: "Neel Kapoor", partySize: 2, quotedWait: 22, offsetSec: 12 },
  { id: "q-marigold-2", restaurantId: "marigold", userId: "seed-isha", guestName: "Isha Bansal", partySize: 2, quotedWait: 25, offsetSec: 3 },
  { id: "q-lotus-1", restaurantId: "lotus", userId: "seed-dev", guestName: "Devansh Rao", partySize: 5, quotedWait: 48, offsetSec: 30 },
  { id: "q-lotus-2", restaurantId: "lotus", userId: "seed-mira", guestName: "Mira Sen", partySize: 2, quotedWait: 45, offsetSec: 16 },
  { id: "q-lotus-3", restaurantId: "lotus", userId: "seed-arjun", guestName: "Arjun Nair", partySize: 3, quotedWait: 50, offsetSec: 7 },
  { id: "q-nukkad-1", restaurantId: "nukkad", userId: "seed-tara", guestName: "Tara Gill", partySize: 3, quotedWait: 18, offsetSec: 8 },
  { id: "q-nukkad-2", restaurantId: "nukkad", userId: "seed-kabir", guestName: "Kabir Joshi", partySize: 2, quotedWait: 16, offsetSec: 2 },
  { id: "q-baradari-1", restaurantId: "baradari", userId: "seed-leela", guestName: "Leela Khanna", partySize: 4, quotedWait: 55, offsetSec: 28 },
  { id: "q-baradari-2", restaurantId: "baradari", userId: "seed-samir", guestName: "Samir Qureshi", partySize: 2, quotedWait: 50, offsetSec: 14 },
  { id: "q-baradari-3", restaurantId: "baradari", userId: "seed-anaya", guestName: "Anaya Bose", partySize: 6, quotedWait: 60, offsetSec: 6 },
  { id: "q-verde-1", restaurantId: "verde", userId: "seed-paul", guestName: "Paul D’Souza", partySize: 2, quotedWait: 28, offsetSec: 11 },
  { id: "q-verde-2", restaurantId: "verde", userId: "seed-riya", guestName: "Riya Menon", partySize: 4, quotedWait: 30, offsetSec: 5 },
];
