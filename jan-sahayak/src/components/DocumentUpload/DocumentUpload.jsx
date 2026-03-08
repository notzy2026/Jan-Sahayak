import React, { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'

// Simulate OCR extraction results per document type
const OCR_MOCK = {
  'Aadhaar Card':   { 'नाम': 'राम कुमार', 'आधार': 'XXXX-XXXX-1234', 'जन्म तिथि': '15/08/1972' },
  'Bank Passbook':  { 'खाता नं.': 'XXXX-XXXX-8901', 'IFSC': 'SBIN0001234', 'नाम': 'राम कुमार' },
  'Land Records':   { 'खसरा नं.': '145/B', 'क्षेत्रफल': '2.5 बीघा', 'जिला': 'जयपुर' },
  'Ration Card':    { 'राशन कार्ड नं.': 'RJ-12345678', 'परिवार के सदस्य': '4' },
  'Income Certificate': { 'वार्षिक आय': '₹85,000', 'प्रमाण पत्र नं.': 'IC-2024-001' },
  'Caste Certificate':  { 'जाति': 'OBC', 'प्रमाण पत्र नं.': 'CC-2024-002' },
  'default':        { 'दस्तावेज़': 'स्वीकृत ✓' },
}

const DOC_ICONS = {
  'Aadhaar Card': '🪪', 'Bank Passbook': '🏦', 'Land Records': '📄',
  'Ration Card': '📋', 'Income Certificate': '📃', 'Caste Certificate': '📖',
  'School Certificate': '🎓', 'Medical Certificate': '🏥', 'PAN Card': '💳',
  'default': '📄',
}

const UploadSlot = ({ docName }) => {
  const { t } = useTranslation()
  const [status, setStatus]     = useState('idle')    // idle | processing | done
  const [preview, setPreview]   = useState(null)
  const [ocrData, setOcrData]   = useState(null)
  const fileRef                 = useRef(null)

  const handleFile = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target.result)
    reader.readAsDataURL(file)

    setStatus('processing')
    // Simulate OCR extraction after 2 seconds
    setTimeout(() => {
      const data = OCR_MOCK[docName] || OCR_MOCK.default
      setOcrData(data)
      setStatus('done')
    }, 2000)
  }

  const icon = DOC_ICONS[docName] || DOC_ICONS.default

  return (
    <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-4 flex flex-col gap-3">
      {/* Slot header */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        <p className="font-semibold text-gray-800 text-sm">{docName}</p>
        {status === 'done' && <span className="ml-auto text-green-600 text-lg">✅</span>}
      </div>

      {/* Preview + OCR result */}
      {preview && (
        <div className="flex gap-3 items-start">
          {/* Thumbnail */}
          <img src={preview} alt="preview" className="w-16 h-16 rounded-lg object-cover border border-gray-200 flex-shrink-0" />

          {/* OCR status / data */}
          {status === 'processing' && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
              <div className="w-4 h-4 border-2 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
              Processing...
            </div>
          )}
          {status === 'done' && ocrData && (
            <div className="flex flex-col gap-1">
              {Object.entries(ocrData).map(([k, v]) => (
                <p key={k} className="text-xs text-gray-700">
                  <span className="font-semibold text-gray-500">{k}:</span>{' '}
                  <span className="font-bold text-gray-900">{v}</span>{' '}
                  <span className="text-green-500">✓</span>
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upload buttons */}
      {status !== 'done' && (
        <div className="flex gap-2">
          {/* Camera (mobile) */}
          <label className="flex-1 cursor-pointer flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-orange-50 border border-orange-200 text-[#FF6B00] text-xs font-semibold hover:bg-orange-100 transition-colors">
            📷 Camera
            <input
              type="file" accept="image/*" capture="environment"
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </label>

          {/* File upload (desktop) */}
          <label className="flex-1 cursor-pointer flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-100 transition-colors">
            📁 Upload
            <input
              type="file" accept=".jpg,.jpeg,.png,.pdf"
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </label>
        </div>
      )}
    </div>
  )
}

const DocumentUpload = ({ documents = [] }) => {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col gap-3">
      {documents.map((doc) => (
        <UploadSlot key={doc} docName={doc} />
      ))}
    </div>
  )
}

export default DocumentUpload
