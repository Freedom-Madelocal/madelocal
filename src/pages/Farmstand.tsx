import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFarmstandsMP } from "@/hooks/use-farmstands-mp";
import { useUserLocation } from "@/hooks/use-location";

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

const Farmstand = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: farmstands, isLoading } = useFarmstandsMP();
  const { location } = useUserLocation();

  const farmstand = useMemo(
    () => farmstands?.find((f) => f.slug === id || f.id === id),
    [farmstands, id]
  );

  const distance = useMemo(() => {
    if (!farmstand || !location) return null;
    return distanceMiles(
      location.lat,
      location.lng,
      farmstand.latitude,
      farmstand.longitude
    );
  }, [farmstand, location]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!farmstand) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-muted-foreground">Farmstand not found</p>
        <Button onClick={() => navigate("/")}>Back to Discover</Button>
      </div>
    );
  }

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${farmstand.latitude},${farmstand.longitude}`;

  return (
    <div className="min-h-screen pb-24">
      {/* Hero image */}
      <div className="relative aspect-[4/3] w-full bg-muted">
        {farmstand.image_url ? (
          <img
            src={farmstand.image_url}
            alt={farmstand.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No photo
          </div>
        )}
        <div className="absolute left-3 top-3" style={{ paddingTop: "env(safe-area-inset-top)" }}>
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
              {farmstand.name}
            </h1>
            {farmstand.location && (
              <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span>{farmstand.location}</span>
              </div>
            )}
          </div>
          {distance !== null && (
            <Badge variant="secondary" className="shrink-0">
              {distance.toFixed(1)} mi
            </Badge>
          )}
        </div>

        {!farmstand.claimed && (
          <Badge variant="outline" className="border-dashed">
            Unclaimed — community listed
          </Badge>
        )}

        {farmstand.description && (
          <div className="rounded-2xl border bg-card p-4">
            <h2 className="mb-2 text-sm font-semibold">About</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {farmstand.description}
            </p>
          </div>
        )}

        <div className="rounded-2xl border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold">Visit this farmstand</h2>
          <Button asChild size="lg" className="w-full gap-2">
            <a href={directionsUrl} target="_blank" rel="noreferrer">
              <Navigation className="h-4 w-4" />
              Get directions
            </a>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Farmstand;
