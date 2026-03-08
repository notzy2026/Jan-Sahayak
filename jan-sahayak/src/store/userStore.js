import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useUserStore = create(persist(
  (set, get) => ({
    // User profile answers
    answers: {
      state: null,        // "UP" | "MP" | etc.
      occupation: null,   // "farmer" | "worker" | etc.
      income: null,       // "below1L" | "1to3L" | "above3L"
      land: null,         // "0" | "1bigha" | "2hectare" | "5plus"
      age: null,          // number
      familySize: null,   // number
    },

    // Conversation state
    currentStep: 1,
    isComplete: false,

    // Matched schemes (set after API call or mock matching)
    matchedSchemes: [],

    // Applications
    applications: [],

    // UI state
    selectedLanguage: 'hi',
    avatarState: 'idle',

    // ── Actions ──────────────────────────────────────────────────────────────

    setAnswer: (key, value) => set((state) => ({
      answers: { ...state.answers, [key]: value }
    })),

    nextStep: () => set((state) => {
      const next = state.currentStep + 1
      return { currentStep: next, isComplete: next > 5 }
    }),

    prevStep: () => set((state) => ({
      currentStep: Math.max(1, state.currentStep - 1)
    })),

    setMatchedSchemes: (schemes) => set({ matchedSchemes: schemes }),

    addApplication: (app) => set((state) => ({
      applications: [...state.applications, app]
    })),

    setLanguage: (lang) => set({ selectedLanguage: lang }),

    setAvatarState: (avatarState) => set({ avatarState }),

    resetAll: () => set({
      answers: { state: null, occupation: null, income: null, land: null, age: null, familySize: null },
      currentStep: 1,
      isComplete: false,
      matchedSchemes: [],
    }),
  }),
  { name: 'jan-sahayak-storage' }
))

export default useUserStore
