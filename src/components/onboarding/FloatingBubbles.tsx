import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import type { SellerWithListings } from "@/hooks/use-sellers";

const BUBBLE_SIZE = 56; // 14 * 4 = 56px (h-14 w-14)
const BUBBLE_RADIUS = BUBBLE_SIZE / 2;
const SPEED = 0.4; // slow & graceful

interface Bubble {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Props {
  sellers: SellerWithListings[];
}

export default function FloatingBubbles({ sellers }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bubblesRef = useRef<Bubble[]>([]);
  const animFrameRef = useRef<number>(0);
  const [positions, setPositions] = useState<{ x: number; y: number }[]>([]);
  const [entered, setEntered] = useState(false);

  const initBubbles = useCallback(() => {
    const el = containerRef.current;
    if (!el || !sellers.length) return;
    const { width, height } = el.getBoundingClientRect();

    const bubbles: Bubble[] = sellers.slice(0, 5).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      return {
        x: BUBBLE_RADIUS + ((width - BUBBLE_SIZE) / (sellers.length + 1)) * (i + 1),
        y: BUBBLE_RADIUS + Math.random() * (height - BUBBLE_SIZE),
        vx: Math.cos(angle) * SPEED,
        vy: Math.sin(angle) * SPEED,
      };
    });
    bubblesRef.current = bubbles;
    setPositions(bubbles.map((b) => ({ x: b.x, y: b.y })));
  }, [sellers]);

  useEffect(() => {
    // Delay init so the entry animation plays first
    const timer = setTimeout(() => {
      initBubbles();
      setEntered(true);
    }, 1400);
    return () => clearTimeout(timer);
  }, [initBubbles]);

  useEffect(() => {
    if (!entered) return;

    const tick = () => {
      const el = containerRef.current;
      if (!el) return;
      const { width, height } = el.getBoundingClientRect();
      const bs = bubblesRef.current;

      // Move
      for (const b of bs) {
        b.x += b.vx;
        b.y += b.vy;
      }

      // Wall bounce
      for (const b of bs) {
        if (b.x - BUBBLE_RADIUS < 0) { b.x = BUBBLE_RADIUS; b.vx = Math.abs(b.vx); }
        if (b.x + BUBBLE_RADIUS > width) { b.x = width - BUBBLE_RADIUS; b.vx = -Math.abs(b.vx); }
        if (b.y - BUBBLE_RADIUS < 0) { b.y = BUBBLE_RADIUS; b.vy = Math.abs(b.vy); }
        if (b.y + BUBBLE_RADIUS > height) { b.y = height - BUBBLE_RADIUS; b.vy = -Math.abs(b.vy); }
      }

      // Bubble-to-bubble collision
      for (let i = 0; i < bs.length; i++) {
        for (let j = i + 1; j < bs.length; j++) {
          const dx = bs[j].x - bs[i].x;
          const dy = bs[j].y - bs[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = BUBBLE_SIZE;
          if (dist < minDist && dist > 0) {
            const nx = dx / dist;
            const ny = dy / dist;
            const overlap = (minDist - dist) / 2;
            bs[i].x -= nx * overlap;
            bs[i].y -= ny * overlap;
            bs[j].x += nx * overlap;
            bs[j].y += ny * overlap;

            // Swap velocity components along collision normal
            const dvx = bs[i].vx - bs[j].vx;
            const dvy = bs[i].vy - bs[j].vy;
            const dot = dvx * nx + dvy * ny;
            bs[i].vx -= dot * nx;
            bs[i].vy -= dot * ny;
            bs[j].vx += dot * nx;
            bs[j].vy += dot * ny;
          }
        }
      }

      setPositions(bs.map((b) => ({ x: b.x, y: b.y })));
      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [entered]);

  const topSellers = sellers.slice(0, 5);

  // Initial arc positions for entry animation
  const arcPositions = [
    { left: '10%', bottom: '140px' },
    { left: '28%', bottom: '110px' },
    { left: '50%', bottom: '100px' },
    { left: '72%', bottom: '110px' },
    { left: '90%', bottom: '140px' },
  ];

  return (
    <div ref={containerRef} className="absolute inset-x-0 bottom-0 h-56 pointer-events-none overflow-hidden" style={{ zIndex: 10 }}>
      {topSellers.map((seller, i) => {
        const firstPrice = seller.listings?.[0]?.price;
        const displayName = seller.name || "Seller";
        const imgSrc = seller.avatar_url || seller.listings?.[0]?.images?.[0];
        const pos = positions[i];
        const arc = arcPositions[i];

        return (
          <motion.div
            key={seller.id}
            initial={{ opacity: 0, scale: 0.5, left: arc.left, bottom: arc.bottom }}
            animate={
              entered && pos
                ? { opacity: 1, scale: 1, left: pos.x - BUBBLE_RADIUS, top: pos.y - BUBBLE_RADIUS, bottom: 'auto' }
                : { opacity: 1, scale: 1, left: arc.left, bottom: arc.bottom }
            }
            transition={
              entered && pos
                ? { left: { duration: 0 }, top: { duration: 0 }, opacity: { duration: 0.4 }, scale: { type: "spring", stiffness: 200, damping: 18, delay: 0.8 + i * 0.12 } }
                : { delay: 0.8 + i * 0.12, type: "spring", stiffness: 200, damping: 18 }
            }
            className="absolute pointer-events-auto group"
            style={entered && pos ? { left: pos.x - BUBBLE_RADIUS, top: pos.y - BUBBLE_RADIUS } : undefined}
          >
            {/* Name tooltip on hover */}
            <div className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background opacity-0 transition-opacity duration-200 group-hover:opacity-100 shadow-md z-10">
              {displayName}
            </div>

            {/* Avatar bubble */}
            <div className="relative">
              <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-background shadow-lg ring-2 ring-primary/20">
                {imgSrc ? (
                  <img src={imgSrc} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground text-lg font-bold">
                    {displayName.charAt(0)}
                  </div>
                )}
              </div>
              {firstPrice != null && (
                <span className="absolute -bottom-1.5 -right-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground shadow-sm">
                  ${Number(firstPrice).toFixed(0)}
                </span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
