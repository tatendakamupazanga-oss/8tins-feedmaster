import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Activity, AlertTriangle, CheckCircle2, Clock, Cpu, Download, Fan, Flame, Globe,
  LayoutDashboard, Lock, Minus, MoreVertical, Plus, Power, Radio, Settings,
  ShieldCheck, SlidersHorizontal, Snowflake, TrendingUp, Wind, X,
} from "lucide-react";

/* ───────────────────────── Types & constants ───────────────────────── */

type Tab = "dashboard" | "climate" | "trends" | "settings";
type Mode = "AUTO" | "MANUAL";
type Relays = { fan: boolean; heat: boolean; cool: boolean };
type Point = { t: number; temp: number; hum: number; label: string };
type Sim = {
  temp: number; hum: number; target: number; targetHum: number; mode: Mode; relays: Relays;
  history: Point[]; latency: number; rssi: number; tick: number;
};

const C = {
  base: "#101B2A", surface: "#1A2A3D", border: "#28415C", teal: "#40D6C3",
  ok: "#2ECC71", warn: "#F39C12", bad: "#E74C3C", text: "#F4F7FA", muted: "#A9BBCD",
  chill: "#8FE9F5",
};
const T_MIN = 24, T_MAX = 35;
const H_MIN = 50, H_MAX = 80; // humidity setpoint bounds (% RH)
const LOGO = "data:image/png;base64,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";
const BRAND = "8tins FeedMaster";
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
    temp: h[59].temp, hum: h[59].hum, target: 30, targetHum: 65, mode: "AUTO",
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
  // In AUTO the simulation steers humidity toward the setpoint; replace with real sensor data later
  const hum = clamp(s.hum + ((s.mode === "AUTO" ? s.targetHum : 65) - s.hum) * 0.04 + (heat ? -0.14 : 0) + (cool ? 0.1 : 0) + rnd(-0.25, 0.25), 35, 95);
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
const humStatus = (h: number, target: number) => {
  const d = Math.abs(h - target);
  return d <= 3 ? { l: "OPTIMAL", c: C.ok } : d <= 6 ? { l: "MARGINAL", c: C.warn } : { l: "OUT OF RANGE", c: C.bad };
};

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

