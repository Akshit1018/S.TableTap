export type RewardKind = "discount_pct" | "free_item" | "gift";

export type WaitReward = {
  id: string;
  restaurantId: string;
  minWaitMins: number;
  kind: RewardKind;
  value: number;
  title: string;
  description: string;
};

export type DepositTier = {
  id: string;
  restaurantId: string;
  name: string;
  amount: number;
  discountPct: number;
  perk: string;
  sortOrder: number;
};

export type Restaurant = {
  id: string;
  ownerUserId: string;
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
  tags: string[];
  waitingCount: number;
};

export type QueueStatus = "waiting" | "ready" | "seated" | "cancelled" | "no_show";

export type QueueEntry = {
  id: string;
  restaurantId: string;
  userId: string;
  guestName: string;
  partySize: number;
  status: QueueStatus;
  joinedAt: string;
  quotedWait: number;
  notes: string | null;
};

export type BookingStatus = "held" | "confirmed" | "cancelled" | "completed";

export type Booking = {
  id: string;
  restaurantId: string;
  restaurantName: string;
  userId: string;
  guestName: string;
  partySize: number;
  slotAt: string;
  depositTierId: string;
  depositAmount: number;
  discountPct: number;
  perk: string;
  status: BookingStatus;
  createdAt: string;
};

export type Gift = {
  id: string;
  restaurantId: string;
  restaurantName: string;
  userId: string;
  title: string;
  description: string;
  kind: string;
  value: number;
  source: "wait" | "host" | "booking";
  claimed: boolean;
  createdAt: string;
};

export type Profile = {
  userId: string;
  displayName: string;
  phone: string | null;
  rolePref: "guest" | "host";
};

export type AppNotification = {
  id: string;
  userId: string;
  title: string;
  body: string;
  kind: string;
  read: boolean;
  createdAt: string;
};

export type HostStats = {
  waiting: number;
  ready: number;
  seatedTonight: number;
  coversTonight: number;
  bookingsTonight: number;
  avgQuoted: number;
};
