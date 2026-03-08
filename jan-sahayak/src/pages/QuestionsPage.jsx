import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import LanguageBar from '../components/LanguageBar/LanguageBar'
import AnimatedAvatar from '../components/Avatar/AnimatedAvatar'
import ProgressDots from '../components/ProgressDots/ProgressDots'

const QuestionsPage = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [avatarState, setAvatarState] = useState('greeting')
  const [currentText, setCurrentText] = useState('')
  const [answers, setAnswers] = useState({
    state: '',
    occupation: '',
    income: '',
    land: '',
    age: '',
    members: ''
  })

  // Progress labels
  const progressLabels = [
    t('questions.step1Label') || 'Location',
    t('questions.step2Label') || 'Work',
    t('questions.step3Label') || 'Income',
    t('questions.step4Label') || 'Land',
    t('questions.step5Label') || 'Family'
  ]

  // Speak question when step changes or language changes
  useEffect(() => {
    const questionKey = `questions.q${currentStep}.question`
    const questionText = t(questionKey)
    
    setCurrentText(questionText)
    setAvatarState('speaking')
  }, [currentStep, t, i18n.language])

  // Handle avatar click to repeat question
  const handleAvatarClick = () => {
    const questionKey = `questions.q${currentStep}.question`
    const questionText = t(questionKey)
    
    setCurrentText(questionText)
    setAvatarState('speaking')
  }

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
      setAvatarState('happy')
      setTimeout(() => setAvatarState('speaking'), 500)
    } else {
      // Navigate to results
      setAvatarState('happy')
      setCurrentText(t('questions.loading'))
      setTimeout(() => {
        navigate('/results', { state: { answers } })
      }, 2000)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderQuestion = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <input
              type="text"
              placeholder={t('questions.q1.placeholder') || 'Enter your state'}
              value={answers.state}
              onChange={(e) => setAnswers({ ...answers, state: e.target.value })}
              className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-saffron focus:outline-none transition-colors"
            />
          </div>
        )

      case 2:
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['farmer', 'worker', 'student', 'business', 'women', 'disabled', 'pensioner', 'other'].map((option) => (
              <button
                key={option}
                onClick={() => setAnswers({ ...answers, occupation: option })}
                className={`px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
                  answers.occupation === option
                    ? 'bg-saffron text-white scale-105 shadow-lg'
                    : 'bg-white border-2 border-gray-300 hover:border-saffron'
                }`}
              >
                {t(`questions.q2.${option}`)}
              </button>
            ))}
          </div>
        )

      case 3:
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['lt1', '1to3', 'gt3'].map((option) => (
              <button
                key={option}
                onClick={() => setAnswers({ ...answers, income: option })}
                className={`px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
                  answers.income === option
                    ? 'bg-saffron text-white scale-105 shadow-lg'
                    : 'bg-white border-2 border-gray-300 hover:border-saffron'
                }`}
              >
                {t(`questions.q3.${option}`)}
              </button>
            ))}
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <input
              type="number"
              placeholder={t('questions.q4.label')}
              value={answers.land}
              onChange={(e) => setAnswers({ ...answers, land: e.target.value })}
              className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-saffron focus:outline-none transition-colors"
            />
          </div>
        )

      case 5:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                {t('questions.q5.age')}
              </label>
              <input
                type="number"
                placeholder="25"
                value={answers.age}
                onChange={(e) => setAnswers({ ...answers, age: e.target.value })}
                className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-saffron focus:outline-none transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                {t('questions.q5.members')}
              </label>
              <input
                type="number"
                placeholder="4"
                value={answers.members}
                onChange={(e) => setAnswers({ ...answers, members: e.target.value })}
                className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-saffron focus:outline-none transition-colors"
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return answers.state.trim() !== ''
      case 2:
        return answers.occupation !== ''
      case 3:
        return answers.income !== ''
      case 4:
        return answers.land.trim() !== ''
      case 5:
        return answers.age.trim() !== '' && answers.members.trim() !== ''
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream">
      {/* Language Bar */}


      {/* Progress Dots - Fixed below LanguageBar */}
      <div className="fixed top-16 left-0 right-0 bg-white/80 backdrop-blur-sm shadow-sm z-40">
        <ProgressDots 
          currentStep={currentStep} 
          totalSteps={5} 
          labels={progressLabels}
        />
      </div>

      {/* Main Content */}
      <div className="pt-40 pb-20 px-4 md:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Avatar - Clickable to repeat question */}
          <div 
            onClick={handleAvatarClick}
            className="cursor-pointer hover:scale-105 transition-transform duration-300"
          >
            <AnimatedAvatar
              state={avatarState}
              currentText={currentText}
              size={280}
              autoSpeak={true}
              onSpeakingEnd={() => setAvatarState('confused')}
            />
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
            {/* Question Text */}
            <h2 className={`text-2xl md:text-3xl font-bold text-center text-gray-800 ${
              i18n.language !== 'en' ? `lang-${i18n.language}` : ''
            }`}>
              {t(`questions.q${currentStep}.question`)}
            </h2>

            {/* Question Input/Options */}
            <div className="py-4">
              {renderQuestion()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-6">
              <button
                onClick={handleBack}
                disabled={currentStep === 1}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  currentStep === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white border-2 border-gray-300 hover:border-saffron hover:scale-105'
                }`}
              >
                {t('questions.back')}
              </button>

              <button
                onClick={handleNext}
                disabled={!isStepValid()}
                className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  isStepValid()
                    ? 'bg-saffron text-white hover:scale-105 shadow-lg'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {currentStep === 5 ? t('questions.q5.submit') : t('questions.next')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuestionsPage
