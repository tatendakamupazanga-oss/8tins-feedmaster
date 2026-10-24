import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Activity, AlertTriangle, CheckCircle2, Clock, Cpu, Download, Fan, Flame, Globe,
  LayoutDashboard, Lock, Minus, MoreVertical, Plus, Power, Radio, Settings,
  ShieldCheck, SlidersHorizontal, Smartphone, Snowflake, TrendingUp, Wind, X,
} from "lucide-react";

/* ───────────────────────── Types & constants ───────────────────────── */

type Tab = "dashboard" | "climate" | "trends" | "settings";
type Mode = "AUTO" | "MANUAL";
type Relays = { fan: boolean; heat: boolean; cool: boolean };
type Point = { t: number; temp: number; hum: number; label: string };
type Sim = {
  temp: number; hum: number; target: number; mode: Mode; relays: Relays;
  history: Point[]; latency: number; rssi: number; tick: number;
};

const C = {
  base: "#101B2A", surface: "#1A2A3D", border: "#28415C", teal: "#40D6C3",
  ok: "#2ECC71", warn: "#F39C12", bad: "#E74C3C", text: "#F4F7FA", muted: "#A9BBCD",
  chill: "#8FE9F5",
};
const T_MIN = 24, T_MAX = 35;
const MONO = "ui-monospace, 'SF Mono', 'JetBrains Mono', Menlo, Consolas, monospace";
const SANS = "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const clock = (d: Date) => d.toTimeString().slice(0, 8);

function seed(): Point[] {
  const now = Date.now();
  return Array.from({ length: 60 }, (_, i) => {
    const t = now - (59 - i) * 2000;
    return {
      t,
      temp: 29.4 + Math.sin(i / 7) * 0.45 + rnd(-0.06, 0.06),
      hum: 65.2 + Math.cos(i / 9) * 1.6 + rnd(-0.2, 0.2),
      label: clock(new Date(t)),
    };
  });
}

function initial(): Sim {
  const h = seed();
  return {
    temp: h[59].temp, hum: h[59].hum, target: 30, mode: "AUTO",
    relays: { fan: true, heat: false, cool: false },
    history: h, latency: 24, rssi: -58, tick: 0,
  };
}

function step(s: Sim): Sim {
  let { fan, heat, cool } = s.relays;
  if (s.mode === "AUTO") {
    // Hysteresis band ±0.4 °C around setpoint — mirrors ESP32 firmware logic
    heat = s.temp < s.target - 0.4 ? true : s.temp > s.target - 0.1 ? false : heat;
    cool = s.temp > s.target + 0.4 ? true : s.temp < s.target + 0.1 ? false : cool;
    fan = true;
  }
  const temp = clamp(
    s.temp + (27.5 - s.temp) * 0.012 + (heat ? 0.17 : 0) - (cool ? 0.19 : 0) + (fan ? -0.01 : 0.01) + rnd(-0.04, 0.04),
    22, 38,
  );
  const hum = clamp(s.hum + (65 - s.hum) * 0.04 + (heat ? -0.14 : 0) + (cool ? 0.1 : 0) + rnd(-0.25, 0.25), 35, 95);
  const now = Date.now();
  const history = [...s.history.slice(-59), { t: now, temp, hum, label: clock(new Date(now)) }];
  return {
    ...s, temp, hum, relays: { fan, heat, cool }, history, tick: s.tick + 1,
    latency: Math.round(clamp(s.latency + rnd(-5, 5), 14, 60)),
    rssi: Math.round(clamp(s.rssi + rnd(-2, 2), -78, -48)),
  };
}

const tempStatus = (d: number) =>
  Math.abs(d) <= 0.8 ? { l: "OPTIMAL", c: C.ok } : Math.abs(d) <= 2 ? { l: "DRIFTING", c: C.warn } : { l: "ALARM", c: C.bad };
const humStatus = (h: number) =>
  h >= 60 && h <= 70 ? { l: "OPTIMAL", c: C.ok } : h >= 55 && h <= 75 ? { l: "MARGINAL", c: C.warn } : { l: "OUT OF RANGE", c: C.bad };

/* ───────────────────────── Primitives ───────────────────────── */

