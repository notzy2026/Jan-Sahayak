# Jan-Sahayak: System Design Document
## Voice-First Welfare Platform for Rural India

**Version:** 1.0  
**Date:** February 2026  
**Document Type:** System Design Specification

---

## 📋 Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [Solution Overview](#2-solution-overview)
3. [System Architecture](#3-system-architecture)
4. [Complete User Workflow](#4-complete-user-workflow)
5. [Core Components Design](#5-core-components-design)
6. [Implementation Guide](#6-implementation-guide)

---

## 1. Problem Statement

### 1.1 The "Last-Mile" Welfare Gap

India has **500+ welfare schemes** but a massive **75% utilization gap**:

**Core Problems:**
1. **Information Fragmentation** - Schemes scattered across 50+ portals
2. **Language Barriers** - 22+ languages, low digital literacy
3. **Middleman Exploitation** - ₹500-1000 paid just to check eligibility
4. **Application Complexity** - 20-50 field forms in bureaucratic language
5. **Resource Discovery Gap** - Don't know WHERE to go, WHO to call, HOW to apply

**Impact:**
- 800M potential beneficiaries, only 200M (25%) actually benefit
- ₹10,000 Crores/year lost to middlemen
- 10-15 days wasted per application

---

## 2. Solution Overview

### 2.1 Vision

**"Empower every rural Indian to access welfare benefits without intermediaries, in their own language, at zero cost."**

### 2.2 Key Innovation: Complete User Journey

```
Traditional → Show scheme list → User figures out rest

Jan-Sahayak → Problem understanding → Scheme discovery → 
              Resource provision → Application support → 
              Tracking → Complaint resolution
```

**What We Provide:**
1. ✅ Voice-first interface (22+ languages + dialects)
2. ✅ Scheme discovery + eligibility check
3. ✅ **Nearby MP Online centers** (location-based)
4. ✅ **Toll-free helpline numbers** (scheme-specific)
5. ✅ **YouTube video tutorials** (step-by-step guides)
6. ✅ Conversational form filling + PDF generation
7. ✅ **Complaint & support system** (AI + human agents)

---

## 3. System Architecture

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│           USER CHANNELS                                 │
│  WhatsApp | Mobile App | IVRS | Web Portal             │
└────────────────────┬────────────────────────────────────┘
                     │
          ┌──────────▼──────────┐
          │   API Gateway       │
          │  (Auth + Rate Limit)│
          └──────────┬──────────┘
                     │
       ┌─────────────┼─────────────┐
       │             │             │
   ┌───▼───┐    ┌───▼───┐    ┌───▼────┐
   │Voice  │    │Business│   │Resource│
   │Process│    │ Logic  │   │Discovery│
   └───┬───┘    └───┬───┘    └───┬────┘
       │            │            │
       └────────────┼────────────┘
                    │
       ┌────────────┼────────────┬──────────┐
       │            │            │          │
   ┌───▼──┐    ┌───▼──┐    ┌───▼──┐   ┌──▼──┐
   │ AI   │    │Data  │    │Centers│  │Support│
   │Services│  │Layer │    │Videos │  │System│
   └──────┘    └──────┘    └───────┘  └──────┘
```

### 3.2 AWS Services Stack

**Voice:** Transcribe, Polly, Translate, Connect  
**AI/ML:** Bedrock (Claude), Lex, Textract  
**Compute:** Lambda, Step Functions  
**Storage:** S3, DynamoDB, RDS PostgreSQL, ElastiCache  
**Integration:** API Gateway, SNS, SQS, EventBridge  
**Security:** Cognito, KMS, WAF  

---

## 4. Complete User Workflow

### 4.1 The 8-Phase Journey

```
PHASE 1: PROBLEM IDENTIFICATION
═══════════════════════════════
User: "Meri fasal barish me kharab ho gayi"
      (My crop was damaged by rain)

System:
├─ Voice-to-Text (Transcribe)
├─ Language Detection
├─ Intent Recognition (Lex/Bedrock)
└─ Problem Classification
    ├─ Category: Agriculture
    ├─ Issue: Crop Damage
    └─ Urgency: High


PHASE 2: SCHEME DISCOVERY
═══════════════════════════════
System: "Aapke liye kuch yojnayen hain..."
        (There are schemes for you...)

Actions:
├─ Fetch User Profile (location, occupation, demographics)
├─ Query Scheme Database
│   ├─ Filter: Agriculture + MP/Central + Active
│   └─ Check eligibility
└─ AI Ranking (Claude)
    1. ★★★★★ PM Fasal Bima Yojana - ₹2000/acre
    2. ★★★★☆ MP Kisan Kalyan - ₹4000/year
    3. ★★★☆☆ Soil Health Card - Free


PHASE 3: SCHEME EXPLANATION
═══════════════════════════════
System (Voice): 
"Aap PM Fasal Bima ke liye eligible hain.
 Aapko ₹2000 per acre milenge.
 Total: ₹4000 (2 acres)
 
 Kya apply karna chahenge?"

User: "Haan, kaise karu?" (Yes, how?)


PHASE 4: RESOURCE DISCOVERY ⭐ NEW
═══════════════════════════════════
System provides THREE OPTIONS:

┌─────────────────────────────────────────┐
│ 1️⃣ ONLINE APPLICATION                   │
│    [Start Application]                  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 2️⃣ NEARBY OFFLINE CENTERS               │
│                                         │
│ 📍 Shri Ram MP Online                   │
│    Main Market, Sehore (2.3 km)        │
│    📞 +91-7567-XXXXXX                   │
│    [Get Directions] [Call Now]         │
│                                         │
│ 📍 Jan Seva Kendra                      │
│    Bus Stand, Sehore (3.1 km)          │
│    [Get Directions] [Call Now]         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 3️⃣ TOLL-FREE HELPLINES                  │
│                                         │
│ • PM Fasal Bima: 1800-180-1551 (24x7)  │
│ • Kisan Call: 1800-180-1551             │
│ • MP Agriculture: 1800-233-3663         │
│   [Call Now]                            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 4️⃣ VIDEO TUTORIALS                      │
│                                         │
│ 🎬 "PM Fasal Bima - Kaise Apply Karen"  │
│    Duration: 8:45 | Views: 2.3M        │
│    [▶️ Watch]                           │
│                                         │
│ 🎬 "Documents Required"                 │
│    Duration: 5:20                       │
│    [▶️ Watch]                           │
└─────────────────────────────────────────┘


PHASE 5: APPLICATION (If Online)
═══════════════════════════════════
Conversational Form Filling:

Q: "Aapka naam?" → [Auto-filled: Ramesh Kumar]
Q: "Pita ji ka naam?" → [Auto-filled: Shyam Lal]
Q: "Kitni zameen?" → User: "Do bigha"
Q: "Kaunsi fasal?" → User: "Gehun"
Q: "Aadhaar scan?" → [OCR + Auto-fill]
Q: "Bank passbook?" → [OCR + Auto-fill]


PHASE 6: PDF GENERATION
═══════════════════════════════════
System:
├─ Validate inputs
├─ Generate official PDF
├─ Add QR code
└─ Provide options:
    1. Submit online (DigiLocker)
    2. Download & print
    3. Submit at center


PHASE 7: TRACKING
═══════════════════════════════════
┌─────────────────────────────────────────┐
│ 📱 APPLICATION TRACKING                 │
│                                         │
│ Status: Submitted ✅                    │
│ App No: MP/2026/PMFBY/123456           │
│                                         │
│ Timeline:                               │
│ ✅ Submitted (15-Feb-2026)             │
│ ⏳ Under Review                        │
│ ⏳ Field Verification                  │
│ ⏳ Approval                            │
│ ⏳ Payment                             │
└─────────────────────────────────────────┘


PHASE 8: COMPLAINT & SUPPORT ⭐ NEW
═══════════════════════════════════════
If Issues Arise:

┌─────────────────────────────────────────┐
│ 🆘 NEED HELP?                          │
│                                         │
│ 1️⃣ AI Assistant                         │
│    [Chat] [Voice Support]               │
│                                         │
│ 2️⃣ File Complaint                       │
│    [Register Complaint]                 │
│                                         │
│ 3️⃣ Escalation Helpline                  │
│    📞 1800-XXX-XXXX (24x7)             │
│    [Call Now]                           │
│                                         │
│ 4️⃣ Scheme-Specific Helpline             │
│    [Call Scheme Support]                │
│                                         │
│ 5️⃣ Human Agent                          │
│    Wait Time: 5 min                     │
│    [Request Callback]                   │
└─────────────────────────────────────────┘

Complaint Tracking:
├─ ID: JAN/2026/COMP/789012
├─ Status: In Progress
├─ Assigned: Regional Officer
└─ Expected: 7 days
```

### 4.2 Workflow State Diagram

```
START → Language Select → Problem ID → Intent Parse
  ↓
Scheme Discovery
  ↓
┌────────┬─────────┬─────────┬────────┐
│Scheme  │Center   │Toll-Free│Video   │
│Details │Search   │Numbers  │Tutorial│
└───┬────┴────┬────┴────┬────┴───┬────┘
    │         │         │        │
    └─────────┴─────────┴────────┘
              ↓
    User Decision Point
              ↓
    ┌─────────┼─────────┐
    │         │         │
 Apply    Visit    Call/Watch
 Online   Center   
    │         │         │
    └─────────┴─────────┘
              ↓
    Form Fill → PDF → Submit → Track
              ↓
         Problem?
         ↙     ↘
    Success   Complaint
      END     System → Resolve → END
```

---

## 5. Core Components Design

### 5.1 Problem Identification Engine

```
Input: Voice/Text
  ↓
Language & Dialect Detection (Transcribe + Comprehend)
  ↓
Intent Extraction (Lex)
  - Domain: Agriculture
  - Urgency: High
  ↓
Entity Extraction (Bedrock)
  - Problem: Crop damage
  - Cause: Rain
  ↓
Output: Structured Problem Object
```

### 5.2 Scheme Matching Engine

```
Input: Problem + User Profile
  ↓
Database Query (RDS + OpenSearch)
  - Category filter
  - Location filter
  - Active schemes
  ↓
Eligibility Check (Rules Engine)
  For each scheme:
  ✓ Age, Income, Category, Location, Occupation
  Score: 0-100
  ↓
AI Ranking (Claude via Bedrock)
  Consider: Eligibility, Benefit, Complexity, Success Rate
  ↓
Output: Ranked Scheme List
```

### 5.3 Resource Discovery Engine ⭐ NEW

```
Component 1: Center Finder
  ├─ Input: User location (lat, lon)
  ├─ PostGIS spatial query (10km radius)
  ├─ Filter: Verified centers only
  ├─ Sort: By distance
  └─ Add: Directions URL, Call button

Component 2: Helpline Finder
  ├─ Fetch: Scheme-specific helplines
  ├─ Add: General helplines (Kisan Call Center)
  ├─ Include: Operating hours, languages
  └─ Priority: Toll-free first

Component 3: Video Tutorial Finder
  ├─ Query: YouTube by scheme + language
  ├─ Fetch: Views, likes, rating
  ├─ Filter: Verified channels only
  └─ Sort: By rating + views
```

### 5.4 Support System ⭐ NEW

```
Issue Reported
  ↓
AI Analysis (Bedrock)
  - Classify category
  - Determine priority
  - Check auto-resolvable
  ↓
┌─────────┬─────────┐
│Auto-Solve│ Create  │
│ (80%)    │ Ticket  │
└─────────┴────┬────┘
               ↓
       Ticket Routing
         - Assign agent
         - Set SLA
         - Notify user
               ↓
       Resolution
         - Agent works
         - AI suggestions
         - User updates
               ↓
       Escalate if SLA breach
```

### 5.5 Database Schemas

**Service Centers:**
```sql
CREATE TABLE service_centers (
    center_id SERIAL PRIMARY KEY,
    center_type VARCHAR(50), -- 'mp_online', 'jsk', 'csc'
    center_name VARCHAR(200),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    contact_number VARCHAR(20),
    operating_hours JSONB,
    verified BOOLEAN
);

-- Spatial index
CREATE INDEX idx_location ON service_centers 
USING GIST(ST_MakePoint(longitude, latitude)::geography);
```

**Helplines:**
```sql
CREATE TABLE helpline_numbers (
    helpline_id SERIAL PRIMARY KEY,
    name VARCHAR(200),
    number VARCHAR(20),
    is_toll_free BOOLEAN,
    scheme_id INTEGER,
    operating_hours JSONB,
    priority INTEGER
);
```

**Videos:**
```sql
CREATE TABLE video_tutorials (
    video_id SERIAL PRIMARY KEY,
    title VARCHAR(500),
    youtube_url VARCHAR(500),
    youtube_video_id VARCHAR(50),
    scheme_id INTEGER,
    language VARCHAR(10),
    view_count INTEGER,
    rating DECIMAL(2, 1),
    verified BOOLEAN
);
```

**Support Tickets:**
```sql
CREATE TABLE support_tickets (
    ticket_id UUID PRIMARY KEY,
    ticket_number VARCHAR(50) UNIQUE,
    user_id UUID,
    scheme_id INTEGER,
    category VARCHAR(50),
    priority VARCHAR(20),
    status VARCHAR(30),
    created_at TIMESTAMP,
    sla_deadline TIMESTAMP,
    conversation_history JSONB
);
```

---

## 6. Implementation Guide

### 6.1 API Endpoints

**Resource Discovery:**
```
GET /resources/centers/nearby
  ?latitude=23.0167&longitude=77.0167&radius_km=10

GET /resources/helplines
  ?scheme_id=1

GET /resources/videos
  ?scheme_id=1&language=hi
```

**Support System:**
```
POST /support/tickets
  Body: {user_id, description, scheme_id}

GET /support/tickets/{ticket_id}

POST /support/tickets/{ticket_id}/messages
```

### 6.2 Key Technologies

| Component | Technology |
|-----------|-----------|
| Voice I/O | Transcribe, Polly |
| AI/NLU | Bedrock (Claude), Lex |
| OCR | Textract |
| Database | RDS PostgreSQL + PostGIS |
| Cache | ElastiCache (Redis) |
| Compute | Lambda, Step Functions |
| API | API Gateway |
| Maps | Google Maps API |
| Videos | YouTube Data API |

### 6.3 Deployment Steps

**Phase 1: Foundation (Week 1-2)**
- Set up AWS infrastructure
- Configure Cognito, RDS, DynamoDB, S3
- Deploy basic Lambda functions

**Phase 2: Core Features (Week 3-6)**
- Voice pipeline (Transcribe + Polly)
- Scheme matching engine
- Form-to-chat converter
- PDF generation

**Phase 3: Resource Integration (Week 7-8)**  ⭐ NEW
- Service center database setup
- PostGIS spatial queries
- Helpline number integration
- YouTube API integration
- Google Maps integration

**Phase 4: Support System (Week 9-10)**  ⭐ NEW
- Ticket management system
- AI-powered issue analysis
- Escalation workflows
- SLA tracking

**Phase 5: Testing & Launch (Week 11-12)**
- Integration testing
- User acceptance testing
- Pilot launch (5 districts)
- Full rollout

### 6.4 Success Metrics

**User Metrics:**
- Monthly Active Users: Target 1M+ (Year 1)
- Scheme Applications: 500K+ (Year 1)
- Success Rate: >75%

**Engagement Metrics:**
- Average Session Time: 5-10 minutes
- Completion Rate: >60%
- Return Users: >40%

**Business Metrics:**
- Money Saved (middlemen): ₹50 Crores+ (Year 1)
- Cost per User: ₹15-20/month
- Availability: 99.9% SLA

---

## Key Innovations Summary

### What Makes Jan-Sahayak Unique:

1. ✅ **Complete Journey**: Not just info, but end-to-end support
2. ✅ **Offline Integration**: Bridges digital + physical infrastructure
3. ✅ **Voice-First**: 22+ languages, works for illiterate users
4. ✅ **AI-Powered**: Smart matching, auto-resolution
5. ✅ **Multi-Channel**: WhatsApp, IVRS, app, web

### The Complete Workflow:

```
Problem ID → Best Scheme → MP Online Center + 
Toll-Free Number + YT Tutorial → Application → 
Tracking → Trouble? → Complaint Helpline → Resolution
```

---

## Next Steps

1. ✅ Review & approve design
2. ⏳ Set up AWS infrastructure
3. ⏳ Populate databases (schemes, centers, helplines, videos)
4. ⏳ Implement core components
5. ⏳ Test with pilot users
6. ⏳ Launch in pilot districts

---

**Document Status:** ✅ Ready for Implementation  
**Version:** 1.0  
**Last Updated:** February 15, 2026

---

*Built with ❤️ for Rural India*
