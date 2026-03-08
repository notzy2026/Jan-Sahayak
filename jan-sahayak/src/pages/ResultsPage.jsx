import React from 'react'
import { useTranslation } from 'react-i18next'
import LanguageBar from '../components/LanguageBar/LanguageBar'

const ResultsPage = () => {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream">
      {/* Language Bar */}

      
      {/* Main Content - with padding-top to account for fixed LanguageBar */}
      <div className="pt-20 p-8">
        <h1 className="text-3xl font-bold mb-6">Results</h1>
        <div className="card">
          <p>Your eligible schemes will appear here</p>
        </div>
      </div>
    </div>
  )
}

export default ResultsPage
