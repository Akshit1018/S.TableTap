import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { elapsedWaitMins } from "@/lib/utils";
import {
  SEED_QUEUE,
  SEED_RESTAURANTS,
  SEED_REWARDS,
  SEED_TIERS,
} from "./seed";
import type {
  AppNotification,
  Booking,
  DepositTier,
  Gift,
  HostStats,
  Profile,
  QueueEntry,
  QueueStatus,
  Restaurant,
  WaitReward,
} from "./types";

type RestRow = {
  id: string;
  owner_user_id: string;
  name: string;
  cuisine: string;
  neighborhood: string;
  address: string;
  cover_image: string;
  wait_mins: number;
  party_max: number;
  rating: string | number;
  price_level: number;
  description: string;
  hours: string;
  tags: string;
  waiting_count: number;
};

type RewardRow = {
  id: string;
  restaurant_id: string;
  min_wait_mins: number;
  kind: WaitReward["kind"];
  value: number;
  title: string;
  description: string;
};

type TierRow = {
  id: string;
  restaurant_id: string;
  name: string;
  amount: number;
  discount_pct: number;
  perk: string;
  sort_order: number;
};

type QueueRow = {
  id: string;
  restaurant_id: string;
  user_id: string;
  guest_name: string;
  party_size: number;
  status: QueueStatus;
  joined_at: string;
  quoted_wait: number;
  notes: string | null;
};

type BookingRow = {
  id: string;
  restaurant_id: string;
  restaurant_name: string;
  user_id: string;
  guest_name: string;
  party_size: number;
  slot_at: string;
  deposit_tier_id: string;
  deposit_amount: number;
  discount_pct: number;
  perk: string;
  status: Booking["status"];
  created_at: string;
};

type GiftRow = {
  id: string;
  restaurant_id: string;
  restaurant_name: string;
  user_id: string;
  title: string;
  description: string;
  kind: string;
  value: number;
  source: Gift["source"];
  claimed: boolean;
  created_at: string;
};

let seedPromise: Promise<void> | null = null;

async function ensureSeed(): Promise<void> {
  if (!seedPromise) {
    seedPromise = (async () => {
      const sql = await getSql();
      const existing = await sql<{ c: number }>`select count(*)::int as c from restaurants`;
      if ((existing[0]?.c ?? 0) > 0) return;

      for (const r of SEED_RESTAURANTS) {
        await sql`
          insert into restaurants (
            id, owner_user_id, name, cuisine, neighborhood, address, cover_image,
            wait_mins, party_max, rating, price_level, description, hours, tags
          ) values (
            ${r.id}, ${"seed-host"}, ${r.name}, ${r.cuisine}, ${r.neighborhood}, ${r.address},
            ${r.coverImage}, ${r.waitMins}, ${r.partyMax}, ${r.rating}, ${r.priceLevel},
            ${r.description}, ${r.hours}, ${r.tags}
          )
        `;
      }
      for (const rw of SEED_REWARDS) {
        await sql`
          insert into wait_rewards (id, restaurant_id, min_wait_mins, kind, value, title, description)
          values (${rw.id}, ${rw.restaurantId}, ${rw.minWaitMins}, ${rw.kind}, ${rw.value}, ${rw.title}, ${rw.description})
        `;
      }
      for (const t of SEED_TIERS) {
        await sql`
          insert into deposit_tiers (id, restaurant_id, name, amount, discount_pct, perk, sort_order)
          values (${t.id}, ${t.restaurantId}, ${t.name}, ${t.amount}, ${t.discountPct}, ${t.perk}, ${t.sortOrder})
        `;
      }
      for (const q of SEED_QUEUE) {
        const joined = new Date(Date.now() - q.offsetSec * 1000).toISOString();
        await sql`
          insert into queue_entries (
            id, restaurant_id, user_id, guest_name, party_size, status, joined_at, quoted_wait
          ) values (
            ${q.id}, ${q.restaurantId}, ${q.userId}, ${q.guestName}, ${q.partySize}, ${"waiting"},
            ${joined}, ${q.quotedWait}
          )
        `;
      }
    })().catch((err) => {
      seedPromise = null;
      throw err;
    });
  }
  await seedPromise;
}

