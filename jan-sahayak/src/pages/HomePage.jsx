import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import LanguageBar from '../components/LanguageBar/LanguageBar'
import AnimatedAvatar from '../components/Avatar/AnimatedAvatar'

const HomePage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [avatarState, setAvatarState] = useState('greeting')
  const [greetingText, setGreetingText] = useState('')

  // Set greeting text based on language
  React.useEffect(() => {
    setAvatarState('greeting')
    setGreetingText(t('home.welcome'))
    
    // Change to idle after 3 seconds
    const timer = setTimeout(() => {
      setAvatarState('idle')
    }, 3000)

    return () => clearTimeout(timer)
  }, [t])

  const sectors = [
    { key: 'disability', icon: '♿', color: 'bg-blue-100 hover:bg-blue-200' },
    { key: 'women', icon: '👩', color: 'bg-pink-100 hover:bg-pink-200' },
    { key: 'health', icon: '🏥', color: 'bg-green-100 hover:bg-green-200' },
    { key: 'education', icon: '📚', color: 'bg-purple-100 hover:bg-purple-200' },
    { key: 'agriculture', icon: '🌾', color: 'bg-yellow-100 hover:bg-yellow-200' },
    { key: 'all', icon: '🔍', color: 'bg-orange-100 hover:bg-orange-200' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream">
      {/* Language Bar */}

      
      {/* Header - with padding-top to account for fixed LanguageBar */}
      <header className="bg-white shadow-md pt-16">
        <div className="container mx-auto px-4 py-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-saffron">{t('app.title')}</h1>
            <p className="text-sm text-gray-600">{t('app.tagline')}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Avatar Section */}
        <div className="flex justify-center mb-12 mt-8">
          <AnimatedAvatar 
            state={avatarState}
            size={350}
            currentText={greetingText}
            onSpeakingEnd={() => setAvatarState('idle')}
            autoSpeak={true}
          />
        </div>


        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-bold text-textDark mb-4">
            {t('home.welcome')}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            {t('home.subtitle')}
          </p>
        </div>

        {/* Action Buttons (Moved Below Avatar and Welcome) */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
          <button
            onClick={() => navigate('/conversation')}
            className="btn-primary flex items-center gap-3 text-lg py-4 px-8 min-w-[200px] justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            <span className="text-2xl">🎤</span>
            {t('home.startVoice') || 'आवाज से शुरू करें'}
          </button>
          <button
            onClick={() => navigate('/conversation')}
            className="btn-secondary flex items-center gap-3 text-lg py-4 px-8 min-w-[200px] justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all bg-green-700 hover:bg-green-800 text-white border-transparent"
          >
            <span className="text-2xl">💬</span>
            {t('home.startText') || 'टेक्स्ट से शुरू करें'}
          </button>
        </div>

        {/* Sector Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {sectors.map((sector) => (
            <div
              key={sector.key}
              className={`${sector.color} rounded-xl p-6 cursor-pointer transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-xl flex flex-col items-center text-center`}
              onClick={() => navigate('/conversation', { state: { sector: sector.key } })}
            >
              <div className="text-5xl mb-4">{sector.icon}</div>
              <h3 className="text-xl font-bold text-textDark mb-2">
                {t(`sectors.${sector.key}.title`)}
              </h3>
              <p className="text-sm text-gray-700">
                {t(`sectors.${sector.key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-gray-600 mb-2">
            {t('footer.whatsapp')}: <strong>+91-XXXXX-XXXXX</strong> | {t('footer.tollfree')}: <strong>1800-XXX-XXXX</strong>
          </p>
          <p className="text-sm text-deepGreen font-semibold">
            🔒 {t('footer.privacy')}
          </p>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
