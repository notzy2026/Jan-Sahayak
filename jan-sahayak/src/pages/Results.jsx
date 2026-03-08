import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import LanguageBar from '../components/LanguageBar/LanguageBar'
import AnimatedAvatar from '../components/Avatar/AnimatedAvatar'
import SchemeCard from '../components/SchemeCard/SchemeCard'
import MOCK_SCHEMES from '../data/mockSchemes'
import useUserStore from '../store/userStore'
import { generateResultsSummaryPDF, downloadPDF } from '../utils/pdfgen'

// ── Simple eligibility filter ─────────────────────────────────────────────────
// For demo we pick schemes based on q2 (occupation) with sensible defaults
const filterSchemes = (answers) => {
  if (!answers) return MOCK_SCHEMES.slice(0, 6)

  // Support both old (q2) and new (occupation) answer key formats
  const occ = answers.occupation || answers.q2

  if (!occ) return MOCK_SCHEMES.slice(0, 6)

  let filtered = [...MOCK_SCHEMES]

  // Occupation-based relevance boost (put matching first)
  const TOP_OCC = {
    farmer:    ['PM-KISAN', 'PMFBY'],
    worker:    ['MGNREGA', 'PMKVY'],
    student:   ['PMKVY'],
    business:  ['MUDRA', 'PMEGP'],
    disabled:  ['AYUSHMAN'],
    pensioner: ['AYUSHMAN'],
    women:     ['PMMVY', 'SSY'],
    other:     [],
  }

  const topIds = TOP_OCC[occ] || []
  filtered.sort((a, b) => {
    const aPriority = topIds.includes(a.id) ? 1 : 0
    const bPriority = topIds.includes(b.id) ? 1 : 0
    if (bPriority !== aPriority) return bPriority - aPriority
    // Then sort by benefit descending
    return b.benefit - a.benefit
  })

  // Everyone always gets Ayushman Bharat (health) — insert at position 2 if not already top
  if (!topIds.includes('AYUSHMAN')) {
    const idx = filtered.findIndex((s) => s.id === 'AYUSHMAN')
    if (idx > 2) {
      const [item] = filtered.splice(idx, 1)
      filtered.splice(2, 0, item)
    }
  }

  return filtered.slice(0, 6);
}

// ── Results Page ──────────────────────────────────────────────────────────────
const Results = () => {
  const { t, i18n } = useTranslation()
  const navigate     = useNavigate()
  const location     = useLocation()
  const { answers: storeAnswers, resetAll } = useUserStore()

  // Accept answers from navigation state (from Questions.jsx) OR fallback to Zustand
  const answers      = location.state?.answers || storeAnswers
  const schemes      = filterSchemes(answers)
  const topScheme    = schemes[0]

  const [avatarState, setAvatarState] = useState('happy')
  const [pdfLoading, setPdfLoading]   = useState(false)

  // Build headline with scheme count
  const headline = t('results.headline', { count: schemes.length })

  // WhatsApp share text
  const shareText = encodeURIComponent(
    `Jan Sahayak: आप ${schemes.length} सरकारी योजनाओं के लिए पात्र हैं!\n` +
    schemes.slice(0, 3).map((s, i) => `${i + 1}. ${s.name_hi} – ${s.benefitLabel}`).join('\n') +
    '\n\nMore info: pmkisan.gov.in'
  )
  const whatsappUrl = `https://wa.me/?text=${shareText}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50 flex flex-col">
      {/* Fixed top */}


      {/* ── TOP SECTION ── */}
      <main className="flex-1 flex flex-col items-center px-4 pt-20 pb-36 gap-5">

        {/* Avatar + headline side-by-side (reuses AnimatedAvatar side-bubble layout) */}
        <div className="w-full max-w-lg">
          <AnimatedAvatar
            state={avatarState}
            size={160}
            currentText={headline}
            autoSpeak={true}
            onSpeakingEnd={() => setAvatarState('idle')}
          />
        </div>

        {/* Headline text (below avatar) */}
        <h1 className={`text-xl font-extrabold text-center text-gray-800 leading-snug ${
          i18n.language !== 'en' ? `lang-${i18n.language}` : ''
        }`}>
          {headline}
        </h1>

        {/* ── SCHEME CARDS sorted by benefit desc ── */}
        <div className="w-full max-w-lg flex flex-col gap-3">
          {schemes.map((scheme) => (
            <SchemeCard key={scheme.id} {...scheme} />
          ))}
        </div>
      </main>

      {/* ── BOTTOM ACTION BAR (fixed) ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/97 backdrop-blur-sm border-t border-gray-100 shadow-xl">
        <div className="max-w-lg mx-auto px-4 py-3 flex flex-col gap-2">

          {/* Primary: Apply to top scheme */}
          {topScheme && (
            <button
              id="results-apply-btn"
              onClick={() => navigate(`/apply/${topScheme.id}`)}
              className="w-full py-4 rounded-2xl bg-[#FF6B00] text-white text-base font-extrabold text-center shadow-lg hover:bg-orange-600 active:scale-95 transition-all"
            >
              🚀 {t('results.applyNow')} — {i18n.language === 'hi' ? topScheme.name_hi : topScheme.name_en}
            </button>
          )}

          {/* Secondary + Tertiary row */}
          <div className="flex gap-3">
            {/* WhatsApp share */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              id="results-share-btn"
              className="flex-1 py-3 rounded-2xl bg-green-50 border-2 border-green-200 text-green-700 text-sm font-bold text-center hover:bg-green-100 transition-colors"
            >
              📗 {t('results.share')}
            </a>

            <button
              id="results-pdf-btn"
              onClick={async () => {
                setPdfLoading(true)
                try {
                  const bytes = await generateResultsSummaryPDF(schemes, answers || {})
                  downloadPDF(bytes, 'jan-sahayak-schemes.pdf')
                } catch (e) { console.error(e) }
                setPdfLoading(false)
              }}
              className="flex-1 py-3 rounded-2xl bg-orange-50 border-2 border-orange-200 text-[#FF6B00] text-sm font-bold hover:bg-orange-100 transition-colors"
            >
              {pdfLoading ? '⏳...' : `📥 ${t('results.download')}`}
            </button>
          </div>

          {/* Start over + My Applications row */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => { resetAll(); navigate('/landing') }}
              className="text-xs text-gray-400 font-medium py-1 hover:text-[#FF6B00] transition-colors"
            >
              ↩ Start Over
            </button>
            <button
              onClick={() => navigate('/status')}
              className="text-xs text-gray-600 font-semibold py-1 hover:text-[#FF6B00] transition-colors flex items-center gap-1"
            >
              📋 मेरे आवेदन
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Results
