import React from 'react'

const ProgressDots = ({ currentStep = 1, totalSteps = 5, labels = [] }) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      {/* Progress Dots Container */}
      <div className="flex items-center justify-between relative">
        {/* Connecting Line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 -z-10" />
        
        {/* Progress Fill Line */}
        <div 
          className="absolute top-1/2 left-0 h-1 bg-saffron -translate-y-1/2 -z-10 transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />

        {/* Dots */}
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep
          const isUpcoming = stepNumber > currentStep

          return (
            <div key={stepNumber} className="flex flex-col items-center gap-2 relative z-10">
              {/* Circle */}
              <div
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300
                  ${isCompleted ? 'bg-saffron text-white scale-100 animate-scale-bounce' : ''}
                  ${isCurrent ? 'border-4 border-saffron bg-white text-saffron' : ''}
                  ${isUpcoming ? 'border-2 border-gray-300 bg-white text-gray-400' : ''}
                `}
              >
                {isCompleted ? (
                  <span className="text-2xl">✓</span>
                ) : isCurrent ? (
                  <div className="relative">
                    <span>{stepNumber}</span>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-2 bg-saffron rounded-full animate-ping" />
                    </div>
                  </div>
                ) : (
                  <span>{stepNumber}</span>
                )}
              </div>

              {/* Label - Hidden on mobile, shown on desktop */}
              {labels[index] && (
                <span className="hidden md:block text-xs text-gray-600 text-center max-w-20 leading-tight">
                  {labels[index]}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ProgressDots
