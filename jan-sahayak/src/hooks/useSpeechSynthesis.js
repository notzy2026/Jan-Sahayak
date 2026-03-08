import { useState, useEffect, useCallback } from 'react'

/**
 * Custom hook for speech synthesis with language support
 * Provides lip-sync timing for avatar animations
 */
export const useSpeechSynthesis = (language = 'en') => {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [voices, setVoices] = useState([])

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices()
      setVoices(availableVoices)
    }

    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices

    return () => {
      window.speechSynthesis.cancel()
    }
  }, [])

  // Get appropriate voice for language
  const getVoiceForLanguage = useCallback((lang) => {
    const languageMap = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'gu': 'gu-IN',
      'kn': 'kn-IN',
      'bn': 'bn-IN'
    }

    const targetLang = languageMap[lang] || 'en-US'
    
    // Find voice matching the language
    let voice = voices.find(v => v.lang === targetLang)
    
    // Fallback to any voice with the language code
    if (!voice) {
      voice = voices.find(v => v.lang.startsWith(lang))
    }
    
    // Final fallback to default voice
    if (!voice) {
      voice = voices[0]
    }

    return voice
  }, [voices])

  // Speak text with language-specific voice
  const speak = useCallback((text, onStart, onEnd, onBoundary) => {
    if (!text) return
    if (!('speechSynthesis' in window)) {
      if (onEnd) onEnd()
      return
    }

    // Cancel any ongoing speech
    try { window.speechSynthesis.cancel() } catch(e) { /* ignore */ }

    const utterance = new SpeechSynthesisUtterance(text)
    const voice = getVoiceForLanguage(language)
    
    if (voice) {
      utterance.voice = voice
    }
    
    utterance.lang = language === 'en' ? 'en-US' : 
                     language === 'hi' ? 'hi-IN' :
                     language === 'gu' ? 'gu-IN' :
                     language === 'kn' ? 'kn-IN' :
                     language === 'bn' ? 'bn-IN' : 'en-US'
    
    // Adjust rate for better clarity (slightly slower for Indian languages)
    utterance.rate = language === 'en' ? 1.0 : 0.9
    utterance.pitch = 1.0
    utterance.volume = 1.0

    utterance.onstart = () => {
      setIsSpeaking(true)
      if (onStart) onStart()
    }

    utterance.onend = () => {
      setIsSpeaking(false)
      if (onEnd) onEnd()
    }

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event)
      setIsSpeaking(false)
      if (onEnd) onEnd()
    }

    // Boundary event for lip-sync (fires on word boundaries)
    utterance.onboundary = (event) => {
      if (onBoundary) {
        onBoundary(event)
      }
    }

    try {
      window.speechSynthesis.speak(utterance)
    } catch (e) {
      console.warn('[Speech] speak() failed:', e)
      setIsSpeaking(false)
      if (onEnd) onEnd()
    }
  }, [language, getVoiceForLanguage])

  // Pause speech
  const pause = useCallback(() => {
    window.speechSynthesis.pause()
    setIsPaused(true)
  }, [])

  // Resume speech
  const resume = useCallback(() => {
    window.speechSynthesis.resume()
    setIsPaused(false)
  }, [])

  // Stop speech
  const stop = useCallback(() => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
    setIsPaused(false)
  }, [])

  return {
    speak,
    pause,
    resume,
    stop,
    isSpeaking,
    isPaused,
    voices
  }
}
