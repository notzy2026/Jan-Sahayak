/**
 * tts.js — Text-to-Speech helper
 * Uses the Web Speech API (browser-native, works offline)
 */

// Language code → BCP-47 locale map
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
 * Speak the given text in the given language.
 * Cancels any currently playing speech first.
 *
 * @param {string}   text      – text to speak
 * @param {string}   langCode  – i18n language key, e.g. 'hi', 'ta'
 * @param {Function} [onEnd]   – optional callback fired when speech ends
 */
export function speak(text, langCode, onEnd) {
  if (!window.speechSynthesis) return

  window.speechSynthesis.cancel() // stop any current speech

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang  = LANG_TO_BCP47[langCode] || 'hi-IN'
  utterance.rate  = 0.85  // 15% slower for comprehension
  utterance.pitch = 1.1   // slightly warm pitch

  if (onEnd) utterance.onend = onEnd

  window.speechSynthesis.speak(utterance)
}

/**
 * Immediately stop any ongoing speech.
 */
export function stopSpeaking() {
  window.speechSynthesis.cancel()
}

/**
 * Returns true if speech synthesis is currently active.
 * @returns {boolean}
 */
export function isSpeaking() {
  return window.speechSynthesis.speaking
}
