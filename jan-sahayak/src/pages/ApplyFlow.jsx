import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import LanguageBar from '../components/LanguageBar/LanguageBar'
import DocumentUpload from '../components/DocumentUpload/DocumentUpload'
import MOCK_SCHEMES from '../data/mockSchemes'
import useUserStore from '../store/userStore'
import { generateApplicationPDF, generateResultsSummaryPDF, downloadPDF } from '../utils/pdfgen'
import AnimatedAvatar from '../components/Avatar/AnimatedAvatar'

// ── Helpers ───────────────────────────────────────────────────────────────────
const generateRefNo = () =>
  'JS-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(Math.random() * 9000 + 1000)

// ── Success overlay ────────────────────────────────────────────────────────────
const SuccessOverlay = ({ refNo, onClose }) => {
  const { t } = useTranslation()
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm gap-6 px-6">
      <div className="text-7xl animate-bounce">🎉</div>
      <h2 className="text-2xl font-extrabold text-green-600 text-center">आवेदन सफलतापूर्वक जमा हो गया!</h2>
      <p className="text-gray-500 text-sm text-center">Application submitted successfully</p>
      <div className="bg-green-50 border-2 border-green-200 rounded-2xl px-8 py-4 text-center">
        <p className="text-xs text-gray-500 mb-1">Application Reference Number</p>
        <p className="text-2xl font-extrabold tracking-widest text-green-700">{refNo}</p>
      </div>
      <p className="text-xs text-gray-400 text-center">इस नंबर को संभाल कर रखें — Keep this number safe</p>
      <button
        onClick={onClose}
        className="px-10 py-3 rounded-2xl bg-[#FF6B00] text-white font-bold text-base hover:bg-orange-600 transition-colors"
      >
        ✓ Done
      </button>
    </div>
  )
}

