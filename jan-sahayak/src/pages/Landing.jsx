import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import LanguageBar from '../components/LanguageBar/LanguageBar'
import AnimatedAvatar from '../components/Avatar/AnimatedAvatar'

// ── IVR Modal ─────────────────────────────────────────────────────────────────
const IVRModal = ({ onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    onClick={onClose}
  >
    <div
      className="bg-white rounded-3xl shadow-2xl px-10 py-8 flex flex-col items-center gap-4 max-w-xs w-full mx-4"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="text-5xl">📞</div>
      <p className="text-lg font-bold text-gray-800 text-center">Toll-Free Helpline</p>
      <p className="text-3xl font-extrabold text-[#FF6B00] tracking-widest">1800-XXX-XXXX</p>
      <p className="text-sm text-gray-500 text-center">Available 24×7 in your language</p>
      <button
        onClick={onClose}
        className="mt-2 px-8 py-2 rounded-full bg-[#FF6B00] text-white font-semibold hover:bg-orange-600 transition-colors"
      >
        Close
      </button>
    </div>
  </div>
)

// ── SMS Modal ─────────────────────────────────────────────────────────────────
const SMSModal = ({ onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    onClick={onClose}
  >
    <div
      className="bg-white rounded-3xl shadow-2xl px-8 py-8 flex flex-col items-center gap-4 max-w-xs w-full mx-4"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="text-5xl">💬</div>
      <p className="text-lg font-bold text-gray-800 text-center">SMS Instructions</p>
      <div className="bg-gray-50 rounded-xl p-4 w-full text-sm text-gray-700 space-y-2">
        <p>1. Open your SMS app</p>
        <p>2. Send <span className="font-bold text-[#FF6B00]">HELP</span> to <span className="font-bold">XXXXX</span></p>
        <p>3. You will receive a callback within 5 minutes</p>
      </div>
      <button
        onClick={onClose}
        className="mt-2 px-8 py-2 rounded-full bg-[#FF6B00] text-white font-semibold hover:bg-orange-600 transition-colors"
      >
        Close
      </button>
    </div>
  </div>
)

// ── Keyboard Overlay ──────────────────────────────────────────────────────────
const KeyboardOverlay = ({ onClose, onSubmit }) => {
  const [text, setText] = useState('')
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl shadow-2xl w-full max-w-lg p-6 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm font-semibold text-gray-500 text-center">Type your query</p>
        <textarea
          autoFocus
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. I want to know about disability pension..."
          className="w-full border-2 border-gray-200 rounded-xl p-3 text-base resize-none focus:outline-none focus:border-[#FF6B00] transition-colors"
        />
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => { if (text.trim()) onSubmit(text) }}
            className="flex-1 py-3 rounded-xl bg-[#FF6B00] text-white font-bold text-base hover:bg-orange-600 transition-colors"
          >
            Submit →
          </button>
        </div>
      </div>
    </div>
  )
}

// ── How It Works Accordion ────────────────────────────────────────────────────
const HOW_IT_WORKS_STEPS = [
  { icon: '🔍', label: 'Discover', desc: 'Tell us your need by voice or text' },
  { icon: '📋', label: 'Apply',    desc: 'We fill the application form for you' },
  { icon: '📍', label: 'Track',    desc: 'Follow your scheme status anytime' },
]

