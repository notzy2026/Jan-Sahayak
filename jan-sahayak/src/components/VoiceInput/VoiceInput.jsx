import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

// Language code mapping for Speech Recognition
const LANGUAGE_CODE_MAP = {
  en: 'en-IN',
  hi: 'hi-IN',
  gu: 'gu-IN',
  kn: 'kn-IN',
  bn: 'bn-IN'
}

const VoiceInput = ({ onTranscript, language = 'hi', disabled = false }) => {
  const { t } = useTranslation()
  const [isListening, setIsListening] = useState(false)
  const [interimTranscript, setInterimTranscript] = useState('')
  const [finalTranscript, setFinalTranscript] = useState('')
  const [error, setError] = useState(null)
  const [isConfirmed, setIsConfirmed] = useState(false)
  
  const recognitionRef = useRef(null)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const canvasRef = useRef(null)
  const animationFrameRef = useRef(null)
  const mediaStreamRef = useRef(null)

  // Initialize Speech Recognition
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition not supported in this browser')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = LANGUAGE_CODE_MAP[language] || 'hi-IN'

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
      setIsConfirmed(false)
      initializeAudioVisualizer()
    }

    recognition.onresult = (event) => {
      let interim = ''
      let final = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          final += transcript
        } else {
          interim += transcript
        }
      }

      setInterimTranscript(interim)
      if (final) {
        setFinalTranscript(final)
        setIsConfirmed(true)
        if (onTranscript) {
          onTranscript(final)
        }
      }
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      if (event.error === 'not-allowed') {
        setError('Microphone blocked')
      } else {
        setError('Speech recognition error')
      }
      setIsListening(false)
      stopAudioVisualizer()
    }

    recognition.onend = () => {
      setIsListening(false)
      stopAudioVisualizer()
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      stopAudioVisualizer()
    }
  }, [language, onTranscript])

  // Initialize Audio Visualizer
  const initializeAudioVisualizer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream

      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const analyser = audioContext.createAnalyser()
      const source = audioContext.createMediaStreamSource(stream)
      
      analyser.fftSize = 256
      source.connect(analyser)
      
      audioContextRef.current = audioContext
      analyserRef.current = analyser
      
      drawWaveform()
    } catch (err) {
      console.error('Error accessing microphone:', err)
      setError('Microphone blocked')
    }
  }

  // Stop Audio Visualizer
  const stopAudioVisualizer = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
    
    // Draw flat line when idle
    drawFlatLine()
  }

  // Draw Waveform
  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const analyser = analyserRef.current
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw)
      analyser.getByteFrequencyData(dataArray)

      ctx.fillStyle = 'rgb(255, 255, 255)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const barWidth = (canvas.width / bufferLength) * 2.5
      let barHeight
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height * 0.8

        // Saffron color for bars
        ctx.fillStyle = `rgb(255, 153, 51)`
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)

        x += barWidth + 1
      }
    }

    draw()
  }

  // Draw Flat Line (idle state)
  const drawFlatLine = () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = 'rgb(255, 255, 255)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = 'rgb(200, 200, 200)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, canvas.height / 2)
    ctx.lineTo(canvas.width, canvas.height / 2)
    ctx.stroke()
  }

  // Initialize flat line on mount
  useEffect(() => {
    drawFlatLine()
  }, [])

  // Handle mic button click
  const handleMicClick = () => {
    if (disabled) return

    if (isListening) {
      recognitionRef.current?.stop()
    } else {
      setInterimTranscript('')
      setFinalTranscript('')
      setIsConfirmed(false)
      recognitionRef.current?.start()
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md">
      {/* Mic Button */}
      <button
        onClick={handleMicClick}
        disabled={disabled || error === 'Microphone blocked'}
        className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl transition-all duration-300 shadow-2xl border-4 border-white ${
          isListening
            ? 'bg-saffron animate-pulse scale-110'
            : 'bg-saffron hover:scale-105'
        } ${disabled || error === 'Microphone blocked' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        aria-label={isListening ? 'Stop listening' : 'Start listening'}
      >
        🎤
      </button>

      {/* Waveform Canvas */}
      <canvas
        ref={canvasRef}
        width={300}
        height={80}
        className="rounded-lg border-2 border-gray-200 bg-white"
      />

      {/* Transcript Display */}
      <div className="w-full min-h-16 p-4 bg-white rounded-lg border-2 border-gray-200 text-center">
        {error === 'Microphone blocked' ? (
          <div className="flex flex-col items-center gap-2">
            <span className="text-2xl">🎤🚫</span>
            <p className="text-sm text-red-600 font-semibold">
              {t('microphoneBlocked') || 'Microphone blocked'}
            </p>
            <p className="text-xs text-gray-500">
              {t('fallbackToKeyboard') || 'Please use keyboard input'}
            </p>
          </div>
        ) : isConfirmed && finalTranscript ? (
          <div className="flex items-center justify-center gap-2">
            <p className="text-base text-black font-bold">
              {finalTranscript}
            </p>
            <span className="text-green-600 text-xl">✓</span>
          </div>
        ) : interimTranscript ? (
          <p className="text-base text-gray-500 italic">
            {interimTranscript}
          </p>
        ) : (
          <p className="text-sm text-gray-400">
            {isListening
              ? t('speakIntoMicrophone') || 'Speak into your microphone...'
              : t('clickMicToStart') || 'Click mic to start'}
          </p>
        )}
      </div>
    </div>
  )
}

export default VoiceInput
