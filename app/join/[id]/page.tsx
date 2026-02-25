'use client'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { CheckboxGroup } from '@/components/ui/CheckboxGroup'
import { Container } from '@/components/ui/Container'
import { Input, Textarea } from '@/components/ui/Input'
import { RadioGroup } from '@/components/ui/RadioGroup'
import { getApplyErrorMessage, submitApplication } from '@/lib/api'
import { saveApplication, type ClubApplicationPayload } from '@/lib/applications'
import { getClubById } from '@/lib/data'
import { cn } from '@/lib/utils/cn'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { notFound, useParams, useRouter } from 'next/navigation'
import { FormEvent, ReactNode, useCallback, useMemo, useRef, useState } from 'react'

type FieldKind = 'text' | 'textarea' | 'date' | 'radio' | 'checkbox' | 'checkboxGroup'
type ResponseValue = string | boolean | string[]

type FieldDef = {
  key: string
  kind: FieldKind
  label: string
  required: boolean | ((state: { responses: Record<string, ResponseValue> }) => boolean)
  visible?: (state: { responses: Record<string, ResponseValue> }) => boolean
  options?: string[]
  minLength?: number
  helper?: ReactNode
  placeholder?: string
}

function isVisible(field: FieldDef, state: { responses: Record<string, ResponseValue> }) {
  return field.visible ? field.visible(state) : true
}

function isRequired(field: FieldDef, state: { responses: Record<string, ResponseValue> }) {
  return typeof field.required === 'function' ? field.required(state) : field.required
}

