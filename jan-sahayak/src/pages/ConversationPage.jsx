import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import LanguageBar from '../components/LanguageBar/LanguageBar'
import AnimatedAvatar from '../components/Avatar/AnimatedAvatar'
import VoiceInput from '../components/VoiceInput/VoiceInput'

const ConversationPage = () => {
  const { t, i18n } = useTranslation()
  const [avatarState, setAvatarState] = useState('greeting')
  const [currentText, setCurrentText] = useState(t('greeting.welcome'))
  const [userTranscript, setUserTranscript] = useState('')

  const handleTranscript = (text) => {
    setUserTranscript(text)
    setAvatarState('thinking')
    setCurrentText(t('conversation.processing'))
    
    // Simulate processing
    setTimeout(() => {
      setAvatarState('happy')
      setCurrentText(t('conversation.understood'))
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream">
      {/* Language Bar */}

      
      {/* Main Content - with padding-top to account for fixed LanguageBar */}
      <div className="pt-20 p-8 flex flex-col items-center gap-8">
        {/* Avatar */}
        <AnimatedAvatar
          state={avatarState}
          currentText={currentText}
          size={320}
          autoSpeak={true}
          onSpeakingEnd={() => setAvatarState('idle')}
        />

        {/* Voice Input */}
        <VoiceInput
          onTranscript={handleTranscript}
          language={i18n.language}
        />

        {/* User Transcript Display */}
        {userTranscript && (
          <div className="w-full max-w-2xl p-6 bg-white rounded-2xl shadow-lg border-2 border-saffron">
            <h3 className="text-lg font-bold text-gray-700 mb-2">
              {t('conversation.yourQuery') || 'Your Query:'}
            </h3>
            <p className="text-base text-gray-900">{userTranscript}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ConversationPage
