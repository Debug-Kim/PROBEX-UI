'use client'

import { useState }    from 'react'
import { useForm }     from 'react-hook-form'
import { zodResolver }  from '@hookform/resolvers/zod'
import { cn }          from '@/lib/utils'
import {
  kycStep1Schema, kycStep2Schema, kycStep3Schema,
  type KYCStep1Data, type KYCStep2Data, type KYCStep3Data,
} from '@/lib/validation/auth'
import type { KYCStatus } from '@/types/user'
import { FormField, AuthInput } from './AuthShell'

// ─── Step definitions ──────────────────────────────────────────────────────

const STEPS = [
  { number: 1, label: 'Personal Info',  short: 'Personal' },
  { number: 2, label: 'Identity',       short: 'Identity' },
  { number: 3, label: 'Address',        short: 'Address'  },
  { number: 4, label: 'Review',         short: 'Review'   },
] as const

// ─── KYC Stepper Header ────────────────────────────────────────────────────

interface StepperProps {
  currentStep: number
}

function KYCStepper({ currentStep }: StepperProps) {
  return (
    <div className="flex items-center gap-0 mb-6" role="list" aria-label="KYC verification steps">
      {STEPS.map((step, idx) => {
        const isComplete = currentStep > step.number
        const isActive   = currentStep === step.number

        return (
          <div key={step.number} className="flex items-center flex-1" role="listitem">
            {/* Step indicator */}
            <div className="flex flex-col items-center gap-1 flex-1">
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200',
                )}
                style={{
                  background: isComplete
                    ? 'var(--probex-positive)'
                    : isActive
                      ? 'var(--probex-gradient-brand)'
                      : 'var(--probex-surface-3)',
                  color: isComplete || isActive ? (isComplete ? '#fff' : '#050816') : 'var(--probex-text-muted)',
                  border: !isComplete && !isActive ? '1px solid var(--probex-border-default)' : 'none',
                }}
                aria-current={isActive ? 'step' : undefined}
              >
                {isComplete ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                ) : step.number}
              </div>
              <span
                className="text-2xs font-medium hidden sm:block"
                style={{ color: isActive ? 'var(--probex-primary)' : 'var(--probex-text-muted)' }}
              >
                {step.short}
              </span>
            </div>

            {/* Connector line */}
            {idx < STEPS.length - 1 && (
              <div
                className="h-px flex-1 mx-1 -mt-4"
                style={{
                  background: currentStep > step.number
                    ? 'var(--probex-positive)'
                    : 'var(--probex-border-default)',
                }}
                aria-hidden="true"
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Step 1: Personal Information ─────────────────────────────────────────

const COUNTRIES = [
  { code: 'US', name: 'United States' }, { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' }, { code: 'FR', name: 'France' },
  { code: 'CA', name: 'Canada' }, { code: 'AU', name: 'Australia' },
  { code: 'SG', name: 'Singapore' }, { code: 'AE', name: 'United Arab Emirates' },
  { code: 'CH', name: 'Switzerland' }, { code: 'JP', name: 'Japan' },
]

function Step1({ onNext }: { onNext: (d: KYCStep1Data) => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<KYCStep1Data>({
    resolver: zodResolver(kycStep1Schema),
  })
  return (
    <form onSubmit={handleSubmit(onNext)} noValidate className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <FormField label="First Name" htmlFor="kyc-first" error={errors.firstName?.message}>
          <AuthInput id="kyc-first" placeholder="Alex" hasError={!!errors.firstName} {...register('firstName')} />
        </FormField>
        <FormField label="Last Name" htmlFor="kyc-last" error={errors.lastName?.message}>
          <AuthInput id="kyc-last" placeholder="Reeves" hasError={!!errors.lastName} {...register('lastName')} />
        </FormField>
      </div>
      <FormField label="Date of Birth" htmlFor="kyc-dob" error={errors.dateOfBirth?.message}>
        <AuthInput id="kyc-dob" type="date" hasError={!!errors.dateOfBirth} {...register('dateOfBirth')} />
      </FormField>
      <FormField label="Nationality" htmlFor="kyc-nationality" error={errors.nationality?.message}>
        <select
          id="kyc-nationality"
          className="input-base h-10 text-sm"
          style={{ borderColor: errors.nationality ? 'var(--probex-negative)' : undefined }}
          {...register('nationality')}
        >
          <option value="">Select country…</option>
          {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
        </select>
      </FormField>
      <FormField label="Phone (optional)" htmlFor="kyc-phone" error={errors.phone?.message}>
        <AuthInput id="kyc-phone" type="tel" placeholder="+1 555 000 0000" hasError={!!errors.phone} {...register('phone')} />
      </FormField>
      <StepButton isLoading={isSubmitting} label="Continue" />
    </form>
  )
}

// ─── Step 2: Identity Verification ────────────────────────────────────────

function Step2({ onNext, onBack }: { onNext: (d: KYCStep2Data) => void; onBack: () => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<KYCStep2Data>({
    resolver: zodResolver(kycStep2Schema),
  })
  return (
    <form onSubmit={handleSubmit(onNext)} noValidate className="flex flex-col gap-4">
      <FormField label="Document Type" htmlFor="kyc-doctype" error={errors.documentType?.message}>
        <select id="kyc-doctype" className="input-base h-10 text-sm" {...register('documentType')}>
          <option value="">Select document…</option>
          <option value="passport">Passport</option>
          <option value="national-id">National ID</option>
          <option value="drivers-license">Driver's License</option>
        </select>
      </FormField>
      <FormField label="Document Number" htmlFor="kyc-docnum" error={errors.documentNumber?.message}>
        <AuthInput id="kyc-docnum" placeholder="e.g. A12345678" hasError={!!errors.documentNumber} {...register('documentNumber')} />
      </FormField>
      <FormField label="Expiry Date" htmlFor="kyc-expiry" error={errors.expiryDate?.message}>
        <AuthInput id="kyc-expiry" type="date" hasError={!!errors.expiryDate} {...register('expiryDate')} />
      </FormField>
      {/* Document upload placeholder */}
      <div
        className="rounded-lg border-2 border-dashed p-6 flex flex-col items-center gap-2 cursor-pointer transition-colors duration-150"
        style={{ borderColor: 'var(--probex-border-default)' }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--probex-border-active)'}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--probex-border-default)'}
        aria-label="Upload identity document"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--probex-text-muted)' }} aria-hidden="true">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        <p className="text-sm font-medium" style={{ color: 'var(--probex-text-secondary)' }}>Upload document photo</p>
        <p className="text-xs" style={{ color: 'var(--probex-text-muted)' }}>JPG, PNG or PDF — max 10MB</p>
        <p className="text-xs italic" style={{ color: 'var(--probex-text-disabled)' }}>(Document upload coming soon)</p>
      </div>
      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="btn-ghost flex-1 h-10">Back</button>
        <StepButton isLoading={isSubmitting} label="Continue" className="flex-1" />
      </div>
    </form>
  )
}

// ─── Step 3: Address Verification ─────────────────────────────────────────

function Step3({ onNext, onBack }: { onNext: (d: KYCStep3Data) => void; onBack: () => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<KYCStep3Data>({
    resolver: zodResolver(kycStep3Schema),
  })
  return (
    <form onSubmit={handleSubmit(onNext)} noValidate className="flex flex-col gap-4">
      <FormField label="Address Line 1" htmlFor="kyc-addr1" error={errors.addressLine1?.message}>
        <AuthInput id="kyc-addr1" placeholder="123 Main Street" hasError={!!errors.addressLine1} {...register('addressLine1')} />
      </FormField>
      <FormField label="Address Line 2 (optional)" htmlFor="kyc-addr2" error={errors.addressLine2?.message}>
        <AuthInput id="kyc-addr2" placeholder="Apt, Suite, Unit…" hasError={!!errors.addressLine2} {...register('addressLine2')} />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="City" htmlFor="kyc-city" error={errors.city?.message}>
          <AuthInput id="kyc-city" placeholder="New York" hasError={!!errors.city} {...register('city')} />
        </FormField>
        <FormField label="Postal Code" htmlFor="kyc-postal" error={errors.postalCode?.message}>
          <AuthInput id="kyc-postal" placeholder="10001" hasError={!!errors.postalCode} {...register('postalCode')} />
        </FormField>
      </div>
      <FormField label="Country" htmlFor="kyc-country" error={errors.country?.message}>
        <select id="kyc-country" className="input-base h-10 text-sm" {...register('country')}>
          <option value="">Select country…</option>
          {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
        </select>
      </FormField>
      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="btn-ghost flex-1 h-10">Back</button>
        <StepButton isLoading={isSubmitting} label="Continue" className="flex-1" />
      </div>
    </form>
  )
}

// ─── Step 4: Review & Submit ───────────────────────────────────────────────

function Step4({ onSubmit, onBack, status }: { onSubmit: () => void; onBack: () => void; status: KYCStatus }) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    await new Promise((r) => setTimeout(r, 1400))
    setIsSubmitting(false)
    onSubmit()
  }

  if (status === 'pending') {
    return (
      <div className="flex flex-col items-center gap-4 text-center py-4">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)' }}
          aria-hidden="true"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--probex-warning)' }}>
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <div>
          <p className="text-base font-semibold" style={{ color: 'var(--probex-text-primary)' }}>Under Review</p>
          <p className="text-sm mt-1" style={{ color: 'var(--probex-text-muted)' }}>
            Your verification is being reviewed. This typically takes 1–2 business days.
          </p>
        </div>
        <div
          className="w-full px-4 py-3 rounded-lg text-xs"
          style={{ background: 'var(--probex-surface-2)', border: '1px solid var(--probex-border)' }}
        >
          <p style={{ color: 'var(--probex-text-muted)' }}>You&apos;ll receive an email notification once your account is verified.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm" style={{ color: 'var(--probex-text-muted)' }}>
        Please review your submission before sending. All information must match your official documents.
      </p>
      <div
        className="rounded-lg p-4 flex flex-col gap-2"
        style={{ background: 'var(--probex-surface-2)', border: '1px solid var(--probex-border)' }}
      >
        {[
          { label: 'Personal Info', status: 'complete' },
          { label: 'Identity Document', status: 'complete' },
          { label: 'Address', status: 'complete' },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between text-sm">
            <span style={{ color: 'var(--probex-text-secondary)' }}>{item.label}</span>
            <span
              className="flex items-center gap-1.5 text-xs font-semibold"
              style={{ color: 'var(--probex-positive)' }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
              Provided
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs" style={{ color: 'var(--probex-text-disabled)' }}>
        By submitting, you confirm that all information provided is accurate and that you consent to identity verification processing.
      </p>
      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="btn-ghost flex-1 h-10">Back</button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="btn-primary flex-1 h-10 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting && <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
          {isSubmitting ? 'Submitting…' : 'Submit for Review'}
        </button>
      </div>
    </div>
  )
}

// ─── Main KYCFlow component ────────────────────────────────────────────────

export function KYCFlow() {
  const [step, setStep]     = useState<1 | 2 | 3 | 4>(1)
  const [status, setStatus] = useState<KYCStatus>('not_started')

  const handleStep1 = (_data: KYCStep1Data) => setStep(2)
  const handleStep2 = (_data: KYCStep2Data) => setStep(3)
  const handleStep3 = (_data: KYCStep3Data) => setStep(4)
  const handleSubmit = () => setStatus('pending')

  return (
    <div>
      <KYCStepper currentStep={step} />
      {step === 1 && <Step1 onNext={handleStep1} />}
      {step === 2 && <Step2 onNext={handleStep2} onBack={() => setStep(1)} />}
      {step === 3 && <Step3 onNext={handleStep3} onBack={() => setStep(2)} />}
      {step === 4 && <Step4 onSubmit={handleSubmit} onBack={() => setStep(3)} status={status} />}
    </div>
  )
}

// ─── Shared step submit button ─────────────────────────────────────────────

function StepButton({ isLoading, label, className }: { isLoading: boolean; label: string; className?: string }) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className={cn('btn-primary h-10 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none', className)}
    >
      {isLoading && <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
      {isLoading ? 'Processing…' : label}
    </button>
  )
}
