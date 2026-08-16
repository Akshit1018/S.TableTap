import { createContext, useContext } from "react";
import type { Restaurant } from "@/lib/data/types";

export type HostVenueState = {
  venues: Restaurant[];
  venue: Restaurant | null;
  venueId: string;
  setVenueId: (id: string) => void;
};

export const HostVenueContext = createContext<HostVenueState>({
  venues: [],
  venue: null,
  venueId: "amber",
  setVenueId: () => undefined,
});

export function useHostVenue() {
  return useContext(HostVenueContext);
}
