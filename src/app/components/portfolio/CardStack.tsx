import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronDown, ChevronRight, SquareArrowOutUpRight } from "lucide-react";
import { Link } from "react-router";
import { useEffect, useState } from "react";

function cn(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(" ");
}

export type CardStackItem = {
  id: string | number;
  title: string;
  description?: string;
  imageSrc?: string;
  href?: string;
  tag?: string;
};

type CardStackProps<T extends CardStackItem> = {
  items: T[];
  initialIndex?: number;
  maxVisible?: number;
  cardWidth?: number;
  cardHeight?: number;
  autoAdvance?: boolean;
  intervalMs?: number;
  pauseOnHover?: boolean;
  loop?: boolean;
  showDots?: boolean;
  className?: string;
};

function wrapIndex(index: number, length: number) {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
}

function signedOffset(index: number, active: number, length: number, loop: boolean) {
  const raw = index - active;
  if (!loop || length <= 1) return raw;
  const alt = raw > 0 ? raw - length : raw + length;
  return Math.abs(alt) < Math.abs(raw) ? alt : raw;
}

export function CardStack<T extends CardStackItem>({
  items,
  initialIndex = 0,
  maxVisible = 5,
  cardWidth = 640,
  cardHeight = 390,
  autoAdvance = true,
  intervalMs = 3200,
  pauseOnHover = true,
  loop = true,
  showDots = true,
  className,
}: CardStackProps<T>) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(() => wrapIndex(initialIndex, items.length));
  const [hovering, setHovering] = useState(false);
  const maxOffset = Math.max(0, Math.floor(maxVisible / 2));

  useEffect(() => {
    setActive((current) => wrapIndex(current, items.length));
  }, [items.length]);

  const prev = () => setActive((current) => wrapIndex(current - 1, items.length));
  const next = () => setActive((current) => wrapIndex(current + 1, items.length));

  useEffect(() => {
    if (!autoAdvance || reduceMotion || !items.length) return;
    if (pauseOnHover && hovering) return;
    const timer = window.setInterval(next, Math.max(900, intervalMs));
    return () => window.clearInterval(timer);
  }, [autoAdvance, hovering, intervalMs, items.length, pauseOnHover, reduceMotion]);

  if (!items.length) return null;
  const activeItem = items[active];

  return (
    <div
      className={cn("relative w-full overflow-x-clip overflow-y-visible", className)}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div
        className="relative mx-[calc(50%-50vw)] overflow-hidden outline-none"
        style={{ height: Math.max(520, cardHeight + 170) }}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") prev();
          if (event.key === "ArrowRight") next();
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,.08),transparent_34%),linear-gradient(180deg,rgba(255,255,255,.03),transparent_38%)]" aria-hidden />
        <div className="pointer-events-none absolute inset-x-0 bottom-4 mx-auto h-44 w-[70%] rounded-full bg-black/85 blur-3xl" aria-hidden />

        <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: "1200px" }}>
          <AnimatePresence initial={false}>
            {items.map((item, index) => {
              const offset = signedOffset(index, active, items.length, loop);
              const abs = Math.abs(offset);
              if (abs > maxOffset) return null;

              const isActive = offset === 0;
              const side = offset < 0 ? -1 : 1;
              const x = isActive ? 0 : side * (abs === 1 ? cardWidth * 0.62 : cardWidth * 1.06);
              const y = isActive ? -10 : abs === 1 ? 58 : 82;
              const rotateZ = isActive ? 0 : side * (abs === 1 ? 10 : 18);
              const rotateY = isActive ? 0 : side * (abs === 1 ? -9 : -16);
              const scale = isActive ? 1 : abs === 1 ? 0.9 : 0.78;
              const opacity = isActive ? 1 : abs === 1 ? 0.82 : 0.58;
              const zIndex = 100 - abs * 10;

              return (
                <motion.div
                  key={item.id}
                  className={cn(
                    "absolute overflow-hidden rounded-[22px] border border-white/10 bg-neutral-950 shadow-[0_26px_80px_rgba(0,0,0,.75)] ring-1 ring-white/5 will-change-transform select-none",
                    isActive ? "cursor-grab active:cursor-grabbing" : "cursor-pointer opacity-80 hover:opacity-100"
                  )}
                  style={{
                    width: `min(${cardWidth}px, calc(100vw - 48px))`,
                    height: cardHeight,
                    zIndex,
                    transformStyle: "preserve-3d",
                  }}
                  initial={reduceMotion ? false : { opacity: 0, y: y + 38, x, rotateZ, rotateY, scale }}
                  animate={{
                    opacity,
                    x,
                    y,
                    rotateZ,
                    rotateY,
                    scale,
                  }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: y + 24, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 240, damping: 30 }}
                  onClick={() => setActive(index)}
                  drag={isActive && !reduceMotion ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.16}
                  onDragEnd={(_, info) => {
                    if (reduceMotion) return;
                    const threshold = Math.min(150, cardWidth * 0.22);
                    if (info.offset.x > threshold || info.velocity.x > 650) prev();
                    if (info.offset.x < -threshold || info.velocity.x < -650) next();
                  }}
                >
                  <DefaultStackCard item={item} />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={next}
          className="absolute right-0 top-1/2 z-[120] flex h-14 w-11 -translate-y-1/2 items-center justify-center rounded-l-2xl border border-white/10 bg-black/80 text-white shadow-2xl transition hover:bg-white hover:text-black"
          aria-label="Next creative work"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {showDots && (
        <div className="-mt-16 flex flex-col items-center justify-center gap-7">
          <div className="relative z-[130] flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              {items.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActive(index)}
                  className={cn(
                    "h-2.5 w-2.5 rounded-full transition",
                    index === active ? "bg-white" : "bg-white/25 hover:bg-white/55"
                  )}
                  aria-label={`Go to ${item.title}`}
                />
              ))}
            </div>
            {activeItem?.href && (
              <Link to={activeItem.href} className="text-white/65 transition hover:text-white" aria-label={`Open ${activeItem.title}`}>
                <SquareArrowOutUpRight className="h-5 w-5" />
              </Link>
            )}
          </div>
          <button type="button" className="relative z-[130] inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/70 px-5 py-3 text-sm font-bold text-white shadow-[0_12px_40px_rgba(0,0,0,.45)] transition hover:border-white/35 hover:bg-white hover:text-black">
            See similar <ChevronDown size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

function DefaultStackCard({ item }: { item: CardStackItem }) {
  return (
    <div className="group relative h-full w-full">
      {item.imageSrc ? (
        <img src={item.imageSrc} alt={item.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" draggable={false} loading="lazy" />
      ) : (
        <div className="h-full w-full bg-[var(--color-bg-secondary)]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/18 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20" />
      <div className="absolute inset-x-0 bottom-0 p-7">
        {item.tag && <p className="font-mono text-[9px] uppercase tracking-[.2em] text-white/55">{item.tag}</p>}
        <h3 className="mt-2 font-manrope text-2xl font-extrabold text-white">{item.title}</h3>
        {item.description && <p className="mt-2 text-sm font-semibold text-white/70">{item.description}</p>}
      </div>
    </div>
  );
}