function Card({ children, className = "", glow }: { children: ReactNode; className?: string; glow?: string }) {
  return (
    <section
      className={`relative rounded-xl border border-[#28415C] bg-[#1A2A3D] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),inset_0_-12px_24px_-18px_rgba(0,0,0,0.6),0_10px_28px_-14px_rgba(0,0,0,0.7)] transition-shadow duration-500 ${className}`}
      style={glow ? { boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 0 28px -8px ${glow}, 0 10px 28px -14px rgba(0,0,0,0.7)` } : undefined}
    >
      <span className="pointer-events-none absolute left-1.5 top-1.5 h-2 w-2 border-l border-t border-[#40D6C3]/50" />
      <span className="pointer-events-none absolute bottom-1.5 right-1.5 h-2 w-2 border-b border-r border-[#40D6C3]/50" />
      {children}
    </section>
  );
}

function Led({ on, color = C.ok, size = 10 }: { on: boolean; color?: string; size?: number }) {
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      {on && <span className="ie-ring absolute inset-0 rounded-full" style={{ background: color }} />}
      <span
        className="relative rounded-full"
        style={{
          width: size, height: size, background: on ? color : "#2A3B50",
          boxShadow: on ? `0 0 8px 1px ${color}, inset 0 0 2px rgba(255,255,255,.6)` : "inset 0 1px 2px rgba(0,0,0,.6)",
        }}
      />
    </span>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-semibold tracking-wider"
      style={{ color, borderColor: `${color}55`, background: `${color}14`, fontFamily: MONO }}
    >
      <Led on color={color} size={6} /> {label}
    </span>
  );
}

const Label = ({ children }: { children: ReactNode }) => (
  <span className="text-[13px] font-medium text-[#A9BBCD]">{children}</span>
);

function Readout({ value, unit, size = "text-5xl" }: { value: string; unit: string; size?: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className={`${size} font-semibold leading-none tracking-tight text-[#F4F7FA]`} style={{ fontFamily: MONO, textShadow: "0 0 18px rgba(64,214,195,0.25)" }}>
        {value}
      </span>
      <span className="text-lg text-[#A9BBCD]" style={{ fontFamily: MONO }}>{unit}</span>
    </div>
  );
}

/* ───────────────────────── Dashboard ───────────────────────── */

function DriftMeter({ delta }: { delta: number }) {
  const pos = clamp(((delta + 3) / 6) * 100, 2, 98);
  return (
    <div>
      <div className="relative h-2 rounded-full bg-[#101B2A] shadow-[inset_0_1px_3px_rgba(0,0,0,0.7)]">
        <div className="absolute inset-y-0 left-[36.7%] w-[26.6%] rounded-full bg-[#2ECC71]/25" />
        <div className="absolute inset-y-[-3px] left-1/2 w-px bg-[#A9BBCD]/60" />
        <div
          className="absolute top-1/2 h-4 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-[#40D6C3] shadow-[0_0_10px_#40D6C3] transition-all duration-1000"
          style={{ left: `${pos}%` }}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-[#A9BBCD]/80" style={{ fontFamily: MONO }}>
        <span>-3.0</span><span>drift from target</span><span>+3.0</span>
      </div>
    </div>
  );
}

function HumBar({ hum }: { hum: number }) {
  const pos = clamp(((hum - 40) / 50) * 100, 2, 98);
  return (
    <div>
      <div className="relative h-2 rounded-full bg-[#101B2A] shadow-[inset_0_1px_3px_rgba(0,0,0,0.7)]">
        <div className="absolute inset-y-0 left-[40%] w-[20%] rounded-full bg-[#2ECC71]/30" />
        <div
          className="absolute top-1/2 h-4 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-[#F4F7FA] shadow-[0_0_10px_rgba(244,247,250,0.8)] transition-all duration-1000"
          style={{ left: `${pos}%` }}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-[#A9BBCD]/80" style={{ fontFamily: MONO }}>
        <span>40%</span><span>ideal 60–70%</span><span>90%</span>
      </div>
    </div>
  );
}

function Actuator({ name, on, kind }: { name: string; on: boolean; kind: "fan" | "heat" | "cool" }) {
  const color = kind === "heat" ? C.warn : kind === "cool" ? C.chill : C.teal;
  const Icon = kind === "fan" ? Fan : kind === "heat" ? Flame : Snowflake;
  return (
    <Card glow={on ? `${color}66` : undefined} className="overflow-hidden">
      {on && kind === "heat" && <div className="ie-heat pointer-events-none absolute inset-x-0 bottom-0 h-16" />}
      {on && kind === "cool" && <div className="ie-frost pointer-events-none absolute inset-0" />}
      <div className="relative flex items-start justify-between">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-lg border"
          style={{ borderColor: on ? `${color}88` : C.border, background: on ? `${color}18` : C.base, color: on ? color : "#56708C" }}
        >
          <Icon size={24} className={on && kind === "fan" ? "ie-spin" : on ? "ie-pulse" : ""} />
        </div>
        <Led on={on} color={color} />
      </div>
      <div className="relative mt-4">
        <div className="text-sm font-medium text-[#F4F7FA]">{name}</div>
        <div className="mt-0.5 text-xs font-semibold tracking-widest" style={{ fontFamily: MONO, color: on ? color : "#56708C" }}>
          {on ? "RUNNING" : "OFF"}
        </div>
      </div>
    </Card>
  );
}

function Dashboard({ s }: { s: Sim }) {
  const d = s.temp - s.target;
  const ts = tempStatus(d), hs = humStatus(s.hum);
  const prev = s.history[Math.max(0, s.history.length - 6)];
  const rate = ((s.temp - prev.temp) / ((Date.now() - prev.t) / 60000)) || 0;
  const margin = Math.min(s.temp - T_MIN, T_MAX - s.temp);
  const airflow = s.relays.fan ? 112 + (s.tick % 7) * 2.3 : 0;
  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <Card glow={`${ts.c}33`}>
          <div className="flex items-center justify-between">
            <Label>Room temperature</Label>
            <Badge label={ts.l} color={ts.c} />
          </div>
          <div className="mt-4 flex items-end justify-between">
            <Readout value={s.temp.toFixed(1)} unit="°C" />
            <div className="text-right text-xs text-[#A9BBCD]" style={{ fontFamily: MONO }}>
              <div>Target: <span className="text-[#F4F7FA]">{s.target.toFixed(1)} °C</span></div>
              <div className="mt-1" style={{ color: Math.abs(rate) < 0.3 ? C.muted : C.warn }}>
                {rate >= 0 ? "▲" : "▼"} {Math.abs(rate).toFixed(2)} °C/min
              </div>
            </div>
          </div>
          <div className="mt-5"><DriftMeter delta={d} /></div>
        </Card>
        <Card glow={`${hs.c}33`}>
          <div className="flex items-center justify-between">
            <Label>Relative humidity</Label>
            <Badge label={hs.l} color={hs.c} />
          </div>
          <div className="mt-4 flex items-end justify-between">
            <Readout value={s.hum.toFixed(1)} unit="% RH" />
            <div className="text-right text-xs text-[#A9BBCD]" style={{ fontFamily: MONO }}>
              <div>BSF range: <span className="text-[#F4F7FA]">60% – 70%</span></div>
              <div className="mt-1">{s.hum < 60 ? `${(60 - s.hum).toFixed(1)} below` : s.hum > 70 ? `${(s.hum - 70).toFixed(1)} above` : "within band"}</div>
            </div>
          </div>
          <div className="mt-5"><HumBar hum={s.hum} /></div>
        </Card>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#F4F7FA]">Facility actuators</h2>
          <span className="text-xs text-[#A9BBCD]" style={{ fontFamily: MONO }}>Mode: {s.mode}</span>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <Actuator name="Circulation fan" on={s.relays.fan} kind="fan" />
          <Actuator name="Heating element" on={s.relays.heat} kind="heat" />
          <Actuator name="Cooling unit" on={s.relays.cool} kind="cool" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-[#28415C] bg-[#28415C] sm:grid-cols-3">
        {[
          { i: Wind, l: "Airflow estimate", v: airflow.toFixed(0), u: "m³/h" },
          { i: ShieldCheck, l: "Thermal safety margin", v: margin.toFixed(1), u: "°C to limit", warn: margin < 2 },
          { i: Activity, l: "Link latency", v: String(s.latency), u: "ms" },
        ].map(({ i: I, l, v, u, warn }) => (
          <div key={l} className="flex items-center gap-3 bg-[#1A2A3D] px-5 py-4">
            <I size={18} className={warn ? "text-[#F39C12]" : "text-[#40D6C3]"} />
            <div>
              <div className="text-xs text-[#A9BBCD]">{l}</div>
              <div className="text-lg font-semibold text-[#F4F7FA]" style={{ fontFamily: MONO }}>
                {v} <span className="text-xs font-normal text-[#A9BBCD]">{u}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────── Climate control ───────────────────────── */

function Dial({ target, temp }: { target: number; temp: number }) {
  const frac = (target - T_MIN) / (T_MAX - T_MIN);
  const cf = clamp((temp - T_MIN) / (T_MAX - T_MIN), 0, 1);
  const a = Math.PI * (1 - cf);
  const [cx, cy, r] = [130, 130, 100];
  const p = (rad: number) => ({ x: cx + (r + 12) * Math.cos(rad), y: cy - (r + 12) * Math.sin(rad) });
  const q = p(a), q2 = { x: cx + (r - 12) * Math.cos(a), y: cy - (r - 12) * Math.sin(a) };
  return (
    <svg viewBox="0 0 260 160" className="mx-auto w-full max-w-xs">
      <defs>
        <linearGradient id="dialg" x1="0" x2="1"><stop offset="0" stopColor="#1E8F83" /><stop offset="1" stopColor={C.teal} /></linearGradient>
      </defs>
      <path d="M 30 130 A 100 100 0 0 1 230 130" fill="none" stroke={C.base} strokeWidth="14" strokeLinecap="round" />
      <path d="M 30 130 A 100 100 0 0 1 230 130" fill="none" stroke="url(#dialg)" strokeWidth="14" strokeLinecap="round"
        pathLength={100} strokeDasharray={`${frac * 100} 100`} style={{ transition: "stroke-dasharray .4s", filter: "drop-shadow(0 0 6px rgba(64,214,195,.6))" }} />
      <line x1={q2.x} y1={q2.y} x2={q.x} y2={q.y} stroke={C.text} strokeWidth="2" style={{ transition: "all 1s" }} />
      <text x="30" y="152" fill={C.muted} fontSize="10" textAnchor="middle" fontFamily={MONO}>{T_MIN}°</text>
      <text x="230" y="152" fill={C.muted} fontSize="10" textAnchor="middle" fontFamily={MONO}>{T_MAX}°</text>
      <text x="130" y="122" fill={C.text} fontSize="38" textAnchor="middle" fontWeight="600" fontFamily={MONO}>{target.toFixed(1)}</text>
      <text x="130" y="142" fill={C.muted} fontSize="11" textAnchor="middle" fontFamily={MONO}>°C setpoint</text>
    </svg>
  );
}

function Climate({ s, set }: { s: Sim; set: (f: (p: Sim) => Sim) => void }) {
  const manual = s.mode === "MANUAL";
  const setTarget = (v: number) => set((p) => ({ ...p, target: clamp(Math.round(v * 2) / 2, T_MIN, T_MAX) }));
  const toggle = (k: keyof Relays) =>
    set((p) => {
      if (p.mode !== "MANUAL") return p;
      const r = { ...p.relays, [k]: !p.relays[k] };
      if (k === "heat" && r.heat) r.cool = false; // interlock: never energize heat + cool together
      if (k === "cool" && r.cool) r.heat = false;
      return { ...p, relays: r };
    });
  const rows: { k: keyof Relays; n: string; I: typeof Fan; c: string }[] = [
    { k: "fan", n: "Circulation fan", I: Fan, c: C.teal },
    { k: "heat", n: "Heating element", I: Flame, c: C.warn },
    { k: "cool", n: "Cooling unit", I: Snowflake, c: C.chill },
  ];
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <Label>Target temperature</Label>
        <Dial target={s.target} temp={s.temp} />
        <div className="mt-2 flex items-center gap-3">
          <button aria-label="Decrease setpoint" onClick={() => setTarget(s.target - 0.5)} className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#28415C] bg-[#101B2A] text-[#F4F7FA] active:scale-95 hover:border-[#40D6C3]"><Minus size={18} /></button>
          <input type="range" min={T_MIN} max={T_MAX} step={0.5} value={s.target} onChange={(e) => setTarget(parseFloat(e.target.value))}
            aria-label="Target temperature" className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-[#101B2A] accent-[#40D6C3]" />
          <button aria-label="Increase setpoint" onClick={() => setTarget(s.target + 0.5)} className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#28415C] bg-[#101B2A] text-[#F4F7FA] active:scale-95 hover:border-[#40D6C3]"><Plus size={18} /></button>
        </div>
        <p className="mt-3 text-xs text-[#A9BBCD]">Safe larval bounds: {T_MIN.toFixed(1)}–{T_MAX.toFixed(1)} °C. Setpoint moves in 0.5 °C steps.</p>
      </Card>

      <div className="space-y-5">
        <Card>
          <Label>Control mode</Label>
          <div className="mt-3 grid grid-cols-2 gap-1 rounded-lg border border-[#28415C] bg-[#101B2A] p-1">
            {(["AUTO", "MANUAL"] as Mode[]).map((m) => (
              <button key={m} onClick={() => set((p) => ({ ...p, mode: m }))}
                className={`rounded-md py-2.5 text-sm font-semibold tracking-wider transition ${s.mode === m ? "bg-[#40D6C3] text-[#101B2A] shadow-[0_0_14px_rgba(64,214,195,0.45)]" : "text-[#A9BBCD] hover:text-[#F4F7FA]"}`}
                style={{ fontFamily: MONO }}>{m}</button>
            ))}
          </div>
          <p className="mt-3 flex items-start gap-2 text-xs text-[#A9BBCD]">
            {manual ? <AlertTriangle size={14} className="mt-0.5 shrink-0 text-[#F39C12]" /> : <Cpu size={14} className="mt-0.5 shrink-0 text-[#40D6C3]" />}
            {manual ? "Operator override. The controller will not correct temperature drift." : "Relays are driven by the ESP32 controller around the setpoint."}
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <Label>Manual relays</Label>
            {!manual && <span className="flex items-center gap-1 text-xs text-[#A9BBCD]"><Lock size={12} /> Locked in AUTO</span>}
          </div>
          <div className="mt-3 space-y-2">
            {rows.map(({ k, n, I, c }) => {
              const on = s.relays[k];
              return (
                <button key={k} disabled={!manual} onClick={() => toggle(k)} aria-pressed={on}
                  className={`flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition ${manual ? "hover:border-[#40D6C3]/60" : "cursor-not-allowed opacity-60"}`}
                  style={{ borderColor: on ? `${c}77` : C.border, background: on ? `${c}12` : C.base, boxShadow: on ? `0 0 18px -6px ${c}` : undefined }}>
                  <I size={18} style={{ color: on ? c : "#56708C" }} />
                  <span className="flex-1 text-sm text-[#F4F7FA]">{n}</span>
                  <span className="text-[11px] font-semibold tracking-widest" style={{ fontFamily: MONO, color: on ? c : "#56708C" }}>{on ? "ENERGIZED" : "OFF"}</span>
                  <span className="relative h-5 w-9 rounded-full border border-[#28415C] bg-[#101B2A]">
                    <span className="absolute top-0.5 h-3.5 w-3.5 rounded-full transition-all" style={{ left: on ? 18 : 2, background: on ? c : "#56708C", boxShadow: on ? `0 0 8px ${c}` : undefined }} />
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-[#A9BBCD]">Interlock: energizing heating switches cooling off, and the reverse.</p>
        </Card>
      </div>
    </div>
  );
}

/* ───────────────────────── Trends ───────────────────────── */

function Trends({ s }: { s: Sim }) {
  const W = 800, H = 300, pl = 44, pr = 44, pt = 16, pb = 30;
  const h = s.history, n = h.length;
  const ts = h.map((p) => p.temp), hs = h.map((p) => p.hum);
  const dom = (arr: number[], span: number) => {
    const lo = Math.min(...arr), hi = Math.max(...arr), mid = (lo + hi) / 2, half = Math.max((hi - lo) / 2 + 0.3, span / 2);
    return [mid - half, mid + half] as const;
  };
  const [t0, t1] = dom(ts, 3), [h0, h1] = dom(hs, 8);
  const X = (i: number) => pl + (i / (n - 1)) * (W - pl - pr);
  const Yt = (v: number) => pt + (1 - (v - t0) / (t1 - t0)) * (H - pt - pb);
  const Yh = (v: number) => pt + (1 - (v - h0) / (h1 - h0)) * (H - pt - pb);
  const line = (arr: number[], Y: (v: number) => number) => arr.map((v, i) => `${i ? "L" : "M"}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(" ");
  const area = `${line(ts, Yt)} L${X(n - 1)},${H - pb} L${X(0)},${H - pb} Z`;
  const stat = (a: number[]) => ({ min: Math.min(...a), max: Math.max(...a), avg: a.reduce((x, y) => x + y, 0) / a.length });
  const st = stat(ts), sh = stat(hs);
  return (
    <div className="space-y-5">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label>Live telemetry · last 2 minutes</Label>
          <div className="flex gap-4 text-xs text-[#A9BBCD]" style={{ fontFamily: MONO }}>
            <span className="flex items-center gap-1.5"><i className="h-0.5 w-4 bg-[#40D6C3]" /> Temp °C</span>
            <span className="flex items-center gap-1.5"><i className="h-0.5 w-4 bg-[#F39C12]" /> RH %</span>
          </div>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full" role="img" aria-label="Temperature and humidity trend">
          <defs>
            <linearGradient id="tfill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.teal} stopOpacity="0.28" /><stop offset="1" stopColor={C.teal} stopOpacity="0" /></linearGradient>
          </defs>
          {[0, 1, 2, 3, 4].map((g) => {
            const y = pt + (g / 4) * (H - pt - pb);
            return (
              <g key={g}>
                <line x1={pl} x2={W - pr} y1={y} y2={y} stroke={C.border} strokeDasharray="2 5" />
                <text x={pl - 8} y={y + 3} textAnchor="end" fontSize="10" fill={C.teal} fontFamily={MONO}>{(t1 - (g / 4) * (t1 - t0)).toFixed(1)}</text>
                <text x={W - pr + 8} y={y + 3} fontSize="10" fill={C.warn} fontFamily={MONO}>{(h1 - (g / 4) * (h1 - h0)).toFixed(0)}</text>
              </g>
            );
          })}
          {[0, 10, 20, 30, 40, 50, 59].map((i) => (
            <g key={i}>
              <line x1={X(i)} x2={X(i)} y1={pt} y2={H - pb} stroke={C.border} strokeOpacity="0.35" />
              <text x={X(i)} y={H - 10} textAnchor="middle" fontSize="10" fill={C.muted} fontFamily={MONO}>{h[i].label.slice(3)}</text>
            </g>
          ))}
          {s.target >= t0 && s.target <= t1 && (
            <g>
              <line x1={pl} x2={W - pr} y1={Yt(s.target)} y2={Yt(s.target)} stroke={C.teal} strokeOpacity="0.55" strokeDasharray="6 4" />
              <text x={pl + 6} y={Yt(s.target) - 5} fontSize="10" fill={C.teal} fontFamily={MONO}>target {s.target.toFixed(1)}</text>
            </g>
          )}
          <path d={area} fill="url(#tfill)" />
          <path d={line(hs, Yh)} fill="none" stroke={C.warn} strokeWidth="1.6" strokeLinejoin="round" strokeOpacity="0.9" />
          <path d={line(ts, Yt)} fill="none" stroke={C.teal} strokeWidth="2.2" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 5px rgba(64,214,195,.7))" }} />
          <circle cx={X(n - 1)} cy={Yt(ts[n - 1])} r="4" fill={C.teal} />
          <circle cx={X(n - 1)} cy={Yh(hs[n - 1])} r="3.5" fill={C.warn} />
        </svg>
      </Card>
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {[
          { l: "Temp min", v: st.min.toFixed(1), u: "°C", c: C.teal },
          { l: "Temp max", v: st.max.toFixed(1), u: "°C", c: C.teal },
          { l: "RH min", v: sh.min.toFixed(1), u: "%", c: C.warn },
          { l: "RH max", v: sh.max.toFixed(1), u: "%", c: C.warn },
        ].map((x) => (
          <Card key={x.l} className="!p-4">
            <div className="text-xs text-[#A9BBCD]">{x.l}</div>
            <div className="mt-1 text-2xl font-semibold text-[#F4F7FA]" style={{ fontFamily: MONO }}>{x.v}<span className="ml-1 text-sm" style={{ color: x.c }}>{x.u}</span></div>
          </Card>
        ))}
      </div>
      <p className="text-xs text-[#A9BBCD]" style={{ fontFamily: MONO }}>Average over window: {st.avg.toFixed(2)} °C · {sh.avg.toFixed(1)} % RH</p>
    </div>
  );
}

/* ───────────────────────── Settings ───────────────────────── */

function SettingsTab({ s, installed, onInstall }: { s: Sim; installed: boolean; onInstall: () => void }) {
  const [hot, setHot] = useState<"idle" | "confirm" | "active">("idle");
  const bars = s.rssi > -55 ? 4 : s.rssi > -65 ? 3 : s.rssi > -75 ? 2 : 1;
  const up = 273600 + s.tick * 2;
  const uptime = `${Math.floor(up / 86400)}d ${String(Math.floor((up % 86400) / 3600)).padStart(2, "0")}h ${String(Math.floor((up % 3600) / 60)).padStart(2, "0")}m ${String(up % 60).padStart(2, "0")}s`;
  const Row = ({ k, v }: { k: string; v: ReactNode }) => (
    <div className="flex items-center justify-between border-b border-[#28415C]/60 py-2.5 last:border-0">
      <span className="text-sm text-[#A9BBCD]">{k}</span>
      <span className="text-sm text-[#F4F7FA]" style={{ fontFamily: MONO }}>{v}</span>
    </div>
  );
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <div className="flex items-center justify-between">
          <Label>Wi-Fi connection</Label>
          <Badge label="SYNCED" color={C.ok} />
        </div>
        <div className="mt-4 flex items-end gap-4">
          <div className="flex h-10 items-end gap-1" aria-label={`Signal ${bars} of 4`}>
            {[1, 2, 3, 4].map((b) => (
              <span key={b} className="w-2 rounded-sm transition-colors" style={{ height: 8 + b * 8, background: b <= bars ? C.teal : C.border, boxShadow: b <= bars ? "0 0 6px rgba(64,214,195,.5)" : undefined }} />
            ))}
          </div>
          <Readout value={String(s.rssi)} unit="dBm" size="text-3xl" />
        </div>
        <div className="mt-4">
          <Row k="SSID" v="TECHSPHERE-BSF-01" />
          <Row k="IP address" v="192.168.1.47" />
          <Row k="Last sync" v={`${(s.tick % 2) + 1}s ago`} />
          <Row k="Latency" v={`${s.latency} ms`} />
        </div>
      </Card>

      <div className="space-y-5">
        <Card>
          <Label>Wi-Fi setup hotspot</Label>
          <p className="mt-2 text-sm text-[#A9BBCD]">Puts the controller into access-point mode so you can enter new Wi-Fi credentials. Telemetry pauses while it is active.</p>
          {hot === "idle" && (
            <button onClick={() => setHot("confirm")} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-[#40D6C3]/60 bg-[#40D6C3]/10 py-3 text-sm font-semibold text-[#40D6C3] transition hover:bg-[#40D6C3]/20">
              <Radio size={16} /> Start Wi-Fi setup hotspot
            </button>
          )}
          {hot === "confirm" && (
            <div className="mt-4 rounded-lg border border-[#F39C12]/50 bg-[#F39C12]/10 p-3">
              <p className="flex items-start gap-2 text-sm text-[#F4F7FA]"><AlertTriangle size={16} className="mt-0.5 shrink-0 text-[#F39C12]" /> This disconnects the dashboard. The unit keeps running its current mode.</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button onClick={() => setHot("idle")} className="rounded-md border border-[#28415C] py-2 text-sm text-[#A9BBCD] hover:text-[#F4F7FA]">Cancel</button>
                <button onClick={() => setHot("active")} className="rounded-md bg-[#F39C12] py-2 text-sm font-semibold text-[#101B2A]">Confirm start</button>
              </div>
            </div>
          )}
          {hot === "active" && (
            <div className="mt-4 rounded-lg border border-[#2ECC71]/50 bg-[#2ECC71]/10 p-3">
              <p className="flex items-center gap-2 text-sm text-[#F4F7FA]"><CheckCircle2 size={16} className="text-[#2ECC71]" /> Hotspot active</p>
              <p className="mt-1 text-xs text-[#A9BBCD]" style={{ fontFamily: MONO }}>Join “INITE8-SETUP”, then open 192.168.4.1</p>
              <button onClick={() => setHot("idle")} className="mt-3 w-full rounded-md border border-[#28415C] py-2 text-sm text-[#A9BBCD] hover:text-[#F4F7FA]">Stop hotspot</button>
            </div>
          )}
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <Label>App installation</Label>
            {installed && <Badge label="INSTALLED" color={C.ok} />}
          </div>
          <p className="mt-2 text-sm text-[#A9BBCD]">
            {installed ? "Running as the installed INITE EIGHT app on this device." : "Add INITE EIGHT to your home screen for one-tap access. You can also keep using the web dashboard."}
          </p>
          {!installed && (
            <button onClick={onInstall} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-[#40D6C3]/60 bg-[#40D6C3]/10 py-3 text-sm font-semibold text-[#40D6C3] transition hover:bg-[#40D6C3]/20">
              <Download size={16} /> Install App
            </button>
          )}
        </Card>
        <Card>
          <Label>Device</Label>
          <div className="mt-2">
            <Row k="Model" v="INITE EIGHT" />
            <Row k="Firmware" v="v1.4.2" />
            <Row k="ESP32 cores" v={<span className="inline-flex items-center gap-2"><Led on size={7} /> Core 0 · <Led on size={7} /> Core 1</span>} />
            <Row k="Uptime" v={uptime} />
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ───────────────────────── PWA install ───────────────────────── */

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};
const DISMISS_KEY = "ie-install-dismissed";
const readDismissed = () => {
  try { return sessionStorage.getItem(DISMISS_KEY) === "1"; } catch { return false; }
};
const writeDismissed = () => {
  try { sessionStorage.setItem(DISMISS_KEY, "1"); } catch { /* storage blocked: fall back to in-memory state */ }
};
const isStandalone = () =>
  typeof window !== "undefined" &&
  (window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true);
const isMobileBrowser = () => typeof navigator !== "undefined" && /Android|Mobi/i.test(navigator.userAgent);

function usePwaInstall() {
  const [evt, setEvt] = useState<InstallEvent | null>(null);
  const [installed, setInstalled] = useState(isStandalone);
  useEffect(() => {
    const onPrompt = (e: Event) => { e.preventDefault(); setEvt(e as InstallEvent); };
    const onInstalled = () => { setInstalled(true); setEvt(null); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);
  const promptInstall = async () => {
    if (!evt) return "unavailable" as const;
    await evt.prompt();
    const { outcome } = await evt.userChoice;
    setEvt(null); // the browser allows each captured event to be used once
    return outcome;
  };
  return { canPrompt: evt !== null, installed, promptInstall };
}

function InstallSheet({ view, onUseWeb, onInstall, onBack }: {
  view: "choice" | "manual"; onUseWeb: () => void; onInstall: () => void; onBack: () => void;
}) {
  const primary = useRef<HTMLButtonElement>(null);
  const close = useRef(onUseWeb);
  close.current = onUseWeb;
  useEffect(() => {
    primary.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close.current(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="ie-install-title">
      <button aria-label="Close and use web dashboard" tabIndex={-1} onClick={onUseWeb} className="absolute inset-0 cursor-default bg-[rgba(16,27,42,0.75)] backdrop-blur-md" />
      <div
        className="ie-sheet relative w-full max-w-md rounded-t-2xl border border-[#28415C] bg-[#1A2A3D] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_48px_-12px_rgba(64,214,195,0.35),0_24px_60px_-12px_rgba(0,0,0,0.8)] sm:rounded-2xl"
        style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
      >
        <span className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#40D6C3] to-transparent" />
        <span className="mx-auto mb-4 block h-1 w-10 rounded-full bg-[#28415C] sm:hidden" />
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-[#40D6C3]/60 bg-[#40D6C3]/10 text-[#40D6C3] shadow-[0_0_16px_-4px_#40D6C3]">
            <Smartphone size={24} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="ie-install-title" className="text-base font-semibold text-[#F4F7FA]">
              {view === "choice" ? "Open INITE EIGHT" : "Add to Home screen"}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-[#A9BBCD]">
              {view === "choice"
                ? "Install the app for one-tap access from your home screen, or keep monitoring in this browser. The unit keeps running either way."
                : "Your browser did not offer automatic install. Add it manually in Chrome:"}
            </p>
          </div>
          <button onClick={onUseWeb} aria-label="Close" className="-mr-2 -mt-2 flex h-9 w-9 items-center justify-center rounded-lg text-[#A9BBCD] hover:bg-[#101B2A] hover:text-[#F4F7FA]">
            <X size={18} />
          </button>
        </div>

        {view === "choice" ? (
          <div className="mt-6 space-y-3">
            <button ref={primary} onClick={onInstall} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#40D6C3] py-3.5 text-sm font-semibold text-[#101B2A] shadow-[0_0_20px_-4px_rgba(64,214,195,0.7)] transition active:scale-[0.98] hover:brightness-110">
              <Download size={18} /> Install / Download App
            </button>
            <button onClick={onUseWeb} className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#28415C] bg-[#101B2A] py-3.5 text-sm font-semibold text-[#F4F7FA] transition active:scale-[0.98] hover:border-[#40D6C3]/60">
              <Globe size={18} className="text-[#A9BBCD]" /> Use Web Dashboard
            </button>
            <p className="pt-1 text-center text-xs text-[#A9BBCD]/80">Same live dashboard either way. Install adds an icon to your home screen.</p>
          </div>
        ) : (
          <div className="mt-5">
            <ol className="space-y-2.5">
              {[
                <>Tap the menu <MoreVertical size={14} className="inline -translate-y-px text-[#40D6C3]" /> (top-right of Chrome).</>,
                <>Choose <b className="font-semibold text-[#F4F7FA]">Add to Home screen</b> or <b className="font-semibold text-[#F4F7FA]">Install app</b>.</>,
                <>Tap <b className="font-semibold text-[#F4F7FA]">Install</b> to confirm.</>,
              ].map((t, i) => (
                <li key={i} className="flex items-start gap-3 rounded-lg border border-[#28415C] bg-[#101B2A] px-3 py-2.5 text-sm text-[#A9BBCD]">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-[#40D6C3]/50 text-xs text-[#40D6C3]" style={{ fontFamily: MONO }}>{i + 1}</span>
                  <span className="pt-0.5">{t}</span>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-xs text-[#A9BBCD]/80">Not in Chrome? Open this page in Chrome first.</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button onClick={onBack} className="rounded-lg border border-[#28415C] bg-[#101B2A] py-3 text-sm font-semibold text-[#A9BBCD] hover:text-[#F4F7FA]">Back</button>
              <button ref={primary} onClick={onUseWeb} className="rounded-lg bg-[#40D6C3] py-3 text-sm font-semibold text-[#101B2A] shadow-[0_0_20px_-4px_rgba(64,214,195,0.7)] hover:brightness-110">Got it</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────── Shell ───────────────────────── */

const NAV: { id: Tab; label: string; I: typeof Settings }[] = [
  { id: "dashboard", label: "Dashboard", I: LayoutDashboard },
  { id: "climate", label: "Climate", I: SlidersHorizontal },
  { id: "trends", label: "Trends", I: TrendingUp },
  { id: "settings", label: "Settings", I: Settings },
];

function Heartbeat({ latency }: { latency: number }) {
  return (
    <div className="rounded-lg border border-[#28415C] bg-[#101B2A] p-3">
      <div className="flex items-center justify-between text-xs text-[#A9BBCD]">
        <span className="flex items-center gap-2"><Led on size={7} /> Telemetry live</span>
        <span style={{ fontFamily: MONO }}>{latency} ms</span>
      </div>
      <svg viewBox="0 0 200 40" className="mt-2 w-full" aria-hidden>
        <path d="M0 20 H60 L68 20 L74 6 L82 34 L88 20 H120 L128 20 L134 12 L140 28 L146 20 H200" fill="none" stroke={C.border} strokeWidth="1.5" />
        <path className="ie-hb" d="M0 20 H60 L68 20 L74 6 L82 34 L88 20 H120 L128 20 L134 12 L140 28 L146 20 H200" fill="none" stroke={C.teal} strokeWidth="1.8" pathLength={100} style={{ filter: "drop-shadow(0 0 3px #40D6C3)" }} />
      </svg>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [s, setS] = useState<Sim>(initial);
  const pwa = usePwaInstall();
  const [sheet, setSheet] = useState<null | "choice" | "manual">(null);

  // Offer install once per session: right away if the browser can prompt, otherwise after a short delay on mobile
  useEffect(() => {
    if (pwa.installed || readDismissed()) return;
    if (!pwa.canPrompt && !isMobileBrowser()) return;
    const id = setTimeout(() => setSheet((cur) => cur ?? "choice"), pwa.canPrompt ? 900 : 2200);
    return () => clearTimeout(id);
  }, [pwa.canPrompt, pwa.installed]);

  const dismissSheet = () => { writeDismissed(); setSheet(null); };
  const installNow = async () => {
    if (pwa.canPrompt) {
      const r = await pwa.promptInstall();
      if (r !== "unavailable") dismissSheet();
    } else {
      setSheet("manual");
    }
  };

  useEffect(() => {
    const id = setInterval(() => setS(step), 2000);
    return () => clearInterval(id);
  }, []);

  const title = NAV.find((n) => n.id === tab)!.label;
  const alarm = tempStatus(s.temp - s.target).l === "ALARM" || humStatus(s.hum).l === "OUT OF RANGE";

  return (
    <div className="min-h-screen bg-[#101B2A] text-[#F4F7FA]" style={{ fontFamily: SANS, backgroundImage: "radial-gradient(900px 500px at 85% -10%, rgba(64,214,195,0.07), transparent), linear-gradient(rgba(40,65,92,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(40,65,92,0.18) 1px, transparent 1px)", backgroundSize: "auto, 32px 32px, 32px 32px" }}>
      <style>{`
        @keyframes ie-spin{to{transform:rotate(360deg)}}
        @keyframes ie-ring{0%{transform:scale(1);opacity:.6}100%{transform:scale(3);opacity:0}}
        @keyframes ie-pulse{0%,100%{opacity:1}50%{opacity:.55}}
        @keyframes ie-hb{from{stroke-dashoffset:100}to{stroke-dashoffset:-100}}
        @keyframes ie-heat{0%,100%{opacity:.7}50%{opacity:1}}
        @keyframes ie-sheet{from{transform:translateY(24px);opacity:0}to{transform:none;opacity:1}}
        .ie-sheet{animation:ie-sheet .28s cubic-bezier(.2,.8,.2,1)}
        .ie-spin{animation:ie-spin 1.1s linear infinite}
        .ie-ring{animation:ie-ring 1.8s ease-out infinite}
        .ie-pulse{animation:ie-pulse 1.6s ease-in-out infinite}
        .ie-hb{stroke-dasharray:30 70;animation:ie-hb 2.4s linear infinite}
        .ie-heat{background:linear-gradient(to top,rgba(243,156,18,.28),transparent);animation:ie-heat 2.2s ease-in-out infinite}
        .ie-frost{background:radial-gradient(120% 80% at 100% 0%,rgba(143,233,245,.16),transparent 60%),repeating-linear-gradient(135deg,rgba(143,233,245,.05) 0 2px,transparent 2px 9px)}
        @media (prefers-reduced-motion:reduce){.ie-spin,.ie-ring,.ie-pulse,.ie-hb,.ie-heat,.ie-sheet{animation:none}}
        button:focus-visible,input:focus-visible{outline:2px solid #40D6C3;outline-offset:2px}
      `}</style>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-[#28415C] bg-[#0D1724]/90 p-5 backdrop-blur lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#40D6C3]/60 bg-[#40D6C3]/10 text-lg font-bold text-[#40D6C3] shadow-[0_0_16px_-4px_#40D6C3]" style={{ fontFamily: MONO }}>I8</div>
          <div>
            <div className="text-sm font-semibold leading-tight">INITE EIGHT</div>
            <div className="text-xs text-[#A9BBCD]">BSF climate control</div>
          </div>
        </div>
        <nav className="mt-8 space-y-1">
          {NAV.map(({ id, label, I }) => (
            <button key={id} onClick={() => setTab(id)} aria-current={tab === id ? "page" : undefined}
              className={`relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${tab === id ? "bg-[#40D6C3]/10 text-[#40D6C3]" : "text-[#A9BBCD] hover:bg-[#1A2A3D] hover:text-[#F4F7FA]"}`}>
              {tab === id && <span className="absolute left-0 top-2 h-[calc(100%-16px)] w-0.5 rounded bg-[#40D6C3] shadow-[0_0_8px_#40D6C3]" />}
              <I size={18} /> {label}
            </button>
          ))}
        </nav>
        <div className="mt-auto space-y-3">
          <Heartbeat latency={s.latency} />
          <div className="text-[11px] text-[#A9BBCD]/70">Powered by Techsphere Africa</div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[#28415C] bg-[#101B2A]/85 px-5 py-3.5 backdrop-blur sm:px-8">
          <div>
            <h1 className="text-lg font-semibold">{title}</h1>
            <p className="text-xs text-[#A9BBCD] lg:hidden">INITE EIGHT · BSF climate control</p>
          </div>
          <div className="flex items-center gap-3 text-xs" style={{ fontFamily: MONO }}>
            <span className="hidden items-center gap-2 text-[#A9BBCD] sm:flex"><Clock size={14} /> {clock(new Date(s.history[s.history.length - 1].t))}</span>
            {!pwa.installed && (
              <button onClick={installNow} className="inline-flex items-center gap-1.5 rounded-md border border-[#40D6C3]/50 bg-[#40D6C3]/10 px-2.5 py-1.5 text-xs font-semibold text-[#40D6C3] transition hover:bg-[#40D6C3]/20">
                <Download size={14} /> Install App
              </button>
            )}
            <Badge label={alarm ? "ALARM" : s.mode} color={alarm ? C.bad : C.teal} />
            <Power size={16} className="text-[#2ECC71]" aria-label="Unit online" />
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-5 pb-28 pt-6 sm:px-8 lg:pb-10">
          {tab === "dashboard" && <Dashboard s={s} />}
          {tab === "climate" && <Climate s={s} set={setS} />}
          {tab === "trends" && <Trends s={s} />}
          {tab === "settings" && <SettingsTab s={s} installed={pwa.installed} onInstall={installNow} />}
        </main>
      </div>

      {sheet && <InstallSheet view={sheet} onUseWeb={dismissSheet} onInstall={installNow} onBack={() => setSheet("choice")} />}

      {/* Mobile dock */}
      <nav className="fixed inset-x-3 bottom-3 z-20 grid grid-cols-4 gap-1 rounded-2xl border border-[#28415C] bg-[#0D1724]/95 p-1.5 shadow-[0_12px_30px_-8px_rgba(0,0,0,0.8)] backdrop-blur lg:hidden" style={{ paddingBottom: "max(0.375rem, env(safe-area-inset-bottom))" }}>
        {NAV.map(({ id, label, I }) => (
          <button key={id} onClick={() => setTab(id)} aria-current={tab === id ? "page" : undefined}
            className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[11px] transition ${tab === id ? "bg-[#40D6C3]/12 text-[#40D6C3]" : "text-[#A9BBCD]"}`}>
            <I size={20} /> {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
