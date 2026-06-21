import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { carbonService } from '@/services/carbon.service';
import { formatCO2 } from '@/utils/formatters';
import type { DashboardStats, CarbonCategory } from '@/types/carbon.types';

type Msg = { from: 'user' | 'bot'; text: string; isAI?: boolean };

const CATEGORY_LABELS: Record<CarbonCategory, string> = {
  transport: 'Transport', energy: 'Energy',
  food: 'Food', shopping: 'Shopping', waste: 'Waste',
};

const REDUCE_TIPS: Record<string, string> = {
  transport: `To cut transport emissions 🚗\n\n• Switch to public transit when possible\n• Walk / cycle for short trips (<5 km)\n• Carpool to halve your per-km emissions\n• Consider an electric or hybrid vehicle`,
  energy:    `To reduce energy emissions ⚡\n\n• Switch to LED bulbs (75% less energy)\n• Turn off devices on standby\n• Wash clothes in cold water\n• Increase renewable energy % in your profile`,
  food:      `To cut food emissions 🥗\n\n• Reduce beef (1 kg beef = 27 kg CO₂ vs 6.9 for chicken)\n• Have 2–3 meatless days per week\n• Buy local & seasonal produce\n• Reduce food waste (compost scraps)`,
  shopping:  `To reduce shopping emissions 🛍\n\n• Buy second-hand or refurbished\n• Choose quality over fast fashion\n• Repair instead of replace\n• Avoid single-use plastics`,
  waste:     `To cut waste emissions ♻️\n\n• Compost food scraps\n• Recycle paper, plastic, glass, metal\n• Donate items instead of binning\n• Buy in bulk to reduce packaging`,
};

function getTopCategory(stats: DashboardStats): CarbonCategory {
  const breakdown = stats.thisMonth.breakdown;
  return (Object.entries(breakdown).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'transport') as CarbonCategory;
}

const WELCOME_GENERIC = `Hi! I'm your EcoTrack AI assistant 🌿\n\nAsk me anything about your carbon footprint, how to reduce emissions, or tap "Get AI Insights" for Gemini-powered tips!`;

function buildWelcome(stats: DashboardStats | undefined): string {
  if (!stats) return WELCOME_GENERIC;
  const today  = formatCO2(stats.today.co2Kg);
  const month  = formatCO2(stats.thisMonth.co2Kg);
  const paris  = formatCO2(stats.globalComparison.paris_target);
  const status = stats.thisMonth.co2Kg <= stats.globalComparison.paris_target
    ? '✅ within the Paris target'
    : `⚠️ above the Paris target of ${paris}/mo`;
  return `Hi! I'm your EcoTrack AI assistant 🌿\n\nToday: **${today}** · This month: **${month}** — ${status}.\n\nAsk me anything or tap a quick question below!`;
}

