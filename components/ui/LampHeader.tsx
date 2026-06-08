"use client";
import { motion } from "framer-motion";
import React from "react";

interface Props {
  eyebrow?: string;
  children: React.ReactNode;
  light?: boolean;
}

export default function LampHeader({ eyebrow, children, light = false }: Props) {
  return (
    <div style={{ position: "relative", textAlign: "center", paddingTop: 60, paddingBottom: 40, overflow: "hidden" }}>
      {/* Lamp cone */}
      <div style={{
        position: "absolute",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "60%",
        height: "100%",
        background: "conic-gradient(from 270deg at 50% 0%, rgba(201,162,39,0.15) 0deg, transparent 50deg, transparent 310deg, rgba(201,162,39,0.15) 360deg)",
        pointerEvents: "none",
      }} />
      {/* Center line */}
      <div style={{
        position: "absolute",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: 1,
        height: "50%",
        background: "linear-gradient(to bottom, rgba(201,162,39,0.5), transparent)",
        pointerEvents: "none",
      }} />
      {/* Dot */}
      <div style={{
        position: "absolute",
        top: 0,
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: "#C9A227",
        boxShadow: "0 0 20px rgba(201,162,39,0.8), 0 0 40px rgba(201,162,39,0.4)",
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {eyebrow && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{
              fontFamily: "var(--font-accent)",
              fontSize: 11,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#C9A227",
              marginBottom: 16,
            }}
          >
            {eyebrow}
          </motion.p>
        )}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.7 }}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(32px,4.5vw,56px)",
            fontWeight: 300,
            color: light ? "var(--text-primary)" : "white",
            lineHeight: 1.1,
          }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
