"use client";
import { useRef, useState } from "react";

interface Props {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export default function GlowingCard({ children, style, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={className}
      style={{
        position: "relative",
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(13,27,71,0.6)",
        backdropFilter: "blur(16px)",
        transition: "border-color 0.3s",
        ...style,
      }}
    >
      {/* Gradient border glow on hover */}
      <div
        style={{
          position: "absolute",
          inset: -1,
          borderRadius: 17,
          background: hovered
            ? `radial-gradient(circle at ${pos.x}% ${pos.y}%, rgba(201,162,39,0.4) 0%, transparent 50%)`
            : "transparent",
          transition: "opacity 0.3s",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}