export const DashboardChat: React.FC = () => {
  const { data: stats } = useQuery({
    queryKey: ['dashboard'],
    queryFn: carbonService.getDashboard,
    staleTime: 5 * 60 * 1000,
  });

  const [open, setOpen]       = useState(false);
  const [msgs, setMsgs]       = useState<Msg[]>([{ from: 'bot', text: WELCOME_GENERIC }]);
  const [input, setInput]     = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Update welcome msg when stats load
  useEffect(() => {
    if (stats) {
      setMsgs([{ from: 'bot', text: buildWelcome(stats) }]);
    }
  }, [stats]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const addBot = (text: string, isAI = false) =>
    setMsgs(p => [...p, { from: 'bot', text, isAI }]);

  const handleSend = () => {
    const q = input.trim();
    if (!q) return;
    setInput('');
    setMsgs(p => [...p, { from: 'user', text: q }]);
    const l = q.toLowerCase();
    let reply = '';

    if (l.includes('biggest') || l.includes('top') || l.includes('source')) {
      if (stats) {
        const top = getTopCategory(stats);
        const topKg = formatCO2(stats.thisMonth.breakdown[top]);
        const pct = stats.thisMonth.co2Kg > 0
          ? Math.round((stats.thisMonth.breakdown[top] / stats.thisMonth.co2Kg) * 100) : 0;
        reply = `Your biggest source this month is **${CATEGORY_LABELS[top]}** at ${topKg} (${pct}% of total) 📊\n\nAsk "reduce ${CATEGORY_LABELS[top].toLowerCase()}" for tips!`;
      } else reply = `Log some activities first, then I can show your top emission source! 🌿`;
    } else if (l.includes('average') || l.includes('paris') || l.includes('world')) {
      if (stats) {
        const my = stats.thisMonth.co2Kg;
        const world = stats.globalComparison.world;
        const paris = stats.globalComparison.paris_target;
        reply = `Your monthly footprint is ${formatCO2(my)} 🌍\n\n${my <= world ? '✅' : '⚠️'} vs World avg (${formatCO2(world)})\n${my <= paris ? '✅' : '⚠️'} vs Paris target (${formatCO2(paris)})\n\nParis target = 167 kg/month per person.`;
      } else reply = `The Paris Agreement target is **167 kg CO₂/month** per person (2,000 kg/year). Log activities to see how you compare! 🌍`;
    } else if (l.includes('tree') || l.includes('offset')) {
      if (stats) {
        reply = `This month you'd need **${stats.thisMonth.treeEquivalent.toFixed(1)} trees** to offset your footprint 🌳\n\nOne mature tree absorbs ~21 kg CO₂/year. Reducing emissions at source is always more effective!`;
      } else reply = `One mature tree absorbs ~21 kg CO₂/year (~1.75 kg/month) 🌳\n\nLog activities to see how many trees you'd need to offset your footprint!`;
    } else if (l.includes('today')) {
      if (stats) reply = `Today you've emitted **${formatCO2(stats.today.co2Kg)}** 🌿\n\n≈ ${stats.today.treeEquivalent.toFixed(2)} trees needed to offset.`;
      else reply = `Log today's activities to see your daily footprint! 🌿`;
    } else if (l.includes('reduc') || l.includes('transport') || l.includes('car')) {
      reply = REDUCE_TIPS.transport;
    } else if (l.includes('energy') || l.includes('electric')) {
      reply = REDUCE_TIPS.energy;
    } else if (l.includes('food') || l.includes('meat') || l.includes('diet')) {
      reply = REDUCE_TIPS.food;
    } else if (l.includes('shop') || l.includes('buy') || l.includes('cloth')) {
      reply = REDUCE_TIPS.shopping;
    } else if (l.includes('waste') || l.includes('recycl')) {
      reply = REDUCE_TIPS.waste;
    } else if (l.includes('carbon') || l.includes('co2') || l.includes('what')) {
      reply = `Carbon footprint is the total CO₂-equivalent your activities release 🌍\n\nIt includes CO₂ from fuel, methane from livestock, and nitrous oxide from agriculture — all converted to a single CO₂e number so you can track and reduce it.`;
    } else {
      reply = `Here's what I can help with 🌿\n\n• "My biggest source?" — top emission category\n• "Am I above average?" — vs world & Paris target\n• "How to reduce transport/food/energy?"\n• "How many trees?" — offset equivalent\n• Tap "Get AI Insights" for Gemini-powered tips!`;
    }
    setTimeout(() => addBot(reply), 400);
  };

  const handleGemini = async () => {
    setMsgs(p => [...p, { from: 'user', text: 'Get AI Insights from Gemini 🤖' }]);
    setAiLoading(true);
    try {
      const result = await carbonService.getInsights();
      const ins = result.insights;
      const tipsText = ins.personalizedTips.slice(0, 3)
        .map((t, i) => `${i + 1}. ${t.tip} (saves ~${t.potentialSavingKg.toFixed(1)} kg • ${t.difficulty})`)
        .join('\n');
      addBot(`${ins.summary}\n\n🎯 Top 3 Tips:\n${tipsText}\n\n🏆 Weekly Challenge: ${ins.weeklyChallenge.title}\n${ins.weeklyChallenge.description}\n\n${ins.motivationalMessage}`, true);
    } catch {
      addBot('Could not reach Gemini right now. Visit the AI Insights page for your full analysis! 🌿');
    } finally {
      setAiLoading(false);
    }
  };

  const quickActions = [
    { label: 'My biggest source?', q: 'My biggest source?' },
    { label: 'vs Paris target?',   q: 'Am I above Paris target?' },
    { label: 'Reduce transport',   q: 'How to reduce transport?' },
    { label: 'Reduce food',        q: 'How to reduce food?' },
  ];

  return (
    <>
      {/* Floating button — above mobile bottom nav */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close AI assistant' : 'Open AI assistant'}
        className="fixed bottom-[4.5rem] right-4 lg:bottom-5 lg:right-5 z-50
                   w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center
                   shadow-xl transition-all duration-200 hover:scale-110 active:scale-95"
        style={{
          background: open ? '#dc2626' : 'linear-gradient(135deg,#16a34a,#059669)',
          boxShadow: open ? '0 8px 24px rgba(220,38,38,0.35)' : '0 8px 24px rgba(22,163,74,0.4)',
        }}
      >
        {open ? <X className="h-5 w-5 text-white" /> : <Bot className="h-5 w-5 text-white" />}
        {!open && (
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-teal-400
                           border-2 border-white dark:border-carbon-900 animate-pulse" />
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div
          role="dialog"
          aria-label="EcoTrack AI assistant"
          className="fixed z-50 rounded-2xl overflow-hidden flex flex-col
                     left-2 right-2 bottom-[8rem]
                     lg:left-auto lg:right-5 lg:w-96 lg:bottom-24
                     bg-white dark:bg-carbon-900"
          style={{
            height: 440,
            boxShadow: '0 24px 64px rgba(0,0,0,0.22)',
            border: '1px solid rgba(22,163,74,0.18)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3 shrink-0
                       border-b border-green-100 dark:border-green-900/30"
            style={{ background: 'linear-gradient(135deg, rgba(22,163,74,0.08), rgba(5,150,105,0.05))' }}
          >
            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30
                            border border-green-200 dark:border-green-800
                            flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4 text-green-600 dark:text-green-400" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-carbon-900 dark:text-white leading-none">
                EcoTrack Assistant
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                Your personal carbon coach
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
              className="text-carbon-400 hover:text-carbon-600 dark:hover:text-carbon-200 transition-colors shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
                  m.from === 'user'
                    ? 'bg-green-600 text-white rounded-br-sm'
                    : m.isAI
                      ? 'bg-green-50 dark:bg-green-900/20 text-carbon-800 dark:text-carbon-200 border border-green-200 dark:border-green-800 rounded-bl-sm'
                      : 'bg-carbon-100 dark:bg-carbon-800 text-carbon-800 dark:text-carbon-200 rounded-bl-sm'
                }`}>
                  {m.isAI && (
                    <div className="flex items-center gap-1 mb-1.5 text-green-600 dark:text-green-400">
                      <Sparkles className="h-3 w-3" aria-hidden="true" />
                      <span className="text-[10px] font-semibold uppercase tracking-wide">Gemini AI</span>
                    </div>
                  )}
                  {m.text}
                </div>
              </div>
            ))}
            {aiLoading && (
              <div className="flex justify-start">
                <div className="bg-carbon-100 dark:bg-carbon-800 rounded-2xl rounded-bl-sm px-3 py-2
                               flex items-center gap-2 text-xs text-carbon-500 dark:text-carbon-400">
                  <Loader2 className="h-3 w-3 animate-spin text-green-500" />
                  Gemini is analysing your data…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick suggestions */}
          <div className="px-3 pb-2 flex flex-wrap gap-1.5 shrink-0">
            {quickActions.map((a) => (
              <button
                key={a.label}
                onClick={() => { setMsgs(p => [...p, { from: 'user', text: a.q }]); setInput(''); const l = a.q.toLowerCase(); let r = ''; if (l.includes('biggest') || l.includes('source')) { if (stats) { const top = getTopCategory(stats); const kg = formatCO2(stats.thisMonth.breakdown[top]); const pct = stats.thisMonth.co2Kg > 0 ? Math.round((stats.thisMonth.breakdown[top] / stats.thisMonth.co2Kg) * 100) : 0; r = `Your biggest source is **${CATEGORY_LABELS[top]}** at ${kg} (${pct}% of total) 📊`; } else r = `Log some activities first! 🌿`; } else if (l.includes('paris')) { if (stats) { const my = stats.thisMonth.co2Kg; const p = stats.globalComparison.paris_target; const w = stats.globalComparison.world; r = `This month: ${formatCO2(my)}\n${my <= w ? '✅' : '⚠️'} vs World (${formatCO2(w)})\n${my <= p ? '✅' : '⚠️'} vs Paris target (${formatCO2(p)})`; } else r = `The Paris target is 167 kg CO₂/month per person. Log activities to compare!`; } else if (l.includes('transport')) { r = REDUCE_TIPS.transport; } else if (l.includes('food')) { r = REDUCE_TIPS.food; } setTimeout(() => addBot(r), 400); }}
                className="text-[10px] px-2.5 py-1 rounded-full border
                           border-green-200 dark:border-green-800
                           text-green-700 dark:text-green-400
                           hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors"
              >
                {a.label}
              </button>
            ))}
            <button
              onClick={handleGemini}
              disabled={aiLoading}
              className="text-[10px] px-2.5 py-1 rounded-full text-white
                         disabled:opacity-50 transition-colors flex items-center gap-1"
              style={{ background: 'linear-gradient(135deg,#16a34a,#059669)' }}
            >
              <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />
              Get AI Insights
            </button>
          </div>

          {/* Input */}
          <div className="px-3 pb-3 shrink-0">
            <div className="flex items-center gap-2 rounded-xl
                           border border-carbon-200 dark:border-carbon-700
                           bg-carbon-50 dark:bg-carbon-800 px-3 py-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask about your footprint…"
                aria-label="Chat message"
                className="flex-1 text-xs bg-transparent text-carbon-900 dark:text-white
                           placeholder-carbon-400 outline-none"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                aria-label="Send message"
                className="text-green-600 dark:text-green-400 disabled:opacity-30 hover:text-green-700 transition-colors"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
