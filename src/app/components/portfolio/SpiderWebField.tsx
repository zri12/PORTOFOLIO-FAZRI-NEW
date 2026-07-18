import { useId, useMemo } from "react";

export function SpiderWebField({ className = "" }: { className?: string }) {
  const id = useId();

  // Generate deterministic but organic looking web nodes
  const nodes = useMemo(() => {
    const pts = [];
    const rings = 5;
    const segments = 12;
    for (let r = 1; r <= rings; r++) {
      const radius = r * 20;
      for (let s = 0; s < segments; s++) {
        const angle = (s / segments) * Math.PI * 2 + (r % 2 === 0 ? 0.2 : 0);
        // Add some noise
        const rNoise = (Math.random() - 0.5) * 5;
        const aNoise = (Math.random() - 0.5) * 0.1;
        
        pts.push({
          x: 50 + (radius + rNoise) * Math.cos(angle + aNoise),
          y: 50 + (radius + rNoise) * Math.sin(angle + aNoise),
          ring: r,
          segment: s
        });
      }
    }
    return pts;
  }, []);

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden opacity-30 mix-blend-screen ${className}`}>
      <svg className="h-full w-full opacity-60" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id={`glow-${id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-accent-main)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--color-accent-main)" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        {/* Glow behind center */}
        <circle cx="50" cy="50" r="30" fill={`url(#glow-${id})`} />
        
        {/* Radial Spokes */}
        {Array.from({ length: 12 }).map((_, i) => (
          <line
            key={`spoke-${i}`}
            x1="50" y1="50"
            x2={50 + 60 * Math.cos((i / 12) * Math.PI * 2)}
            y2={50 + 60 * Math.sin((i / 12) * Math.PI * 2)}
            stroke="var(--color-accent-main)"
            strokeWidth="0.1"
            className="opacity-40"
          />
        ))}

        {/* Connecting Rings (Spider Web Pattern) */}
        {nodes.map((node, i) => {
          // Connect to next segment in the same ring
          const nextSegmentNode = nodes.find(n => n.ring === node.ring && n.segment === (node.segment + 1) % 12);
          
          if (!nextSegmentNode) return null;
          
          // Use quadratic bezier to give the web that drooping shape
          const midX = (node.x + nextSegmentNode.x) / 2;
          const midY = (node.y + nextSegmentNode.y) / 2;
          // Pull control point slightly towards center to create sag
          const cpX = midX * 0.95 + 50 * 0.05;
          const cpY = midY * 0.95 + 50 * 0.05;

          return (
            <path
              key={`ring-${i}`}
              d={`M ${node.x} ${node.y} Q ${cpX} ${cpY} ${nextSegmentNode.x} ${nextSegmentNode.y}`}
              fill="none"
              stroke="var(--color-accent-main)"
              strokeWidth="0.1"
              className="opacity-40"
            />
          );
        })}

        {/* Highlight Nodes */}
        {nodes.filter(n => n.ring > 1).map((node, i) => (
          <circle 
            key={`node-${i}`} 
            cx={node.x} 
            cy={node.y} 
            r="0.3" 
            fill="var(--color-accent-secondary)" 
            className="opacity-60" 
          />
        ))}
      </svg>
    </div>
  );
}