function mapRestaurant(row: RestRow): Restaurant {
  return {
    id: row.id,
    ownerUserId: row.owner_user_id,
    name: row.name,
    cuisine: row.cuisine,
    neighborhood: row.neighborhood,
    address: row.address,
    coverImage: row.cover_image,
    waitMins: Number(row.wait_mins),
    partyMax: Number(row.party_max),
    rating: Number(row.rating),
    priceLevel: Number(row.price_level),
    description: row.description,
    hours: row.hours,
    tags: row.tags ? row.tags.split(",").filter(Boolean) : [],
    waitingCount: Number(row.waiting_count ?? 0),
  };
}

function mapReward(row: RewardRow): WaitReward {
  return {
    id: row.id,
    restaurantId: row.restaurant_id,
    minWaitMins: Number(row.min_wait_mins),
    kind: row.kind,
    value: Number(row.value),
    title: row.title,
    description: row.description,
  };
}

function mapTier(row: TierRow): DepositTier {
  return {
    id: row.id,
    restaurantId: row.restaurant_id,
    name: row.name,
    amount: Number(row.amount),
    discountPct: Number(row.discount_pct),
    perk: row.perk,
    sortOrder: Number(row.sort_order),
  };
}

function mapQueue(row: QueueRow): QueueEntry {
  return {
    id: row.id,
    restaurantId: row.restaurant_id,
    userId: row.user_id,
    guestName: row.guest_name,
    partySize: Number(row.party_size),
    status: row.status,
    joinedAt: typeof row.joined_at === "string" ? row.joined_at : new Date(row.joined_at).toISOString(),
    quotedWait: Number(row.quoted_wait),
    notes: row.notes,
  };
}

function mapBooking(row: BookingRow): Booking {
  return {
    id: row.id,
    restaurantId: row.restaurant_id,
    restaurantName: row.restaurant_name,
    userId: row.user_id,
    guestName: row.guest_name,
    partySize: Number(row.party_size),
    slotAt: typeof row.slot_at === "string" ? row.slot_at : new Date(row.slot_at).toISOString(),
    depositTierId: row.deposit_tier_id,
    depositAmount: Number(row.deposit_amount),
    discountPct: Number(row.discount_pct),
    perk: row.perk,
    status: row.status,
    createdAt: typeof row.created_at === "string" ? row.created_at : new Date(row.created_at).toISOString(),
  };
}

function mapGift(row: GiftRow): Gift {
  return {
    id: row.id,
    restaurantId: row.restaurant_id,
    restaurantName: row.restaurant_name,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    kind: row.kind,
    value: Number(row.value),
    source: row.source,
    claimed: Boolean(row.claimed),
    createdAt: typeof row.created_at === "string" ? row.created_at : new Date(row.created_at).toISOString(),
  };
}

let dbChain: Promise<void> = Promise.resolve();

function runSerial<T>(fn: () => Promise<T>): Promise<T> {
  const next = dbChain.then(fn, fn);
  dbChain = next.then(
    () => undefined,
    () => undefined,
  );
  return next;
}

async function tickQueues(restaurantId?: string) {
  return runSerial(async () => {
    if (Date.now() - lastTickAt < 900) return;
    lastTickAt = Date.now();
    try {
      const sql = await getSql();
      const rows = restaurantId
        ? await sql<QueueRow>`
            select * from queue_entries
            where restaurant_id = ${restaurantId} and status = 'waiting'
          `
        : await sql<QueueRow>`select * from queue_entries where status = 'waiting'`;

      const due = rows.map(mapQueue).filter((entry) => elapsedWaitMins(entry.joinedAt) >= entry.quotedWait);
      for (const entry of due) {
        await sql`update queue_entries set status = 'ready' where id = ${entry.id} and status = 'waiting'`;
        await sql`
          insert into notifications (id, user_id, title, body, kind)
          values (
            ${crypto.randomUUID()}, ${entry.userId},
            ${"Your table is ready"},
            ${"Come to the host stand — we’re holding your table."},
            ${"ready"}
          )
        `;
      }

      const active = restaurantId
        ? await sql<QueueRow>`
            select * from queue_entries
            where restaurant_id = ${restaurantId} and status in ('waiting','ready')
          `
        : rows;
      const rewardRows = restaurantId
        ? await sql<RewardRow>`select * from wait_rewards where restaurant_id = ${restaurantId}`
        : await sql<RewardRow>`select * from wait_rewards`;

      for (const row of active) {
        const entry = mapQueue(row);
        if (entry.userId.startsWith("seed-") || entry.userId.startsWith("walkin-")) continue;
        const elapsed = elapsedWaitMins(entry.joinedAt);
        for (const rw of rewardRows) {
          if (rw.restaurant_id !== entry.restaurantId) continue;
          if (elapsed < Number(rw.min_wait_mins)) continue;
          const exists = await sql<{ c: number }>`
            select count(*)::int as c from gifts
            where user_id = ${entry.userId}
              and restaurant_id = ${entry.restaurantId}
              and title = ${rw.title}
              and source = 'wait'
          `;
          if ((exists[0]?.c ?? 0) > 0) continue;
          await sql`
            insert into gifts (id, restaurant_id, user_id, title, description, kind, value, source)
            values (
              ${crypto.randomUUID()}, ${entry.restaurantId}, ${entry.userId},
              ${rw.title}, ${rw.description}, ${rw.kind}, ${rw.value}, ${"wait"}
            )
          `;
        }
      }
    } catch (err) {
      console.error("[tabletap] tickQueues", err);
    }
  });
}