function getClubFields(clubId: string): FieldDef[] {
  switch (clubId) {
    case 'spark-club':
      return [
        {
          key: 'membership_status',
          kind: 'radio',
          label: 'Are you an old or new member?',
          required: true,
          options: ['Old member', 'New member'],
        },
        {
          key: 'why_join_expectations',
          kind: 'textarea',
          label: 'Why do you want to join SPARK club / what are your expectations?',
          required: true,
          minLength: 5,
          placeholder: 'Write a short response...',
        },
        {
          key: 'fields_of_interest',
          kind: 'checkboxGroup',
          label: 'Field(s) of interest',
          required: true,
          options: [
            'Sports',
            'Arts & Design',
            'Media / Content',
            'Science & Tech',
            'PR / Marketing',
            'Other',
          ],
        },
        {
          key: 'fields_of_interest_other',
          kind: 'text',
          label: 'Other (please specify)',
          required: ({ responses }) => Array.isArray(responses.fields_of_interest) && responses.fields_of_interest.includes('Other'),
          visible: ({ responses }) => Array.isArray(responses.fields_of_interest) && responses.fields_of_interest.includes('Other'),
          placeholder: 'Type your field of interest...',
        },
      ]

    case 'interact-club':
      return [
        {
          key: 'why_join',
          kind: 'textarea',
          label: 'Why do you want to join Interact Club?',
          required: true,
          minLength: 5,
          placeholder: 'Write a short response...',
        },
        {
          key: 'roles',
          kind: 'checkboxGroup',
          label: 'Which role(s) would you like to be part of?',
          required: true,
          options: ['Finance', 'Events', 'Social Media'],
        },
      ]

    case 'eco-committee':
      return [
        {
          key: 'why_join',
          kind: 'textarea',
          label: 'Why do you want to join the Eco Committee?',
          required: true,
          minLength: 5,
          placeholder: 'Write a short response...',
        },
        {
          key: 'personal_impact',
          kind: 'textarea',
          label: 'How will joining this club affect you as an individual?',
          required: true,
          minLength: 5,
          placeholder: 'Write a short response...',
        },
      ]

    case 'duke-of-edinburgh':
      return [
        {
          key: 'award_level',
          kind: 'radio',
          label: 'Award level',
          required: true,
          options: ['Bronze', 'Silver', 'Gold'],
        },
        {
          key: 'date_of_birth',
          kind: 'date',
          label: 'Date of birth',
          required: true,
        },
        {
          key: 'motivation',
          kind: 'textarea',
          label: 'Why do you want to join the DofE International Award?',
          required: true,
          minLength: 5,
          placeholder: 'Write a short response...',
        },
        {
          key: 'previous_completion',
          kind: 'radio',
          label: 'Have you previously completed any level of the DofE Award?',
          required: true,
          options: ['No', 'Yes'],
        },
        {
          key: 'previous_levels',
          kind: 'checkboxGroup',
          label: 'Which level(s)',
          required: ({ responses }) => responses.previous_completion === 'Yes',
          visible: ({ responses }) => responses.previous_completion === 'Yes',
          options: ['Bronze', 'Silver', 'Gold'],
        },
        {
          key: 'previous_notes',
          kind: 'text',
          label: 'Notes',
          required: false,
          visible: ({ responses }) => responses.previous_completion === 'Yes',
          placeholder: 'Optional notes...',
        },
        {
          key: 'weekly_commitment',
          kind: 'checkbox',
          label: 'Yes, I’m willing to commit weekly time to Volunteering, Physical, and Skills.',
          required: true,
        },
        {
          key: 'medical_considerations',
          kind: 'radio',
          label: 'Do you have any medical conditions or considerations we should be aware of?',
          required: true,
          options: ['No', 'Yes'],
        },
        {
          key: 'medical_considerations_specify',
          kind: 'textarea',
          label: 'Please specify',
          required: ({ responses }) => responses.medical_considerations === 'Yes',
          visible: ({ responses }) => responses.medical_considerations === 'Yes',
          minLength: 5,
          placeholder: 'Please provide details...',
        },
      ]

    case 'unicef-ambassador':
      return [
        {
          key: 'house',
          kind: 'text',
          label: 'House',
          required: true,
          placeholder: 'Your house...',
        },
        {
          key: 'group_selection',
          kind: 'radio',
          label: 'Which group do you want to join within UNICEF?',
          required: true,
          options: ['Event team', 'Graphics design team'],
        },
      ]

    case 'tedx': {
      const tedxTalks = [
        { year: 2026, url: 'https://www.youtube.com/live/zKHNISnOFrU?si=k1Iki2cmOw4II_dB' },
        { year: 2025, url: 'https://www.youtube.com/live/Zr9k0QWJl-U?si=Y2ht0xe4Kxn6RaEw' },
        { year: 2024, url: 'https://www.youtube.com/live/RTgHyGn61GY?si=DIGYl1uVNJTy7iZf' },
      ]
      const ytIcon = (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      )
      return [
        {
          key: 'talk_reflection',
          kind: 'textarea',
          label: 'Choose one TEDx Amnuay Silpa School Youth talk to watch and describe what you learned from the talk.',
          required: true,
          minLength: 5,
          helper: (
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="text-xs text-white/50">Watch:</span>
              {tedxTalks.map(({ year, url }) => (
                <a
                  key={year}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#ff0000] px-2.5 py-1.5 text-xs font-medium text-white shadow-md transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-105 hover:shadow-lg hover:shadow-red-500/40 active:scale-100 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[#ff0000] focus:ring-offset-2 focus:ring-offset-brand-navy"
                >
                  {ytIcon}
                  <span>{year}</span>
                </a>
              ))}
            </div>
          ),
          placeholder: 'Write a short response...',
        },
        {
          key: 'interests_passions_abilities',
          kind: 'textarea',
          label: 'What are your interests, passions, or abilities?',
          required: true,
          minLength: 5,
          placeholder: 'Write a short response...',
        },
      ]
    }

    // Operation Smile / School Show / MUN (and others with no application questions): student ID only
    default:
      return []
  }
}

