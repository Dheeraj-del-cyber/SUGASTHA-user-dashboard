<div align="center">
  <img src="images/logo.png" alt="SUGASTHA banner" width="280" />
</div>

<a href="https://git.io/typing-svg">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=20&pac=3&duration=3200&pause=900&color=0F766E&center=true&vCenter=true&width=720&lines=ABHA+login+%E2%86%92+auto-fetched+health+records;AI+triage%3A+Green+%7C+Yellow+%7C+Red+(zero+manual+selection);3-tier+hospital+queue+with+automatic+failover;QR+%2B+5-digit+token+for+hospital+check-in;Journey+synced+back+to+your+ABHA+Health+Locker" alt="Typing animation of key features"/>
</a>

<br/>

![ABDM](https://img.shields.io/badge/ABDM-Compliant-0f766e?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.4-646cff?style=for-the-badge&logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**An Ayushman Bharat Digital Mission (ABDM) compliant, citizen-centric web app: ABHA login, AI clinical triage, hospital queue buffering, QR consultation tokens, and ABHA record sync.**

[Overview](#-overview) · [Architecture](#-architecture) · [Quick Start](#-quick-start) · [Flows](#-flows-at-a-glance) · [Integration](#-hospital-integration) · [Config](#-configuration)

</div>

---

## 🌟 Overview

SUGASTHA is the **patient-side** app. A citizen logs in with ABHA, describes symptoms, gets an automatic triage level, and is routed to teleconsultation or a hospital, with a backup-hospital safety net and a scannable pass.

```mermaid
flowchart LR
    A([ABHA Login]) --> B[Health records auto-fetched]
    B --> C[Symptoms entered]
    C --> D{AI triage}
    D -->|Green| E[eSanjeevani / routine care]
    D -->|Yellow| F[Same-day hospital review]
    D -->|Red| G[Immediate care pathway]
    E --> H[Book consultation / queue buffer]
    F --> H
    G --> H
    H --> I[QR + 5-digit token]
    I --> J[Live status tracking]
    J --> K[Sync to ABHA Health Locker]

    classDef patient fill:#e0f2fe,stroke:#0f766e,color:#0f172a
    classDef system fill:#dcfce7,stroke:#166534,color:#14532d
    class A,C,H,I,J patient
    class B,D,E,F,G,K system
```

> ⚠️ **Scope:** The hospital dashboard is a separate app (`SUGASTHA-hospital-dashboard-main/`). The two talk over the REST API described in [Hospital Integration](#-hospital-integration).

---

## ✨ Key Features

| | Feature | What it does |
|---|---|---|
| 🪪 | **ABHA Auth** | Login, Aadhaar-KYC registration, and ID recovery |
| 🏥 | **Health Records** | Prescriptions, diagnoses, labs, allergies, chronic conditions |
| 🤖 | **AI Triage** | Rule-based engine, Green / Yellow / Red, with clinical rationale |
| 📡 | **eSanjeevani-ready** | Teleconsult referral with inspectable API payload |
| 🏨 | **Hospital Ranking** | By condition, triage, distance, fare estimate, specialist availability |
| 📊 | **3-Tier Queue** | Primary + 2 fallback hospitals, automatic failover |
| 🎫 | **QR + Token** | ABDM-style QR payload and 5-digit verification token |
| 📍 | **Live Tracker** | Request → Pending → Confirmed → Completed |
| 📁 | **ABHA Sync** | FHIR R4 `Encounter` bundle to the Health Locker |
| 📱 | **Mobile-first** | Desktop sidebar, mobile bottom-nav, Capacitor/RN-ready |

---

## 🏗 Architecture

### System context

```mermaid
flowchart LR
    P([👤 Patient]) --> APP["SUGASTHA<br/>Patient App<br/>React + TS"]
    APP <-->|ABHA login & records| ABDM[(ABDM Gateway<br/>mock in dev)]
    APP -->|teleconsult referral| ES[eSanjeevani<br/>MoHFW]
    APP <-->|hospitals · doctors · appointments| API["Hospital Backend<br/>FastAPI :8000"]
    HD["🏥 Hospital Dashboard<br/>React :5174"] <--> API
    APP -.->|fallback| OSM[OpenStreetMap<br/>demo hospitals]

    classDef core fill:#0f766e,stroke:#0f766e,color:#fff
    classDef ext fill:#e0f2fe,stroke:#1d4ed8,color:#0c4a6e
    class APP core
    class ABDM,ES,API,HD,OSM ext
```

### Layered design

```mermaid
flowchart TB
    subgraph PRES["🎨 Presentation"]
        C["React components · Vanilla CSS · mobile-first"]
    end
    subgraph SVC["⚙️ Service layer (pure TypeScript)"]
        S1[abhaService]
        S2[triageEngine]
        S3[hospitalQueueService]
        S4[consultationService]
    end
    subgraph DOM["📐 Domain"]
        T["types/index.ts<br/>AbhaProfile · TriageResult · ConsultationRequest"]
    end
    subgraph DATA["💾 Data"]
        D["mockAbhaData · mockHospitals · localStorage"]
    end
    PRES --> SVC --> DOM
    SVC --> DATA
```

> Services are framework-agnostic, so they port to React Native unchanged. Swap `abhaService.ts` method bodies for real ABDM Gateway calls when going live.

### Component map

```mermaid
flowchart LR
    App[App.tsx<br/>state machine] --> Auth[auth/<br/>Login · Register · Recover]
    App --> Dash[dashboard/<br/>UserDashboard]
    Dash --> Prof[profile/<br/>AbhaCard · HealthRecords]
    Dash --> Tri[triage/<br/>SymptomForm · ResultCard]
    Tri --> Rec[recommendations/<br/>Teleconsult · HospitalList]
    Rec --> Con[consultation/<br/>Booking · QR · Tracker]
    Con --> Sum[summary/<br/>JourneySummary]
    Dash --> Hist[history/<br/>ConsultationHistory]
```

<details>
<summary><b>📂 Project structure</b></summary>

```
SUGASTHA-user-dashboard/
├── index.html · vite.config.ts · tsconfig.json · package.json
└── src/
    ├── main.tsx · App.tsx
    ├── types/index.ts              # domain models
    ├── styles/                     # variables.css (tokens) · global.css
    ├── data/                       # mockAbhaData · mockHospitals
    ├── services/                   # abha · triage · hospitalQueue · consultation
    └── components/
        ├── common/  auth/  profile/  triage/
        └── recommendations/  consultation/  summary/  history/  dashboard/
```

</details>

---

## 🚀 Quick Start

**Requires:** Node.js ≥ 18 (20+ recommended), npm ≥ 9.

```bash
git clone https://github.com/YOUR_USERNAME/SUGASTHA-user-dashboard.git
cd SUGASTHA-user-dashboard
npm install
npm run dev          # → http://localhost:5173
```

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Type-check + production bundle in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npx tsc --noEmit` | Type-check only |

📱 To test on a phone, open `http://YOUR_LOCAL_IP:5173` on the same Wi-Fi.

### 🧪 Demo profiles

| Patient | ABHA Number | Expected triage |
|---|---|---|
| Rajesh Kumar Verma | `91-4523-8901-2345` | 🔴 **RED** (diabetes + hypertension + cardiac symptoms) |
| Ananya Sen | `91-7890-1234-5678` | 🟢🟡 **GREEN / YELLOW** (allergic rhinitis) |

Demo OTP auto-fills as `482910`.

---

## 🔄 Flows at a glance

### End-to-end sequence

```mermaid
sequenceDiagram
    autonumber
    actor P as Patient
    participant A as SUGASTHA App
    participant B as ABDM (mock)
    participant H as Hospital Backend
    participant D as Hospital Dashboard

    P->>A: ABHA login + OTP
    A->>B: Verify & fetch records
    B-->>A: Profile + health history
    P->>A: Enter symptoms
    A->>A: Triage engine → 🟢 🟡 🔴
    A-->>P: Result + rationale + recommendation
    P->>A: Pick hospital & doctor
    A->>H: POST /appointments
    H-->>D: Appears in hospital inbox
    A-->>P: QR + 5-digit token (PENDING)
    D->>H: Accept appointment
    loop every 15 s
        A->>H: Poll appointment status
    end
    H-->>A: CONFIRMED
    P->>A: Complete journey
    A->>B: Sync FHIR Encounter to Health Locker
```

### Triage decision

```mermaid
flowchart TD
    S([Symptoms + pain scale + red flags]) --> E{AI Triage Engine}
    H[(ABHA history<br/>comorbidities · allergies)] --> E
    E -->|Mild, stable| G["🟢 GREEN<br/>Routine"]
    E -->|Moderate / risk factors| Y["🟡 YELLOW<br/>Same-day"]
    E -->|Severe / red flags| R["🔴 RED<br/>Immediate 0–1 hr"]
    G --> T["📡 eSanjeevani<br/>teleconsult"]
    Y --> T
    Y --> HV["🏨 Hospital visit"]
    R --> HV
    classDef g fill:#dcfce7,stroke:#16a34a,color:#14532d
    classDef y fill:#fef9c3,stroke:#ca8a04,color:#713f12
    classDef r fill:#fee2e2,stroke:#dc2626,color:#7f1d1d
    class G g
    class Y y
    class R r
```

> The user is **never** asked to choose a priority. Triage is computed from current symptoms + ABHA history.

### 3-tier queue failover

```mermaid
stateDiagram-v2
    [*] --> Primary: Booking created
    Primary --> Confirmed: Hospital accepts
    Primary --> Backup1: Busy / no response
    Backup1 --> Confirmed: Accepts
    Backup1 --> Backup2: Busy / no response
    Backup2 --> Confirmed: Accepts
    Backup2 --> Exhausted: All declined
    Exhausted --> [*]
    Confirmed --> [*]
```

### Consultation lifecycle

```mermaid
stateDiagram-v2
    direction LR
    [*] --> RequestCreated
    RequestCreated --> Pending: Token + QR issued
    Pending --> Confirmed: Hospital accepts
    Confirmed --> Completed: Consultation done
    Completed --> SyncedToABHA: Journey saved
    SyncedToABHA --> [*]
```

### QR pass & token

```mermaid
flowchart LR
    Q["QR payload (JSON)"] --- a[Consultation ID<br/>SUG-2026-4829]
    Q --- b[5-digit token<br/>#38291]
    Q --- c[ABHA number + name]
    Q --- d[Hospital ID]
    Q --- e[Triage level]
    Q --- f[Signature placeholder]
```

---

## 🔌 Hospital Integration

The patient app connects to the hospital FastAPI backend. Default base URL: `http://localhost:8000/api/v1`.

| Method | Endpoint | Used for |
|---|---|---|
| `GET` | `/hospitals/nearby-govt?lat=&lng=&limit=8` | Nearby registered hospitals |
| `GET` | `/doctors?hospital_id=` | Doctors at a hospital |
| `POST` | `/appointments` | Create booking (shows in hospital inbox) |
| `GET` | `/appointments?hospital_id=` | Poll status (every 15 s) |
| `POST` | `/appointments/{id}/accept` | Hospital accepts |

```mermaid
flowchart LR
    U[Patient App] -->|POST /appointments| API[(FastAPI<br/>backend)]
    API --> HI[Hospital inbox]
    HI -->|Accept| API
    API -->|GET /appointments<br/>polled every 15 s| U
```

No webhooks or direct browser-to-browser links are used. If no registered hospital with doctors is available, the app falls back to OpenStreetMap/demo hospitals; those bookings are **local-only** and labelled as such before confirmation.

<details>
<summary><b>🛠 Local development with the hospital backend</b></summary>

1. Backend (`SUGASTHA-hospital-dashboard-main/backend`):
   ```bash
   # DATABASE_URL=sqlite:///./sugastha.db and a local JWT_SECRET_KEY must be set
   python -m app.db.seed                      # once, to seed demo data
   uvicorn app.main:app --reload --port 8000
   ```
2. Hospital frontend (`.../frontend`): `npm run dev -- --port 5174`
3. Patient frontend (this repo): `npm run dev`

To use a different backend, set `VITE_HOSPITAL_API_BASE_URL` in `.env.local` and restart Vite.

</details>

> ⚠️ **Prototype notice:** appointment write endpoints currently have no authentication and CORS is permissive. Use **synthetic data only** until auth and CORS restrictions are in place.

### eSanjeevani referral

```
POST https://esanjeevani.mohfw.gov.in/api/v2/patient/teleconsult-referral
```

The full payload is viewable in-app via **Inspect API Contract** on the Teleconsultation card.

---

## ⚙️ Configuration

```env
# Hospital backend (defaults to http://localhost:8000/api/v1 in dev)
VITE_HOSPITAL_API_BASE_URL=https://your-hospital-api.example.com/api/v1

# ABDM Gateway (production)
VITE_ABDM_GATEWAY_URL=https://dev.abdm.gov.in
VITE_ABDM_CLIENT_ID=your_client_id
VITE_ABDM_CLIENT_SECRET=your_client_secret

# eSanjeevani & maps
VITE_ESANJEEVANI_URL=https://esanjeevani.mohfw.gov.in/api/v2
VITE_MAPS_API_KEY=your_maps_api_key
```

- Put these in `.env.local` (already git-ignored).
- The API URL is the **backend**, not the hospital dashboard website. Verify it at `<API_ROOT>/health`.
- Vite embeds variables at **build time**, so redeploy after changing them.

---

## 📝 Development Notes

- **Mock data:** ABHA profiles live in `localStorage` via `mockAbhaData.ts`.
- **QR payload:** consultation ID, token, ABHA number, patient name, hospital ID, triage level, signature placeholder.
- **FHIR:** `HealthcareJourneySummary.fhirBundlePayload` holds a starter R4 `Encounter` structure for Health Locker submission.

---

## 🤝 Contributing

```bash
git checkout -b feature/my-feature
npx tsc --noEmit && npm run build     # verify
git commit -m "feat: add my feature"
```

Branch prefixes: `feature/` · `fix/` · `refactor/` · `docs/`

## 📄 License

MIT. See [LICENSE](./LICENSE).

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:1d4ed8,100:0f766e&height=120&section=footer" alt="footer wave" width="100%"/>

**SUGASTHA** — Built for the citizens of India 🇮🇳
<br/>Aligned with Ayushman Bharat Digital Mission (ABDM) standards

</div>