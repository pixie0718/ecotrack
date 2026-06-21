import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Leaf, BarChart3, Zap, ShieldCheck, ArrowRight,
  Car, Utensils, ShoppingBag, Recycle,
  Sparkles, TrendingDown, Trophy, CheckCircle2,
  Target, Globe2, Lock, Activity, Flame,
  ChevronRight, X, Send, Bot,
} from 'lucide-react';

/* ─── SVG leaf path ──────────────────────────────────── */
const LP = 'M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 8-8 8z';

/* ─── 3D Leaves config ───────────────────────────────── */
const LEAVES_3D = [
  // Big foreground leaves
  { left: '6%',   top: '18%', size: 52, color: 'rgba(34,197,94,0.55)',  anim: 'leaf3dSway',  dur: 11, delay: 0  },
  { left: '88%',  top: '14%', size: 46, color: 'rgba(20,184,166,0.50)', anim: 'leaf3dDrift', dur: 9,  delay: 2  },
  { left: '78%',  top: '62%', size: 58, color: 'rgba(34,197,94,0.45)',  anim: 'leaf3dFloat', dur: 13, delay: 5  },
  { left: '3%',   top: '68%', size: 44, color: 'rgba(16,185,129,0.50)', anim: 'leaf3dDrift', dur: 10, delay: 7  },
  // Medium mid-layer
  { left: '22%',  top: '8%',  size: 34, color: 'rgba(34,197,94,0.35)',  anim: 'leaf3dFloat', dur: 14, delay: 3  },
  { left: '68%',  top: '5%',  size: 30, color: 'rgba(20,184,166,0.35)', anim: 'leaf3dSway',  dur: 12, delay: 6  },
  { left: '92%',  top: '50%', size: 36, color: 'rgba(34,197,94,0.30)',  anim: 'leaf3dDrift', dur: 10, delay: 1  },
  { left: '12%',  top: '40%', size: 32, color: 'rgba(16,185,129,0.35)', anim: 'leaf3dSway',  dur: 15, delay: 8  },
  // Small background leaves
  { left: '45%',  top: '3%',  size: 20, color: 'rgba(34,197,94,0.20)',  anim: 'leaf3dFloat', dur: 17, delay: 4  },
  { left: '55%',  top: '75%', size: 22, color: 'rgba(20,184,166,0.18)', anim: 'leaf3dSway',  dur: 16, delay: 9  },
  { left: '33%',  top: '85%', size: 18, color: 'rgba(34,197,94,0.18)',  anim: 'leaf3dDrift', dur: 18, delay: 11 },
  { left: '72%',  top: '80%', size: 24, color: 'rgba(16,185,129,0.20)', anim: 'leaf3dFloat', dur: 14, delay: 6  },
];

/* ─── Floating particles ──────────────────────────────── */
const PARTICLES = [
  { left: '5%',  size: 2, delay: 0,  dur: 20 },
  { left: '18%', size: 3, delay: 5,  dur: 17 },
  { left: '32%', size: 2, delay: 9,  dur: 23 },
  { left: '47%', size: 3, delay: 2,  dur: 19 },
  { left: '61%', size: 2, delay: 12, dur: 21 },
  { left: '75%', size: 3, delay: 7,  dur: 18 },
  { left: '88%', size: 2, delay: 15, dur: 24 },
];

/* ─── Trust badges ────────────────────────────────────── */
const TRUST = [
  { icon: <Lock    className="h-3.5 w-3.5" />, label: '100% Free'           },
  { icon: <Sparkles className="h-3.5 w-3.5"/>, label: 'Google Gemini AI'    },
  { icon: <ShieldCheck className="h-3.5 w-3.5"/>, label: 'JWT Secured'      },
  { icon: <Globe2  className="h-3.5 w-3.5" />, label: 'IPCC / EPA Data'     },
  { icon: <CheckCircle2 className="h-3.5 w-3.5"/>, label: 'Open Source'     },
];

