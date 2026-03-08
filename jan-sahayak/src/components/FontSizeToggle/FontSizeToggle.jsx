import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const FONT_SIZES = [
  { label: 'A-', value: '14px' },
  { label: 'A', value: '18px' }, // Default
  { label: 'A+', value: '22px' },
  { label: 'A++', value: '26px' }
];

const FontSizeToggle = () => {
  const { t } = useTranslation();
  const [currentSize, setCurrentSize] = useState(() => {
    return localStorage.getItem('jan-sahayak-fontsize') || '18px';
  });

  useEffect(() => {
    document.documentElement.style.setProperty('--font-size-base', currentSize);
    localStorage.setItem('jan-sahayak-fontsize', currentSize);
  }, [currentSize]);

  return (
    <div className="fixed top-2 right-2 z-[70] flex bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {FONT_SIZES.map((size) => (
        <button
          key={size.label}
          onClick={() => setCurrentSize(size.value)}
          className={`px-3 py-2 text-sm font-medium border-r border-gray-200 last:border-r-0 transition-colors
            ${currentSize === size.value ? 'bg-saffron text-white' : 'text-gray-700 hover:bg-gray-100'}
          `}
          aria-label={t('a11y.fontSize', { size: size.label, defaultValue: `Font size ${size.label}` })}
          aria-pressed={currentSize === size.value}
        >
          {size.label}
        </button>
      ))}
    </div>
  );
};

export default FontSizeToggle;