let lastTickAt = 0;

const REST_SELECT = `
  r.id, r.owner_user_id, r.name, r.cuisine, r.neighborhood, r.address, r.cover_image,
  r.wait_mins, r.party_max, r.rating, r.price_level, r.description, r.hours, r.tags,
  (select count(*)::int from queue_entries q where q.restaurant_id = r.id and q.status in ('waiting','ready')) as waiting_count
`;

export const listRestaurants = createServerFn({ method: "GET" }).handler(async () => {
  await ensureSeed();
  const sql = await getSql();
  const rows = await sql.query<RestRow>(
    `select ${REST_SELECT} from restaurants r order by r.wait_mins desc`,
  );
  return rows.map(mapRestaurant);
});

export const getRestaurant = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    await ensureSeed();
    await tickQueues(id);
    const sql = await getSql();
    const rows = await sql.query<RestRow>(
      `select ${REST_SELECT} from restaurants r where r.id = $1`,
      [id],
    );
    return rows[0] ? mapRestaurant(rows[0]) : null;
  });

export const listRewards = createServerFn({ method: "GET" })
  .validator((restaurantId: string) => restaurantId)
  .handler(async ({ data: restaurantId }) => {
    await ensureSeed();
    const sql = await getSql();
    const rows = await sql<RewardRow>`
      select * from wait_rewards where restaurant_id = ${restaurantId} order by min_wait_mins asc
    `;
    return rows.map(mapReward);
  });

export const listTiers = createServerFn({ method: "GET" })
  .validator((restaurantId: string) => restaurantId)
  .handler(async ({ data: restaurantId }) => {
    await ensureSeed();
    const sql = await getSql();
    const rows = await sql<TierRow>`
      select * from deposit_tiers where restaurant_id = ${restaurantId} order by sort_order asc
    `;
    return rows.map(mapTier);
  });

export const listQueue = createServerFn({ method: "GET" })
  .validator((restaurantId: string) => restaurantId)
  .handler(async ({ data: restaurantId }) => {
    await ensureSeed();
    await tickQueues(restaurantId);
    const sql = await getSql();
    const rows = await sql<QueueRow>`
      select * from queue_entries
      where restaurant_id = ${restaurantId} and status in ('waiting','ready')
      order by joined_at asc
    `;
    return rows.map(mapQueue);
  });

export const ensureProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { displayName?: string; rolePref?: "guest" | "host" }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const existing = await sql<Profile & { user_id: string; display_name: string; role_pref: string }>`
      select user_id, display_name, phone, role_pref from profiles where user_id = ${context.userId}
    `;
    if (existing[0]) {
      return {
        userId: existing[0].user_id,
        displayName: existing[0].display_name,
        phone: existing[0].phone ?? null,
        rolePref: (existing[0].role_pref as Profile["rolePref"]) ?? "guest",
      } satisfies Profile;
    }
    const name = data.displayName?.trim() || "Guest";
    const role = data.rolePref ?? "guest";
    await sql`
      insert into profiles (user_id, display_name, role_pref)
      values (${context.userId}, ${name}, ${role})
    `;
    return { userId: context.userId, displayName: name, phone: null, rolePref: role } satisfies Profile;
  });

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{ user_id: string; display_name: string; phone: string | null; role_pref: string }>`
      select user_id, display_name, phone, role_pref from profiles where user_id = ${context.userId}
    `;
    const row = rows[0];
    if (!row) {
      await sql`insert into profiles (user_id, display_name) values (${context.userId}, ${"Guest"})`;
      return { userId: context.userId, displayName: "Guest", phone: null, rolePref: "guest" } satisfies Profile;
    }
    return {
      userId: row.user_id,
      displayName: row.display_name,
      phone: row.phone,
      rolePref: (row.role_pref as Profile["rolePref"]) ?? "guest",
    } satisfies Profile;
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { displayName?: string; phone?: string; rolePref?: "guest" | "host" }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`insert into profiles (user_id, display_name) values (${context.userId}, ${"Guest"}) on conflict (user_id) do nothing`;
    if (data.displayName !== undefined) {
      await sql`update profiles set display_name = ${data.displayName} where user_id = ${context.userId}`;
    }
    if (data.phone !== undefined) {
      await sql`update profiles set phone = ${data.phone} where user_id = ${context.userId}`;
    }
    if (data.rolePref !== undefined) {
      await sql`update profiles set role_pref = ${data.rolePref} where user_id = ${context.userId}`;
    }
    const rows = await sql<{ user_id: string; display_name: string; phone: string | null; role_pref: string }>`
      select user_id, display_name, phone, role_pref from profiles where user_id = ${context.userId}
    `;
    const row = rows[0]!;
    return {
      userId: row.user_id,
      displayName: row.display_name,
      phone: row.phone,
      rolePref: (row.role_pref as Profile["rolePref"]) ?? "guest",
    } satisfies Profile;
  });

