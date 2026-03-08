import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import LanguageSelectionPage from './pages/LanguageSelectionPage'
import Landing from './pages/Landing'
import HomePage from './pages/HomePage'
import Questions from './pages/Questions'
import ConversationPage from './pages/ConversationPage'
import Results from './pages/Results'
import ApplyFlow from './pages/ApplyFlow'
import Status from './pages/Status'
import LanguageBar from './components/LanguageBar/LanguageBar'
import FontSizeToggle from './components/FontSizeToggle/FontSizeToggle'
import useUserStore from './store/userStore'
import { RAMU_DEMO } from './data/demoFlow'

// ── Error Boundary ──────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, info) {
    console.error('[Jan-Sahayak] Caught render error:', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, textAlign: 'center', fontFamily: 'sans-serif' }}>
          <div style={{ fontSize: 48 }}>🔧</div>
          <h2 style={{ color: '#FF6B00', marginBottom: 8 }}>Oops! Something went wrong.</h2>
          <p style={{ color: '#666', marginBottom: 16 }}>{this.state.error?.message}</p>
          <button
            onClick={() => { this.setState({ hasError: false }); window.location.href = '/landing' }}
            style={{ padding: '12px 24px', background: '#FF6B00', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 700 }}
          >
            🏠 Go to Home
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

// Inner component to handle routes that need location
const AppRoutes = () => {
  const location = useLocation()
  const hasSelectedLanguage = localStorage.getItem('jan-sahayak-language')

  const {
    answers: { state, occupation, income, land, age, familySize },
    setAnswer
  } = useUserStore()

  // Google Analytics Page View Tracking
  useEffect(() => {
    // Simulated Event Tracking - In real app, push to window.dataLayer
    console.log(`[GA Event] page_view: ${location.pathname}`);
  }, [location]);

  // Check if we have answers for the results page (used for display only, no longer a redirect guard)
  const hasAnswers = state && occupation && age

  return (
    <TransitionGroup className="page-transition-group h-full w-full relative">
      <CSSTransition key={location.pathname} classNames="page" timeout={300}>
        <div className="absolute w-full h-full pb-20"> {/* pb-20 to ensure content doesn't hide behind fixed bottom nav */}
          <Routes location={location}>
            <Route
              path="/"
              element={<Navigate to="/landing" replace />}
            />
            <Route path="/landing" element={<Landing />} />
            <Route path="/home" element={<HomePage />} />
            
            {/* Questions flow */}
            <Route 
              path="/questions" 
              element={hasSelectedLanguage ? <Questions /> : <Navigate to="/" replace />} 
            />
            
            <Route path="/conversation" element={<ConversationPage />} />
            
            <Route 
              path="/results" 
              element={<Results />} 
            />
            
            <Route path="/apply/:schemeId" element={<ApplyFlow />} />
            <Route path="/status" element={<Status />} />
          </Routes>
        </div>
      </CSSTransition>
    </TransitionGroup>
  )
}

function App() {
  const { i18n, t } = useTranslation()
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [highContrast, setHighContrast] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const { setAnswer } = useUserStore()

  // Activate Demo Mode
  const toggleDemoMode = () => {
    const newMode = !isDemoMode;
    setIsDemoMode(newMode);
    
    if (newMode) {
      // Pre-fill RAMU's data
      Object.entries(RAMU_DEMO.answers).forEach(([key, value]) => {
        setAnswer(key, value);
      });
      // In a real flow, you might want to immediately navigate
      // but simply pre-filling is enough to show off the system traversing fields rapidly
      console.log("[Demo Mode] Enabled. Data pre-filled for Ramu.");
    }
  }

  useEffect(() => {
    if (highContrast) {
      document.body.classList.add('high-contrast')
    } else {
      document.body.classList.remove('high-contrast')
    }
  }, [highContrast])

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <Router>
      <div className={`min-h-screen flex flex-col font-sans text-textDark ${i18n.language !== 'en' ? `lang-${i18n.language}` : ''}`}>
        
        {isOffline && (
          <div className="fixed top-0 left-0 right-0 z-[60] bg-amber-500 text-white text-center py-2 text-sm font-medium shadow-md">
            आप ऑफलाइन हैं। कुछ सुविधाएं सीमित हो सकती हैं।
          </div>
        )}

        <FontSizeToggle />

        {/* Global LanguageBar always visible */}
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center pointer-events-none p-2">
          <div className="pointer-events-auto flex gap-2 items-center">
            <LanguageBar />
            {isDemoMode && (
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded shadow animate-pulse">
                Demo Mode
              </span>
            )}
          </div>
          <div className="pointer-events-auto flex items-center gap-2">
            <button 
              onClick={toggleDemoMode}
              className={`p-2 rounded-full shadow-md text-xl transition-colors ${isDemoMode ? 'bg-amber-100' : 'bg-white'}`}
              aria-label="Toggle Demo Mode"
            >
              🎬
            </button>
            <button 
              onClick={() => setHighContrast(!highContrast)} 
              className="bg-white p-2 rounded-full shadow-md text-xl"
              aria-label={t('a11y.highContrast', { defaultValue: 'Toggle High Contrast' })}
              aria-pressed={highContrast}
            >
              👁️
            </button>
          </div>
        </div>

        {/* Global Layout Wrapper with Content Area */}
        <div className="flex-1 w-full pt-16 relative overflow-x-hidden">
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
        </div>

        {/* Bottom Nav Appears Here (Mobile Only) */}
        {/* Replace with your bottom nav component if separated */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-3 flex justify-around shadow-md z-50">
           <a href="/home" className="flex flex-col items-center gap-1" aria-label={t('nav.home', { defaultValue: 'Home' })}>
             <span className="text-xl">🏠</span>
             <span className="text-xs text-saffron font-semibold">Home</span>
           </a>
           <a href="/apply/some-id" className="flex flex-col items-center gap-1 opacity-60" aria-label={t('nav.apply', { defaultValue: 'Apply for scheme' })}>
             <span className="text-xl">📋</span>
             <span className="text-xs">Apply</span>
           </a>
           <a href="/status" className="flex flex-col items-center gap-1 opacity-60" aria-label={t('nav.status', { defaultValue: 'Application Status' })}>
             <span className="text-xl">📊</span>
             <span className="text-xs">Status</span>
           </a>
        </div>
        
      </div>
    </Router>
  )
}

export default App
