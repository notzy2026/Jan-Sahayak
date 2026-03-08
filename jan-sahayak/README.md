# Jan-Sahayak - Voice-First Welfare Assistant

A multilingual React application for discovering welfare schemes and generating application forms.

## Tech Stack

- **React 18** with Vite
- **Tailwind CSS v3** for styling
- **React Router DOM v6** for routing
- **react-i18next + i18next** for multilingual support (English, Hindi, Gujarati, Kannada, Bengali)
- **Zustand** for state management
- **@lottiefiles/react-lottie-player** for avatar animations
- **pdf-lib + @pdf-lib/fontkit** for PDF generation
- **Axios** for API calls

## Folder Structure

```
jan-sahayak/
├── src/
│   ├── pages/              # Page components
│   ├── components/         # Reusable components
│   ├── i18n/              # Internationalization
│   │   └── locales/       # Language JSON files (en, hi, gu, kn, bn)
│   ├── store/             # Zustand state management
│   └── utils/             # Utility functions
├── public/                # Static assets
└── ...config files
```

## Supported Languages

1. English (en)
2. Hindi (hi) - हिंदी
3. Gujarati (gu) - ગુજરાતી
4. Kannada (kn) - ಕನ್ನಡ
5. Bengali (bn) - বাংলা

## Custom Colors (Tailwind)

- **saffron**: #FF6B00
- **cream**: #FFF8F0
- **deepGreen**: #1A6B3A
- **warmGold**: #E8A020
- **textDark**: #1A1A1A

## Fonts

Using Noto Sans family from Google Fonts for multilingual support:
- Noto Sans (default)
- Noto Sans Devanagari (Hindi)
- Noto Sans Gujarati
- Noto Sans Kannada
- Noto Sans Bengali

## Installation

```bash
cd jan-sahayak
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Features

- Voice-first interface
- Multi-sector welfare scheme discovery (Disability, Women, Health, Education, Agriculture)
- Multilingual support with automatic language detection
- PDF form generation
- Responsive design
- Accessibility compliant
