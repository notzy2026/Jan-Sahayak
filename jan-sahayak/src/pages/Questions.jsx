import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import LanguageBar from '../components/LanguageBar/LanguageBar'
import ProgressDots from '../components/ProgressDots/ProgressDots'
import AnimatedAvatar from '../components/Avatar/AnimatedAvatar'
import VoiceInput from '../components/VoiceInput/VoiceInput'
import useUserStore from '../store/userStore'

// ── BCP-47 map (mirrors VoiceInput) ──────────────────────────────────────────
const LANG_BCP47 = { hi:'hi-IN', bn:'bn-IN', gu:'gu-IN', kn:'kn-IN', en:'en-IN' }

// ── Indian States + UTs ───────────────────────────────────────────────────────
const STATES = [
  { code:'AN', name:'Andaman & Nicobar' }, { code:'AP', name:'Andhra Pradesh' },
  { code:'AR', name:'Arunachal Pradesh' }, { code:'AS', name:'Assam' },
  { code:'BR', name:'Bihar' },             { code:'CH', name:'Chandigarh' },
  { code:'CG', name:'Chhattisgarh' },      { code:'DN', name:'Dadra & NH' },
  { code:'DD', name:'Daman & Diu' },       { code:'DL', name:'Delhi' },
  { code:'GA', name:'Goa' },               { code:'GJ', name:'Gujarat' },
  { code:'HR', name:'Haryana' },           { code:'HP', name:'Himachal Pradesh' },
  { code:'JK', name:'Jammu & Kashmir' },   { code:'JH', name:'Jharkhand' },
  { code:'KA', name:'Karnataka' },         { code:'KL', name:'Kerala' },
  { code:'LA', name:'Ladakh' },            { code:'LD', name:'Lakshadweep' },
  { code:'MP', name:'Madhya Pradesh' },    { code:'MH', name:'Maharashtra' },
  { code:'MN', name:'Manipur' },           { code:'ML', name:'Meghalaya' },
  { code:'MZ', name:'Mizoram' },           { code:'NL', name:'Nagaland' },
  { code:'OD', name:'Odisha' },            { code:'PY', name:'Puducherry' },
  { code:'PB', name:'Punjab' },            { code:'RJ', name:'Rajasthan' },
  { code:'SK', name:'Sikkim' },            { code:'TN', name:'Tamil Nadu' },
  { code:'TG', name:'Telangana' },         { code:'TR', name:'Tripura' },
  { code:'UP', name:'Uttar Pradesh' },     { code:'UK', name:'Uttarakhand' },
  { code:'WB', name:'West Bengal' },
]

// ── Occupation config ─────────────────────────────────────────────────────────
const OCCUPATIONS = [
  { key:'farmer',    icon:'🌾' },
  { key:'worker',    icon:'👷' },
  { key:'student',   icon:'📚' },
  { key:'business',  icon:'🏪' },
  { key:'women',     icon:'👩' },
  { key:'disabled',  icon:'♿' },
  { key:'pensioner', icon:'🧓' },
  { key:'other',     icon:'❓' },
]

// ── OCCUPATION card colors ─────────────────────────────────────────────────────
const OCC_COLORS = [
  'bg-yellow-50 border-yellow-200',
  'bg-blue-50 border-blue-200',
  'bg-purple-50 border-purple-200',
  'bg-orange-50 border-orange-200',
  'bg-pink-50 border-pink-200',
  'bg-green-50 border-green-200',
  'bg-indigo-50 border-indigo-200',
  'bg-gray-50 border-gray-200',
]

// ═══════════════════════════════════════════════════════════════════════════════
// Sub-question components
// ═══════════════════════════════════════════════════════════════════════════════

// ── Q1: State Selection ───────────────────────────────────────────────────────
const StateSelect = ({ onSelect, selected }) => (
  <div className="w-full overflow-y-auto max-h-[55vh] pr-1">
    <div className="grid grid-cols-3 gap-2">
      {STATES.map((s) => (
        <button
          key={s.code}
          onClick={() => onSelect(s.code)}
          className={`
            px-2 py-3 rounded-xl border-2 text-xs font-semibold text-center
            transition-all duration-200 hover:scale-105
            ${selected === s.code
              ? 'bg-[#FF6B00] border-[#FF6B00] text-white shadow-lg scale-105'
              : 'bg-white border-gray-200 text-gray-700 hover:border-orange-300'
            }
          `}
        >
          {s.name}
        </button>
      ))}
    </div>
  </div>
)

