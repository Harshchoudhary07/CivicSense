# 🏛️ CivicSense - Civic Issue Reporting Platform

A comprehensive, hackathon-ready platform enabling citizens to report civic issues, officers to manage complaints, and admins to oversee the entire system with smart assignment and priority management.

![Platform Preview](https://img.shields.io/badge/Status-Ready%20for%20Demo-success)
![React](https://img.shields.io/badge/React-19.2.0-blue)
![Firebase](https://img.shields.io/badge/Firebase-Ready-orange)
![Vite](https://img.shields.io/badge/Vite-7.2.4-purple)

## ✨ Features

### 👤 Citizen Module
- **OTP Authentication** - Secure phone-based login with guest access
- **Report Issues** - Upload photos, capture GPS location, categorize problems
- **Track Complaints** - Real-time status updates with timeline view
- **Nearby Issues** - Map view of complaints in your area
- **Feedback System** - Rate service quality after resolution

### 👮 Officer Module
- **Secure Dashboard** - View assigned complaints by priority
- **Status Management** - Update complaint status with remarks
- **Resolution Upload** - Add before/after photos
- **Filter & Sort** - Organize by status, category, priority

### 🛠️ Admin Module
- **Analytics Dashboard** - System-wide metrics and insights
- **Department Management** - Create departments, assign officers
- **Smart Assignment** - Auto-assign based on category and location
- **Reports & Export** - Generate CSV reports, view trends
- **Heatmap** - Geographic visualization of complaint density

### 🧠 Smart Features
- **Priority Engine** - Auto-calculates priority based on:
  - Proximity to schools/hospitals → High Priority
  - Multiple reports in area (≥3) → Critical Priority
  - Pending duration (>48hrs) → Escalated
- **Auto-Assignment** - Routes complaints to appropriate departments
- **Timeline Tracking** - Complete audit trail of all updates

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Firebase account (free tier works)
- Google Maps API key (optional, for map features)

### Installation

1. **Clone and Install**
```bash
cd "civic sense"
npm install
```

2. **Configure Firebase**
```bash
# Copy environment template
cp .env.example .env

# Add your Firebase credentials to .env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
```

3. **Run Development Server**
```bash
npm run dev
# Visit http://localhost:5173
```

4. **Build for Production**
```bash
npm run build
# Deploy the 'dist' folder
```

## 📁 Project Structure

```
civic sense/
├── src/
│   ├── config/          # Firebase configuration
│   ├── services/        # Business logic & Firebase operations
│   │   ├── authService.js
│   │   ├── complaintService.js
│   │   ├── priorityEngine.js
│   │   └── assignmentService.js
│   ├── pages/           # React components for all screens
│   ├── utils/           # Helper functions & constants
│   ├── styles/          # Design system CSS
│   └── App.jsx          # Main routing
├── .env.example         # Environment variables template
└── package.json
```

## 🎨 Design System

- **Colors**: Modern gradient theme (purple, blue, pink)
- **Typography**: Inter & Outfit fonts
- **Components**: Glassmorphism cards, smooth animations
- **Responsive**: Mobile-first design

## 📊 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite |
| Backend | Firebase (Auth, Firestore, Storage) |
| Styling | Vanilla CSS with CSS Variables |
| Routing | React Router DOM |
| Maps | Google Maps API (optional) |

## 🔑 Demo Credentials

### Officer Login
- Email: `officer@demo.com`
- Password: `demo123`

### Admin Access
- Navigate to `/admin/dashboard`
- (Configure Firebase for full functionality)

## 📸 Screenshots

### Landing Page
Beautiful hero section with gradient background and clear CTAs

### Report Issue
Intuitive form with photo upload and GPS location capture

### Analytics Dashboard
Data-rich insights with charts and export capabilities

## 🎯 Use Cases

1. **Citizens** - Report potholes, water leaks, garbage issues
2. **Officers** - Manage assigned complaints, update status
3. **Admins** - Monitor system performance, assign resources
4. **Government** - Data-driven decision making

## 🔧 Configuration

### Firebase Setup
1. Create project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication (Phone), Firestore, Storage
3. Copy config to `.env`

### Google Maps (Optional)
1. Get API key from [Google Cloud Console](https://console.cloud.google.com)
2. Add to `.env`: `VITE_GOOGLE_MAPS_API_KEY=your-key`

## 📝 API Structure

### Firestore Collections
- `users` - User profiles and roles
- `complaints` - All reported issues
- `departments` - Department configurations
- `feedback` - User ratings and comments

### Storage Structure
- `complaints/{id}/` - Issue photos
- `resolutions/{id}/` - Resolution photos

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
# Connect GitHub repo to Vercel
# Add environment variables in Vercel dashboard
```

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## 🤝 Contributing

This is a hackathon project. Feel free to:
- Add new features
- Improve UI/UX
- Enhance smart algorithms
- Add notifications (SMS, Email)

## 📄 License

MIT License - feel free to use for your hackathon or personal projects!

## 🏆 Hackathon Ready

This project includes:
- ✅ All must-have features from requirements
- ✅ Beautiful, modern UI
- ✅ Smart business logic
- ✅ Complete documentation
- ✅ Demo-ready screenshots

**Just add Firebase credentials and you're ready to present!** 🎉

## 📞 Support

For questions or issues:
1. Check the `walkthrough.md` for detailed guide
2. Review `implementation_plan.md` for architecture
3. See inline code comments

---

**Built with ❤️ for better communities**