export default function JoinPage() {
  const params = useParams()
  const router = useRouter()
  const clubId = params.id as string
  const club = getClubById(clubId)

  const [studentId, setStudentId] = useState('')
  const [responses, setResponses] = useState<Record<string, ResponseValue>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<{ code: string; message?: string } | null>(null)

  if (!club) {
    notFound()
  }

  const fields = useMemo(() => getClubFields(club.id), [club.id])
  const state = useMemo(() => ({ responses }), [responses])

  const fieldRefs = useRef<Record<string, HTMLElement | null>>({})

  const getValidationErrors = useCallback(() => {
    const newErrors: Record<string, string> = {}

    // Student ID: required, digits-only, exactly 5 digits
    if (!studentId) newErrors.student_id = 'Student ID is required'
    else if (!/^\d{5}$/.test(studentId)) newErrors.student_id = 'Student ID must be exactly 5 digits'

    // Club-specific fields
    for (const field of fields) {
      if (!isVisible(field, state)) continue
      if (!isRequired(field, state)) continue

      const v = responses[field.key]
      if (field.kind === 'checkbox') {
        if (v !== true) newErrors[field.key] = 'You must confirm this to proceed'
        continue
      }
      if (field.kind === 'checkboxGroup') {
        const arr = Array.isArray(v) ? v : []
        if (arr.length < 1) newErrors[field.key] = 'Please select at least one option'
        continue
      }
      const s = typeof v === 'string' ? v.trim() : ''
      if (!s) {
        newErrors[field.key] = 'This field is required'
        continue
      }
      const minLength = field.minLength ?? (field.kind === 'textarea' ? 5 : undefined)
      if (minLength != null && s.length < minLength) {
        newErrors[field.key] = `Please enter at least ${minLength} characters`
      }
    }

    return newErrors
  }, [studentId, responses, fields, state])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    setSubmitAttempted(true)

    const newErrors = getValidationErrors()
    if (Object.keys(newErrors).length > 0) {
      // Scroll to first error
      const orderedKeys = [
        'student_id',
        ...fields
          .filter((f) => isVisible(f, state))
          .map((f) => f.key),
      ]
      const firstKey = orderedKeys.find((k) => newErrors[k])
      if (firstKey) {
        const el = fieldRefs.current[firstKey]
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        // Focus if it’s an actual input/textarea
        requestAnimationFrame(() => {
          const input = document.getElementById(firstKey) as HTMLInputElement | HTMLTextAreaElement | null
          input?.focus()
        })
      }
      return
    }

    if (!club.accepting) return

    setIsSubmitting(true)
    setSubmitError(null)

    // Build API body: responses must be Record<string, string>
    const responsesForApi: Record<string, string> = {}
    const responsesForPayload: Record<string, unknown> = {}
    for (const field of fields) {
      if (!isVisible(field, state)) continue
      const v = responses[field.key]
      if (v == null) continue
      if (typeof v === 'string') {
        const trimmed = v.trim()
        if (!trimmed) continue
        responsesForApi[field.key] = trimmed
        responsesForPayload[field.key] = trimmed
      } else if (Array.isArray(v)) {
        if (v.length === 0) continue
        responsesForApi[field.key] = JSON.stringify(v)
        responsesForPayload[field.key] = v
      } else {
        responsesForApi[field.key] = String(v)
        responsesForPayload[field.key] = v
      }
    }

    const payload: ClubApplicationPayload = {
      club_id: club.id,
      club_name: club.name,
      club_url: `/clubs/${club.id}`,
      student_id: studentId,
      responses: responsesForPayload,
      submitted_at: new Date().toISOString(),
    }

    try {
      await submitApplication(club.id, {
        student_id: studentId.trim(),
        responses: responsesForApi,
      })
      // Keep local copy so "My applications" still works until backend provides list endpoint
      saveApplication(payload)
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(12)
      }
      const urlParams = new URLSearchParams({
        club: club.name,
        studentId,
      })
      router.push(`/join/confirmation?${urlParams.toString()}`)
    } catch (e: unknown) {
      const err = e as { code?: string; message?: string }
      const code = err.code ?? 'UNKNOWN'
      setSubmitError({
        code,
        message: getApplyErrorMessage(code, err.message),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const validationErrors = useMemo(() => getValidationErrors(), [getValidationErrors])
  const canSubmit = club.accepting && !isSubmitting && Object.keys(validationErrors).length === 0

  const showErrorFor = (key: string) => submitAttempted || touched[key]

  const renderField = (field: FieldDef) => {
    if (!isVisible(field, state)) return null
    const error = showErrorFor(field.key) ? validationErrors[field.key] : undefined
    const required = isRequired(field, state)
    const v = responses[field.key]

    if (field.kind === 'radio') {
      return (
        <div ref={(el) => { fieldRefs.current[field.key] = el }} className="w-full">
          <RadioGroup
            label={field.label}
            name={field.key}
            options={(field.options ?? []).map((opt) => ({ value: opt, label: opt }))}
            value={typeof v === 'string' ? v : ''}
            onChange={(value) => {
              setResponses((prev) => ({ ...prev, [field.key]: value }))
              setTouched((prev) => ({ ...prev, [field.key]: true }))
            }}
            error={error}
            required={required}
          />
        </div>
      )
    }

    if (field.kind === 'checkboxGroup') {
      return (
        <div ref={(el) => { fieldRefs.current[field.key] = el }} className="w-full">
          <CheckboxGroup
            label={field.label}
            name={field.key}
            options={(field.options ?? []).map((opt) => ({ value: opt, label: opt }))}
            value={Array.isArray(v) ? v : []}
            onChange={(value) => {
              setResponses((prev) => ({ ...prev, [field.key]: value }))
              setTouched((prev) => ({ ...prev, [field.key]: true }))
            }}
            error={error}
            required={required}
          />
        </div>
      )
    }

    if (field.kind === 'checkbox') {
      const checked = v === true
      return (
        <div ref={(el) => { fieldRefs.current[field.key] = el }} className="w-full">
          <label
            className={cn(
              'flex items-start gap-4 min-h-[48px] p-4 rounded-xl cursor-pointer',
              'bg-brand-navy/60 border border-white/10',
              'transition-all duration-200',
              'hover:border-white/20 hover:bg-brand-navy/80',
              checked && 'border-brand-pink/50 bg-brand-pink/10',
              error && 'border-red-500/50'
            )}
          >
            <input
              type="checkbox"
              id={field.key}
              checked={checked}
              onChange={(e) => {
                setResponses((prev) => ({ ...prev, [field.key]: e.target.checked }))
                setTouched((prev) => ({ ...prev, [field.key]: true }))
              }}
              className="sr-only"
            />
            <span
              className={cn(
                'w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5',
                'transition-all duration-200',
                checked
                  ? 'border-brand-pink bg-brand-pink'
                  : 'border-white/30 bg-transparent'
              )}
              aria-hidden
            >
              {checked && (
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </span>
            <span className="text-white/90 text-sm leading-relaxed">
              {field.label}
              {required && <span className="text-brand-pink ml-1">*</span>}
            </span>
          </label>
          {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        </div>
      )
    }

    if (field.kind === 'date') {
      return (
        <div ref={(el) => { fieldRefs.current[field.key] = el }} className="w-full">
          <label htmlFor={field.key} className="block text-sm font-medium text-white/90 mb-2">
            {field.label}
            {required && <span className="text-brand-pink ml-1">*</span>}
          </label>
          <input
            type="date"
            id={field.key}
            value={typeof v === 'string' ? v : ''}
            onChange={(e) => {
              setResponses((prev) => ({ ...prev, [field.key]: e.target.value }))
              setTouched((prev) => ({ ...prev, [field.key]: true }))
            }}
            onBlur={() => setTouched((prev) => ({ ...prev, [field.key]: true }))}
            className={cn(
              'w-full min-h-[44px] px-4 py-3 rounded-xl',
              'bg-brand-navy/80 border border-white/10',
              'text-white',
              'focus:outline-none focus:border-brand-pink/50 focus:ring-2 focus:ring-brand-pink/20',
              'transition-all duration-200',
              '[color-scheme:dark]',
              error && 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
            )}
            required={required}
          />
          {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        </div>
      )
    }

    if (field.kind === 'textarea') {
      return (
        <div ref={(el) => { fieldRefs.current[field.key] = el }} className="w-full">
          {field.helper}
          <Textarea
            id={field.key}
            label={field.label}
            value={typeof v === 'string' ? v : ''}
            onChange={(e) => {
              setResponses((prev) => ({ ...prev, [field.key]: e.target.value }))
            }}
            onBlur={() => setTouched((prev) => ({ ...prev, [field.key]: true }))}
            error={error}
            required={required}
            placeholder={field.placeholder ?? 'Write a short response...'}
          />
        </div>
      )
    }

    // text
    return (
      <div ref={(el) => { fieldRefs.current[field.key] = el }} className="w-full">
        <Input
          id={field.key}
          label={field.label}
          value={typeof v === 'string' ? v : ''}
          onChange={(e) => {
            setResponses((prev) => ({ ...prev, [field.key]: e.target.value }))
          }}
          onBlur={() => setTouched((prev) => ({ ...prev, [field.key]: true }))}
          error={error}
          required={required}
          placeholder={field.placeholder ?? 'Your answer...'}
        />
      </div>
    )
  }

  return (
    <div className="pt-24 pb-24 md:pb-16 min-h-screen overflow-x-hidden">
      <Container size="narrow" className="min-w-0 max-w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="min-w-0"
        >
          <Link
            href={`/clubs/${club.id}`}
            className="inline-flex items-center text-white/60 hover:text-white mb-6 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to {club.name}
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Apply to {club.name}
          </h1>
          <p className="text-white/60 mb-8">
            Fill out the form below to submit your application.
          </p>

          {/* Not accepting notice */}
          {!club.accepting && (
            <Card padding="lg" className="border-amber-500/30 bg-amber-500/10 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-amber-400 font-semibold mb-1">Not Accepting Members</h3>
                  <p className="text-white/70 text-sm">
                    This club is currently not accepting new members. Please check back later.
                  </p>
                </div>
              </div>
            </Card>
          )}

          <form onSubmit={handleSubmit} className="min-w-0">
            {/* Student ID Card */}
            <div ref={(el) => { fieldRefs.current.student_id = el }}>
              <Card padding="lg" className="mb-6" >
              <h2 className="text-lg font-bold text-white mb-6">Student Information</h2>
              
              <Input
                id="student_id"
                label="Student ID"
                placeholder="e.g., 79528"
                value={studentId}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 5)
                  setStudentId(digits)
                  setTouched((prev) => ({ ...prev, student_id: true }))
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, student_id: true }))}
                error={(studentId.length > 0 && studentId.length !== 5)
                  ? 'Student ID must be exactly 5 digits'
                  : (showErrorFor('student_id') ? validationErrors.student_id : undefined)}
                helperText="Your school student ID number (5 digits)"
                required
                inputMode="numeric"
                pattern="\d*"
                maxLength={5}
              />
              </Card>
            </div>

            {/* Application questions */}
            {fields.length > 0 && (
              <Card padding="lg" className="mb-6">
                <h2 className="text-lg font-bold text-white mb-2">
                  Application Questions
                </h2>
                <p className="text-white/60 text-sm mb-6">
                  Please answer the following questions.
                </p>
                
                <div className="space-y-6">
                  {fields.map((field) => (
                    <div key={field.key}>
                      {renderField(field)}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Submit button */}
            {submitError && (
              <div className="mb-6 p-4 rounded-xl border border-red-500/50 bg-red-500/10 flex items-start gap-3">
                <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-red-200 text-sm">{submitError.message}</p>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              fullWidth
              disabled={!club.accepting || isSubmitting || !canSubmit}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit application'
              )}
            </Button>

            {!club.accepting && (
              <p className="text-white/50 text-sm text-center mt-4">
                This club is not currently accepting applications.
              </p>
            )}

            {club.accepting && !isSubmitting && !canSubmit && (
              <p className="text-white/45 text-sm text-center mt-4">
                Complete required fields to submit.
              </p>
            )}

            <p className="text-white/40 text-sm text-center mt-4">
              By submitting, you agree to participate in club activities and follow club guidelines.
            </p>
          </form>
        </motion.div>
      </Container>
    </div>
  )
}
