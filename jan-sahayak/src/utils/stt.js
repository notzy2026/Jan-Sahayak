/**
 * stt.js — Speech-to-Text helper
 * Uses the Web Speech API (browser-native, works offline in Chrome/Edge)
 */

// Language code → BCP-47 locale map (shared with tts.js)
const LANG_TO_BCP47 = {
  hi: 'hi-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  bn: 'bn-IN',
  mr: 'mr-IN',
  gu: 'gu-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  pa: 'pa-IN',
  or: 'or-IN',
  en: 'en-IN',
}

/**
 * Start listening for speech.
 *
 * @param {string}   langCode    – i18n language key, e.g. 'hi', 'ta'
 * @param {Function} onInterim   – called with partial (live) transcript string
 * @param {Function} onFinal     – called with the final confirmed transcript string
 * @param {Function} onError     – called with error code string, e.g. 'NOT_SUPPORTED', 'no-speech'
 * @returns {SpeechRecognition|null} recognition instance (pass to stopListening to cancel)
 */
export function startListening(langCode, onInterim, onFinal, onError) {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition

  if (!SpeechRecognition) {
    onError('NOT_SUPPORTED')
    return null
  }

  const recognition = new SpeechRecognition()
  recognition.lang            = LANG_TO_BCP47[langCode] || 'hi-IN'
  recognition.continuous      = false
  recognition.interimResults  = true

  recognition.onresult = (event) => {
    const interim = Array.from(event.results)
      .filter((r) => !r.isFinal)
      .map((r) => r[0].transcript)
      .join('')

    const final = Array.from(event.results)
      .filter((r) => r.isFinal)
      .map((r) => r[0].transcript)
      .join('')

    if (interim) onInterim(interim)
    if (final)   onFinal(final)
  }

  recognition.onerror = (e) => onError(e.error)

  recognition.start()
  return recognition
}

/**
 * Stop an active recognition session.
 * @param {SpeechRecognition|null} recognition – instance returned by startListening
 */
export function stopListening(recognition) {
  if (recognition) recognition.stop()
}
