"use client";
import { useEffect, useRef } from "react";

export default function AuroraBackground({ className = "" }: { className?: string }) {
  return (
    <div
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      {/* Base dark */}
      <div style={{ position: "absolute", inset: 0, background: "#0A1535" }} />

      {/* Aurora layers */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(ellipse 80% 60% at 50% -20%, rgba(27,42,123,0.5) 0%, transparent 70%)",
        animation: "aurora1 8s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(ellipse 60% 50% at 20% 80%, rgba(22,32,96,0.4) 0%, transparent 70%)",
        animation: "aurora2 10s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(ellipse 40% 40% at 80% 60%, rgba(27,42,123,0.25) 0%, transparent 60%)",
        animation: "aurora3 12s ease-in-out infinite",
      }} />
      {/* Subtle gold glow at bottom center */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "60%",
        height: "30%",
        background: "radial-gradient(ellipse at center bottom, rgba(201,162,39,0.07) 0%, transparent 70%)",
      }} />

      <style>{`
        @keyframes aurora1 {
          0%,100% { opacity: 1; transform: translate(0,0) scale(1); }
          50% { opacity: 0.7; transform: translate(-5%,8%) scale(1.05); }
        }
        @keyframes aurora2 {
          0%,100% { opacity: 0.8; transform: translate(0,0) scale(1); }
          50% { opacity: 1; transform: translate(5%,-6%) scale(1.08); }
        }
        @keyframes aurora3 {
          0%,100% { opacity: 0.6; transform: translate(0,0) scale(1); }
          33% { opacity: 0.9; transform: translate(-8%,4%) scale(1.1); }
          66% { opacity: 0.5; transform: translate(6%,-3%) scale(0.95); }
        }
      `}</style>
    </div>
  );
}
