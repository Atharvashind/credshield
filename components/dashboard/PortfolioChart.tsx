"use client";

import { useEffect, useRef, useState } from "react";

interface DataPoint {
  epoch: number;
  nav: number;
  label: string;
}

// Simulate NAV growth over 12 rebalance epochs at 0.5% each
function generateNavHistory(): DataPoint[] {
  const points: DataPoint[] = [];
  let nav = 1.0;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                   "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  for (let i = 0; i < 12; i++) {
    points.push({ epoch: i, nav: parseFloat(nav.toFixed(6)), label: months[i] });
    nav *= 1.005; // 0.5% per epoch
  }
  return points;
}

const DATA = generateNavHistory();
const MAX_NAV = Math.max(...DATA.map((d) => d.nav));
const MIN_NAV = Math.min(...DATA.map((d) => d.nav));
const NAV_RANGE = MAX_NAV - MIN_NAV;

export function PortfolioChart() {
  const [hovered, setHovered] = useState<DataPoint | null>(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  const W = 600;
  const H = 200;
  const PAD = { top: 20, right: 20, bottom: 30, left: 50 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const xStep = chartW / (DATA.length - 1);

  const toX = (i: number) => PAD.left + i * xStep;
  const toY = (nav: number) =>
    PAD.top + chartH - ((nav - MIN_NAV) / (NAV_RANGE || 1)) * chartH;

  // Build SVG path
  const linePath = DATA.map((d, i) =>
    `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(d.nav)}`
  ).join(" ");

  // Area fill path
  const areaPath =
    linePath +
    ` L ${toX(DATA.length - 1)} ${PAD.top + chartH}` +
    ` L ${toX(0)} ${PAD.top + chartH} Z`;

  return (
    <div className="glass-panel rounded-xl p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="font-sans text-xs text-stone-600 uppercase tracking-wider mb-1">
            NAV per Share — 12 Epoch History
          </p>
          {hovered ? (
            <p className="font-serif text-2xl text-stone-100">
              {hovered.nav.toFixed(6)}{" "}
              <span className="font-sans text-sm text-stone-500">XLM</span>
            </p>
          ) : (
            <p className="font-serif text-2xl text-stone-100">
              {DATA[DATA.length - 1].nav.toFixed(6)}{" "}
              <span className="font-sans text-sm text-stone-500">XLM</span>
            </p>
          )}
        </div>
        <span className="font-sans text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded">
          +{(((DATA[DATA.length - 1].nav - DATA[0].nav) / DATA[0].nav) * 100).toFixed(2)}%
        </span>
      </div>

      {/* SVG Chart */}
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          onMouseLeave={() => setHovered(null)}
        >
          <defs>
            <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D3CBBE" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#D3CBBE" stopOpacity="0" />
            </linearGradient>
            <clipPath id="chart-clip">
              <rect
                x={PAD.left}
                y={PAD.top}
                width={animated ? chartW : 0}
                height={chartH}
                style={{ transition: "width 1.2s cubic-bezier(0.4,0,0.2,1)" }}
              />
            </clipPath>
          </defs>

          {/* Y-axis grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((t) => {
            const y = PAD.top + chartH * (1 - t);
            const val = MIN_NAV + NAV_RANGE * t;
            return (
              <g key={t}>
                <line
                  x1={PAD.left}
                  y1={y}
                  x2={PAD.left + chartW}
                  y2={y}
                  stroke="#1c1c1c"
                  strokeWidth="1"
                />
                <text
                  x={PAD.left - 6}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-stone-700"
                  style={{ fontSize: 9, fontFamily: "monospace" }}
                >
                  {val.toFixed(4)}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path d={areaPath} fill="url(#chart-fill)" clipPath="url(#chart-clip)" />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#D3CBBE"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            clipPath="url(#chart-clip)"
          />

          {/* X-axis labels */}
          {DATA.map((d, i) => (
            <text
              key={i}
              x={toX(i)}
              y={H - 6}
              textAnchor="middle"
              className="fill-stone-700"
              style={{ fontSize: 9, fontFamily: "sans-serif" }}
            >
              {d.label}
            </text>
          ))}

          {/* Hover targets */}
          {DATA.map((d, i) => (
            <g key={i}>
              <rect
                x={toX(i) - xStep / 2}
                y={PAD.top}
                width={xStep}
                height={chartH}
                fill="transparent"
                onMouseEnter={() => setHovered(d)}
              />
              {hovered?.epoch === i && (
                <>
                  <line
                    x1={toX(i)}
                    y1={PAD.top}
                    x2={toX(i)}
                    y2={PAD.top + chartH}
                    stroke="#D3CBBE"
                    strokeWidth="0.5"
                    strokeDasharray="3 3"
                  />
                  <circle
                    cx={toX(i)}
                    cy={toY(d.nav)}
                    r="4"
                    fill="#D3CBBE"
                    stroke="#000"
                    strokeWidth="1.5"
                  />
                </>
              )}
            </g>
          ))}
        </svg>
      </div>

      <p className="font-sans text-2xs text-stone-700">
        Simulated history based on 0.5% yield per rebalance epoch. Live data
        reflects on-chain rebalance events.
      </p>
    </div>
  );
}