/* ─── Benchmark data ──────────────────────────────────── */
const BENCHMARKS = [
  { label: 'Paris Climate Target',  kg: 167,  color: 'bg-green-500',  note: '2°C goal'           },
  { label: 'India Average',         kg: 158,  color: 'bg-blue-400',   note: 'IPCC per-capita'    },
  { label: 'Global Average',        kg: 400,  color: 'bg-amber-500',  note: 'World Bank data'    },
  { label: 'Sample User (EcoTrack)', kg: 248, color: 'bg-purple-400', note: '← track yours here' },
];
const MAX_BM = 480;

/* ─── Feature pillars ─────────────────────────────────── */
const PILLARS = [
  {
    title: 'Measure',
    icon: <Activity className="h-5 w-5" />,
    color: 'text-blue-400',
    border: 'border-blue-500/20',
    bg: 'bg-blue-500/5',
    items: [
      '5 emission categories',
      '50+ activity factors (IPCC/EPA)',
      'One-tap daily logging',
      'Full activity history',
      'Monthly footprint totals',
    ],
  },
  {
    title: 'Understand',
    icon: <BarChart3 className="h-5 w-5" />,
    color: 'text-purple-400',
    border: 'border-purple-500/20',
    bg: 'bg-purple-500/5',
    items: [
      'AI insights via Google Gemini',
      'Category breakdown charts',
      'Monthly trend analysis',
      'Paris target comparison',
      'India vs world benchmarks',
    ],
  },
  {
    title: 'Reduce',
    icon: <TrendingDown className="h-5 w-5" />,
    color: 'text-green-400',
    border: 'border-green-500/20',
    bg: 'bg-green-500/5',
    items: [
      '5 personalised AI tips / month',
      'Difficulty-ranked recommendations',
      'Gamified weekly challenges',
      'Reduction goal tracker',
      'CO₂ savings estimates',
    ],
  },
];