export const joinQueue = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { restaurantId: string; partySize: number; notes?: string; guestName: string }) => input)
  .handler(async ({ context, data }) => {
    return runSerial(async () => {
      await ensureSeed();
      const sql = await getSql();
      const rest = await sql<{ wait_mins: number; party_max: number; name: string }>`
        select wait_mins, party_max, name from restaurants where id = ${data.restaurantId}
      `;
      if (!rest[0]) throw new Error("Restaurant not found");
      const party = Math.min(Math.max(1, data.partySize), rest[0].party_max);
      await sql`
        update queue_entries set status = 'cancelled'
        where user_id = ${context.userId} and status in ('waiting','ready')
      `;
      const ahead = await sql<{ c: number }>`
        select count(*)::int as c from queue_entries
        where restaurant_id = ${data.restaurantId} and status in ('waiting','ready')
      `;
      const quoted = Number(rest[0].wait_mins) + Math.max(0, (ahead[0]?.c ?? 0) - 1) * 4;
      const id = crypto.randomUUID();
      await sql`
        insert into queue_entries (id, restaurant_id, user_id, guest_name, party_size, status, quoted_wait, notes)
        values (${id}, ${data.restaurantId}, ${context.userId}, ${data.guestName}, ${party}, ${"waiting"}, ${quoted}, ${data.notes ?? null})
      `;
      await sql`
        insert into notifications (id, user_id, title, body, kind)
        values (
          ${crypto.randomUUID()}, ${context.userId},
          ${"You're on the list"},
          ${`Quoted wait at ${rest[0].name} is about ${quoted} minutes.`},
          ${"queue"}
        )
      `;
      const rows = await sql<QueueRow>`select * from queue_entries where id = ${id}`;
      return mapQueue(rows[0]!);
    });
  });

export const leaveQueue = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ context, data: id }) => {
    const sql = await getSql();
    await sql`
      update queue_entries set status = 'cancelled'
      where id = ${id} and user_id = ${context.userId} and status in ('waiting','ready')
    `;
    return { ok: true };
  });

export const myActiveQueue = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await ensureSeed();
    await tickQueues();
    return runSerial(async () => {
      const sql = await getSql();
      const rows = await sql<QueueRow>`
        select * from queue_entries
        where user_id = ${context.userId} and status in ('waiting','ready')
        order by joined_at desc
        limit 1
      `;
      if (!rows[0]) return null;
      return mapQueue(rows[0]);
    });
  });

