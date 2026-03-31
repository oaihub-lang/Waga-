# OPP Lifestyle — Community OS

> "Oringo Must Continue" — The digital headquarters for the Oringo People's Party

## Overview

OPP Lifestyle is a high-end community mobile application built with React Native (Expo) and Firebase. It serves 720+ members of the Oringo People's Party with a full-featured platform for community governance, business networking, matchmaking, financial management, and event coordination.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React Native (Expo ~50) |
| Backend / DB | Firebase (Firestore) |
| Auth | Firebase Authentication |
| Storage | Firebase Storage |
| Video/Audio | Agora.io (integration hooks in place) |
| Payments | Paystack / Flutterwave |
| Theme | "Luxury Midnight" — #121212, Gold #D4AF37, Oringo Green #00FF41 |

---

## Feature Modules

### 1. Identity, Access & Governance
- **Verified Gatekeeper**: `isVerified` flag managed by Admins
- **Paywall Logic**: Unverified users access general chat + public feed only
- **Admin Command Center**: Full member management, dues approval, law enforcement
- **Onboarding**: Read-only mode until OPP Intro Format is complete

### 2. Reputation Engine
- 1–5 star system (1000 point scale)
- Gain: dues paid (+50), vouch received (+10), admin bonus (+10)
- Lose: law violation (-20), admin penalty
- Activity Badges: Oringo King/Queen, High-Value Vendor, Verified Member

### 3. Business & Betting Hub
- **Member Marketplace**: Searchable vendor directory by category
- **Trust System**: Vouch button boosts vendor reputation
- **Betting Corner**: Auto-detects SportyBet/Bet9ja codes, one-tap copy
- **Winning Wall**: Members share green-ticked slips

### 4. OPP Vibe-Check (Matchmaker)
- Double-blind matching — select up to 3 people
- Notifications only on mutual matches
- Strictly private — "Learn to Love" philosophy

### 5. Oringo Lounge & Ozza Room
- Audio/Video conference rooms (up to 120 users via Agora.io)
- Admin Stage Controls to mute all mics during formal meetings
- **Ozza Room**: Secure gallery with View Once + anti-screenshot notices

### 6. Financial Ledger — The Purse
- Real-time Carnival 2024 and Medical Outreach fund tracking
- Transparent paid members ledger
- Paystack / Flutterwave / bank transfer payment flow

### 7. Carnival Hub
- Live countdown to Dec 14th @ Villa Toscana, Enugu
- VIP RSVP system (Verified members only)
- "Coming Home" diaspora member tracker
- Hotel roommate finder

---

## Project Structure

```
src/
├── constants/          # Colors, theme, spacing, laws, badges
├── context/            # AuthContext, AppContext
├── services/           # Firebase operations
├── navigation/         # Root, Auth, App, Tab navigators
├── components/
│   └── common/         # Button, Card, Badge, Avatar, StarRating, GoldInput, ScreenHeader, Toast
└── screens/
    ├── auth/           # Splash, Login, Register, Onboarding
    ├── main/           # Home (Feed), Profile, Notifications, MemberProfile
    ├── business/       # Marketplace, VendorProfile, BettingCorner
    ├── matchmaker/     # MatchmakerScreen
    ├── lounge/         # LoungeScreen, OzzaRoom
    ├── financial/      # ThePurse, DuesPayment
    ├── events/         # CarnivalHub
    └── admin/          # AdminDashboard, MemberManagement, Ledger
```

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure Firebase
Create a Firebase project and update `src/services/firebase.js` with your config:
```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

### 3. Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules,storage
```

### 4. Run the app
```bash
# Expo Go (development)
npx expo start

# Android build
npx expo run:android

# iOS build
npx expo run:ios
```

---

## The 6 Laws of OPP

1. **Respect All Members** — Treat every OPP member with dignity
2. **No Fighting** — Physical or verbal altercations are prohibited
3. **No-Tag Rule** — Do not tag members without consent
4. **Pay Your Dues** — Annual dues maintain Verified status
5. **Oringo First** — Lifestyle and community enjoyment are foundational
6. **Confidentiality** — What happens in OPP, stays in OPP

---

## Agora.io Integration

The Lounge screen has integration hooks ready. To enable live A/V:

1. Create an Agora.io account and get your App ID
2. Install `react-native-agora`
3. Implement `joinChannel` / `leaveChannel` in `LoungeScreen.js`

---

## Roadmap

- [ ] Push notifications (Expo Notifications + Firebase Cloud Messaging)
- [ ] Direct messaging between members
- [ ] Agora.io full A/V implementation
- [ ] Paystack/Flutterwave webhook verification
- [ ] Annual dues automation
- [ ] OPP Awards system
- [ ] 2025 Carnival event page

---

*Built with the philosophy: "Oringo Must Continue" 🏆*
