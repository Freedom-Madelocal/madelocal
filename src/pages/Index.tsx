import { useMemo, useState, useEffect } from "react";
import { Loader2, MapPin, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/discover/SearchBar";
import { CategoryFilter } from "@/components/discover/CategoryFilter";
import { SegmentToggle, type Segment } from "@/components/discover/SegmentToggle";
import { ListingCard } from "@/components/listings/ListingCard";
import { FarmstandCard } from "@/components/farmstand/FarmstandCard";
import { MarketCard } from "@/components/markets/MarketCard";
import { useMarketplaceListings } from "@/hooks/use-marketplace-listings";
import { useFarmstandsMP } from "@/hooks/use-farmstands-mp";
import { useFarmersMarketsMP } from "@/hooks/use-farmers-markets-mp";
import { useUserLocation } from "@/hooks/use-location";
import { useCart } from "@/hooks/use-cart-mp";
import logoFull from "@/assets/logo-full.png";

const RADIUS_MILES = 5;

function distMiles(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 3959;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const Index = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [segment, setSegment] = useState<Segment>("listings");
  const { location, loading: locLoading, requestLocation } = useUserLocation();
  const { itemCount } = useCart();

  const { data: listings = [], isLoading: listingsLoading } = useMarketplaceListings();
  const { data: farmstands = [], isLoading: farmstandsLoading } = useFarmstandsMP();
  const { data: markets = [], isLoading: marketsLoading } = useFarmersMarketsMP();

  // Auto-request location on mount
  useEffect(() => {
    if (!location && !locLoading) requestLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const userLat = location?.lat ?? null;
  const userLng = location?.lng ?? null;

  const filteredListings = useMemo(() => {
    return listings
      .map((l) => {
        const distance =
          userLat != null && userLng != null && l.latitude != null && l.longitude != null
            ? distMiles(userLat, userLng, l.latitude, l.longitude)
            : null;
        return { row: l, distance };
      })
      .filter(({ row, distance }) => {
        const matchesCat = category === "all" || row.category === category;
        const q = search.toLowerCase();
        const matchesSearch =
          !search ||
          row.title.toLowerCase().includes(q) ||
          row.description?.toLowerCase().includes(q);
        const matchesLoc = userLat == null || distance == null || distance <= RADIUS_MILES;
        return matchesCat && matchesSearch && matchesLoc;
      })
      .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
  }, [listings, search, category, userLat, userLng]);

  const filteredFarmstands = useMemo(() => {
    return farmstands
      .map((f) => {
        const distance =
          userLat != null && userLng != null
            ? distMiles(userLat, userLng, f.latitude, f.longitude)
            : null;
        return { row: f, distance };
      })
      .filter(({ row, distance }) => {
        const q = search.toLowerCase();
        const matchesSearch =
          !search ||
          row.name.toLowerCase().includes(q) ||
          row.description?.toLowerCase().includes(q);
        const matchesLoc = userLat == null || distance == null || distance <= RADIUS_MILES;
        return matchesSearch && matchesLoc;
      })
      .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
  }, [farmstands, search, userLat, userLng]);

  const filteredMarkets = useMemo(() => {
    return markets
      .map((m) => {
        const distance =
          userLat != null && userLng != null
            ? distMiles(userLat, userLng, m.latitude, m.longitude)
            : null;
        return { row: m, distance };
      })
      .filter(({ row, distance }) => {
        const q = search.toLowerCase();
        const matchesSearch =
          !search ||
          row.name.toLowerCase().includes(q) ||
          row.city.toLowerCase().includes(q);
        const matchesLoc = userLat == null || distance == null || distance <= RADIUS_MILES;
        return matchesSearch && matchesLoc;
      })
      .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
  }, [markets, search, userLat, userLng]);

  const isLoading =
    (segment === "listings" && listingsLoading) ||
    (segment === "farmstands" && farmstandsLoading) ||
    (segment === "markets" && marketsLoading);

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-lg px-4 pb-3 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <img src={logoFull} alt="MadeLocal" className="h-16 object-contain" />
              <p className="mt-1 text-sm text-muted-foreground">Discover food near you</p>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/cart" className="relative">
                <Button variant="outline" size="icon" className="h-9 w-9 rounded-full">
                  <ShoppingCart className="h-4 w-4" />
                </Button>
                {itemCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-5 min-w-[20px] rounded-full px-1 text-[10px]">
                    {itemCount}
                  </Badge>
                )}
              </Link>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "shrink-0 gap-1.5 rounded-full",
                  location && "border-primary/30 bg-primary/10 text-primary hover:bg-primary/15"
                )}
                onClick={requestLocation}
                disabled={locLoading}
              >
                {locLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <MapPin className="h-3.5 w-3.5" />
                )}
                {RADIUS_MILES} mi
              </Button>
            </div>
          </div>

          <div className="mt-3">
            <SearchBar value={search} onChange={setSearch} />
          </div>

          {segment === "listings" && (
            <div className="mt-3">
              <CategoryFilter selected={category} onSelect={setCategory} />
            </div>
          )}

          <div className="mt-3">
            <SegmentToggle value={segment} onChange={setSegment} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pt-3">
        {isLoading && (
          <div className="py-16 text-center text-muted-foreground">
            <Loader2 className="mx-auto h-6 w-6 animate-spin" />
            <p className="mt-2 text-sm">Loading…</p>
          </div>
        )}

        {!isLoading && segment === "listings" && (
          <>
            {filteredListings.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">
                <p className="text-lg font-medium">No listings nearby</p>
                <p className="mt-1 text-sm">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filteredListings.map(({ row, distance }, i) => (
                  <ListingCard key={row.id} row={row} distance={distance} index={i} />
                ))}
              </div>
            )}
          </>
        )}

        {!isLoading && segment === "farmstands" && (
          <>
            {filteredFarmstands.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">
                <p className="text-lg font-medium">No farmstands nearby</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filteredFarmstands.map(({ row, distance }, i) => (
                  <FarmstandCard key={row.id} row={row} distance={distance} index={i} />
                ))}
              </div>
            )}
          </>
        )}

        {!isLoading && segment === "markets" && (
          <>
            {filteredMarkets.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">
                <p className="text-lg font-medium">No markets nearby</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredMarkets.map(({ row, distance }, i) => (
                  <MarketCard key={row.id} row={row} distance={distance} index={i} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
