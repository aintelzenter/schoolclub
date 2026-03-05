'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils/cn'

const TOPICS = ['Sustainability', 'Identity', 'Failure', 'Innovation', 'Community', 'Leadership']
const WHY_IT_MATTERS = ['Local impact', 'Global relevance', 'Personal growth', 'Future-ready', 'Inclusive', 'Actionable']
const CALL_TO_ACTION = ['Start a conversation', 'Take one step', 'Share your story', 'Join the movement', 'Ask a question', 'Challenge assumptions']

interface TEDxIdeaBuilderProps {
  tintHex: string
  className?: string
}

export function TEDxIdeaBuilder({ tintHex, className }: TEDxIdeaBuilderProps) {
  const [topic, setTopic] = useState<string | null>(null)
  const [why, setWhy] = useState<string | null>(null)
  const [cta, setCta] = useState<string | null>(null)

  const preview = [topic, why, cta].filter(Boolean).join(' → ')

  return (
    <div
      className={cn(
        'rounded-xl border overflow-hidden bg-white/[0.04] p-4 md:p-5',
        className
      )}
      style={{ borderColor: `${tintHex}40` }}
    >
      <p className="text-white/80 text-[11px] uppercase tracking-widest font-semibold mb-3" style={{ color: tintHex }}>
        Idea Builder
      </p>
      <div className="space-y-3">
        <StepRow label="Topic" options={TOPICS} value={topic} onChange={setTopic} tintHex={tintHex} />
        <StepRow label="Why it matters" options={WHY_IT_MATTERS} value={why} onChange={setWhy} tintHex={tintHex} />
        <StepRow label="Call to action" options={CALL_TO_ACTION} value={cta} onChange={setCta} tintHex={tintHex} />
        {preview && (
          <p className="text-white/85 text-sm leading-snug pt-3 border-t mt-2" style={{ borderColor: `${tintHex}25` }}>
            {preview}
          </p>
        )}
      </div>
    </div>
  )
}

function StepRow({
  label,
  options,
  value,
  onChange,
  tintHex,
}: {
  label: string
  options: string[]
  value: string | null
  onChange: (v: string | null) => void
  tintHex: string
}) {
  return (
    <div>
      <span className="text-white/60 text-[11px] block mb-1.5">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const isActive = value === opt
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(isActive ? null : opt)}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--brand-deep)]'
              )}
              style={{
                backgroundColor: isActive ? `${tintHex}25` : 'rgba(255,255,255,0.06)',
                color: isActive ? tintHex : 'rgba(255,255,255,0.7)',
                border: `1px solid ${isActive ? `${tintHex}50` : 'rgba(255,255,255,0.08)'}`,
              }}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}
