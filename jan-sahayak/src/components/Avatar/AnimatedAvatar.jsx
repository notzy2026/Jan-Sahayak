import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis'

// Import video files
import thinkingVideo from '../../assets/videos/newvideo/thinking.mp4'
import happyVideo from '../../assets/videos/newvideo/happy thank you.mp4'
import speakingVideo from '../../assets/videos/newvideo/speaking.mp4'
import confuseVideo from '../../assets/videos/newvideo/confuse.mp4'
import greetingVideo from '../../assets/videos/Video_Generation_For_Happiness (2).mp4'
import idleVideo from '../../assets/videos/Video_Generation_Confirmation (1).mp4'

const AnimatedAvatar = ({ 
  state = 'idle', 
  size = 400, 
  onSpeakingEnd,
  currentText = '',
  gender = 'male',
  autoSpeak = false,
  showControls = true
}) => {
  const { i18n } = useTranslation()
  const [localState, setLocalState] = useState(state)
  const { speak, stop, isSpeaking } = useSpeechSynthesis(i18n.language)
  const videoRef = useRef(null)

  // Sync local state with prop state
  useEffect(() => {
    setLocalState(state)
  }, [state])

  // Get video source based on state
  const getVideoSource = () => {
    const currentState = isSpeaking ? 'speaking' : localState
    
    switch (currentState) {
      case 'thinking':
        return thinkingVideo
      case 'happy':
        return happyVideo
      case 'confused':
        return confuseVideo
      case 'speaking':
        return speakingVideo
      case 'greeting':
        return greetingVideo
      case 'idle':
      default:
        return idleVideo
    }
  }

  // Play video when state changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load()
      videoRef.current.play().catch(err => {
        console.log('Video autoplay prevented:', err)
      })
    }
  }, [localState, isSpeaking])

  // Auto-speak when text changes and autoSpeak is true
  useEffect(() => {
    if (autoSpeak && currentText && state === 'speaking') {
      handleSpeak()
    }
    
    return () => {
      stop()
    }
  }, [currentText, autoSpeak, state])

  // State-based border colors
  const getBorderColor = () => {
    const currentState = isSpeaking ? 'speaking' : localState
    
    switch (currentState) {
      case 'idle':
        return 'border-cream'
      case 'speaking':
        return 'border-saffron animate-pulse-ring'
      case 'thinking':
        return 'border-gray-400'
      case 'happy':
        return 'border-green-500 animate-sparkle'
      case 'confused':
        return 'border-amber-500'
      case 'greeting':
        return 'border-saffron animate-pulse'
      default:
        return 'border-cream'
    }
  }

  // Truncate text to 80 characters with ellipsis
  const displayText = currentText.length > 80 
    ? currentText.substring(0, 80) + '...' 
    : currentText


  const handleSpeak = () => {
    if (currentText) {
      setLocalState('speaking')
      speak(
        currentText,
        () => {
          setLocalState('speaking')
        },
        () => {
          setLocalState('idle')
          if (onSpeakingEnd) onSpeakingEnd()
        }
      )
    }
  }

  const handleReplay = () => {
    stop()
    setTimeout(() => {
      handleSpeak()
    }, 100)
  }

  const showSpeechBubble = (localState === 'speaking' || localState === 'greeting' || isSpeaking) && displayText

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Avatar + Speech Bubble side-by-side on md, stacked on mobile */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">

        {/* Avatar frame */}
        <div className="relative flex-shrink-0">
          <div
            className={`rounded-3xl border-4 ${getBorderColor()} transition-all duration-300 overflow-hidden bg-gradient-to-br from-cream via-white to-warmGold shadow-2xl`}
            style={{ width: size, height: size * 1.2 }}
          >
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              loop
              muted
              playsInline
              autoPlay
              key={getVideoSource()}
            >
              <source src={getVideoSource()} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Thinking spin ring */}
          {localState === 'thinking' && (
            <div className="absolute inset-0 rounded-3xl border-4 border-gray-300 border-t-gray-600 animate-spin" />
          )}
        </div>

        {/* Speech Bubble — RIGHT side on md, BOTTOM on mobile */}
        {showSpeechBubble && (
          <div className="relative mt-2 md:mt-4 bg-white rounded-2xl shadow-xl px-4 py-3 border-2 border-saffron animate-fade-in w-full md:w-auto"
            style={{ maxWidth: Math.max(220, size * 0.9) }}
          >
            {/* Arrow pointing UP on mobile, LEFT on md */}
            <div className="absolute left-1/2 -top-3 -translate-x-1/2 md:translate-x-0 md:-left-3 md:top-5 w-4 h-4 bg-white rotate-45 border-l-2 border-t-2 md:border-t-0 md:border-b-2 border-saffron" />
            <p className={`text-sm text-textDark leading-relaxed font-semibold ${
              i18n.language !== 'en' ? `lang-${i18n.language}` : ''
            }`}>
              {displayText}
            </p>
          </div>
        )}
      </div>

      {/* Replay Button */}
      {showControls && (localState === 'speaking' || isSpeaking) && currentText && (
        <button
          className="mt-5 w-14 h-14 bg-saffron text-white rounded-full shadow-xl hover:bg-opacity-90 transition-all duration-300 flex items-center justify-center text-2xl hover:scale-110 border-4 border-white"
          aria-label="Replay last message"
          onClick={handleReplay}
        >
          🔊
        </button>
      )}

      {/* Status Text */}
      {showControls && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 font-semibold">
            {(isSpeaking || localState === 'speaking') && '🗣️ Speaking...'}
            {!isSpeaking && localState === 'idle' && '✅ Ready to help'}
            {localState === 'thinking' && '🤔 Thinking...'}
            {localState === 'happy' && '😊 Great!'}
            {localState === 'confused' && '😕 Let me clarify...'}
            {localState === 'greeting' && '🙏 Namaste!'}
          </p>
        </div>
      )}
    </div>
  )
}

export default AnimatedAvatar
