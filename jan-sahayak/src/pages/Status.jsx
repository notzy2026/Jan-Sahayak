import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import LanguageBar from '../components/LanguageBar/LanguageBar'
import AnimatedAvatar from '../components/Avatar/AnimatedAvatar'
import useUserStore from '../store/userStore'

// ── Status config ──────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  applied: {
    label_hi: 'आवेदन किया',
    label_en: 'Applied',
    dot: '#F59E0B',
    bg: '#FEF3C7',
    text: '#92400E',
  },
  review: {
    label_hi: 'समीक्षा हो रही है',
    label_en: 'Under Review',
    dot: '#3B82F6',
    bg: '#DBEAFE',
    text: '#1E40AF',
  },
  approved: {
    label_hi: 'स्वीकृत',
    label_en: 'Approved',
    dot: '#22C55E',
    bg: '#DCFCE7',
    text: '#166534',
  },
  received: {
    label_hi: 'राशि मिल गई ✅',
    label_en: 'Amount Received ✅',
    dot: '#16A34A',
    bg: '#BBF7D0',
    text: '#14532D',
    celebrate: true,
  },
  rejected: {
    label_hi: 'अस्वीकार',
    label_en: 'Rejected',
    dot: '#EF4444',
    bg: '#FEE2E2',
    text: '#991B1B',
    showAppeal: true,
  },
}

// ── Upcoming deadlines (static for demo) ──────────────────────────────────────
const DEADLINES = [
  {
    id: 'd1',
    icon: '🌾',
    title_hi: 'PMFBY खरीफ नामांकन की अंतिम तिथि',
    title_en: 'PMFBY Kharif Enrollment Deadline',
    date: '31 जुलाई 2026',
    daysLeft: 145,
  },
  {
    id: 'd2',
    icon: '💰',
    title_hi: 'पीएम-किसान अगली किस्त',
    title_en: 'PM-KISAN Next Installment',
    date: '30 अप्रैल 2026',
    daysLeft: 53,
  },
  {
    id: 'd3',
    icon: '🏥',
    title_hi: 'आयुष्मान कार्ड नवीनीकरण',
    title_en: 'Ayushman Card Renewal',
    date: '15 अप्रैल 2026',
    daysLeft: 38,
  },
]

// ── Application Card ──────────────────────────────────────────────────────────
const AppCard = ({ app, lang }) => {
  const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.applied
  const name = lang === 'hi' ? app.schemeName_hi : app.schemeName_en
  const statusLabel = lang === 'hi' ? cfg.label_hi : cfg.label_en

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 20,
        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
        padding: 18,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        borderLeft: `4px solid ${cfg.dot}`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Celebration shimmer for received */}
      {cfg.celebrate && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, #BBF7D022 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />
      )}

      {/* Top row: icon + name + status badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 28, flexShrink: 0 }}>{app.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 700, fontSize: 15, color: '#1F2937', margin: 0, lineHeight: 1.3 }}>
            {name}
          </p>
          <p style={{ fontSize: 12, color: '#6B7280', margin: '2px 0 0', fontWeight: 600 }}>
            {app.benefit}
          </p>
        </div>
        {/* Status badge */}
        <span style={{
          flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: 5,
          backgroundColor: cfg.bg, color: cfg.text,
          fontSize: 11, fontWeight: 700,
          padding: '4px 10px', borderRadius: 999,
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            backgroundColor: cfg.dot, flexShrink: 0,
            ...(app.status === 'review' ? { animation: 'pulse 1.5s infinite' } : {}),
          }} />
          {statusLabel}
        </span>
      </div>

      {/* Date row */}
      <div style={{ display: 'flex', gap: 20 }}>
        <div>
          <p style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, margin: 0, textTransform: 'uppercase' }}>
            आवेदन तिथि
          </p>
          <p style={{ fontSize: 13, color: '#374151', fontWeight: 600, margin: '2px 0 0' }}>
            {new Date(app.dateApplied).toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
        <div>
          <p style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, margin: 0, textTransform: 'uppercase' }}>
            अंतिम अपडेट
          </p>
          <p style={{ fontSize: 13, color: '#374151', fontWeight: 600, margin: '2px 0 0' }}>
            {new Date(app.lastUpdated).toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <p style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, margin: 0 }}>REF</p>
          <p style={{ fontSize: 11, color: '#6B7280', fontWeight: 700, margin: '2px 0 0', letterSpacing: 1 }}>
            {app.refNo}
          </p>
        </div>
      </div>

      {/* Rejected: appeal option */}
      {cfg.showAppeal && (
        <button style={{
          padding: '8px 16px', borderRadius: 12,
          background: '#FEE2E2', border: '1.5px solid #FCA5A5',
          color: '#991B1B', fontSize: 12, fontWeight: 700,
          cursor: 'pointer', alignSelf: 'flex-start',
        }}>
          📋 अपील करें (File Appeal)
        </button>
      )}

      {/* Received: celebration message */}
      {cfg.celebrate && (
        <div style={{
          background: '#F0FDF4', borderRadius: 12, padding: '8px 14px',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 20 }}>🎉</span>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#166534' }}>
            बधाई हो! राशि आपके बैंक खाते में जमा हो गई है।
          </p>
        </div>
      )}
    </div>
  )
}