const HowItWorks = ({ label }) => {
  const [open, setOpen] = useState(false)
  return (
    <div className="w-full max-w-sm mx-auto mt-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-3 rounded-2xl bg-white/70 border border-orange-100 shadow-sm text-sm font-semibold text-gray-700 hover:bg-white transition-all"
      >
        <span>❓ {label}</span>
        <span className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {open && (
        <div className="mt-2 bg-white/90 rounded-2xl shadow-md p-4 flex flex-col gap-3 animate-fade-in border border-orange-50">
          {HOW_IT_WORKS_STEPS.map((s, i) => (
            <div key={s.label} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-orange-50 border-2 border-[#FF6B00] flex items-center justify-center text-lg flex-shrink-0">
                {s.icon}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">{i + 1}. {s.label}</p>
                <p className="text-xs text-gray-500">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Landing Page ──────────────────────────────────────────────────────────────
const Landing = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [showIVR, setShowIVR]         = useState(false)
  const [showSMS, setShowSMS]         = useState(false)
  const [showKeyboard, setShowKeyboard] = useState(false)

  const handleVoiceStart = () => navigate('/questions')
  const handleTypeSubmit = (text) => navigate('/questions', { state: { prefillText: text } })

  return (
    <div
      className="min-h-screen flex flex-col overflow-hidden relative"
      style={{
        background: `
          radial-gradient(ellipse at 95% 5%, #FF6B0033 0%, transparent 55%),
          radial-gradient(ellipse at 50% 50%, #FFF8F0 60%, #FFE4C4 100%)
        `,
      }}
    >
      {/* Dot-grid overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, #FF6B0020 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          opacity: 0.05,
        }}
      />

      {/* ── Language Bar (fixed top) ── */}


      {/* ── Main center section ── */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 80,
          paddingBottom: 110,
          paddingLeft: 16,
          paddingRight: 16,
          gap: 24,
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Avatar — greeting animation + speech bubble, no controls */}
        <AnimatedAvatar
          state="greeting"
          size={220}
          currentText={t('landing.greeting')}
          autoSpeak={true}
          showControls={false}
        />

        {/* Big CTA — START TALKING */}
        <button
          id="landing-speak-btn"
          onClick={handleVoiceStart}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            width: '80%',
            maxWidth: 360,
            height: 64,
            backgroundColor: '#FF6B00',
            color: '#ffffff',
            fontSize: 20,
            fontWeight: 800,
            borderRadius: 999,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(255,107,0,0.45)',
            animation: 'saffron-glow 2s ease-in-out infinite',
            transition: 'transform 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <span style={{ fontSize: 24 }}>🎤</span>
          {t('landing.speak')}
        </button>

        {/* Type instead */}
        <button
          id="landing-type-btn"
          onClick={() => setShowKeyboard(true)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: 15,
            fontWeight: 600,
            color: '#888',
            textDecoration: 'underline',
            cursor: 'pointer',
            padding: '4px 8px',
            marginTop: '-12px'
          }}
        >
          {t('landing.type')}
        </button>

        {/* How It Works accordion */}
        <div className="w-full mt-auto mb-2">
          <HowItWorks label={t('landing.howItWorks')} />
        </div>
      </main>

      {/* ── Bottom bar (fixed) ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-gray-100 shadow-lg">
        <div className="flex items-center justify-around max-w-lg mx-auto py-3 px-6">

          {/* Call IVR */}
          <button
            id="landing-ivr-btn"
            onClick={() => setShowIVR(true)}
            className="flex flex-col items-center gap-1 group"
          >
            <span className="text-3xl group-hover:scale-110 transition-transform">📞</span>
            <span className="text-[11px] font-semibold text-gray-600 group-hover:text-[#FF6B00] transition-colors">
              {t('landing.callIVR')}
            </span>
          </button>

          {/* WhatsApp */}
          <a
            id="landing-whatsapp-btn"
            href="https://wa.me/91XXXXXXXXXX"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 group"
          >
            <span className="text-3xl group-hover:scale-110 transition-transform">📗</span>
            <span className="text-[11px] font-semibold text-gray-600 group-hover:text-green-600 transition-colors">
              {t('landing.whatsapp')}
            </span>
          </a>

          {/* SMS */}
          <button
            id="landing-sms-btn"
            onClick={() => setShowSMS(true)}
            className="flex flex-col items-center gap-1 group"
          >
            <span className="text-3xl group-hover:scale-110 transition-transform">💬</span>
            <span className="text-[11px] font-semibold text-gray-600 group-hover:text-[#FF6B00] transition-colors">
              {t('landing.sms')}
            </span>
          </button>

          {/* My Applications → /status */}
          <button
            id="landing-status-btn"
            onClick={() => navigate('/status')}
            className="flex flex-col items-center gap-1 group relative"
          >
            <span className="text-3xl group-hover:scale-110 transition-transform">📋</span>
            <span className="text-[11px] font-semibold text-gray-600 group-hover:text-[#FF6B00] transition-colors">
              मेरे आवेदन
            </span>
          </button>
        </div>
      </div>

      {/* ── Modals ── */}
      {showIVR      && <IVRModal      onClose={() => setShowIVR(false)} />}
      {showSMS      && <SMSModal      onClose={() => setShowSMS(false)} />}
      {showKeyboard && (
        <KeyboardOverlay
          onClose={() => setShowKeyboard(false)}
          onSubmit={(text) => { setShowKeyboard(false); handleTypeSubmit(text) }}
        />
      )}
    </div>
  )
}

export default Landing
