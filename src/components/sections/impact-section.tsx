'use client'

import { useEffect, useRef, useState } from 'react'
import { EditableText } from '@/components/editable/editable-text'
import { useEditMode } from '@/contexts/edit-mode-context'

interface ImpactSectionProps {
  title?: string
  stat1Value?: string
  stat1Label?: string
  stat2Value?: string
  stat2Label?: string
  stat3Value?: string
  stat3Label?: string
  stat4Value?: string
  stat4Label?: string
  testimonialQuote?: string
  testimonialAuthor?: string
  testimonialRole?: string
}

function parseStatValue(value: string): { number: number; suffix: string } {
  // Extract number and suffix from strings like "500+", "95%", "1,000+"
  const cleaned = value.replace(/,/g, '')
  const match = cleaned.match(/^(\d+)(.*)$/)
  if (match) {
    return { number: parseInt(match[1], 10), suffix: match[2] || '' }
  }
  return { number: 0, suffix: '' }
}

function AnimatedCounter({
  value,
  isVisible,
  isEditMode,
}: {
  value: string
  isVisible: boolean
  isEditMode: boolean
}) {
  const { number, suffix } = parseStatValue(value)
  const [count, setCount] = useState(0)
  const hasAnimated = useRef(false)

  useEffect(() => {
    // Reset animation when value changes
    hasAnimated.current = false
    setCount(0)
  }, [value])

  useEffect(() => {
    if (!isVisible || hasAnimated.current || isEditMode) return

    hasAnimated.current = true
    const duration = 2000 // 2 seconds
    const steps = 60
    const increment = number / steps
    const stepDuration = duration / steps

    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= number) {
        setCount(number)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [isVisible, number, isEditMode])

  // In edit mode, show the raw value
  if (isEditMode) {
    return <span>{value}</span>
  }

  return (
    <span className="tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  )
}

export function ImpactSection({
  title = 'THE RISEUP EFFECT',
  stat1Value = '500+',
  stat1Label = 'Athletes Trained',
  stat2Value = '12',
  stat2Label = 'Teams Strong',
  stat3Value = '95%',
  stat3Label = 'Return Rate',
  stat4Value = '1,000+',
  stat4Label = 'Hours Coached',
  testimonialQuote = "RiseUp taught my son that failure is just another rep. He's a different kid now.",
  testimonialAuthor = 'Sarah M.',
  testimonialRole = 'Flag Football Parent',
}: ImpactSectionProps) {
  const { isEditMode } = useEditMode()
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  const stats = [
    { value: stat1Value, label: stat1Label, valueKey: 'impact.stat_1_value', labelKey: 'impact.stat_1_label' },
    { value: stat2Value, label: stat2Label, valueKey: 'impact.stat_2_value', labelKey: 'impact.stat_2_label' },
    { value: stat3Value, label: stat3Label, valueKey: 'impact.stat_3_value', labelKey: 'impact.stat_3_label' },
    { value: stat4Value, label: stat4Label, valueKey: 'impact.stat_4_value', labelKey: 'impact.stat_4_label' },
  ]

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative pt-16 pb-24 md:pt-20 md:pb-32 bg-black overflow-hidden"
    >
      {/* Subtle background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#b72031]/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8">
        {/* Title */}
        <div className="text-center mb-16 md:mb-20">
          <EditableText
            contentKey="impact.title"
            as="h2"
            className={`text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            page="homepage"
            section="impact"
          >
            {title}
          </EditableText>
          <div
            className={`mt-6 h-1 w-24 bg-[#b72031] mx-auto transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
            }`}
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-20">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`text-center transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
              style={{ transitionDelay: `${400 + index * 150}ms` }}
            >
              <div className="relative inline-block">
                {/* Glow effect behind number */}
                <div className="absolute inset-0 bg-[#b72031]/20 blur-2xl rounded-full scale-150" />
                <div className="relative text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-3">
                  <EditableText
                    contentKey={stat.valueKey}
                    as="span"
                    className=""
                    page="homepage"
                    section="impact"
                  >
                    <AnimatedCounter
                      value={stat.value}
                      isVisible={isVisible}
                      isEditMode={isEditMode}
                    />
                  </EditableText>
                </div>
              </div>
              <EditableText
                contentKey={stat.labelKey}
                as="div"
                className="text-sm md:text-base text-white/60 uppercase tracking-widest font-medium"
                page="homepage"
                section="impact"
              >
                {stat.label}
              </EditableText>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <div
          className={`max-w-3xl mx-auto text-center transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '1000ms' }}
        >
          <div className="relative">
            {/* Quote marks */}
            <span className="absolute -top-8 -left-4 text-8xl text-[#b72031]/20 font-serif leading-none">
              &ldquo;
            </span>
            <EditableText
              contentKey="impact.testimonial_quote"
              as="p"
              className="text-xl md:text-2xl lg:text-3xl text-white/90 font-light leading-relaxed"
              page="homepage"
              section="impact"
            >
              {testimonialQuote}
            </EditableText>
          </div>
        </div>
      </div>
    </section>
  )
}
