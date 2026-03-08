import React from 'react';
import { useTranslation } from 'react-i18next';

// Note: Ensure `schemes` prop matches the array format returned by `eligibilityMatcher`
const WhatsAppShare = ({ schemes }) => {
  const { t } = useTranslation();

  const handleShare = () => {
    let messageText = "जन-सहायक ने पाया कि आप इन योजनाओं के लिए योग्य हैं:\n";
    
    // Add specific high-impact schemes and their exact benefits from the database
    schemes.forEach((scheme, index) => {
      // Only share top 3 schemes if array is large
      if (index < 3) {
        messageText += `✅ ${scheme.name_en || scheme.id}: ${scheme.benefit}\n`;
      }
    });

    // Append helpline or link (Hardcoded demo PM-KISAN, or dynamic if PM-KISAN exists)
    const pmKisan = schemes.find(s => s.id === 'PM-KISAN');
    if (pmKisan) {
        messageText += `📞 ${pmKisan.id} Helpline: ${pmKisan.helpline}\n`;
    }

    messageText += "\njansahayak.in\n";

    const encodedMessage = encodeURIComponent(messageText);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <button 
      onClick={handleShare}
      className="btn-secondary flex items-center gap-2 justify-center w-full"
      aria-label={t('share.whatsapp', { defaultValue: 'Share on WhatsApp' })}
    >
      <span className="text-xl leading-none">💬</span> 
      <span className="font-semibold">{t('share.buttonText', { defaultValue: 'Share on WhatsApp' })}</span>
    </button>
  );
};

export default WhatsAppShare;
