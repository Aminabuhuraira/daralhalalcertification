"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/*
 * AfricaMap -- renders accurate African country outlines fetched from
 * Natural Earth GeoJSON (via D3-graph-gallery CDN). No extra packages needed.
 *
 * Projection: simple equirectangular clipped to Africa's bounding box.
 *   x = (lon - MIN_LON) / (MAX_LON - MIN_LON) * W
 *   y = (MAX_LAT - lat) / (MAX_LAT - MIN_LAT) * H
 */

// Africa ISO 3166-1 alpha-3 codes
const AFRICA_IDS = new Set([
  "DZA","AGO","BEN","BWA","BFA","BDI","CMR","CPV","CAF","TCD",
  "COM","COD","COG","DJI","EGY","GNQ","ERI","ETH","GAB","GMB",
  "GHA","GIN","GNB","CIV","KEN","LSO","LBR","LBY","MDG","MWI",
  "MLI","MRT","MUS","MAR","MOZ","NAM","NER","NGA","RWA","STP",
  "SEN","SLE","SOM","ZAF","SDS","SDN","SWZ","TZA","TGO","TUN",
  "UGA","ESH","ZMB","ZWE","ABV",
]);

const NIGERIA_ID = "NGA";

// SVG canvas
const W = 420;
const H = 450;

// Africa bounding box (degrees, with small padding)
const MIN_LON = -20;
const MAX_LON = 55;
const MIN_LAT = -36;
const MAX_LAT = 38;

// Nigeria's geographic center
const NG_LON = 8.0;
const NG_LAT = 9.0;

function project(lon: number, lat: number): [number, number] {
  const x = ((lon - MIN_LON) / (MAX_LON - MIN_LON)) * W;
  const y = ((MAX_LAT - lat) / (MAX_LAT - MIN_LAT)) * H;
  return [parseFloat(x.toFixed(1)), parseFloat(y.toFixed(1))];
}

function geoToSvgPath(geometry: {
  type: string;
  coordinates: number[][][] | number[][][][];
}): string {
  const rings: number[][][] = [];
  if (geometry.type === "Polygon") {
    (geometry.coordinates as number[][][]).forEach((r) => rings.push(r));
  } else if (geometry.type === "MultiPolygon") {
    (geometry.coordinates as number[][][][]).forEach((poly) =>
      poly.forEach((r) => rings.push(r))
    );
  }
  return rings
    .map((ring) =>
      ring
        .map((pt, i) => {
          const [x, y] = project(pt[0], pt[1]);
          return `${i === 0 ? "M" : "L"}${x},${y}`;
        })
        .join(" ") + " Z"
    )
    .join(" ");
}

interface GeoFeature {
  id: string;
  path: string;
}

const [NG_X, NG_Y] = project(NG_LON, NG_LAT);
const RING_DELAYS = [0, 0.9, 1.8];

const GEO_URL =
  "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";

