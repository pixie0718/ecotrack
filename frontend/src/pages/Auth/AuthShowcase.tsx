import React from 'react';
import { Leaf, Zap, Trophy, TrendingDown, BarChart2, ShieldCheck } from 'lucide-react';

const STATS = [
  { value: '50+', label: 'Emission Factors' },
  { value: '5',   label: 'CO₂ Categories' },
  { value: 'AI',  label: 'Gemini Powered' },
  { value: '21kg',label: 'Per Tree / Year' },
];

const FEATURES = [
  { icon: BarChart2,   text: 'Real-time carbon footprint tracking' },
  { icon: Zap,         text: 'AI insights powered by Google Gemini' },
  { icon: Trophy,      text: 'Gamified eco challenges & achievements' },
  { icon: TrendingDown,text: 'Personalised reduction strategies' },
  { icon: ShieldCheck, text: 'Secure, privacy-first architecture' },
];

const PARTICLES = [
  { id: 0, left: '10%', size: 2, delay: 0,  dur: 20 },
  { id: 1, left: '28%', size: 3, delay: 4,  dur: 17 },
  { id: 2, left: '48%', size: 2, delay: 8,  dur: 23 },
  { id: 3, left: '67%', size: 3, delay: 2,  dur: 19 },
  { id: 4, left: '82%', size: 2, delay: 6,  dur: 21 },
  { id: 5, left: '55%', size: 2, delay: 11, dur: 25 },
];

const AuthShowcase: React.FC = () => (
  <div className="relative flex flex-col justify-between w-full h-full min-h-screen px-10 py-12 overflow-hidden"
       style={{ background: 'rgba(0,0,0,0.15)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>

    {/* Subtle inner aurora */}
    <div className="pointer-events-none absolute inset-0">
      <div className="aurora-1 absolute top-[-10%] left-[-20%] w-[420px] h-[420px] rounded-full opacity-25"
           style={{ background: 'radial-gradient(circle, #16a34a, transparent 65%)' }} />
      <div className="aurora-3 absolute bottom-[-10%] right-[-10%] w-[340px] h-[340px] rounded-full opacity-15"
           style={{ background: 'radial-gradient(circle, #0d9488, transparent 65%)' }} />
    </div>

    {/* Floating particles */}
    {PARTICLES.map((p) => (
      <div key={p.id} className="auth-particle"
           style={{ left: p.left, width: p.size, height: p.size,
                    animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s` }} />
    ))}

    {/* Top: Logo + tagline */}
    <div className="relative z-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="auth-logo flex items-center justify-center w-11 h-11 rounded-xl">
          <Leaf className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">EcoTrack</h1>
          <p className="text-xs text-green-400/60">Carbon Footprint Platform</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white leading-snug mb-3">
        Track. Reduce.<br />
        <span className="text-green-400">Make an Impact.</span>
      </h2>
      <p className="text-sm text-white/45 leading-relaxed">
        Understand your carbon impact across transport, energy, food, shopping and waste —
        then let AI guide you to net zero.
      </p>
    </div>

    {/* Middle: Features list */}
    <div className="relative z-10 space-y-3 my-8">
      {FEATURES.map(({ icon: Icon, text }) => (
        <div key={text} className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
               style={{ background: 'rgba(22,163,74,0.15)', border: '1px solid rgba(22,163,74,0.2)' }}>
            <Icon className="h-4 w-4 text-green-400" />
          </div>
          <span className="text-sm text-white/60">{text}</span>
        </div>
      ))}
    </div>

    {/* Bottom: Stats grid */}
    <div className="relative z-10">
      <div className="grid grid-cols-2 gap-3 mb-6">
        {STATS.map(({ value, label }) => (
          <div key={label} className="rounded-xl p-3"
               style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-lg font-bold text-green-400">{value}</p>
            <p className="text-xs text-white/40 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* IPCC source badge */}
      <div className="flex items-center gap-2 rounded-xl px-3 py-2.5"
           style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.15)' }}>
        <div className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" style={{ animation: 'logoPulse 2s infinite' }} />
        <p className="text-xs text-white/45">
          Emission factors sourced from <span className="text-green-400/80">IPCC · EPA · GHG Protocol</span>
        </p>
      </div>

      <p className="mt-5 text-xs italic text-white/25 leading-relaxed">
        "The greatest threat to our planet is the belief that someone else will save it."
        <span className="block mt-0.5 not-italic text-white/20">— Robert Swan</span>
      </p>
    </div>
  </div>
);

export default AuthShowcase;