// ── MODE A — Online Scheme ────────────────────────────────────────────────────
const OnlineFlow = ({ scheme }) => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { answers } = useUserStore()
  const [step, setStep]           = useState(1)
  const [confirmed, setConfirmed] = useState(false)
  const [refNo, setRefNo]         = useState('')
  const [pdfLoading, setPdfLoading] = useState(false)

  // Pre-filled editable form fields with realistic dummy data for ALL possible scheme fields
  // Fields marked as userMustFill in the scheme will still be pre-filled here so the demo looks complete,
  // but they will visually appear different (amber).
  const [formData, setFormData] = useState({
    // Common personal details
    farmerName: 'राम कुमार',
    applicantName: 'राम कुमार',
    beneficiaryName: 'राम कुमार',
    fullName: 'राम कुमार',
    guardianName: 'सुरेश कुमार',
    girlChildName: 'अदिति कुमारी',
    dob: '15/08/1972',
    girlDob: '10/05/2018',
    gender: 'Male',
    age: 45,
    category: 'OBC',

    // IDs and Cards
    aadhaarNo: 'XXXX-XXXX-1234',
    guardianAadhaar: 'XXXX-XXXX-9876',
    panNo: 'ABCDE1234F',
    guardianPan: 'XYZPG5678H',
    rationCardNo: 'RC-12345678',
    jobCardNo: 'UP-001-2023-JA',
    mcpCardNo: 'MCP-99887766',
    birthCertificateNo: 'B-2018-774411',
    documentNo: 'DL-UP14-2010',

    // Contact and Address
    mobileNo: '9876543210',
    guardianMobile: '9876543210',
    address: 'ग्राम पिपरिया, तहसील महमूदाबाद, सीतापुर, उत्तर प्रदेश',
    businessAddress: 'मुख्य बाजार, महमूदाबाद, सीतापुर',
    village: 'पिपरिया',
    panchayat: 'पिपरिया',

    // Bank Details
    accountNo: '302XXXXX8901',
    bankAccount: '302XXXXX8901',
    ifscCode: 'SBIN0001234',

    // Specific features
    landRegId: 'RJ-LRI-2023-456',
    cropName: 'गेहूँ (Wheat)',
    surveyNo: 'Khasra 45/2',
    sownArea: 1.5,
    documentType: 'Aadhaar',
    businessName: 'कुमार जनरल स्टोर',
    loanAmount: 50000,
    qualification: '10th Pass',
    projectCost: 150000,
    activityType: 'Service',
    incomeCategory: 'EWS',
    familyIncome: 85000,
    ownershipAffidavit: 'No',
    education: '10th Pass',
    jobRole: 'Data Entry Operator',
    husbandName: 'सुनील कुमार',
    lmpDate: '01/01/2026',
    initialDeposit: 1000
  })

  // Dynamic steps based on the scheme's own steps_hi
  const STEPS = scheme.steps_hi.map((stepText, idx) => ({
    n: idx + 1,
    label: stepText,
    url: idx === 0 || idx === scheme.steps_hi.length - 1 ? scheme.portal_url : null
  }));

  // Avatar state
  const [avatarText, setAvatarText] = useState(`नमस्ते! मैं ${scheme.name_hi} में आवेदन करने में आपकी मदद करूँगा। कृपया पहले नीचे दिए गए दस्तावेज देख लें।`)
  const [avatarState, setAvatarState] = useState('greeting')
  const [hasStartedTyping, setHasStartedTyping] = useState(false)

  // Speak when confirmed
  useEffect(() => {
    if (confirmed) {
      setAvatarText('बहुत बढ़िया! आपकी जानकारी सहेज ली गई है। अब नीचे सबमिट बटन दबाकर फॉर्म जनरेट करें।')
      setAvatarState('happy')
    } else if (avatarText === 'बहुत बढ़िया! आपकी जानकारी सहेज ली गई है। अब नीचे सबमिट बटन दबाकर फॉर्म जनरेट करें।') {
      setAvatarText('')
      setAvatarState('idle')
    }
  }, [confirmed])

  const handleInputChange = (field, value) => {
    setFormData((f) => ({ ...f, [field]: value }))
    if (!hasStartedTyping) {
      setHasStartedTyping(true)
      setAvatarText('कृपया पीले रंग वाले खाली खाने भर लें ताकि आपका फॉर्म पूरी तरह से तैयार हो सके।')
      setAvatarState('speaking')
    }
  }

  const handleSubmit = () => {
    const ref = generateRefNo()
    setRefNo(ref)
    setStep(4)
    setAvatarText('बधाई हो! आपका फॉर्म सफलतापूर्वक जमा कर दिया गया है। आप इसे अब डाउनलोड कर सकते हैं।')
    setAvatarState('happy')
  }

  return (
    <div className="flex flex-col gap-5 pb-32">
      {/* ── Avatar Section ── */}
      <div className="bg-white rounded-2xl shadow-sm p-4 flex justify-center sticky top-0 z-10 border border-gray-100 mb-2">
        <AnimatedAvatar 
          state={avatarState} 
          size={140} 
          currentText={avatarText} 
          autoSpeak={true}
          onSpeakingEnd={() => setAvatarState('idle')}
        />
      </div>

      {/* ── Step 1: Document Upload ── */}
      <section className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="font-bold text-gray-800 text-base mb-1">📎 जरूरी दस्तावेज अपलोड करें</h3>
        <p className="text-xs text-gray-400 mb-4">Upload required documents</p>
        <DocumentUpload documents={scheme.documents} />
      </section>

      {/* ── Step 2: Pre-filled Form Preview ── */}
      <section className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="font-bold text-gray-800 text-base mb-1">📝 भरा हुआ फॉर्म देखें</h3>
        <p className="text-xs text-gray-400 mb-4">
          हरे रंग के खाने भरे हैं • <span className="text-amber-600 font-bold">पीले खाने आप भरें</span>
        </p>

        <div className="flex flex-col gap-3">
          {scheme.formFields && scheme.formFields.map((field) => (
            <div key={field.id}>
              <label className="text-xs font-semibold text-gray-500">{field.label}</label>
              {field.type === 'select' ? (
                <select
                  value={formData[field.id]}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className={`w-full mt-1 px-3 py-2.5 rounded-xl border-2 text-sm font-medium focus:outline-none transition-colors ${
                    field.userMustFill
                      ? 'border-amber-300 bg-amber-50 focus:border-amber-500 text-amber-900'
                      : 'border-green-200 bg-green-50 text-gray-800'
                  }`}
                >
                  {field.options && field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : (
                <input
                  type={field.type}
                  value={formData[field.id]}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  placeholder={field.placeholder || (field.userMustFill ? 'यहाँ भरें...' : '')}
                  className={`w-full mt-1 px-3 py-2.5 rounded-xl border-2 text-sm font-medium focus:outline-none transition-colors ${
                    field.userMustFill
                      ? 'border-amber-300 bg-amber-50 placeholder-amber-400 focus:border-amber-500 text-amber-900'
                      : 'border-green-200 bg-green-50 text-gray-800'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Confirmation */}
        <button
          onClick={() => setConfirmed((c) => !c)}
          className={`mt-5 w-full py-3 rounded-2xl border-2 font-bold text-sm transition-all ${
            confirmed
              ? 'bg-green-500 border-green-500 text-white'
              : 'bg-white border-gray-200 text-gray-600 hover:border-green-400'
          }`}
        >
          {confirmed ? '✅ जानकारी सही है!' : '❓ क्या यह सब सही है?'}
        </button>
      </section>

      {/* ── Step 3: Submission Guide ── */}
      <section className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="font-bold text-gray-800 text-base mb-4">🚀 ऑनलाइन आवेदन कैसे करें</h3>
        <div className="flex flex-col gap-4">
          {STEPS.map((s) => (
            <div key={s.n} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#FF6B00] text-white text-xs font-bold flex items-center justify-center">
                {s.n}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-700 font-medium">{s.label}</p>
                {s.url && (
                  <a
                    href={s.url} target="_blank" rel="noopener noreferrer"
                    className="mt-1 inline-block text-xs text-[#FF6B00] font-bold underline"
                  >
                    🌐 पोर्टल खोलें →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Fixed bottom: Submit ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-gray-100 shadow-xl z-40">
        <div className="max-w-lg mx-auto px-4 py-4 flex flex-col gap-2">
          <button
            disabled={!confirmed}
            onClick={handleSubmit}
            className={`w-full py-4 rounded-2xl text-white font-extrabold text-lg shadow-lg transition-all ${
              confirmed
                ? 'bg-[#FF6B00] hover:bg-orange-600 hover:scale-105'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            ✅ Submit करें
          </button>
          <button
            onClick={async () => {
              setPdfLoading(true)
              try {
                const bytes = await generateApplicationPDF(scheme, answers, formData)
                downloadPDF(bytes, `${scheme.id}-application.pdf`)
              } catch (e) { console.error(e) }
              setPdfLoading(false)
            }}
            className="w-full py-3 rounded-2xl bg-gray-50 border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-100 transition-colors"
          >
            {pdfLoading ? '⏳ Generating...' : '📥 PDF Download करें'}
          </button>
        </div>
      </div>

      {/* Success overlay */}
      {step === 4 && <SuccessOverlay refNo={refNo} onClose={() => navigate('/landing')} />}
    </div>
  )
}

// ── MODE B — Offline Scheme ────────────────────────────────────────────────────
const OfflineFlow = ({ scheme }) => {
  const { t, i18n } = useTranslation()
  const { answers } = useUserStore()
  const navigate = useNavigate()
  const [pdfLoading, setPdfLoading] = useState(false)

  const [ticked, setTicked] = useState({})
  
  const [avatarText, setAvatarText] = useState(`आप ${scheme.name_hi} के लिए ऑफलाइन आवेदन कर सकते हैं। नीचे देखकर अपने नजदीकी जन-सेवा केंद्र का पता करें।`)
  const [avatarState, setAvatarState] = useState('greeting')
  const [docsTickedCount, setDocsTickedCount] = useState(0)

  const toggle = (doc) => {
    setTicked((prev) => {
      const isNowTicked = !prev[doc]
      if (isNowTicked) {
        if (docsTickedCount === 0) {
          setAvatarText('शाबाश! इसी तरह सभी दस्तावेजों की व्यवस्था कर लें।')
          setAvatarState('happy')
        } else if (docsTickedCount + 1 === scheme.documents.length) {
          setAvatarText('शानदार! आपके सभी दस्तावेज तैयार हैं। आप अब फॉर्म डाउनलोड करके केंद्र पर जा सकते हैं।')
          setAvatarState('happy')
        }
        setDocsTickedCount(c => c + 1)
      } else {
        setDocsTickedCount(c => Math.max(0, c - 1))
      }
      return { ...prev, [doc]: isNowTicked }
    })
  }

  const district = answers?.q1 === 'RJ' ? 'जयपुर' : answers?.q1 === 'UP' ? 'लखनऊ' : 'आपके जिले'

  const officeText = `तहसील कार्यालय, ${district}`

  // Script to say at office
  const SCRIPT = `नमस्ते, मुझे ${scheme.name_hi} के लिए आवेदन करना है। क्या आप मुझे ${scheme.name_hi === 'पीएम आवास योजना' ? 'IAY / PMAY फॉर्म' : 'आवेदन फॉर्म'} दे सकते हैं?`

  const mapsUrl = `https://www.google.com/maps/search/CSC+center+near+me`

  return (
    <div className="flex flex-col gap-4 pb-32">

      {/* ── Avatar Section ── */}
      <div className="bg-white rounded-2xl shadow-sm p-4 flex justify-center sticky top-0 z-10 border border-gray-100 mb-2">
        <AnimatedAvatar 
          state={avatarState} 
          size={140} 
          currentText={avatarText} 
          autoSpeak={true}
          onSpeakingEnd={() => setAvatarState('idle')}
        />
      </div>

      {/* Office info card */}
      <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-4">

        <div className="flex items-center gap-3">
          <span className="text-3xl">🏛️</span>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">जाएं यहाँ</p>
            <p className="font-bold text-gray-900 text-base">{officeText}</p>
          </div>
        </div>

        {/* CSC Button */}
        <a
          href={mapsUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 hover:bg-blue-100 transition-colors"
        >
          <span className="text-2xl">🗺️</span>
          <div>
            <p className="font-bold text-blue-700 text-sm">नजदीकी CSC केंद्र खोजें</p>
            <p className="text-xs text-blue-500">Google Maps पर खुलेगा</p>
          </div>
          <span className="ml-auto text-blue-400">→</span>
        </a>

        {/* Form to ask */}
        <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
          <span className="text-2xl">📋</span>
          <div>
            <p className="text-xs text-gray-500">यह फॉर्म मांगें</p>
            <p className="font-bold text-gray-800 text-sm">{scheme.name_hi} आवेदन फॉर्म</p>
          </div>
        </div>

        {/* Office hours */}
        <div className="flex items-center gap-3">
          <span className="text-2xl">🕐</span>
          <div>
            <p className="text-xs text-gray-500">कार्यालय समय</p>
            <p className="font-semibold text-gray-800 text-sm">सोमवार–शनिवार: 9:30 AM – 5:30 PM</p>
          </div>
        </div>

        {/* Helpline */}
        <a
          href={`tel:${scheme.helpline}`}
          className="flex items-center gap-3 hover:bg-green-50 rounded-xl px-2 py-1 transition-colors"
        >
          <span className="text-2xl">📞</span>
          <div>
            <p className="text-xs text-gray-500">हेल्पलाइन • सुबह 10 – शाम 5 बजे</p>
            <p className="font-bold text-green-700 text-sm">{scheme.helpline}</p>
          </div>
          <span className="ml-auto text-green-400 text-xs font-bold">TAP TO CALL</span>
        </a>
      </div>

      {/* Documents checklist */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="font-bold text-gray-800 text-base mb-3">✅ दस्तावेज तैयार करें</h3>
        <div className="flex flex-col gap-3">
          {scheme.documents.map((doc) => (
            <label key={doc} className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => toggle(doc)}
                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                  ticked[doc]
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 bg-white'
                }`}
              >
                {ticked[doc] && <span className="text-xs font-bold">✓</span>}
              </div>
              <span className={`text-sm font-medium ${ticked[doc] ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                {doc}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Script to say */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="font-bold text-gray-800 text-base mb-2">💬 यह बात बोलें</h3>
        <p className="text-xs text-gray-400 mb-3">कार्यालय में यह कहें — Say this at the office</p>
        <div className="bg-amber-50 border-l-4 border-amber-400 rounded-xl p-4">
          <p className={`text-sm text-gray-800 leading-relaxed font-medium ${i18n.language !== 'en' ? `lang-${i18n.language}` : ''}`}>
            "{SCRIPT}"
          </p>
        </div>
      </div>

      {/* Fixed bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-gray-100 shadow-xl z-40">
        <div className="max-w-lg mx-auto px-4 py-4 flex flex-col gap-2">
          <button
            onClick={async () => {
              setPdfLoading(true)
              try {
                const bytes = await generateResultsSummaryPDF([scheme], answers || {})
                downloadPDF(bytes, `${scheme.id}-offline-guide.pdf`)
              } catch (e) { console.error(e) }
              setPdfLoading(false)
            }}
            className="w-full py-4 rounded-2xl bg-[#FF6B00] text-white font-extrabold text-base shadow-lg hover:bg-orange-600 transition-all"
          >
            {pdfLoading ? '⏳ Generating...' : '📥 PDF Download करें'}
          </button>
          <button
            onClick={() => navigate('/results')}
            className="w-full py-3 rounded-2xl bg-gray-50 border border-gray-200 text-gray-500 text-sm font-semibold hover:bg-gray-100 transition-colors"
          >
            ← वापस जाएं
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main ApplyFlow page
// ═══════════════════════════════════════════════════════════════════════════════
const ApplyFlow = () => {
  const { schemeId } = useParams()
  const navigate     = useNavigate()
  const { i18n }    = useTranslation()

  const scheme = MOCK_SCHEMES.find((s) => s.id === schemeId) || MOCK_SCHEMES[0]
  const isOnline = scheme.mode === 'online'
  const name = i18n.language === 'hi' ? scheme.name_hi : scheme.name_en

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex flex-col">


      {/* ── Scheme Header ── */}
      <div className="mt-14 px-4 py-5 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-lg mx-auto flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm flex-shrink-0"
            style={{ backgroundColor: scheme.categoryColor + '22', border: `2px solid ${scheme.categoryColor}` }}
          >
            {scheme.categoryIcon}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-extrabold text-gray-900 text-lg leading-tight ${i18n.language !== 'en' ? `lang-${i18n.language}` : ''}`}>
              {name}
            </p>
            <p className="text-green-600 font-extrabold text-base">{scheme.benefitLabel}</p>
            <span
              className={`mt-1 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isOnline ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
              }`}
            >
              {isOnline ? '🌐 Online' : '🏢 Offline'}
            </span>
          </div>
          <button onClick={() => navigate('/results')} className="text-gray-400 hover:text-gray-600 text-2xl p-1">✕</button>
        </div>
      </div>

      {/* ── Flow content ── */}
      <main className="flex-1 px-4 py-5 max-w-lg mx-auto w-full">
        {isOnline ? (
          <OnlineFlow scheme={scheme} />
        ) : (
          <OfflineFlow scheme={scheme} />
        )}
      </main>
    </div>
  )
}

export default ApplyFlow
