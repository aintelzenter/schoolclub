'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { TEDxIdeaBuilder } from './TEDxIdeaBuilder'

interface ClubHeaderWidgetProps {
  clubId: string
  tintHex: string
  className?: string
}

const CARD_BASE = 'rounded-xl border overflow-hidden'
const CARD_PADDING = 'p-4 md:p-5'

/** Club-specific header widget: unique content, interactive, visually appealing. Not a description repeat. */
export function ClubHeaderWidget({ clubId, tintHex, className }: ClubHeaderWidgetProps) {
  switch (clubId) {
    case 'operation-smile':
      return <MissionPillars tintHex={tintHex} className={className} />
    case 'mun':
      return <CommitteeExplorer tintHex={tintHex} className={className} />
    case 'spark-club':
      return <KindnessChallenge tintHex={tintHex} className={className} />
    case 'interact-club':
      return <ServicePillars tintHex={tintHex} className={className} />
    case 'eco-committee':
      return <EcoAction tintHex={tintHex} className={className} />
    case 'unicef-ambassador':
      return <ImpactFocus tintHex={tintHex} className={className} />
    case 'school-show':
      return <RoleSpotlight tintHex={tintHex} className={className} />
    case 'tedx':
      return <TEDxIdeaBuilder tintHex={tintHex} className={className} />
    default:
      return null
  }
}