export default function AfricaMap() {
  const [features, setFeatures] = useState<GeoFeature[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(GEO_URL)
      .then((r) => r.json())
      .then((geojson) => {
        const africa: GeoFeature[] = geojson.features
          .filter((f: { id: string }) => AFRICA_IDS.has(f.id))
          .map((f: { id: string; geometry: { type: string; coordinates: number[][][] | number[][][][] } }) => ({
            id: f.id,
            path: geoToSvgPath(f.geometry),
          }));
        setFeatures(africa);
        setLoaded(true);
      })
      .catch(() => {
        // If fetch fails, still mark loaded so UI isn't stuck
        setLoaded(true);
      });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
      style={{ width: "100%", position: "relative" }}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ display: "block", overflow: "visible" }}
        aria-label="Africa map with Nigeria highlighted in gold"
      >
        <defs>
          <radialGradient id="ngFill2" cx="42%" cy="40%" r="60%">
            <stop offset="0%"   stopColor="#FFE17B" />
            <stop offset="55%"  stopColor="#F5C842" />
            <stop offset="100%" stopColor="#C9A227" stopOpacity="0.9" />
          </radialGradient>

          <filter id="ngGlow2" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
            <feColorMatrix
              in="blur" type="matrix"
              values="1 0.7 0 0 0  0.85 0.6 0 0 0  0 0 0 0 0  0 0 0 0.5 0"
              result="gold"
            />
            <feMerge>
              <feMergeNode in="gold" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="cShadow2" x="-5%" y="-5%" width="110%" height="110%">
            <feDropShadow dx="2" dy="4" stdDeviation="5"
              floodColor="rgba(60,10,140,0.12)" floodOpacity="1" />
          </filter>
        </defs>

        {/* Loading skeleton */}
        {!loaded && (
          <rect
            x={10} y={10} width={W - 20} height={H - 20}
            rx={8}
            fill="rgba(109,40,217,0.06)"
            stroke="rgba(109,40,217,0.2)"
            strokeWidth={1}
          />
        )}

        {loaded && features.length === 0 && (
          <text
            x={W / 2} y={H / 2}
            textAnchor="middle"
            fontSize={12}
            fill="rgba(109,40,217,0.4)"
          >
            Map unavailable
          </text>
        )}

        {/* All African countries except Nigeria */}
        {features
          .filter((f) => f.id !== NIGERIA_ID)
          .map((f) => (
            <path
              key={f.id}
              d={f.path}
              fill="rgba(109,40,217,0.08)"
              stroke="rgba(109,40,217,0.5)"
              strokeWidth={0.7}
              strokeLinejoin="round"
              filter="url(#cShadow2)"
            />
          ))}

        {/* Nigeria glow layer */}
        {features
          .filter((f) => f.id === NIGERIA_ID)
          .map((f) => (
            <path
              key="ng-glow"
              d={f.path}
              fill="rgba(245,200,66,0.28)"
              stroke="none"
              filter="url(#ngGlow2)"
            />
          ))}

        {/* Nigeria solid gold + breathing */}
        {features
          .filter((f) => f.id === NIGERIA_ID)
          .map((f) => (
            <path
              key="ng-fill"
              d={f.path}
              fill="url(#ngFill2)"
              stroke="#B8890A"
              strokeWidth={0.9}
              strokeLinejoin="round"
              style={{ animation: "nigeriaBreath2 2.6s ease-in-out infinite" }}
            />
          ))}

        {/* Pulsing rings */}
        <g transform={`translate(${NG_X},${NG_Y})`}>
          {RING_DELAYS.map((delay, i) => (
            <motion.circle
              key={i}
              cx={0} cy={0} r={10}
              fill="none"
              stroke="#F5C842"
              strokeWidth={1}
              initial={{ scale: 0.6, opacity: 0.65 }}
              animate={{ scale: 4.5, opacity: 0 }}
              transition={{
                duration: 2.6,
                repeat: Infinity,
                ease: "easeOut",
                delay,
              }}
            />
          ))}
        </g>

        {/* Centroid dot */}
        <circle cx={NG_X} cy={NG_Y} r={4.5}
          fill="white" stroke="#B8890A" strokeWidth={1.5} />
        <circle cx={NG_X} cy={NG_Y} r={2} fill="#C9A227" />

        {/* NIGERIA label */}
        <text
          x={NG_X} y={NG_Y - 10}
          textAnchor="middle"
          fontSize={7.5}
          fontWeight="700"
          fill="#7A5500"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="0.07em"
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          NIGERIA
        </text>
      </svg>

      {/* Legend */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        justifyContent: "center", marginTop: 14,
      }}>
        <div style={{
          width: 11, height: 11, borderRadius: 3,
          background: "linear-gradient(135deg, #FFE17B, #F5C842)",
          boxShadow: "0 0 7px rgba(245,200,66,0.55)",
          flexShrink: 0,
        }} />
        <span style={{
          fontFamily: "var(--font-body, system-ui)",
          fontSize: 11,
          color: "rgba(10,21,53,0.64)",
          letterSpacing: "0.06em",
          textTransform: "uppercase" as const,
        }}>
          Nigeria &mdash; Africa&apos;s Halal Gateway
        </span>
      </div>

      <style>{`
        @keyframes nigeriaBreath2 {
          0%, 100% {
            filter: drop-shadow(0 0 5px rgba(245,200,66,0.65))
                    drop-shadow(0 0 15px rgba(245,200,66,0.32));
            opacity: 0.9;
          }
          50% {
            filter: drop-shadow(0 0 12px rgba(245,200,66,1))
                    drop-shadow(0 0 32px rgba(245,200,66,0.58))
                    drop-shadow(0 0 55px rgba(245,200,66,0.22));
            opacity: 1;
          }
        }
      `}</style>
    </motion.div>
  );
}