/* ─── Categories ──────────────────────────────────────── */
const CATS = [
  { icon: <Car       className="h-6 w-6" />, label: 'Transport', color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20',   examples: ['Car (petrol/diesel)', 'Flights', 'Public transit', 'Two-wheeler'], avg: 112 },
  { icon: <Zap       className="h-6 w-6" />, label: 'Energy',    color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/20',  examples: ['Electricity (kWh)', 'Natural gas', 'LPG / biomass', 'Heating'], avg: 50 },
  { icon: <Utensils  className="h-6 w-6" />, label: 'Food',      color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/20',  examples: ['Beef / lamb', 'Dairy & eggs', 'Poultry & seafood', 'Vegetables'], avg: 59 },
  { icon: <ShoppingBag className="h-6 w-6"/>, label: 'Shopping', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', examples: ['Electronics', 'Clothing', 'Furniture', 'Online orders'], avg: 17 },
  { icon: <Recycle   className="h-6 w-6" />, label: 'Waste',     color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/20',      examples: ['Landfill waste', 'Recycling', 'Food waste', 'Composting'], avg: 10 },
];

/* ─── How it works steps ──────────────────────────────── */
const STEPS = [
  { num: '01', title: 'Log activities',    desc: 'Add daily activities across 5 categories in seconds. Our calculator converts each one to kg CO₂e using IPCC emission factors.' },
  { num: '02', title: 'Understand impact', desc: 'See your footprint breakdown, compare against Paris targets, and track monthly trends in real-time charts.' },
  { num: '03', title: 'Reduce with AI',    desc: 'Google Gemini analyses your data and delivers 5 personalised, difficulty-ranked reduction tips with estimated savings.' },
];

/* ─── Preview card data ───────────────────────────────── */
const PREVIEW_BARS = [
  { label: 'Transport', pct: 45, kg: 112, color: 'bg-blue-400'   },
  { label: 'Energy',    pct: 20, kg: 50,  color: 'bg-amber-400'  },
  { label: 'Food',      pct: 24, kg: 59,  color: 'bg-green-400'  },
  { label: 'Shopping',  pct: 7,  kg: 17,  color: 'bg-purple-400' },
  { label: 'Waste',     pct: 4,  kg: 10,  color: 'bg-red-400'    },
];

/* ════════════════════════════════════════════════════════
   CHAT BOT
   ════════════════════════════════════════════════════════ */
type Msg = { from: 'user' | 'bot'; text: string };

const BOT: Record<string, string> = {
  what_is: `EcoTrack is a Carbon Footprint Awareness Platform 🌿\n\nYou log daily activities across 5 categories, and we calculate your CO₂ emissions using IPCC/EPA data. Google Gemini AI then gives you 5 personalised tips to reduce your impact — ranked by priority and difficulty.`,
  free:    `Yes, 100% free forever! 🎉\n\nNo credit card needed. Just create an account and start tracking. All features — including AI insights and weekly challenges — are included at no cost.`,
  ai:      `We use Google Gemini 1.5 Flash ✨\n\nEvery month it:\n• Analyses your full emission breakdown\n• Generates 5 personalised reduction tips\n• Ranks them by priority & difficulty\n• Estimates CO₂ savings for each\n• Creates a custom weekly eco-challenge for you`,
  track:   `You can track 5 life categories 📊\n\n🚗 Transport — car, flights, bus, metro\n⚡ Energy — electricity, gas, LPG\n🥗 Food — meat, dairy, vegetables\n🛍 Shopping — clothes, electronics\n♻️ Waste — landfill, recycling\n\nWe use 50+ emission factors from IPCC & EPA so your numbers are scientifically accurate.`,
  reduce:  `Top ways to shrink your footprint 🌱\n\n1. Switch to public transit (+30–50 kg/mo saved)\n2. Eat less beef (27 kg CO₂ per kg vs 6.9 for chicken)\n3. Cut electricity waste — LED bulbs, shorter showers\n4. Buy less fast fashion (1 cotton shirt ≈ 2.1 kg CO₂)\n5. Compost food scraps instead of landfill\n\nEcoTrack's AI will generate tips tailored specifically to your habits!`,
  carbon:  `Carbon footprint is the total CO₂-equivalent (CO₂e) your activities release 🌍\n\nIt includes:\n• CO₂ from burning fossil fuels\n• Methane (CH₄) from livestock & landfill\n• Nitrous oxide (N₂O) from agriculture\n\nAll gases are converted to a single "CO₂ equivalent" so you get one clear number to track and reduce.`,
  matter:  `It matters because climate change is accelerating ⚠️\n\nThe Paris Agreement requires each person to emit under 2,000 kg CO₂e per year (167 kg/month) to limit warming to 2°C.\n\nThe global average today is 4,700 kg/year — over 2× the safe limit. Individual awareness + AI-guided action = the fastest path to change.`,
};

const SUGGESTIONS = [
  { id: 'what_is', label: 'What is EcoTrack?' },
  { id: 'free',    label: 'Is it free?' },
  { id: 'ai',      label: 'How does AI help?' },
  { id: 'track',   label: 'What can I track?' },
  { id: 'reduce',  label: 'Reduce my footprint' },
  { id: 'carbon',  label: 'What is CO₂ footprint?' },
  { id: 'matter',  label: 'Why does it matter?' },
];

const WELCOME = `Hi! I'm EcoTrack's AI assistant 🌿\n\nAsk me anything about carbon footprint, how EcoTrack works, or how our AI helps you go greener.\n\nOr tap a quick question below!`;

const LandingChat: React.FC = () => {
  const [open, setOpen]     = useState(false);
  const [msgs, setMsgs]     = useState<Msg[]>([{ from: 'bot', text: WELCOME }]);
  const [input, setInput]   = useState('');
  const bottomRef           = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const addBot = (text: string) =>
    setMsgs(p => [...p, { from: 'bot', text }]);

  const handleSuggestion = (id: string, label: string) => {
    setMsgs(p => [...p, { from: 'user', text: label }]);
    setTimeout(() => addBot(BOT[id]), 420);
  };

  const handleSend = () => {
    const q = input.trim();
    if (!q) return;
    setInput('');
    setMsgs(p => [...p, { from: 'user', text: q }]);
    const l = q.toLowerCase();
    let reply = '';
    if (l.includes('free') || l.includes('cost') || l.includes('price'))         reply = BOT.free;
    else if (l.includes('ai') || l.includes('gemini') || l.includes('insight'))  reply = BOT.ai;
    else if (l.includes('track') || l.includes('categor') || l.includes('log'))  reply = BOT.track;
    else if (l.includes('reduc') || l.includes('lower') || l.includes('tip'))    reply = BOT.reduce;
    else if (l.includes('carbon') || l.includes('co2') || l.includes('emission')) reply = BOT.carbon;
    else if (l.includes('matter') || l.includes('why') || l.includes('climate')) reply = BOT.matter;
    else if (l.includes('ecotrack') || l.includes('about') || l.includes('what')) reply = BOT.what_is;
    else reply = `Great question! 🌿\n\nHere's what I can help with:\n• What EcoTrack does\n• How the AI works\n• What you can track\n• How to reduce emissions\n• Why footprint matters\n\nTry one of the quick questions below!`;
    setTimeout(() => addBot(reply), 420);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close assistant' : 'Open AI assistant'}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-green-500 hover:bg-green-400
                   flex items-center justify-center shadow-xl shadow-green-500/40
                   transition-all duration-200 hover:scale-110 active:scale-95"
      >
        {open
          ? <X   className="h-6 w-6 text-white" />
          : <Bot className="h-6 w-6 text-white" />}
        {!open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-teal-400 border-2 border-[#080d08] animate-pulse" />
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-4 sm:right-5 z-50 w-[calc(100vw-2rem)] sm:w-96 rounded-2xl overflow-hidden
                        shadow-2xl shadow-black/60 flex flex-col"
             style={{ height: 480, background: 'rgba(8,14,8,0.97)', border: '1px solid rgba(34,197,94,0.18)', backdropFilter: 'blur(20px)' }}>

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/8 shrink-0"
               style={{ background: 'rgba(34,197,94,0.07)' }}>
            <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
              <Bot className="h-4 w-4 text-green-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-none">EcoTrack Assistant</p>
              <p className="text-xs text-green-400 mt-0.5">● Online · Powered by Gemini</p>
            </div>
            <button onClick={() => setOpen(false)} className="ml-auto text-white/30 hover:text-white transition-colors" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
            {msgs.map((m, i) => (
              <div key={i} className={`flex items-end gap-2 ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.from === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                    <Leaf className="h-3 w-3 text-green-400" aria-hidden="true" />
                  </div>
                )}
                <div className={`max-w-[80%] px-3 py-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap break-words ${
                  m.from === 'user'
                    ? 'bg-green-500 text-white rounded-br-sm'
                    : 'bg-white/6 text-white/75 rounded-bl-sm border border-white/5'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Quick suggestions */}
          <div className="px-3 pt-2 pb-1 border-t border-white/5 shrink-0">
            <div className="flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {SUGGESTIONS.map(s => (
                <button key={s.id} onClick={() => handleSuggestion(s.id, s.label)}
                        className="shrink-0 text-[10px] sm:text-xs px-2.5 py-1.5 rounded-full
                                   border border-green-500/25 text-green-400 hover:bg-green-500/10
                                   transition-colors whitespace-nowrap">
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="px-3 pb-3 pt-2 shrink-0">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/4 px-3 py-2.5">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask anything about EcoTrack..."
                className="flex-1 bg-transparent text-xs text-white placeholder-white/25 outline-none min-w-0"
              />
              <button onClick={handleSend} disabled={!input.trim()} aria-label="Send"
                      className="text-green-400 hover:text-green-300 disabled:text-white/15 transition-colors shrink-0">
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/* ════════════════════════════════════════════════════════
   COMPONENT
   ════════════════════════════════════════════════════════ */
const Landing: React.FC = () => (
  <div className="min-h-screen bg-[#080d08] text-white overflow-x-hidden">

    {/* ── NAVBAR ─────────────────────────────────────────── */}
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4"
         style={{ background: 'rgba(8,13,8,0.88)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-500 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/30 shrink-0">
          <Leaf className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" aria-hidden="true" />
        </div>
        <span className="font-bold text-base sm:text-lg tracking-tight">EcoTrack</span>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-3">
        <Link to="/login" className="hidden sm:block text-sm text-white/50 hover:text-white transition-colors px-3 py-2">
          Sign in
        </Link>
        <Link to="/register"
              className="text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-lg bg-green-500 hover:bg-green-400 transition-colors text-white shadow-lg shadow-green-500/20 whitespace-nowrap">
          <span className="sm:hidden">Sign up</span>
          <span className="hidden sm:inline">Get started free</span>
        </Link>
      </div>
    </nav>

    {/* ── HERO ───────────────────────────────────────────── */}
    <section className="relative min-h-screen flex items-center pt-16 sm:pt-20 auth-bg overflow-hidden">

      {/* Aurora blobs */}
      <div className="aurora-1 pointer-events-none absolute top-[-10%] left-[-5%] w-[700px] h-[700px] rounded-full"
           style={{ background: 'radial-gradient(circle, rgba(22,163,74,0.22), transparent 68%)' }} />
      <div className="aurora-2 pointer-events-none absolute bottom-[-15%] right-[-8%] w-[800px] h-[800px] rounded-full"
           style={{ background: 'radial-gradient(circle, rgba(13,148,136,0.18), transparent 68%)' }} />
      <div className="aurora-3 pointer-events-none absolute top-[30%] right-[20%] w-[500px] h-[500px] rounded-full"
           style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.10), transparent 68%)' }} />

      {/* Grid */}
      <div className="pointer-events-none absolute inset-0"
           style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '72px 72px' }} />

      {/* 3D Leaves */}
      {LEAVES_3D.map((l, i) => (
        <svg key={i}
             className={`leaf-3d leaf-3d-${l.anim === 'leaf3dSway' ? 'sway' : l.anim === 'leaf3dDrift' ? 'drift' : 'float'}`}
             width={l.size} height={l.size} viewBox="0 0 24 24"
             style={{
               left: l.left, top: l.top,
               fill: l.color,
               animationDuration: `${l.dur}s`,
               animationDelay: `${l.delay}s`,
             }}
             aria-hidden="true">
          <path d={LP} />
        </svg>
      ))}

      {/* Particles */}
      {PARTICLES.map((p, i) => (
        <div key={i} className="auth-particle"
             style={{ left: p.left, width: p.size, height: p.size, animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s` }} />
      ))}

      {/* Hero content — 2 columns */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full py-10 sm:py-16 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">

        {/* Left: headline */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6
                          bg-green-500/10 border border-green-500/25 text-green-400">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            Hack2Skill Prompt Wars · Google Gemini AI
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-4 sm:mb-5">
            Track.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-400">Understand.</span>
            <br />Reduce your
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400"> carbon.</span>
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-white/55 leading-relaxed mb-6 sm:mb-8 max-w-lg">
            Log everyday activities across 5 categories, get AI-personalised reduction tips from Google Gemini,
            and track your progress toward the Paris Climate Agreement target.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-10">
            <Link to="/register"
                  className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white
                             bg-green-500 hover:bg-green-400 transition-all shadow-lg shadow-green-500/30
                             hover:shadow-green-500/50 hover:scale-105 active:scale-100 text-[15px]">
              Start tracking free
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link to="/login"
                  className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold
                             text-white/60 hover:text-white border border-white/10 hover:border-white/25
                             transition-all text-[15px]">
              Sign in
            </Link>
          </div>

          {/* Micro stats */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/35">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" aria-hidden="true" /> No credit card</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" aria-hidden="true" /> Free forever</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" aria-hidden="true" /> IPCC data sources</span>
          </div>
        </div>

        {/* Right: Live preview card — hidden on small mobile */}
        <div className="relative hidden sm:flex items-center justify-center lg:justify-end">
          {/* Glow behind card */}
          <div className="absolute inset-0 bg-green-500/5 rounded-3xl blur-3xl" />

          <div className="relative w-full max-w-sm rounded-2xl overflow-hidden border border-white/10"
               style={{ background: 'rgba(15,22,15,0.92)', backdropFilter: 'blur(20px)', boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)' }}>

            {/* Card header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-500 rounded-md flex items-center justify-center">
                  <Leaf className="h-3 w-3 text-white" aria-hidden="true" />
                </div>
                <span className="text-sm font-semibold text-white/80">Monthly Footprint</span>
              </div>
              <span className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            </div>

            <div className="px-5 py-4">
              {/* Big number */}
              <div className="flex items-end gap-2 mb-1">
                <span className="text-4xl font-bold text-white">248</span>
                <span className="text-white/40 text-sm mb-1.5">kg CO₂e / month</span>
              </div>
              <div className="flex items-center gap-1.5 mb-5">
                <TrendingDown className="h-3.5 w-3.5 text-green-400" aria-hidden="true" />
                <span className="text-xs text-green-400 font-medium">12% lower than last month</span>
              </div>

              {/* Category bars */}
              <div className="space-y-2.5 mb-5">
                {PREVIEW_BARS.map((b) => (
                  <div key={b.label}>
                    <div className="flex justify-between text-xs text-white/45 mb-1">
                      <span>{b.label}</span>
                      <span className="font-medium text-white/60">{b.kg} kg</span>
                    </div>
                    <div className="h-1.5 bg-white/6 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${b.color} opacity-80 transition-all duration-1000`}
                           style={{ width: `${b.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* AI tip */}
              <div className="rounded-lg p-3 mb-4"
                   style={{ background: 'rgba(139,92,246,0.10)', border: '1px solid rgba(139,92,246,0.20)' }}>
                <div className="flex items-start gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-purple-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-xs font-medium text-purple-300 mb-0.5">Gemini AI tip</p>
                    <p className="text-xs text-white/50">Carpool 2x/week → save <strong className="text-white/70">31 kg CO₂e</strong>/month</p>
                  </div>
                </div>
              </div>

              {/* Paris comparison */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/30">vs Paris Climate Target</span>
                <span className="font-semibold text-amber-400">+49% above target</span>
              </div>
              <div className="mt-1.5 h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400/70 rounded-full" style={{ width: '67%' }} />
              </div>
              <div className="flex justify-between text-[10px] text-white/20 mt-1">
                <span>0</span>
                <span>Paris 167 kg</span>
                <span>You: 248 kg</span>
              </div>
            </div>

            {/* Card footer */}
            <div className="px-5 py-3 border-t border-white/6 flex items-center justify-between">
              <span className="text-xs text-white/25">Your data stays private</span>
              <div className="flex items-center gap-1 text-xs text-green-400 font-medium">
                <span>View full dashboard</span>
                <ChevronRight className="h-3 w-3" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/15 text-xs pointer-events-none">
        <span>Scroll to explore</span>
        <div className="w-px h-8 bg-gradient-to-b from-white/15 to-transparent" />
      </div>
    </section>

    {/* ── TRUST STRIP ────────────────────────────────────── */}
    <div className="py-5 border-b border-white/5" style={{ background: 'rgba(255,255,255,0.015)' }}>
      <div className="max-w-4xl mx-auto px-6 flex flex-wrap justify-center gap-x-8 gap-y-3">
        {TRUST.map((t) => (
          <div key={t.label} className="flex items-center gap-2 text-sm text-white/35">
            <span className="text-green-500" aria-hidden="true">{t.icon}</span>
            {t.label}
          </div>
        ))}
      </div>
    </div>

    {/* ── STATS ──────────────────────────────────────────── */}
    <section className="py-16 border-b border-white/5">
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {[
          { v: '50+',   l: 'Emission factors',   s: 'IPCC / EPA sourced'     },
          { v: '5',     l: 'Tracking categories', s: 'Full lifestyle coverage' },
          { v: '167',   l: 'kg CO₂ Paris / mo',  s: '2°C climate goal'       },
          { v: '2,000', l: 'kg Annual target',    s: 'Per person per year'    },
        ].map((s) => (
          <div key={s.l}>
            <div className="text-3xl font-bold text-green-400 mb-1">{s.v}</div>
            <div className="text-sm font-medium text-white/70">{s.l}</div>
            <div className="text-xs text-white/30 mt-0.5">{s.s}</div>
          </div>
        ))}
      </div>
    </section>

    {/* ── HOW IT WORKS ───────────────────────────────────── */}
    <section className="py-24 max-w-5xl mx-auto px-6">
      <div className="text-center mb-14">
        <h2 className="text-3xl md:text-4xl font-bold mb-3">Three steps to net zero</h2>
        <p className="text-white/40 max-w-md mx-auto text-sm">Simple daily habit, big long-term impact</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STEPS.map((s, i) => (
          <div key={s.num}
               className="relative p-6 rounded-2xl border border-white/8 bg-white/[0.02] hover:border-green-500/25 transition-colors">
            <div className="text-5xl font-black text-white/5 absolute top-4 right-4 select-none">{s.num}</div>
            <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-4 text-green-400 font-bold">
              {i + 1}
            </div>
            <h3 className="font-semibold text-white mb-2">{s.title}</h3>
            <p className="text-sm text-white/45 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* ── BENCHMARK COMPARISON ───────────────────────────── */}
    <section className="py-24 border-t border-white/5" style={{ background: 'rgba(255,255,255,0.015)' }}>
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Where do you stand?</h2>
          <p className="text-white/40 text-sm">Monthly per-person CO₂e benchmarks — track yours in real time</p>
        </div>
        <div className="space-y-5">
          {BENCHMARKS.map((b) => (
            <div key={b.label}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-sm font-medium text-white/80">{b.label}</span>
                  <span className="ml-2 text-xs text-white/30">{b.note}</span>
                </div>
                <span className="text-sm font-bold text-white/70">{b.kg} kg</span>
              </div>
              <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${b.color} transition-all duration-1000`}
                     style={{ width: `${(b.kg / MAX_BM) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-white/25 mt-6 text-center">
          Sources: IPCC AR6, World Bank 2023, India MoEFCC. Sample user data calculated by EcoTrack.
        </p>
      </div>
    </section>

    {/* ── FEATURE PILLARS ────────────────────────────────── */}
    <section className="py-24 max-w-6xl mx-auto px-6">
      <div className="text-center mb-14">
        <h2 className="text-3xl md:text-4xl font-bold mb-3">Everything you need to go greener</h2>
        <p className="text-white/40 text-sm max-w-md mx-auto">Measure your emissions, understand them with AI, then act on them</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PILLARS.map((p) => (
          <div key={p.title} className={`p-6 rounded-2xl border ${p.border} ${p.bg}`}>
            <div className={`flex items-center gap-2 mb-5 ${p.color}`}>
              {p.icon}
              <span className="font-bold text-lg">{p.title}</span>
            </div>
            <ul className="space-y-2.5">
              {p.items.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-white/55">
                  <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${p.color}`} aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>

    {/* ── 5 CATEGORIES ───────────────────────────────────── */}
    <section className="py-24 border-t border-white/5" style={{ background: 'rgba(255,255,255,0.015)' }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Track across 5 life areas</h2>
          <p className="text-white/40 text-sm">Every category that makes up your personal carbon footprint</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {CATS.map((c) => (
            <div key={c.label} className={`p-5 rounded-2xl border ${c.bg} hover:scale-[1.02] transition-transform`}>
              <div className={`${c.color} mb-3`} aria-hidden="true">{c.icon}</div>
              <div className="font-semibold text-white mb-1">{c.label}</div>
              <div className={`text-xs font-medium mb-3 ${c.color}`}>avg {c.avg} kg/mo</div>
              <ul className="space-y-1">
                {c.examples.map((ex) => (
                  <li key={ex} className="text-xs text-white/35">{ex}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── AI GEMINI SECTION ──────────────────────────────── */}
    <section className="py-24 max-w-5xl mx-auto px-6">
      <div className="relative rounded-3xl overflow-hidden p-10 md:p-16 text-center"
           style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(59,130,246,0.08) 50%, rgba(34,197,94,0.08) 100%)', border: '1px solid rgba(139,92,246,0.18)' }}>
        <div className="absolute inset-0 opacity-10 pointer-events-none"
             style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative z-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-500/12 border border-purple-500/25 mb-6">
            <Sparkles className="h-7 w-7 text-purple-400" aria-hidden="true" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Powered by
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400"> Google Gemini 1.5 Flash</span>
          </h2>
          <p className="text-white/45 max-w-xl mx-auto mb-8 leading-relaxed text-sm">
            Every month, Gemini analyses your full carbon breakdown — category by category — and generates 5 personalised,
            priority-ranked reduction tips with estimated CO₂ savings, tailored to your diet, vehicle, and lifestyle.
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {[
              'Personalised monthly tips', 'Priority + difficulty ratings',
              'CO₂ savings estimate', 'Weekly AI challenges',
              'Paris target comparison', 'Category-level insights',
            ].map((tag) => (
              <span key={tag} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/8 text-white/50 text-xs">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* ── GAMIFICATION STRIP ─────────────────────────────── */}
    <section className="py-16 border-t border-white/5" style={{ background: 'rgba(255,255,255,0.015)' }}>
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <Trophy  className="h-6 w-6" />, color: 'text-amber-400',  bg: 'bg-amber-500/8 border-amber-500/20',   title: 'Weekly Challenges', desc: 'New Gemini-generated challenge every week. Car-free days, meat-free meals, energy audits.' },
            { icon: <Target  className="h-6 w-6" />, color: 'text-blue-400',   bg: 'bg-blue-500/8 border-blue-500/20',     title: 'Reduction Goals',   desc: 'Set a personal % reduction target. Watch your progress bar approach your goal in real time.' },
            { icon: <Flame   className="h-6 w-6" />, color: 'text-orange-400', bg: 'bg-orange-500/8 border-orange-500/20', title: 'Streak & Habits',   desc: 'Daily logging builds streaks. Consistent tracking is the #1 predictor of long-term reduction.' },
          ].map((g) => (
            <div key={g.title} className={`p-5 rounded-2xl border ${g.bg}`}>
              <div className={`${g.color} mb-3`} aria-hidden="true">{g.icon}</div>
              <h3 className="font-semibold text-white mb-2">{g.title}</h3>
              <p className="text-sm text-white/45 leading-relaxed">{g.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── FINAL CTA ──────────────────────────────────────── */}
    <section className="py-28 text-center">
      <div className="max-w-2xl mx-auto px-6">
        <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/30">
          <Leaf className="h-8 w-8 text-white" aria-hidden="true" />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Start your climate journey today</h2>
        <p className="text-white/40 mb-8 text-sm">Free forever. No credit card. Your data stays yours.</p>
        <Link to="/register"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-semibold text-white text-base
                         bg-green-500 hover:bg-green-400 transition-all duration-200
                         shadow-xl shadow-green-500/30 hover:shadow-green-500/50 hover:scale-105 active:scale-100">
          Create free account
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <p className="mt-4 text-xs text-white/20">
          Already have an account?{' '}
          <Link to="/login" className="text-green-500 hover:text-green-400 transition-colors">Sign in</Link>
        </p>
      </div>
    </section>

    {/* ── FOOTER ─────────────────────────────────────────── */}
    <footer className="py-8 border-t border-white/5 text-center">
      <div className="flex items-center justify-center gap-2 mb-3">
        <div className="w-6 h-6 bg-green-500/20 border border-green-500/30 rounded-md flex items-center justify-center">
          <Leaf className="h-3 w-3 text-green-500" aria-hidden="true" />
        </div>
        <span className="font-semibold text-white/50 text-sm">EcoTrack</span>
      </div>
      <p className="text-white/20 text-xs mb-2">
        Built for Google Hack2Skill · Prompt Wars Challenge 3 · Powered by Google Gemini
      </p>
      <p className="text-white/15 text-xs">
        Emission factors sourced from IPCC AR6, EPA, and World Bank open datasets.
      </p>
      <div className="flex items-center justify-center gap-6 mt-4 text-xs text-white/20">
        <Link to="/login"    className="hover:text-white/40 transition-colors">Sign in</Link>
        <Link to="/register" className="hover:text-white/40 transition-colors">Register</Link>
      </div>
    </footer>

    {/* ── AI CHAT BOT ────────────────────────────────────── */}
    <LandingChat />

  </div>
);

export default Landing;
