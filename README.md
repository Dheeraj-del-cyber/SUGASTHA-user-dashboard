# SUGASTHA — Citizen Healthcare & AI Triage Platform

> **An Ayushman Bharat Digital Mission (ABDM) compliant, citizen-centric healthcare web application featuring AI clinical triage, ABHA ID integration, 3-tier hospital queue buffering, QR-based consultation tokens, and ABHA health record synchronization.**

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup & Installation](#setup--installation)
- [Running the Application](#running-the-application)
- [Full User Workflow](#full-user-workflow)
- [Architecture & Mobile-Readiness](#architecture--mobile-readiness)
- [API Contracts & Hospital Integration](#api-contracts--hospital-integration)
- [Development Notes](#development-notes)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

SUGASTHA is a premium user-side healthcare web application designed for Indian citizens under the Ayushman Bharat Digital Mission ecosystem. It enables patients to:

1. **Log in or register** using their 14-digit ABHA ID or ABHA Address (`user@abdm`)
2. **Auto-fetch** their complete ABDM-linked health records (prescriptions, diagnoses, lab reports, allergies, chronic conditions)
3. **Enter current symptoms** through an intuitive interface
4. **Receive automated AI clinical triage** — Green / Yellow / Red — without ever asking the user to manually select a priority
5. **Get intelligent recommendations** — eSanjeevani teleconsultation or a physical hospital visit
6. **Book a consultation** with a 3-tier backup hospital queue buffer ensuring fallover if the primary hospital is busy
7. **Receive a unique QR Code + 5-digit verification token** for hospital check-in
8. **Track live consultation status** as it progresses through the hospital system
9. **Sync a complete healthcare journey summary** back to their permanent ABHA Health Locker

> ⚠️ **Scope Note:** The hospital-side dashboard is intentionally **NOT** built here. It will be developed separately and integrated via clean REST/Webhook API contracts already scaffolded in this codebase.

---

## Key Features

| Feature | Description |
|---|---|
| 🪪 **ABHA Authentication** | Login via ABHA Number or ABHA Address with OTP / Password flow |
| 📋 **ABHA Registration** | Step-by-step guided registration using Aadhaar KYC + OTP |
| 🔍 **ABHA Recovery** | Retrieve forgotten ABHA ID via linked mobile / Aadhaar |
| 🏥 **ABDM Health Records** | Auto-fetch prescriptions, diagnoses, lab reports, chronic conditions, allergies |
| 🤖 **AI Clinical Triage** | Automated rule-based engine classifying Green / Yellow / Red — zero manual selection |
| 🟢🟡🔴 **Triage Rationale** | Detailed clinical factors considered, sourced from both current symptoms and ABHA history |
| 📡 **eSanjeevani Integration-Ready** | "Connect to eSanjeevani" button with full API payload contract, ready for MoHFW gateway |
| 🏨 **Hospital Recommendation** | Filtered by condition, triage, distance (km), auto/cab fare estimates, specialist availability |
| 📊 **3-Tier Queue Buffer** | Primary hospital + 2 automatic fallback hospitals with state machine failover |
| 🎫 **Unique QR + 5-Digit Token** | Generated on booking; cryptographic ABDM-compliant QR payload for hospital verification |
| 📍 **Live Status Tracker** | Full consultation lifecycle: `Request Created → Pending → Confirmed → Completed` |
| 📁 **ABHA Journey Sync** | Complete healthcare journey summary persisted to user's ABHA Health Locker with FHIR bundle structure |
| 📱 **Mobile-First Responsive** | Desktop sidebar + mobile bottom navigation; ready for Capacitor/React Native porting |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 + TypeScript (Vite 6) |
| **Styling** | Vanilla CSS (custom design system with CSS variables) |
| **Icons** | Lucide React |
| **QR Code** | qrcode.react (SVG-based, offline-capable) |
| **State** | React useState / useEffect (local component state) |
| **Persistence** | Browser `localStorage` (mock ABDM data store) |
| **Build Tool** | Vite 6.4 |
| **Type Checking** | TypeScript 5.7 (strict mode) |
| **Node Version** | v18+ recommended (tested on v24.11.1) |

---

## Project Structure

```
SUGASTHA-user-dashboard/
├── index.html                        # App entry HTML (fonts, viewport, SEO meta)
├── vite.config.ts                    # Vite configuration
├── tsconfig.json                     # TypeScript configuration
├── package.json                      # Dependencies & scripts
├── .gitignore
├── README.md
│
└── src/
    ├── main.tsx                      # React app entry point
    ├── App.tsx                       # Root component: state machine & view orchestrator
    │
    ├── types/
    │   └── index.ts                  # All TypeScript domain models
    │                                 # (AbhaProfile, TriageResult, ConsultationRequest, etc.)
    │
    ├── styles/
    │   ├── variables.css             # CSS design tokens (colors, fonts, radii, shadows)
    │   └── global.css                # Reset, layout utilities, buttons, animations
    │
    ├── data/
    │   ├── mockAbhaData.ts           # 2 sample ABDM citizen profiles with past records
    │   └── mockHospitals.ts          # 5 hospitals with doctors, distances, fare estimates
    │
    ├── services/
    │   ├── abhaService.ts            # ABHA login, registration, recovery, health record sync
    │   ├── triageEngine.ts           # AI rule-based clinical triage (Green/Yellow/Red)
    │   ├── hospitalQueueService.ts   # Hospital ranking + 3-tier queue buffer + failover
    │   └── consultationService.ts   # Booking, QR/token generation, state machine, journey sync
    │
    └── components/
        ├── common/
        │   ├── Header.tsx            # App header with ABHA user badge & SOS button
        │   ├── BottomNav.tsx         # Mobile bottom navigation bar
        │   └── Modal.tsx             # Reusable accessible modal dialog
        │
        ├── auth/
        │   ├── AbhaLoginModal.tsx    # ABHA ID / ABHA Address login with OTP flow
        │   ├── AbhaRegisterModal.tsx # 3-step Aadhaar KYC registration wizard
        │   └── AbhaRecoverModal.tsx  # Forgotten ABHA ID recovery flow
        │
        ├── profile/
        │   ├── AbhaCard.tsx          # Digital ABHA Card (with photo, QR, number, blood group)
        │   └── HealthRecordsView.tsx # Tabbed view of ABDM-linked records, conditions, allergies
        │
        ├── triage/
        │   ├── SymptomInputForm.tsx  # Symptom chips, pain scale, body region, red flags
        │   └── TriageResultCard.tsx  # AI triage result display with clinical rationale
        │
        ├── recommendations/
        │   ├── TeleconsultationCard.tsx  # eSanjeevani recommendation with API payload inspector
        │   └── HospitalList.tsx          # Ranked hospital list with doctor selection
        │
        ├── consultation/
        │   ├── BookingConfirmationModal.tsx  # 3-tier queue preview before booking
        │   ├── QrCodeDisplay.tsx            # QR pass + 5-digit token verification slip
        │   ├── ActiveConsultationCard.tsx   # Live consultation widget on dashboard
        │   └── ConsultationTracker.tsx      # Full tracker with queue state & hospital simulator
        │
        ├── summary/
        │   └── HealthcareJourneySummaryModal.tsx  # Complete journey report + ABHA sync
        │
        ├── history/
        │   └── ConsultationHistory.tsx  # Archived passes with QR re-display
        │
        └── dashboard/
            └── UserDashboard.tsx        # Main patient dashboard (home view)
```

---

## Prerequisites

Before setting up, ensure you have the following installed:

- **Node.js** `v18.0.0` or higher (v20+ recommended)
  ```bash
  node -v    # Should print v18.x.x or higher
  ```
- **npm** `v9.0.0` or higher
  ```bash
  npm -v     # Should print 9.x.x or higher
  ```
- **Git** (for cloning)
  ```bash
  git --version
  ```

---

## Setup & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/SUGASTHA-user-dashboard.git
cd SUGASTHA-user-dashboard
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React 19 & React DOM
- TypeScript 5.7
- Vite 6.4
- Lucide React (icons)
- qrcode.react (QR code generation)
- clsx (class name utilities)

### 3. Verify Installation

```bash
npm list --depth=0
```

You should see all top-level packages listed without errors.

---

## Running the Application

### Development Mode (Hot Reload)

```bash
npm run dev
```

The app will start at:
```
http://localhost:5173
```

Network access (for testing on mobile device on same Wi-Fi):
```
http://YOUR_LOCAL_IP:5173
```

### Production Build

```bash
npm run build
```

Output will be in the `dist/` folder. The build is optimized, tree-shaken, and ready for deployment.

### Preview Production Build Locally

```bash
npm run preview
```

Serves the production `dist/` bundle locally for final verification before deployment.

### Type Check Only (No Build)

```bash
npx tsc --noEmit
```

---

## Full User Workflow

Once the app is running, follow this journey to test the complete SUGASTHA flow:

### Step 1 — ABHA Login

1. Open `http://localhost:5173`
2. Click **ABHA Login** in the header
3. Use one of the **pre-filled test profiles**:

| Profile | ABHA Number | Scenario |
|---|---|---|
| Rajesh Kumar Verma | `91-4523-8901-2345` | Diabetic + Hypertensive + Cardiac symptoms → **RED triage** |
| Ananya Sen | `91-7890-1234-5678` | Young adult + allergic rhinitis → **GREEN/YELLOW triage** |

4. Click **Generate 6-Digit OTP** (demo OTP auto-fills `482910`)
5. Click **Verify & Sign In**

**Result:** Dashboard loads with the patient's Digital ABHA Card and auto-fetched health records.

---

### Step 2 — Enter Symptoms & AI Triage

1. Click **Start New AI Triage & Consultation**
2. The form pre-selects `Chest Pain / Discomfort` + `Shortness of Breath`
3. Notice the pain scale slider at 7/10 and checked red-flag checkboxes
4. Click **Generate AI Triage & Clinical Recommendation**

**Result:** After ~1 second analysis, a **RED Emergency triage** card appears with:
- Clinical factors from current symptoms
- ABHA comorbidity multiplier (Diabetes + Hypertension flagged)
- Urgency window: `Immediate (0-1 Hour)`

> The system never asks the user to manually pick Green/Yellow/Red.

---

### Step 3 — Hospital Recommendation

1. Click **Proceed to Recommendation**
2. A ranked list of hospitals appears, showing:
   - Distance from user in km
   - Estimated travel time
   - Auto fare / Cab fare estimates (e.g. Auto: ₹55 | Cab: ₹140)
   - Available specialist doctors with ratings
3. Select a doctor (e.g. **Dr. Vivek Sharma – Cardiology**)
4. Click **Proceed with Consultation Request** on the sticky footer

---

### Step 4 — Book Consultation & 3-Tier Queue

1. The **Booking Confirmation Modal** shows:
   - **Priority 1:** Your selected hospital (Primary)
   - **Backup #1:** Next nearest hospital (Auto-selected)
   - **Backup #2:** Third nearest hospital (Auto-selected)
2. Click **Book Consultation & Generate Token**

**Result:**
- Unique **Consultation ID** generated (e.g. `SUG-2026-4829`)
- Unique **5-Digit Verification Token** generated (e.g. `#38291`)
- Encrypted **ABDM-compliant QR code** generated
- Initial status: **PENDING**

---

### Step 5 — Track Live Status & Simulate Hospital Actions

In the **Active Queue Tracker**:

1. Click **View QR Pass** to see the scannable QR slip with 5-digit token
2. Use the **Hospital Backend Testing Suite** (since hospital system is separate):
   - Click **"Simulate: Hospital Accepts Request (Confirm)"** → Status becomes **CONFIRMED**
   - Or click **"Simulate: Hospital Busy → Failover to Backup"** → Queue cascades to Backup Hospital #1
3. Once confirmed, click **"Complete Consultation Journey & Sync to ABHA Record"**

---

### Step 6 — Healthcare Journey Summary & ABHA Sync

The **Healthcare Journey Summary Modal** displays:
- All reported symptoms
- Triage outcome & clinical rationale
- Hospital, doctor, and queue progression
- Complete events timeline
- Click **Sync to ABHA Record** to persist the encounter to the permanent ABHA health store

---

### Step 7 — Review Updated Records & Pass History

- **ABHA Health Records tab:** The new SUGASTHA consultation appears as the latest record
- **Consultation Passes tab:** The archived 5-digit token and QR are stored for future hospital desk verification

---

## Architecture & Mobile-Readiness

SUGASTHA is designed with a **Clean Architecture** pattern to ensure easy extensibility to mobile platforms (Capacitor / React Native):

```
┌─────────────────────────────────────────────┐
│               Presentation Layer             │
│    React Components + Vanilla CSS            │
│    (Mobile-first responsive, touch targets) │
├─────────────────────────────────────────────┤
│               Service Layer                  │
│    Pure TypeScript business logic            │
│    abhaService / triageEngine /              │
│    hospitalQueueService / consultationService│
├─────────────────────────────────────────────┤
│               Domain / Type Layer            │
│    src/types/index.ts                        │
│    (AbhaProfile, TriageResult,               │
│    ConsultationRequest, etc.)                │
├─────────────────────────────────────────────┤
│               Data / Mock Layer              │
│    src/data/mockAbhaData.ts                  │
│    src/data/mockHospitals.ts                 │
│    (Swap with real ABDM API calls later)     │
└─────────────────────────────────────────────┘
```

**Mobile porting path:**
- Services are framework-agnostic pure TypeScript — reusable in React Native as-is
- Components follow mobile-first CSS — bottom navigation, touch-friendly tap targets
- API contracts are already defined as typed interfaces for direct SDK integration

---

## API Contracts & Hospital Integration

All hospital-side interactions are represented as clean, typed API contracts. The hospital system built separately by another team can connect via:

### Consultation Request Dispatch

```
POST https://api.sugastha.gov.in/v1/consultations/{consultationId}/dispatch
```

```json
{
  "protocolVersion": "ABDM-SUGASTHA-v1.0",
  "event": "CONSULTATION_REQUEST_DISPATCH",
  "consultationToken": "38291",
  "targetHospitalId": "hosp-aiims-delhi",
  "assignedPriorityTier": 1,
  "patientAbhaId": "91-4523-8901-2345",
  "callbackWebhookUrl": "https://api.sugastha.gov.in/v1/consultations/38291/webhook"
}
```

### Acceptance Webhook (Hospital → SUGASTHA)

```
POST https://api.sugastha.gov.in/v1/consultations/{token}/webhook
```

```json
{
  "event": "CONSULTATION_ACCEPTED",
  "hospitalId": "hosp-aiims-delhi",
  "doctorAssigned": "Dr. Vivek Sharma",
  "estimatedWaitTime": "15-20 minutes"
}
```

### eSanjeevani Teleconsultation Referral

```
POST https://esanjeevani.mohfw.gov.in/api/v2/patient/teleconsult-referral
```

Full payload contract is visible within the app via the **"Inspect API Contract"** toggle on the Teleconsultation recommendation card.

---

## Development Notes

- **Mock ABHA Data:** All ABDM profiles are stored in `localStorage` via `mockAbhaData.ts`. The service layer is structured so real ABDM Gateway API calls can be substituted by replacing `abhaService.ts` method bodies.
- **No Hospital Dashboard:** The `hospitalQueueService.ts` generates the 3-tier queue and API payloads, but no hospital-facing UI exists. The **"Hospital Backend Testing Suite"** panel in the tracker simulates webhook calls for user-side verification.
- **QR Code Payload:** Each QR encodes a JSON object with consultation ID, 5-digit token, ABHA number, patient name, hospital ID, triage level, and a cryptographic signature placeholder compliant with ABDM verification standards.
- **FHIR Bundle:** The `HealthcareJourneySummary.fhirBundlePayload` field contains a starter FHIR R4-compatible `Encounter` resource structure ready for ABDM Health Locker submission.

---

## Environment Variables

Currently the project runs fully on mock data — no environment variables are required for local development.

For production ABDM integration, create a `.env.local` file:

```env
# ABDM Gateway
VITE_ABDM_GATEWAY_URL=https://dev.abdm.gov.in
VITE_ABDM_CLIENT_ID=your_client_id
VITE_ABDM_CLIENT_SECRET=your_client_secret

# SUGASTHA Backend API
VITE_API_BASE_URL=https://api.sugastha.gov.in/v1

# eSanjeevani
VITE_ESANJEEVANI_URL=https://esanjeevani.mohfw.gov.in/api/v2

# Map / Geolocation
VITE_MAPS_API_KEY=your_maps_api_key
```

> `.env.local` is already in `.gitignore` — your secrets will never be committed.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with hot reload at `localhost:5173` |
| `npm run build` | TypeScript type-check + Vite production bundle into `dist/` |
| `npm run preview` | Serve production `dist/` bundle locally |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run type checks: `npx tsc --noEmit`
5. Build to verify: `npm run build`
6. Commit: `git commit -m "feat: add my feature"`
7. Push & open a Pull Request

**Branch naming conventions:**
- `feature/` — new features
- `fix/` — bug fixes
- `refactor/` — code improvements
- `docs/` — documentation updates

---

## License

MIT License — see [LICENSE](./LICENSE) for details.

---

<p align="center">
  <strong>SUGASTHA</strong> — Built for the citizens of India 🇮🇳<br/>
  Compliant with Ayushman Bharat Digital Mission (ABDM) standards
</p>