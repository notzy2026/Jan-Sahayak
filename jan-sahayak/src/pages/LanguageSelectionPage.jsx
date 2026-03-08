import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const LanguageSelectionPage = () => {
  const navigate = useNavigate()
  const { i18n } = useTranslation()

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  ]

  const handleLanguageSelect = (languageCode) => {
    i18n.changeLanguage(languageCode)
    localStorage.setItem('jan-sahayak-language', languageCode)
    navigate('/home')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-saffron via-warmGold to-deepGreen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Logo and Title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            जन-सहायक
          </h1>
          <p className="text-xl md:text-2xl text-cream font-semibold">
            Jan-Sahayak
          </p>
          <p className="text-lg text-white mt-2 opacity-90">
            Your Welfare Companion | आपका कल्याण साथी
          </p>
        </div>

        {/* Language Selection Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-center text-textDark mb-3">
            Select Your Language
          </h2>
          <div className="text-center text-gray-600 mb-8 space-y-1">
            <p className="lang-hi">अपनी भाषा चुनें</p>
            <p className="lang-bn">আপনার ভাষা নির্বাচন করুন</p>
            <p className="lang-gu">તમારી ભાષા પસંદ કરો</p>
            <p className="lang-kn">ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ</p>
          </div>

          {/* Language Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageSelect(language.code)}
                className="group relative bg-gradient-to-br from-cream to-white border-2 border-gray-200 rounded-xl p-6 hover:border-saffron hover:shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-saffron focus:ring-opacity-50"
              >
                {/* Flag Emoji */}
                <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {language.flag}
                </div>
                
                {/* Native Name */}
                <div className={`text-2xl font-bold text-textDark mb-1 ${
                  language.code !== 'en' ? `lang-${language.code}` : ''
                }`}>
                  {language.nativeName}
                </div>
                
                {/* English Name */}
                <div className="text-sm text-gray-600">
                  {language.name}
                </div>

                {/* Hover Effect Indicator */}
                <div className="absolute inset-0 bg-saffron opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300"></div>
              </button>
            ))}
          </div>

          {/* Info Text */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              🔒 Your language preference will be saved for future visits
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-8 text-white">
          <p className="text-sm opacity-90">
            Accessible via WhatsApp & Toll-Free Number
          </p>
          <p className="text-xs opacity-75 mt-2">
            Supporting Disability, Women, Health, Education & Agriculture Sectors
          </p>
        </div>
      </div>
    </div>
  )
}

export default LanguageSelectionPage
