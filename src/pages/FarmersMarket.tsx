import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Navigation, Globe, Phone, CloudRain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFarmersMarketsMP } from "@/hooks/use-farmers-markets-mp";
import { useLocation } from "@/hooks/use-location";

function distanceMiles(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 3958.8;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface ScheduleEntry {
  day?: string;
  start_time?: string;
  end_time?: string;
  season?: string;
}

function renderSchedule(schedule: any): ScheduleEntry[] {
  if (!schedule) return [];
  if (Array.isArray(schedule)) return schedule;
  if (typeof schedule === "object") return Object.values(schedule) as ScheduleEntry[];
  return [];
}

const FarmersMarket = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: markets, isLoading } = useFarmersMarketsMP();
  const { location } = useLocation();

  const market = useMemo(
    () => markets?.find((m) => m.slug === slug || m.id === slug),
    [markets, slug]
  );

  const distance = useMemo(() => {
    if (!market || !location) return null;
    return distanceMiles(
      location.latitude,
      location.longitude,
      market.latitude,
      market.longitude
    );
  }, [market, location]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!market) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-muted-foreground">Market not found</p>
        <Button onClick={() => navigate("/")}>Back to Discover</Button>
      </div>
    );
  }

  const fullAddress = `${market.address}, ${market.city}, ${market.state}${
    market.zip_code ? ` ${market.zip_code}` : ""
  }`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    fullAddress
  )}`;
  const schedule = renderSchedule(market.schedule);

  return (
    <div className="min-h-screen pb-24">
      {/* Hero */}
      <div className="relative aspect-[4/3] w-full bg-gradient-to-br from-primary/20 to-secondary/20">
        {market.logo_url ? (
          <img
            src={market.logo_url}
            alt={market.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-3xl font-bold text-primary/60">
            {market.name}
          </div>
        )}
        <div
          className="absolute left-3 top-3"
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          <Button
            variant="secondary"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full bg-background/80 backdrop-blur-xl"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <main className="mx-auto max-w-lg space-y-4 px-4 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold leading-tight">
              {market.name}
            </h1>
            <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>
                {market.city}, {market.state}
              </span>
            </div>
          </div>
          {distance !== null && (
            <Badge variant="secondary" className="shrink-0">
              {distance.toFixed(1)} mi
            </Badge>
          )}
        </div>

        {market.rain_or_shine && (
          <Badge variant="outline" className="gap-1">
            <CloudRain className="h-3 w-3" />
            Rain or shine
          </Badge>
        )}

        {market.description && (
          <div className="rounded-2xl border bg-card p-4">
            <h2 className="mb-2 text-sm font-semibold">About</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {market.description}
            </p>
          </div>
        )}

        {schedule.length > 0 && (
          <div className="rounded-2xl border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Schedule</h2>
            <div className="space-y-2">
              {schedule.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="font-medium capitalize">
                    {s.day ?? "—"}
                  </span>
                  <span className="text-muted-foreground">
                    {s.start_time && s.end_time
                      ? `${s.start_time} – ${s.end_time}`
                      : s.season ?? ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2 rounded-2xl border bg-card p-4">
          <h2 className="text-sm font-semibold">Location</h2>
          <p className="text-sm text-muted-foreground">{fullAddress}</p>
          <Button asChild size="lg" className="mt-2 w-full gap-2">
            <a href={directionsUrl} target="_blank" rel="noreferrer">
              <Navigation className="h-4 w-4" />
              Get directions
            </a>
          </Button>
        </div>

        {(market.website_url || market.phone) && (
          <div className="space-y-2 rounded-2xl border bg-card p-4">
            <h2 className="mb-1 text-sm font-semibold">Contact</h2>
            {market.website_url && (
              <Button asChild variant="outline" className="w-full justify-start gap-2">
                <a href={market.website_url} target="_blank" rel="noreferrer">
                  <Globe className="h-4 w-4" />
                  Visit website
                </a>
              </Button>
            )}
            {market.phone && (
              <Button asChild variant="outline" className="w-full justify-start gap-2">
                <a href={`tel:${market.phone}`}>
                  <Phone className="h-4 w-4" />
                  {market.phone}
                </a>
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default FarmersMarket;