// ── Q2: Occupation ────────────────────────────────────────────────────────────
const OccupationSelect = ({ onSelect, selected, t }) => (
  <div className="w-full grid grid-cols-2 gap-3">
    {OCCUPATIONS.map((occ, i) => (
      <button
        key={occ.key}
        onClick={() => onSelect(occ.key)}
        className={`
          flex items-center gap-3 px-4 py-4 rounded-2xl border-2 min-h-[80px]
          font-semibold text-sm transition-all duration-200 hover:scale-105
          ${selected === occ.key
            ? 'border-[#FF6B00] shadow-lg scale-105 bg-orange-50'
            : `${OCC_COLORS[i]} hover:border-orange-300`
          }
        `}
      >
        <span className="text-3xl">{occ.icon}</span>
        <span className={`text-left text-gray-800 ${selected === occ.key ? 'font-bold text-[#FF6B00]' : ''}`}>
          {t(`questions.q2.${occ.key}`)}
          {selected === occ.key && <span className="ml-1">✓</span>}
        </span>
      </button>
    ))}
  </div>
)

// ── Q3: Income ────────────────────────────────────────────────────────────────
const INCOME_OPTS = [
  { key:'none', icon:'🚫',    coins: 0 },
  { key:'lt1',  icon:'💰',    coins: 1 },
  { key:'1to3', icon:'💰💰',  coins: 2 },
  { key:'gt3',  icon:'💰💰💰', coins: 3 },
]

const IncomeSelect = ({ onSelect, selected, t }) => (
  <div className="w-full flex flex-col gap-4">
    {INCOME_OPTS.map((opt) => (
      <button
        key={opt.key}
        onClick={() => onSelect(opt.key)}
        style={{ height: 80 }}
        className={`
          flex items-center gap-4 px-6 rounded-2xl border-2 w-full
          font-bold text-base transition-all duration-200 hover:scale-[1.02]
          ${selected === opt.key
            ? 'bg-[#FF6B00] border-[#FF6B00] text-white shadow-xl scale-[1.02]'
            : 'bg-white border-gray-200 text-gray-700 hover:border-orange-300'
          }
        `}
      >
        <span className="text-2xl">{opt.icon}</span>
        <span>{t(`questions.q3.${opt.key}`)}</span>
        {selected === opt.key && <span className="ml-auto">✓</span>}
      </button>
    ))}
  </div>
)

// ── Q4: Land (Farmer only) ────────────────────────────────────────────────────
const LAND_MARKS = [0, 1, 2, 3, 4, 5]

