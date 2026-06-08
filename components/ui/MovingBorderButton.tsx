"use client";
import Link from "next/link";
import React from "react";

interface Props {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  as?: "button" | "a";
}

export default function MovingBorderButton({ href, onClick, children, className = "", as: Tag = "a" }: Props) {
  const inner = (
    <span
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 32px",
        background: "#0D1B47",
        borderRadius: 8,
        fontFamily: "var(--font-body)",
        fontSize: 14,
        fontWeight: 600,
        color: "#F5C842",
        letterSpacing: "0.04em",
        cursor: "pointer",
        zIndex: 1,
        transition: "background 0.2s",
      }}
    >
      {children}
    </span>
  );

  const wrapper: React.CSSProperties = {
    position: "relative",
    display: "inline-flex",
    borderRadius: 9,
    padding: 1.5,
    background: "linear-gradient(var(--angle, 0deg), #C9A227, #1B2A7B, #C9A227)",
    animation: "movingBorderSpin 3s linear infinite",
    cursor: "pointer",
    textDecoration: "none",
  };

  if (href) {
    return (
      <>
        <Link href={href} style={wrapper} className={className}>
          {inner}
        </Link>
        <style>{`
          @keyframes movingBorderSpin {
            0% { background: linear-gradient(0deg, #C9A227 0%, #1B2A7B 50%, #C9A227 100%); }
            25% { background: linear-gradient(90deg, #C9A227 0%, #1B2A7B 50%, #C9A227 100%); }
            50% { background: linear-gradient(180deg, #C9A227 0%, #1B2A7B 50%, #C9A227 100%); }
            75% { background: linear-gradient(270deg, #C9A227 0%, #1B2A7B 50%, #C9A227 100%); }
            100% { background: linear-gradient(360deg, #C9A227 0%, #1B2A7B 50%, #C9A227 100%); }
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      <button onClick={onClick} style={wrapper} className={className}>
        {inner}
      </button>
      <style>{`
        @keyframes movingBorderSpin {
          0% { background: linear-gradient(0deg, #C9A227 0%, #1B2A7B 50%, #C9A227 100%); }
          25% { background: linear-gradient(90deg, #C9A227 0%, #1B2A7B 50%, #C9A227 100%); }
          50% { background: linear-gradient(180deg, #C9A227 0%, #1B2A7B 50%, #C9A227 100%); }
          75% { background: linear-gradient(270deg, #C9A227 0%, #1B2A7B 50%, #C9A227 100%); }
          100% { background: linear-gradient(360deg, #C9A227 0%, #1B2A7B 50%, #C9A227 100%); }
        }
      `}</style>
    </>
  );
}