const PILLARS = [
  { icon: '💰', label: 'Fundraise', sub: 'Student-led campaigns' },
  { icon: '📢', label: 'Raise awareness', sub: 'Spread the mission' },
  { icon: '🏥', label: 'Medical missions', sub: 'Global outreach' },
]
function MissionPillars({ tintHex, className }: { tintHex: string; className?: string }) {
  return (
    <div className={cn(CARD_BASE, CARD_PADDING, className)} style={{ borderColor: `${tintHex}40`, backgroundColor: 'rgba(255,255,255,0.03)' }}>
      <p className="text-[11px] uppercase tracking-widest font-semibold mb-3" style={{ color: tintHex }}>Get involved</p>
      <div className="space-y-3">
        {PILLARS.map((p) => (
          <div key={p.label} className="flex items-start gap-3">
            <span className="text-lg leading-none">{p.icon}</span>
            <div>
              <p className="text-white font-medium text-sm">{p.label}</p>
              <p className="text-white/60 text-xs mt-0.5">{p.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const COMMITTEES = [
  { name: 'General Assembly', focus: 'Global policy debate' },
  { name: 'Security Council', focus: 'Crisis & security' },
  { name: 'Historical', focus: 'Role-play past events' },
]
function CommitteeExplorer({ tintHex, className }: { tintHex: string; className?: string }) {
  const [i, setI] = useState(0)
  const c = COMMITTEES[i % COMMITTEES.length]
  return (
    <button
      type="button"
      onClick={() => setI((x) => x + 1)}
      className={cn(CARD_BASE, CARD_PADDING, 'w-full text-left transition-all hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2', className)}
      style={{ borderColor: `${tintHex}40`, backgroundColor: 'rgba(255,255,255,0.03)' }}
    >
      <p className="text-[11px] uppercase tracking-widest font-semibold mb-2" style={{ color: tintHex }}>Committee spotlight</p>
      <p className="text-white font-semibold text-base">{c.name}</p>
      <p className="text-white/70 text-sm mt-1">{c.focus}</p>
      <p className="text-white/40 text-xs mt-3">Tap for next →</p>
    </button>
  )
}

const KINDNESS = ['Share a genuine compliment', 'Hold the door for someone', 'Offer to help with a task', 'Write a quick thank-you note', 'Pick up one piece of litter', 'Smile at someone new']
function KindnessChallenge({ tintHex, className }: { tintHex: string; className?: string }) {
  const [i, setI] = useState(0)
  const tip = KINDNESS[i % KINDNESS.length]
  return (
    <button
      type="button"
      onClick={() => setI((x) => x + 1)}
      className={cn(CARD_BASE, CARD_PADDING, 'w-full text-left transition-all hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2', className)}
      style={{ borderColor: `${tintHex}40`, backgroundColor: 'rgba(255,255,255,0.03)' }}
    >
      <p className="text-[11px] uppercase tracking-widest font-semibold mb-2" style={{ color: tintHex }}>Kindness challenge</p>
      <p className="text-white font-medium text-base leading-snug">“{tip}”</p>
      <p className="text-white/40 text-xs mt-3">Tap for a new one →</p>
    </button>
  )
}

const ROLES = [{ icon: '📊', label: 'Finance' }, { icon: '🎉', label: 'Events' }, { icon: '📱', label: 'Social Media' }]
function ServicePillars({ tintHex, className }: { tintHex: string; className?: string }) {
  return (
    <div className={cn(CARD_BASE, CARD_PADDING, className)} style={{ borderColor: `${tintHex}40`, backgroundColor: 'rgba(255,255,255,0.03)' }}>
      <p className="text-[11px] uppercase tracking-widest font-semibold mb-3" style={{ color: tintHex }}>Service pillars</p>
      <div className="flex flex-wrap gap-2">
        {ROLES.map((r) => (
          <span
            key={r.label}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
            style={{ backgroundColor: `${tintHex}20`, color: tintHex, border: `1px solid ${tintHex}40` }}
          >
            <span>{r.icon}</span>
            {r.label}
          </span>
        ))}
      </div>
    </div>
  )
}

const ECO_ACTIONS = ['Use a reusable bottle', 'Walk or bike when possible', 'Turn off unused lights', 'Recycle paper & electronics', 'Support local sustainability', 'Choose reusable bags']
function EcoAction({ tintHex, className }: { tintHex: string; className?: string }) {
  const [i, setI] = useState(0)
  const action = ECO_ACTIONS[i % ECO_ACTIONS.length]
  return (
    <button
      type="button"
      onClick={() => setI((x) => x + 1)}
      className={cn(CARD_BASE, CARD_PADDING, 'w-full text-left transition-all hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2', className)}
      style={{ borderColor: `${tintHex}40`, backgroundColor: 'rgba(255,255,255,0.03)' }}
    >
      <p className="text-[11px] uppercase tracking-widest font-semibold mb-2" style={{ color: tintHex }}>Daily action</p>
      <p className="text-white font-medium text-base">♻️ {action}</p>
      <p className="text-white/40 text-xs mt-3">Tap for another →</p>
    </button>
  )
}

const FOCUS = [
  { icon: '🌍', label: 'Children in crisis' },
  { icon: '♿', label: 'Disabilities support' },
  { icon: '📢', label: 'Advocacy' },
]
function ImpactFocus({ tintHex, className }: { tintHex: string; className?: string }) {
  const [i, setI] = useState(0)
  const f = FOCUS[i % FOCUS.length]
  return (
    <button
      type="button"
      onClick={() => setI((x) => x + 1)}
      className={cn(CARD_BASE, CARD_PADDING, 'w-full text-left transition-all hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2', className)}
      style={{ borderColor: `${tintHex}40`, backgroundColor: 'rgba(255,255,255,0.03)' }}
    >
      <p className="text-[11px] uppercase tracking-widest font-semibold mb-2" style={{ color: tintHex }}>Impact focus</p>
      <p className="text-2xl mb-1">{f.icon}</p>
      <p className="text-white font-semibold text-base">{f.label}</p>
      <p className="text-white/40 text-xs mt-3">Tap to explore →</p>
    </button>
  )
}

const SHOW_ROLES = ['Acting', 'Singing', 'Dancing', 'Tech crew', 'Directing', 'Design']
function RoleSpotlight({ tintHex, className }: { tintHex: string; className?: string }) {
  const [i, setI] = useState(0)
  const role = SHOW_ROLES[i % SHOW_ROLES.length]
  return (
    <button
      type="button"
      onClick={() => setI((x) => x + 1)}
      className={cn(CARD_BASE, CARD_PADDING, 'w-full text-left transition-all hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2', className)}
      style={{ borderColor: `${tintHex}40`, backgroundColor: 'rgba(255,255,255,0.03)' }}
    >
      <p className="text-[11px] uppercase tracking-widest font-semibold mb-2" style={{ color: tintHex }}>Join the cast</p>
      <p className="text-white font-semibold text-lg">{role}</p>
      <p className="text-white/40 text-xs mt-3">Tap to explore roles →</p>
    </button>
  )
}