// ── Empty State ────────────────────────────────────────────────────────────────
const EmptyState = ({ navigate }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 20, padding: '40px 24px', textAlign: 'center',
  }}>
    <span style={{ fontSize: 80 }}>🧑‍🌾</span>
    <div>
      <p style={{ fontSize: 18, fontWeight: 700, color: '#374151', margin: 0, lineHeight: 1.4 }}>
        अभी तक कोई आवेदन नहीं।
      </p>
      <p style={{ fontSize: 14, color: '#9CA3AF', margin: '6px 0 0' }}>
        नीचे से शुरू करें।
      </p>
    </div>
    <button
      onClick={() => navigate('/')}
      style={{
        padding: '14px 40px', borderRadius: 999,
        background: '#FF6B00', color: '#fff',
        fontSize: 16, fontWeight: 800, border: 'none',
        cursor: 'pointer', boxShadow: '0 4px 20px rgba(255,107,0,0.4)',
      }}
    >
      🔍 योजनाएं खोजें
    </button>
  </div>
)

// ── Deadline Card ─────────────────────────────────────────────────────────────
const DeadlineItem = ({ item, lang }) => {
  const title = lang === 'hi' ? item.title_hi : item.title_en
  const urgent = item.daysLeft < 45

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '12px 0',
      borderBottom: '1px solid #F3F4F6',
    }}>
      <span style={{ fontSize: 24, flexShrink: 0 }}>{item.icon}</span>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1F2937', lineHeight: 1.3 }}>
          {title}
        </p>
        <p style={{ margin: '3px 0 0', fontSize: 12, color: '#6B7280' }}>📅 {item.date}</p>
      </div>
      <div style={{
        flexShrink: 0, textAlign: 'center',
        background: urgent ? '#FEF3C7' : '#F3F4F6',
        borderRadius: 10, padding: '4px 10px',
      }}>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: urgent ? '#92400E' : '#6B7280' }}>
          {item.daysLeft}d
        </p>
        <p style={{ margin: 0, fontSize: 9, color: '#9CA3AF', fontWeight: 600 }}>LEFT</p>
      </div>
      <span style={{ fontSize: 20, cursor: 'pointer' }} title="Set reminder">🔔</span>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Status Page
// ═══════════════════════════════════════════════════════════════════════════════
const Status = () => {
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const { applications } = useUserStore()
  const lang = i18n.language

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF8F0 0%, #ffffff 50%, #F0FDF4 100%)',
      display: 'flex', flexDirection: 'column',
    }}>


      <main style={{
        flex: 1, maxWidth: 600, margin: '0 auto', width: '100%',
        padding: '80px 16px 40px',
        display: 'flex', flexDirection: 'column', gap: 24,
      }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <AnimatedAvatar state="idle" size={120} showControls={false} />
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#1F2937' }}>
              मेरे आवेदन
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>
              My Applications
            </p>
            <p style={{ margin: '6px 0 0', fontSize: 13, fontWeight: 700, color: '#FF6B00' }}>
              {applications.length} सक्रिय आवेदन
            </p>
          </div>
        </div>

        {/* ── Application Cards or Empty State ── */}
        {applications.length === 0 ? (
          <EmptyState navigate={navigate} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {applications.map((app) => (
              <AppCard key={app.id} app={app} lang={lang} />
            ))}
          </div>
        )}

        {/* ── Proactive Alerts: Upcoming Deadlines ── */}
        <div style={{
          background: '#fff',
          borderRadius: 20,
          boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
          padding: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 22 }}>⏰</span>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#1F2937' }}>
                जल्द आने वाली समय सीमाएं
              </h2>
              <p style={{ margin: 0, fontSize: 11, color: '#9CA3AF' }}>Upcoming Deadlines</p>
            </div>
          </div>

          {DEADLINES.map((d) => (
            <DeadlineItem key={d.id} item={d} lang={lang} />
          ))}
        </div>

        {/* Find more schemes */}
        <button
          onClick={() => navigate('/results')}
          style={{
            width: '100%', padding: '14px', borderRadius: 16,
            background: '#FF6B00', color: '#fff',
            fontSize: 15, fontWeight: 800, border: 'none',
            cursor: 'pointer', boxShadow: '0 4px 20px rgba(255,107,0,0.35)',
          }}
        >
          🔍 और योजनाएं खोजें
        </button>
      </main>
    </div>
  )
}

export default Status
