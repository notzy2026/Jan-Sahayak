import React from 'react'
import { useTranslation } from 'react-i18next'

const LanguageBar = () => {
  const { i18n } = useTranslation()

  // Font size configuration
  const fontSizes = [
    { label: 'A-', value: '16px', name: 'Small' },
    { label: 'A', value: '18px', name: 'Medium' },
    { label: 'A+', value: '22px', name: 'Large' },
    { label: 'A++', value: '26px', name: 'Extra Large' },
  ]
  
  // Initialize font size from localStorage or default to 18px (Medium)
  const [currentFontSize, setCurrentFontSize] = React.useState(
    localStorage.getItem('jan-sahayak-fontsize') || '18px'
  )

  React.useEffect(() => {
    document.documentElement.style.setProperty('--font-size-base', currentFontSize)
  }, [currentFontSize])

  const handleFontSizeChange = (size) => {
    setCurrentFontSize(size)
    localStorage.setItem('jan-sahayak-fontsize', size)
    document.documentElement.style.setProperty('--font-size-base', size)
  }

  const languages = [
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },
    { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
    { code: 'bn', name: 'বাংলা', flag: '🇮🇳' },
    { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
    { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
    { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { code: 'ml', name: 'മലയാളം', flag: '🇮🇳' },
    { code: 'or', name: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
  ]

  const handleLanguageChange = (code) => {
    i18n.changeLanguage(code)
    localStorage.setItem('jan-sahayak-language', code)
  }

  return (
    <div className="bg-white shadow-md w-full">
      {/* Top row: Font Size Accessibility Toggle */}
      <div className="flex justify-end items-center px-4 py-1 border-b border-gray-100 bg-gray-50 text-xs">
        <span className="mr-2 text-gray-500 font-medium">Text Size:</span>
        <div className="flex gap-1 bg-white rounded flex-wrap">
          {fontSizes.map((fs) => (
            <button
              key={fs.label}
              onClick={() => handleFontSizeChange(fs.value)}
              className={`px-2 py-1 font-bold rounded transition-colors ${
                currentFontSize === fs.value
                  ? 'bg-saffron text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title={fs.name}
            >
              {fs.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom row: Language Selection */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 px-4 py-2 min-w-max items-center">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-full font-semibold text-sm
                transition-all duration-300 whitespace-nowrap
                ${
                  i18n.language === language.code
                    ? 'bg-saffron text-white shadow-md'
                    : 'bg-gray-100 text-textDark hover:bg-gray-200'
                }
                ${language.code !== 'en' ? `lang-${language.code}` : ''}
              `}
            >
              <span>{language.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LanguageBar
