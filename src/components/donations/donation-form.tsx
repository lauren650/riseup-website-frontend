"use client"

import { useState } from 'react'
import { brandColors } from '@/lib/branding'

type DonationType = 'single' | 'recurring'

interface DonationFormProps {
  className?: string
}

export function DonationForm({ className = '' }: DonationFormProps) {
  const [amount, setAmount] = useState<string>('0.00')
  const [donationType, setDonationType] = useState<DonationType>('single')

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Allow only numbers and decimal point
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setAmount(value)
    }
  }

  const handleAmountBlur = () => {
    // Format to 2 decimal places on blur
    if (amount === '' || amount === '.') {
      setAmount('0.00')
    } else {
      const numValue = parseFloat(amount)
      setAmount(numValue.toFixed(2))
    }
  }

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* Amount Input */}
      <div className="relative w-full max-w-sm">
        <input
          type="text"
          value={amount}
          onChange={handleAmountChange}
          onBlur={handleAmountBlur}
          className="w-full rounded-full border-2 border-white/20 bg-background px-6 py-3 text-center text-2xl font-semibold text-foreground transition-all duration-200 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black"
          placeholder="0.00"
        />
      </div>

      {/* Donate Button */}
      <button
        type="button"
        className="w-full max-w-sm rounded-full bg-accent px-8 py-4 text-xl font-bold text-white transition-all duration-200 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black"
        onClick={() => {
          // This will be connected to payment processing later
          console.log(`Donate ${amount} - ${donationType}`)
        }}
      >
        DONATE
      </button>

      {/* Donation Type Radio Buttons */}
      <div className="flex items-center gap-6">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="radio"
            name="donation-type"
            value="single"
            checked={donationType === 'single'}
            onChange={() => setDonationType('single')}
            className="h-5 w-5 cursor-pointer accent-accent"
          />
          <span className="text-base text-foreground">Single Gift</span>
        </label>

        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="radio"
            name="donation-type"
            value="recurring"
            checked={donationType === 'recurring'}
            onChange={() => setDonationType('recurring')}
            className="h-5 w-5 cursor-pointer accent-accent"
          />
          <span className="text-base text-foreground">Recurring Gift</span>
        </label>
      </div>
    </div>
  )
}