export const createBooking = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      restaurantId: string;
      partySize: number;
      slotAt: string;
      depositTierId: string;
      guestName: string;
    }) => input,
  )
  .handler(async ({ context, data }) => {
    await ensureSeed();
    const sql = await getSql();
    const tierRows = await sql<TierRow>`select * from deposit_tiers where id = ${data.depositTierId}`;
    const tier = tierRows[0];
    if (!tier) throw new Error("Choose a deposit tier");
    const id = crypto.randomUUID();
    await sql`
      insert into bookings (
        id, restaurant_id, user_id, guest_name, party_size, slot_at,
        deposit_tier_id, deposit_amount, discount_pct, perk, status
      ) values (
        ${id}, ${data.restaurantId}, ${context.userId}, ${data.guestName}, ${data.partySize},
        ${data.slotAt}, ${tier.id}, ${tier.amount}, ${tier.discount_pct}, ${tier.perk},
        ${tier.amount > 0 ? "confirmed" : "held"}
      )
    `;
    if (tier.amount > 0 && tier.discount_pct > 0) {
      await sql`
        insert into gifts (id, restaurant_id, user_id, title, description, kind, value, source)
        values (
          ${crypto.randomUUID()}, ${data.restaurantId}, ${context.userId},
          ${`${tier.discount_pct}% advance booking discount`},
          ${tier.perk}, ${"discount_pct"}, ${tier.discount_pct}, ${"booking"}
        )
      `;
    }
    const rows = await sql<BookingRow>`
      select b.*, r.name as restaurant_name
      from bookings b join restaurants r on r.id = b.restaurant_id
      where b.id = ${id}
    `;
    return mapBooking(rows[0]!);
  });

export const myBookings = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<BookingRow>`
      select b.*, r.name as restaurant_name
      from bookings b join restaurants r on r.id = b.restaurant_id
      where b.user_id = ${context.userId}
      order by b.slot_at desc
    `;
    return rows.map(mapBooking);
  });

export const cancelBooking = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ context, data: id }) => {
    const sql = await getSql();
    await sql`
      update bookings set status = 'cancelled'
      where id = ${id} and user_id = ${context.userId} and status in ('held','confirmed')
    `;
    return { ok: true };
  });

export const myGifts = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<GiftRow>`
      select g.*, r.name as restaurant_name
      from gifts g join restaurants r on r.id = g.restaurant_id
      where g.user_id = ${context.userId}
      order by g.created_at desc
    `;
    return rows.map(mapGift);
  });

export const claimGift = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ context, data: id }) => {
    const sql = await getSql();
    await sql`update gifts set claimed = true where id = ${id} and user_id = ${context.userId}`;
    return { ok: true };
  });

export const myNotifications = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<AppNotification & { user_id: string; created_at: string }>`
      select id, user_id, title, body, kind, read, created_at
      from notifications where user_id = ${context.userId}
      order by created_at desc
      limit 20
    `;
    return rows.map((n) => ({
      id: n.id,
      userId: n.user_id,
      title: n.title,
      body: n.body,
      kind: n.kind,
      read: Boolean(n.read),
      createdAt: typeof n.created_at === "string" ? n.created_at : new Date(n.created_at).toISOString(),
    })) satisfies AppNotification[];
  });

export const markNotificationsRead = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await sql`update notifications set read = true where user_id = ${context.userId}`;
    return { ok: true };
  });

export const hostStats = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((restaurantId: string) => restaurantId)
  .handler(async ({ data: restaurantId }) => {
    await ensureSeed();
    await tickQueues(restaurantId);
    const sql = await getSql();
    const waiting = await sql<{ c: number }>`
      select count(*)::int as c from queue_entries where restaurant_id = ${restaurantId} and status = 'waiting'
    `;
    const ready = await sql<{ c: number }>`
      select count(*)::int as c from queue_entries where restaurant_id = ${restaurantId} and status = 'ready'
    `;
    const seated = await sql<{ c: number; covers: number }>`
      select count(*)::int as c, coalesce(sum(party_size),0)::int as covers
      from queue_entries
      where restaurant_id = ${restaurantId} and status = 'seated'
        and joined_at > now() - interval '12 hours'
    `;
    const books = await sql<{ c: number }>`
      select count(*)::int as c from bookings
      where restaurant_id = ${restaurantId} and status in ('held','confirmed')
        and slot_at > now() - interval '4 hours'
    `;
    const avg = await sql<{ a: number | null }>`
      select avg(quoted_wait)::int as a from queue_entries
      where restaurant_id = ${restaurantId} and status in ('waiting','ready')
    `;
    return {
      waiting: waiting[0]?.c ?? 0,
      ready: ready[0]?.c ?? 0,
      seatedTonight: seated[0]?.c ?? 0,
      coversTonight: seated[0]?.covers ?? 0,
      bookingsTonight: books[0]?.c ?? 0,
      avgQuoted: avg[0]?.a ?? 0,
    } satisfies HostStats;
  });