const LandSelect = ({ value, onChange, onNext, t }) => {
  const farmSize = Math.min(value, 5)
  const farmEmojis = '🌱'.repeat(Math.max(1, farmSize)) + (value >= 5 ? '+' : '')

  return (
    <div className="w-full flex flex-col items-center gap-6">
      {/* Farm illustration */}
      <div
        className="rounded-2xl bg-gradient-to-b from-sky-100 to-green-100 border border-green-200 flex items-end justify-center gap-1 px-4 transition-all duration-500"
        style={{ width: '100%', height: 100 }}
      >
        {Array.from({ length: Math.max(1, Math.min(value, 8)) }).map((_, i) => (
          <span key={i} className="text-2xl" style={{ lineHeight: 1 }}>🌿</span>
        ))}
      </div>

      {/* Current value display */}
      <p className="text-4xl font-extrabold text-[#FF6B00]">
        {value >= 5 ? '5+' : value} <span className="text-lg font-semibold text-gray-500">{t('questions.q4.label')}</span>
      </p>

      {/* Slider */}
      <input
        type="range"
        min={0} max={5} step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-3 accent-[#FF6B00] cursor-pointer rounded-full"
      />
      <div className="flex justify-between w-full text-xs text-gray-400 font-medium">
        {LAND_MARKS.map((m) => <span key={m}>{m === 5 ? '5+' : m}</span>)}
      </div>

      <button onClick={onNext} className="btn-primary w-full py-4 text-lg">
        {t('questions.next')}
      </button>
    </div>
  )
}

// ── Q5: Family Info ────────────────────────────────────────────────────────────
const NumberPicker = ({ label, value, min, max, onChange, emoji }) => {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="flex flex-col items-center gap-2 flex-1">
      <span className="text-3xl" style={{ fontSize: `${1.5 + (pct / 100) * 0.8}rem` }}>{emoji}</span>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="text-5xl font-extrabold text-[#FF6B00]">{value}</p>
      <div className="flex gap-4 mt-1">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-12 h-12 rounded-full bg-gray-100 text-2xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center"
        >−</button>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-12 h-12 rounded-full bg-[#FF6B00] text-white text-2xl font-bold hover:bg-orange-600 transition-colors flex items-center justify-center"
        >+</button>
      </div>
    </div>
  )
}

const FamilyInfo = ({ age, members, onAgeChange, onMembersChange, onSubmit, t }) => (
  <div className="w-full flex flex-col items-center gap-6">
    <div className="flex w-full gap-6">
      <NumberPicker label={t('questions.q5.age')}     value={age}     min={18} max={80} onChange={onAgeChange}     emoji="🧑" />
      <div className="w-px bg-gray-200 self-stretch" />
      <NumberPicker label={t('questions.q5.members')} value={members} min={1}  max={10} onChange={onMembersChange} emoji="👨‍👩‍👧" />
    </div>
    <button
      onClick={onSubmit}
      className="w-full py-4 rounded-2xl bg-[#FF6B00] text-white text-lg font-extrabold shadow-xl hover:bg-orange-600 transition-all hover:scale-105"
    >
      🔍 {t('questions.q5.submit')}
    </button>
  </div>
)

// ── Loading screen ────────────────────────────────────────────────────────────
const LoadingScreen = ({ text }) => (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-cream via-white to-orange-50 gap-8">
    <AnimatedAvatar state="thinking" size={220} currentText={text} autoSpeak={false} />
    <p className="text-xl font-bold text-gray-700 animate-pulse text-center px-8">{text}</p>
  </div>
)

// ═══════════════════════════════════════════════════════════════════════════════
// Main Questions page
// ═══════════════════════════════════════════════════════════════════════════════
const Questions = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { answers, currentStep, setAnswer, nextStep, prevStep, resetAll } = useUserStore()

  // Local UI state
  const [avatarState, setAvatarState]   = useState('speaking')
  const [slideDir, setSlideDir]         = useState('in-right')   // animation class
  const [land, setLand]                 = useState(answers.land ?? 0)
  const [age, setAge]                   = useState(answers.age ?? 30)
  const [members, setMembers]           = useState(answers.familySize ?? 4)
  const [loading, setLoading]           = useState(false)
  const [currentText, setCurrentText]   = useState('')
  const prevStepRef                     = useRef(currentStep)

  // Determine total steps to show in ProgressDots (4 or 5)
  const totalSteps = answers.occupation === 'farmer' ? 5 : 4
  // Map currentStep (1-5) → display step (condenses if no Q4)
  const displayStep = currentStep > 4 && answers.occupation !== 'farmer' ? 4 : currentStep

  // Question text map
  const QUESTION_TEXT = {
    1: t('questions.q1.question'),
    2: t('questions.q2.question'),
    3: t('questions.q3.question'),
    4: t('questions.q4.question'),
    5: t('questions.q5.question'),
  }

  // Set question text + avatar state when step changes. TTS is driven by autoSpeak inside AnimatedAvatar.
  useEffect(() => {
    const text = QUESTION_TEXT[currentStep] || ''
    setCurrentText(text)
    setAvatarState('speaking')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, i18n.language])

  // Slide direction tracking
  useEffect(() => {
    if (currentStep > prevStepRef.current) setSlideDir('in-right')
    else if (currentStep < prevStepRef.current) setSlideDir('in-left')
    prevStepRef.current = currentStep
  }, [currentStep])

  // ── Handlers ────────────────────────────────────────────────────────────────
  const advance = useCallback(() => {
    setSlideDir('in-right')
    nextStep()
  }, [nextStep])

  const goBack = useCallback(() => {
    setSlideDir('in-left')
    prevStep()
  }, [prevStep])

  const handleQ1 = (code) => { setAnswer('state', code);      advance() }
  const handleQ2 = (key)  => { setAnswer('occupation', key);   advance() }
  const handleQ3 = (key)  => { setAnswer('income', key);       advance() }
  const handleQ4 = ()     => { setAnswer('land', land);         advance() }
  const handleQ5 = ()     => {
    setAnswer('age', age)
    setAnswer('familySize', members)
    setLoading(true)
    setTimeout(() => {
      navigate('/results', { state: { answers: { ...answers, age, familySize: members } } })
    }, 2800)
  }

  // Voice transcript handler – simple keyword→option matching
  const handleVoiceTranscript = (text) => {
    const lower = text.toLowerCase()
    if (currentStep === 1) {
      const match = STATES.find((s) =>
        lower.includes(s.name.toLowerCase()) || lower.includes(s.code.toLowerCase())
      )
      if (match) handleQ1(match.code)
    } else if (currentStep === 2) {
      const occ = OCCUPATIONS.find((o) => lower.includes(o.key) || lower.includes(t(`questions.q2.${o.key}`).toLowerCase()))
      if (occ) handleQ2(occ.key)
    }
  }

  // ── Progress labels ─────────────────────────────────────────────────────────
  const LABELS = answers.occupation === 'farmer'
    ? ['State', 'Work', 'Income', 'Land', 'Family']
    : ['State', 'Work', 'Income', 'Family']

  // ── Render ──────────────────────────────────────────────────────────────────
  if (loading) return <LoadingScreen text={t('questions.loading')} />

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-orange-50 flex flex-col">
      {/* Fixed top bars */}

      <div className="fixed top-14 left-0 right-0 z-30">
        <ProgressDots currentStep={displayStep} totalSteps={totalSteps} labels={LABELS} />
      </div>

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col items-center pt-32 pb-6 px-4 gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <AnimatedAvatar
            state={avatarState}
            size={180}
            currentText={currentText}
            onSpeakingEnd={() => setAvatarState('confused')}
            autoSpeak={true}
          />
        </div>

        {/* Question card — slide animation via key re-mount */}
        <div
          key={currentStep}
          className="w-full max-w-lg flex flex-col gap-5 animate-fade-in"
        >
          {/* Question text */}
          <h2 className={`text-center text-lg font-bold text-gray-800 leading-snug ${i18n.language !== 'en' ? `lang-${i18n.language}` : ''}`}>
            {QUESTION_TEXT[currentStep]}
          </h2>

          {/* Sub-question UI */}
          {currentStep === 1 && <StateSelect      onSelect={handleQ1} selected={answers.state} />}
          {currentStep === 2 && <OccupationSelect onSelect={handleQ2} selected={answers.occupation} t={t} />}
          {currentStep === 3 && <IncomeSelect     onSelect={handleQ3} selected={answers.income} t={t} />}
          {currentStep === 4 && (
            <LandSelect value={land} onChange={setLand} onNext={handleQ4} t={t} />
          )}
          {currentStep === 5 && (
            <FamilyInfo
              age={age} members={members}
              onAgeChange={setAge} onMembersChange={setMembers}
              onSubmit={handleQ5} t={t}
            />
          )}

          {/* Voice input (below for Q1 & Q2) */}
          {(currentStep === 1 || currentStep === 2) && (
            <VoiceInput
              language={i18n.language}
              onTranscript={handleVoiceTranscript}
            />
          )}
        </div>
      </main>

      {/* ── Bottom nav bar ── */}
      <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-gray-100 shadow-md flex items-center justify-between px-6 py-3">
        <button
          onClick={currentStep === 1 ? () => navigate('/landing') : goBack}
          className="flex items-center gap-2 text-gray-500 font-semibold hover:text-[#FF6B00] transition-colors"
        >
          {t('questions.back')}
        </button>
        <span className="text-sm text-gray-400 font-medium">
          {displayStep} / {totalSteps}
        </span>
      </div>
    </div>
  )
}

export default Questions
