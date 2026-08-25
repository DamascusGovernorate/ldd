"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  MAP_VIEWBOX_WIDTH,
  MAP_VIEWBOX_HEIGHT,
  NEIGHBORHOOD_SHAPES,
} from "@/lib/neighborhoodDistricts";
import { categoryStyle, myState } from "./lib";

const W = MAP_VIEWBOX_WIDTH || 1000;
const H = MAP_VIEWBOX_HEIGHT || 762.5;
const SHAPES = NEIGHBORHOOD_SHAPES || {};
const NAMES = Object.keys(SHAPES);

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/* Control glyphs are drawn inline on purpose: the map must never fail to
   render because of a missing import somewhere else. */
const Glyph = ({ d, size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const RecenterGlyph = ({ size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="6.6" />
    <circle cx="12" cy="12" r="1.7" fill="currentColor" />
    <path d="M12 2.6v3.1M12 18.3v3.1M2.6 12h3.1M18.3 12h3.1" />
  </svg>
);

function boundsOf(names) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  names.forEach((n) =>
    (SHAPES[n]?.points || []).forEach(([x, y]) => {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    })
  );
  if (!Number.isFinite(minX)) {
    return { minX: 0, minY: 0, maxX: W, maxY: H, cx: W / 2, cy: H / 2, w: W, h: H };
  }
  return { minX, minY, maxX, maxY, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2, w: maxX - minX, h: maxY - minY };
}

/* Pins inside one district sit on a tight golden-angle spiral around its
   centroid, so they never stack however many share a neighbourhood. */
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const PIN_SPACING = 30;

function layoutPinsInGroup(group) {
  return group.map((mission, i) => {
    const r = i === 0 ? 0 : PIN_SPACING * Math.sqrt(i);
    const theta = i * GOLDEN_ANGLE;
    return { mission, dx: r * Math.cos(theta), dy: r * Math.sin(theta) };
  });
}

function MissionPin({ mission, leftPct, topPct, onSelect, draggedRef }) {
  const style = categoryStyle(mission);
  const Icon = style.icon;
  const state = myState(mission);

  return (
    <button
      type="button"
      className={`xpg-pin${state === "closed" ? " is-locked" : ""}`}
      style={{ left: `${leftPct}%`, top: `${topPct}%` }}
      onClick={() => {
        if (draggedRef.current) return; // a pan should never open a mission
        onSelect?.(mission);
      }}
      title={`${mission.title} — ${mission.neighborhood}`}
      aria-label={mission.title}
    >
      <svg viewBox="0 0 38 46" width="38" height="46" style={{ display: "block", marginTop: -8 }}>
        <defs>
          <clipPath id={`pinclip-${mission.id}`}>
            <circle cx="19" cy="16.5" r="9.6" />
          </clipPath>
        </defs>
        <path d="M19 45 6.5 27.5A15.4 15.4 0 1 1 31.5 27.5z" fill={style.edge} />
        <path d="M19 42 8.6 26.6A13 13 0 1 1 29.4 26.6z" fill={style.color} />
        <circle cx="19" cy="16.5" r="9.6" fill="#fdf8ee" />

        {mission.icon ? (
          <image
            href={mission.icon}
            x="9.4"
            y="6.9"
            width="19.2"
            height="19.2"
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#pinclip-${mission.id})`}
          />
        ) : (
          <g transform="translate(9.4 6.9) scale(0.8)" style={{ color: style.color }}>
            <Icon size={24} />
          </g>
        )}

        {(state === "accepted" || state === "completed") && (
          <circle cx="19" cy="16.5" r="12.4" fill="none" stroke="#fff" strokeWidth="2.4" opacity="0.9" />
        )}
      </svg>
    </button>
  );
}

export default function GameMap({ missions = [], onSelect, activeNeighborhood }) {
  const wrapRef = useRef(null);
  const pointers = useRef(new Map());
  const pinchDist = useRef(null);
  const dragged = useRef(false);

  const [size, setSize] = useState({ w: 0, h: 0 });
  const [cam, setCam] = useState(null); // { cx, cy, w } in user units
  const [hovered, setHovered] = useState(null);
  const [panning, setPanning] = useState(false);

  /* The viewBox is matched to the container's aspect ratio, so nothing is
     letterboxed and pin percentages map exactly onto the SVG. */
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const r = entry.contentRect;
      setSize({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const full = useMemo(() => boundsOf(NAMES), []);

  // Open on the districts that actually have missions; fall back to the city.
  const focus = useMemo(() => {
    const hit = NAMES.filter((n) => missions.some((m) => m.neighborhood === n));
    return boundsOf(hit.length ? hit : NAMES);
  }, [missions]);

  const fit = useCallback(
    (b) => {
      if (!size.w || !size.h) return null;
      const aspect = size.w / size.h;
      return { cx: b.cx, cy: b.cy, w: Math.max(b.w, b.h * aspect) * 1.12 };
    },
    [size]
  );

  const limits = useMemo(() => {
    const f = fit(full);
    return f ? { max: f.w, min: f.w / 9 } : null;
  }, [fit, full]);

  const clampCam = useCallback(
    (c) => {
      if (!limits || !size.w) return c;
      const w = clamp(c.w, limits.min, limits.max);
      const h = (w * size.h) / size.w;
      const padX = w * 0.4;
      const padY = h * 0.4;
      return {
        w,
        cx: clamp(c.cx, full.minX - padX, full.maxX + padX),
        cy: clamp(c.cy, full.minY - padY, full.maxY + padY),
      };
    },
    [limits, size, full]
  );

  useEffect(() => {
    if (!size.w || !size.h) return;
    setCam((prev) => (prev ? clampCam(prev) : fit(focus)));
  }, [size, fit, focus, clampCam]);

  const zoomAt = useCallback(
    (px, py, factor) => {
      setCam((c) => {
        if (!c || !size.w || !limits) return c;
        const h = (c.w * size.h) / size.w;
        const ux = c.cx - c.w / 2 + (px / size.w) * c.w;
        const uy = c.cy - h / 2 + (py / size.h) * h;
        const nw = clamp(c.w / factor, limits.min, limits.max);
        const nh = (nw * size.h) / size.w;
        return clampCam({
          cx: ux - (px / size.w) * nw + nw / 2,
          cy: uy - (py / size.h) * nh + nh / 2,
          w: nw,
        });
      });
    },
    [size, limits, clampCam]
  );

  // Non-passive so the page doesn't scroll while zooming with a trackpad.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      zoomAt(e.clientX - r.left, e.clientY - r.top, e.deltaY < 0 ? 1.18 : 1 / 1.18);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  const onPointerDown = (e) => {
    wrapRef.current?.setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    dragged.current = false;
    setPanning(true);
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinchDist.current = Math.hypot(a.x - b.x, a.y - b.y);
    }
  };

  const onPointerMove = (e) => {
    const p = pointers.current.get(e.pointerId);
    if (!p) return;
    const prevX = p.x;
    const prevY = p.y;
    p.x = e.clientX;
    p.y = e.clientY;

    if (pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchDist.current) {
        const ratio = dist / pinchDist.current;
        if (Math.abs(ratio - 1) > 0.004) {
          const r = wrapRef.current.getBoundingClientRect();
          zoomAt((a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top, ratio);
          pinchDist.current = dist;
          dragged.current = true;
        }
      } else {
        pinchDist.current = dist;
      }
      return;
    }

    const dx = e.clientX - prevX;
    const dy = e.clientY - prevY;
    if (Math.abs(dx) + Math.abs(dy) > 2) dragged.current = true;

    setCam((c) => {
      if (!c || !size.w) return c;
      const scale = c.w / size.w; // user units per screen pixel, both axes
      return clampCam({ ...c, cx: c.cx - dx * scale, cy: c.cy - dy * scale });
    });
  };

  const endPointer = (e) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchDist.current = null;
    if (pointers.current.size === 0) setPanning(false);
  };

  const recenter = () => setCam(fit(focus));

  const focusDistrict = (name) => {
    if (dragged.current) return;
    const f = fit(boundsOf([name]));
    if (f) setCam(clampCam(f));
  };

  /* ---------------- derived view ---------------- */

  const view = useMemo(() => {
    if (!cam || !size.w || !size.h) return null;
    const h = (cam.w * size.h) / size.w;
    return { x: cam.cx - cam.w / 2, y: cam.cy - h / 2, w: cam.w, h };
  }, [cam, size]);

  // user units per screen pixel — keeps strokes and labels a constant
  // on-screen size at every zoom level
  const u = view ? view.w / size.w : 1;
  const zoomed = cam && limits ? cam.w < limits.max * 0.97 : false;

  const grouped = useMemo(
    () =>
      missions.reduce((acc, m) => {
        (acc[m.neighborhood || "—"] ||= []).push(m);
        return acc;
      }, {}),
    [missions]
  );

  return (
    <div
      ref={wrapRef}
      className={`xpg-map${panning ? " is-panning" : ""}`}
      style={{ minHeight: 340 }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      onPointerLeave={endPointer}
    >
      {view && (
        <svg
          viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
        >
          <defs>
            <linearGradient id="xpg-ground" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f3f5e8" />
              <stop offset="100%" stopColor="#e5ead6" />
            </linearGradient>
          </defs>

          <rect x={view.x} y={view.y} width={view.w} height={view.h} fill="url(#xpg-ground)" />

          {/* fills — this is also the interaction layer for hover and tap */}
          {NAMES.map((name) => {
            const shape = SHAPES[name];
            const count = grouped[name]?.length || 0;
            const isActive = activeNeighborhood === name;
            const isHot = hovered === name;
            return (
              <polygon
                key={name}
                points={shape.points.map(([x, y]) => `${x},${y}`).join(" ")}
                fill={isHot  ? "#7491a8" : count ? "#1168af" : "#1168af"}
                stroke="none"
                style={{ cursor: "pointer", transition: "fill 180ms ease" }}
                onMouseEnter={() => setHovered(name)}
                onMouseLeave={() => setHovered((h) => (h === name ? null : h))}
                onClick={() => focusDistrict(name)}
              />
            );
          })}


          {/* black district borders, drawn last so nothing paints over them */}
          <g fill="none" stroke="#fefefe" strokeLinejoin="round" strokeLinecap="round" pointerEvents="none">
            {NAMES.map((name) => {
              const isActive = activeNeighborhood === name;
              const isHot = hovered === name;
              return (
                <polygon
                  key={`border-${name}`}
                  points={SHAPES[name].points.map(([x, y]) => `${x},${y}`).join(" ")}
                  strokeWidth={(isActive ? 4 : isHot ? 3 : 2.2) * u}
                />
              );
            })}
          </g>

          {/* labels hide when their district is too small on screen to read */}
          {NAMES.map((name) => {
            const shape = SHAPES[name];
            const b = boundsOf([name]);
            if (b.w / u < 58) return null;
            const emphasised = hovered === name || activeNeighborhood === name;
            return (
              <text
                key={`label-${name}`}
                x={shape.centroid[0]}
                y={shape.centroid[1]}
                textAnchor="middle"
                dominantBaseline="central"
                pointerEvents="none"
                style={{ fontFamily: "'Cairo','Almarai',sans-serif", fontWeight: 800 }}
                fontSize={13 * u}
                fill="#fefefe"
                strokeWidth={3.4 * u}
                paintOrder="stroke"

              >
                {name}
              </text>
            );
          })}
        </svg>
      )}

      {/* pins are real buttons, so tap targets stay 38px at any zoom */}
      {view &&
        Object.entries(grouped).map(([neighborhood, group]) =>
          layoutPinsInGroup(group).map(({ mission, dx, dy }) => {
            const shape = SHAPES[neighborhood];
            const base = shape ? { x: shape.centroid[0], y: shape.centroid[1] } : { x: W / 2, y: H / 2 };
            const spread = Math.max(1, u * 0.9); // keep the spiral readable when zoomed out
            const leftPct = ((base.x + dx * spread - view.x) / view.w) * 100;
            const topPct = ((base.y - 14 * u + dy * spread - view.y) / view.h) * 100;
            if (leftPct < -8 || leftPct > 108 || topPct < -8 || topPct > 112) return null;
            return (
              <MissionPin
                key={mission.id}
                mission={mission}
                leftPct={leftPct}
                topPct={topPct}
                onSelect={onSelect}
                draggedRef={dragged}
              />
            );
          })
        )}

      <div className="xpg-mapctl">
        <button type="button" aria-label="تكبير" onClick={() => zoomAt(size.w / 2, size.h / 2, 1.55)}>
          <Glyph d="M12 5.5v13M5.5 12h13" />
        </button>
        <button type="button" aria-label="تصغير" onClick={() => zoomAt(size.w / 2, size.h / 2, 1 / 1.55)}>
          <Glyph d="M5.5 12h13" />
        </button>
        <button type="button" aria-label="إعادة الضبط" onClick={recenter}>
          <RecenterGlyph />
        </button>
      </div>

      {!zoomed && missions.length > 0 && (
        <p className="xpg-maphint">اسحب للتنقل · اضغط على حي للتكبير</p>
      )}
    </div>
  );
}