export const setQueueStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string; status: QueueStatus }) => input)
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql`update queue_entries set status = ${data.status} where id = ${data.id}`;
    if (data.status === "ready") {
      const rows = await sql<QueueRow>`select * from queue_entries where id = ${data.id}`;
      const entry = rows[0];
      if (entry) {
        await sql`
          insert into notifications (id, user_id, title, body, kind)
          values (
            ${crypto.randomUUID()}, ${entry.user_id},
            ${"Your table is ready"},
            ${"Come to the host stand — we’re holding your table."},
            ${"ready"}
          )
        `;
      }
    }
    return { ok: true };
  });

export const addWalkIn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { restaurantId: string; guestName: string; partySize: number }) => input)
  .handler(async ({ data }) => {
    await ensureSeed();
    const sql = await getSql();
    const rest = await sql<{ wait_mins: number }>`select wait_mins from restaurants where id = ${data.restaurantId}`;
    const quoted = Number(rest[0]?.wait_mins ?? 20);
    const id = crypto.randomUUID();
    await sql`
      insert into queue_entries (id, restaurant_id, user_id, guest_name, party_size, status, quoted_wait)
      values (${id}, ${data.restaurantId}, ${"walkin-" + id}, ${data.guestName}, ${data.partySize}, ${"waiting"}, ${quoted})
    `;
    const rows = await sql<QueueRow>`select * from queue_entries where id = ${id}`;
    return mapQueue(rows[0]!);
  });

export const sendHostGift = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      restaurantId: string;
      userId: string;
      title: string;
      description: string;
      kind: string;
      value: number;
    }) => input,
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const id = crypto.randomUUID();
    await sql`
      insert into gifts (id, restaurant_id, user_id, title, description, kind, value, source)
      values (${id}, ${data.restaurantId}, ${data.userId}, ${data.title}, ${data.description}, ${data.kind}, ${data.value}, ${"host"})
    `;
    await sql`
      insert into notifications (id, user_id, title, body, kind)
      values (
        ${crypto.randomUUID()}, ${data.userId},
        ${"A gift from the house"},
        ${data.title},
        ${"gift"}
      )
    `;
    return { ok: true };
  });

export const upsertReward = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      id?: string;
      restaurantId: string;
      minWaitMins: number;
      kind: WaitReward["kind"];
      value: number;
      title: string;
      description: string;
    }) => input,
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const id = data.id ?? crypto.randomUUID();
    await sql`
      insert into wait_rewards (id, restaurant_id, min_wait_mins, kind, value, title, description)
      values (${id}, ${data.restaurantId}, ${data.minWaitMins}, ${data.kind}, ${data.value}, ${data.title}, ${data.description})
      on conflict (id) do update set
        min_wait_mins = excluded.min_wait_mins,
        kind = excluded.kind,
        value = excluded.value,
        title = excluded.title,
        description = excluded.description
    `;
    return { id };
  });

export const deleteReward = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const sql = await getSql();
    await sql`delete from wait_rewards where id = ${id}`;
    return { ok: true };
  });

export const updateWaitMins = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { restaurantId: string; waitMins: number }) => input)
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql`update restaurants set wait_mins = ${data.waitMins} where id = ${data.restaurantId}`;
    return { ok: true };
  });

export const hostBookings = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((restaurantId: string) => restaurantId)
  .handler(async ({ data: restaurantId }) => {
    const sql = await getSql();
    const rows = await sql<BookingRow>`
      select b.*, r.name as restaurant_name
      from bookings b join restaurants r on r.id = b.restaurant_id
      where b.restaurant_id = ${restaurantId}
      order by b.slot_at asc
    `;
    return rows.map(mapBooking);
  });

export const setBookingStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string; status: Booking["status"] }) => input)
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql`update bookings set status = ${data.status} where id = ${data.id}`;
    return { ok: true };
  });

export const upsertTier = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      id?: string;
      restaurantId: string;
      name: string;
      amount: number;
      discountPct: number;
      perk: string;
      sortOrder?: number;
    }) => input,
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const id = data.id ?? crypto.randomUUID();
    const sort = data.sortOrder ?? 99;
    await sql`
      insert into deposit_tiers (id, restaurant_id, name, amount, discount_pct, perk, sort_order)
      values (${id}, ${data.restaurantId}, ${data.name}, ${data.amount}, ${data.discountPct}, ${data.perk}, ${sort})
      on conflict (id) do update set
        name = excluded.name,
        amount = excluded.amount,
        discount_pct = excluded.discount_pct,
        perk = excluded.perk,
        sort_order = excluded.sort_order
    `;
    return { id };
  });

export const deleteTier = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const sql = await getSql();
    await sql`delete from deposit_tiers where id = ${id}`;
    return { ok: true };
  });
