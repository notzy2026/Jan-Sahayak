import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

// Doc icons map
const DOC_ICONS = {
  'Aadhaar Card':     '🪪',
  'Bank Passbook':    '🏦',
  'Land Records':     '📄',
  'Mobile Number':    '📱',
  'Ration Card':      '📋',
  'Income Certificate': '📃',
  'Land Document':    '📜',
  'BPL Card':         '🗂️',
  'Khasra Number':    '🔢',
  'PAN Card':         '💳',
  'Business Plan':    '📊',
  'Bank Statement':   '🧾',
  'Passport Photo':   '🖼️',
  'Medical Certificate': '🏥',
  'Caste Certificate':'📖',
  'School Certificate': '🎓',
  'default':          '📄',
}

const SchemeCard = ({
  id,
  name_hi, name_en,
  benefitLabel, benefitLabel_en,
  description_hi, description_en,
  categoryIcon, categoryColor,
  mode,
  helpline,
  portal_url,
  documents = [],
  steps_hi = [],
}) => {
  const { t, i18n } = useTranslation()
  const [expanded, setExpanded] = useState(false)

  const isHindi  = i18n.language === 'hi'
  const name     = isHindi ? name_hi : name_en
  const desc     = isHindi ? description_hi : description_en
  const benefit  = isHindi ? benefitLabel : (benefitLabel_en || benefitLabel)
  const isOnline = mode === 'online'

  return (
    <div
      id={`scheme-${id}`}
      className={`w-full bg-white rounded-2xl shadow-lg border-l-4 overflow-hidden transition-all duration-300 ${
        isOnline ? 'border-l-[#FF6B00]' : 'border-l-blue-500'
      }`}
    >
      {/* ── Collapsed header (always visible) ── */}
      <button
        className="w-full text-left px-4 py-4 flex items-center gap-3"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
      >
        {/* LEFT: Category icon */}
        <div
          className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-sm"
          style={{ backgroundColor: categoryColor + '20', border: `2px solid ${categoryColor}` }}
        >
          {categoryIcon}
        </div>

        {/* CENTER: Name + benefit + description */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-base leading-tight truncate">{name}</p>
          <p className="text-green-600 font-extrabold text-lg leading-tight">{benefit}</p>
          <p className="text-gray-500 text-xs leading-snug mt-0.5 line-clamp-2">{desc}</p>
        </div>

        {/* RIGHT: badge + helpline */}
        <div className="flex-shrink-0 flex flex-col items-end gap-2 ml-2">
          <span
            className={`text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${
              isOnline ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
            }`}
          >
            {isOnline ? t('results.online') : t('results.offline')}
          </span>
          <a
            href={`tel:${helpline}`}
            onClick={(e) => e.stopPropagation()}
            className="text-[11px] text-gray-500 font-medium hover:text-[#FF6B00] flex items-center gap-1"
          >
            📞 {helpline}
          </a>
        </div>
      </button>

      {/* ── Expanded content ── */}
      {expanded && (
        <div className="px-4 pb-5 border-t border-gray-100 animate-fade-in">

          {/* Required Documents */}
          <div className="mt-4">
            <p className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-2">
              📎 {t('results.required_docs')}
            </p>
            <div className="flex flex-wrap gap-2">
              {documents.map((doc) => (
                <span
                  key={doc}
                  className="flex items-center gap-1 bg-orange-50 border border-orange-200 rounded-lg px-2 py-1 text-xs font-medium text-gray-700"
                >
                  {DOC_ICONS[doc] || DOC_ICONS.default} {doc}
                </span>
              ))}
            </div>
          </div>

          {/* Steps */}
          {steps_hi.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-2">
                📋 {t('results.steps')}
              </p>
              <ol className="space-y-2">
                {steps_hi.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#FF6B00] text-white text-xs flex items-center justify-center font-bold">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Portal + CSC row */}
          <div className="mt-4 flex gap-2 flex-wrap">
            <a
              href={portal_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center py-2.5 rounded-xl bg-[#FF6B00] text-white text-xs font-bold hover:bg-orange-600 transition-colors"
            >
              🌐 {t('results.portal')}
            </a>
            <a
              href="https://findmycsc.org"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors"
            >
              🏢 {t('results.csc')}
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

export default SchemeCard