function HumBar({ hum, target }: { hum: number; target: number }) {
  const pos = clamp(((hum - 40) / 50) * 100, 2, 98);
  return (
    <div>
      <div className="relative h-2 rounded-full bg-[#101B2A] shadow-[inset_0_1px_3px_rgba(0,0,0,0.7)]">
        <div className="absolute inset-y-0 left-[40%] w-[20%] rounded-full bg-[#2ECC71]/30" />
        <div className="absolute inset-y-[-3px] w-px bg-[#40D6C3]/80" style={{ left: `${clamp(((target - 40) / 50) * 100, 0, 100)}%` }} />
        <div
          className="absolute top-1/2 h-4 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-[#F4F7FA] shadow-[0_0_10px_rgba(244,247,250,0.8)] transition-all duration-1000"
          style={{ left: `${pos}%` }}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-[#A9BBCD]/80" style={{ fontFamily: MONO }}>
        <span>40%</span><span>ideal 60–70% · target tick</span><span>90%</span>
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
  const ts = tempStatus(d), hs = humStatus(s.hum, s.targetHum);
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
              <div>Target: <span className="text-[#F4F7FA]">{s.targetHum.toFixed(1)} % RH</span></div>
              <div className="mt-1" style={{ color: Math.abs(s.hum - s.targetHum) <= 3 ? C.muted : C.warn }}>
                {s.hum - s.targetHum >= 0 ? "+" : "−"}{Math.abs(s.hum - s.targetHum).toFixed(1)} % vs target
              </div>
            </div>
          </div>
          <div className="mt-5"><HumBar hum={s.hum} target={s.targetHum} /></div>
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

function Dial({ id, target, current, min, max, digits, unit, tick, color }: {
  id: string; target: number; current: number; min: number; max: number; digits: number; unit: string; tick: string; color: string;
}) {
  const frac = clamp((target - min) / (max - min), 0, 1);
  const cf = clamp((current - min) / (max - min), 0, 1);
  const a = Math.PI * (1 - cf);
  const [cx, cy, r] = [130, 130, 100];
  const q = { x: cx + (r + 12) * Math.cos(a), y: cy - (r + 12) * Math.sin(a) };
  const q2 = { x: cx + (r - 12) * Math.cos(a), y: cy - (r - 12) * Math.sin(a) };
  return (
    <svg viewBox="0 0 260 160" className="mx-auto w-full max-w-xs">
      <defs>
        <linearGradient id={`dial-${id}`} x1="0" x2="1"><stop offset="0" stopColor={color} stopOpacity="0.45" /><stop offset="1" stopColor={color} /></linearGradient>
      </defs>
      <path d="M 30 130 A 100 100 0 0 1 230 130" fill="none" stroke={C.base} strokeWidth="14" strokeLinecap="round" />
      <path d="M 30 130 A 100 100 0 0 1 230 130" fill="none" stroke={`url(#dial-${id})`} strokeWidth="14" strokeLinecap="round"
        pathLength={100} strokeDasharray={`${frac * 100} 100`} style={{ transition: "stroke-dasharray .4s", filter: `drop-shadow(0 0 6px ${color}99)` }} />
      <line x1={q2.x} y1={q2.y} x2={q.x} y2={q.y} stroke={C.text} strokeWidth="2" style={{ transition: "all 1s" }} />
      <text x="30" y="152" fill={C.muted} fontSize="10" textAnchor="middle" fontFamily={MONO}>{min}{tick}</text>
      <text x="230" y="152" fill={C.muted} fontSize="10" textAnchor="middle" fontFamily={MONO}>{max}{tick}</text>
      <text x="130" y="122" fill={C.text} fontSize="38" textAnchor="middle" fontWeight="600" fontFamily={MONO}>{target.toFixed(digits)}</text>
      <text x="130" y="142" fill={C.muted} fontSize="11" textAnchor="middle" fontFamily={MONO}>{unit} setpoint</text>
    </svg>
  );
}

function Setpoint({ id, label, target, current, min, max, step, digits, unit, tick, color, note, onChange }: {
  id: string; label: string; target: number; current: number; min: number; max: number; step: number; digits: number;
  unit: string; tick: string; color: string; note: string; onChange: (v: number) => void;
}) {
  const btn = "flex h-11 w-11 items-center justify-center rounded-lg border border-[#28415C] bg-[#101B2A] text-[#F4F7FA] active:scale-95 hover:border-[#40D6C3]";
  return (
    <Card>
      <Label>{label}</Label>
      <Dial id={id} target={target} current={current} min={min} max={max} digits={digits} unit={unit} tick={tick} color={color} />
      <div className="mt-2 flex items-center gap-3">
        <button aria-label={`Decrease ${label}`} onClick={() => onChange(target - step)} className={btn}><Minus size={18} /></button>
        <input type="range" min={min} max={max} step={step} value={target} onChange={(e) => onChange(parseFloat(e.target.value))}
          aria-label={label} className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-[#101B2A]" style={{ accentColor: color }} />
        <button aria-label={`Increase ${label}`} onClick={() => onChange(target + step)} className={btn}><Plus size={18} /></button>
      </div>
      <p className="mt-3 text-xs text-[#A9BBCD]">{note}</p>
    </Card>
  );
}

function Climate({ s, set }: { s: Sim; set: (f: (p: Sim) => Sim) => void }) {
  const manual = s.mode === "MANUAL";
  const setTarget = (v: number) => set((p) => ({ ...p, target: clamp(Math.round(v * 2) / 2, T_MIN, T_MAX) }));
  const setTargetHum = (v: number) => set((p) => ({ ...p, targetHum: clamp(Math.round(v), H_MIN, H_MAX) }));
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
      <div className="space-y-5">
        <Setpoint id="temp" label="Target temperature" target={s.target} current={s.temp} min={T_MIN} max={T_MAX} step={0.5} digits={1}
          unit="°C" tick="°" color={C.teal} onChange={setTarget}
          note={`Safe larval bounds: ${T_MIN.toFixed(1)}–${T_MAX.toFixed(1)} °C. Moves in 0.5 °C steps.`} />
        <Setpoint id="hum" label="Target humidity" target={s.targetHum} current={s.hum} min={H_MIN} max={H_MAX} step={1} digits={0}
          unit="% RH" tick="%" color={C.warn} onChange={setTargetHum}
          note={`Ideal BSF range is 60–70 % RH. Settable ${H_MIN}–${H_MAX} % in 1 % steps.`} />
      </div>

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
            {manual ? "Operator override. The controller will not correct temperature drift." : "Relays are driven by the ESP32 controller around the temperature and humidity setpoints."}
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
          {s.targetHum >= h0 && s.targetHum <= h1 && (
            <g>
              <line x1={pl} x2={W - pr} y1={Yh(s.targetHum)} y2={Yh(s.targetHum)} stroke={C.warn} strokeOpacity="0.5" strokeDasharray="6 4" />
              <text x={W - pr - 6} y={Yh(s.targetHum) - 5} textAnchor="end" fontSize="10" fill={C.warn} fontFamily={MONO}>target {s.targetHum.toFixed(0)}%</text>
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
              <p className="mt-1 text-xs text-[#A9BBCD]" style={{ fontFamily: MONO }}>Join “8TINS-SETUP”, then open 192.168.4.1</p>
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
            {installed ? "Running as the installed 8tins FeedMaster app on this device." : "Add 8tins FeedMaster to your home screen for one-tap access. You can also keep using the web dashboard."}
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
            <Row k="Brand" v={BRAND} />
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
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-[#40D6C3]/60 bg-[#101B2A] p-1.5 shadow-[0_0_16px_-4px_#40D6C3]">
            <img src={LOGO} alt="" className="max-h-full max-w-full object-contain" draggable={false} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="ie-install-title" className="text-base font-semibold text-[#F4F7FA]">
              {view === "choice" ? `Open ${BRAND}` : "Add to Home screen"}
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
  const alarm = tempStatus(s.temp - s.target).l === "ALARM" || humStatus(s.hum, s.targetHum).l === "OUT OF RANGE";

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
        <div>
          <img src={LOGO} alt={BRAND} className="h-16 w-auto" draggable={false} />
          <div className="mt-2 text-xs text-[#A9BBCD]">BSF climate control</div>
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
          <div className="flex items-center gap-3">
            <img src={LOGO} alt={BRAND} className="h-9 w-auto lg:hidden" draggable={false} />
            <div>
              <h1 className="text-lg font-semibold">{title}</h1>
              <p className="text-xs text-[#A9BBCD] lg:hidden">BSF climate control</p>
            </div>
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
