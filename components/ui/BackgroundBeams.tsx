"use client";

const PATHS = [
  "M-380 -189C-380 -189 -312 216 152 343C616 470 684 875 684 875",
  "M-373 -197C-373 -197 -305 208 159 335C623 462 691 867 691 867",
  "M-360 -205C-360 -205 -292 200 172 327C636 454 704 859 704 859",
  "M-350 -214C-350 -214 -282 191 182 318C646 445 714 850 714 850",
  "M-340 -221C-340 -221 -272 184 192 311C656 438 724 843 724 843",
  "M-326 -229C-326 -229 -258 176 206 303C670 430 738 835 738 835",
  "M-310 -237C-310 -237 -242 168 222 295C686 422 754 827 754 827",
  "M-290 -244C-290 -244 -222 161 242 288C706 415 774 820 774 820",
];

export default function BackgroundBeams({ className = "" }: { className?: string }) {
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
      <svg
        viewBox="0 0 696 316"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}
      >
        <defs>
          {PATHS.map((_, i) => (
            <linearGradient
              key={i}
              id={`beam-${i}`}
              gradientUnits="userSpaceOnUse"
              x1="0%" y1="0%" x2="0%" y2="100%"
            >
              <stop offset="0%" stopColor="#C9A227" stopOpacity="0">
                <animate attributeName="offset" values="0;0.4;0" dur={`${8 + i * 0.8}s`} repeatCount="indefinite" />
              </stop>
              <stop offset="30%" stopColor="#C9A227" stopOpacity="0.5">
                <animate attributeName="offset" values="0.3;0.7;0.3" dur={`${8 + i * 0.8}s`} repeatCount="indefinite" />
              </stop>
              <stop offset="60%" stopColor="#F5C842" stopOpacity="0">
                <animate attributeName="offset" values="0.6;1;0.6" dur={`${8 + i * 0.8}s`} repeatCount="indefinite" />
              </stop>
            </linearGradient>
          ))}
        </defs>

        {PATHS.map((path, i) => (
          <path
            key={i}
            d={path}
            stroke={`url(#beam-${i})`}
            strokeWidth={i % 2 === 0 ? "0.6" : "0.3"}
          />
        ))}
      </svg>
    </div>
  );
}
