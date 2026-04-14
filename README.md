# 🚀 CalTrak-App

> A modular nutrition planning application built using layered architecture, OOP, and SOLID principles.

---

## 🧠 Overview

CalTrak-App is not just another calorie calculator — it’s a well-architected system that separates concerns across layers, making it easy to scale, test, and extend.

### The project demonstrates:

- Clean Architecture principles  
- Object-Oriented Design  
- Dependency Inversion & Abstraction  
- Real-world frontend state management  

---

## 🏗️ Architecture

The application follows a layered architecture:

- **UI (React Components)**  
- **Controllers (Business Logic)**  
- **Services (Interfaces & Implementations)**  
- **Data Layer (LocalStorage / Remote APIs)**  

---

## 🧩 Core Concepts

### 🔹 Models (OOP + Encapsulation)

- **Macro**
  - Handles calorie calculations  
  - Percentage distribution  
  - `rebalanceTo()` for dynamic adjustments  

- **UserProfile**
  - Normalizes user data (kg, cm, lbm)  
  - Acts as a core domain entity  

- **NutritionPlan**
  - Aggregate root  
  - `toLegacyResults()` for backward compatibility  

---

### 🔹 Controllers (Business Logic Layer)

- **NutritionController**
  - Refactored `calculateResults()` into:
    - `calcBMR()`  
    - `calcTDEE()`  
    - `calcMacros()`  
    - `buildMilestones()`  
    - `buildTimeline()`  

- **SessionController**
  - Manages session persistence  
  - Coordinates local + remote storage  

---

### 🔹 Services (Dependency Inversion)

- **Interfaces**
  - `ISessionRepository`  
  - `IRemoteSessionService`  

- **Implementations**
  - `LocalSessionRepository` → localStorage  
  - `MongoRemoteService` → MongoDB  
  - `SheetsRemoteService` → Google Sheets  

---

### 🔹 Store (Global State)

- Built using Zustand  
- Replaces multiple `useState` calls  
- Eliminates prop drilling  
- Uses Singleton pattern  

---

### 🔹 Hooks (Reusable Logic)

- `useCalculation` → calculate → save → navigate  
- `useAdminAccess` → authentication-based access  
- `useKeyboardShortcuts` → global shortcut handling  

---

### 🔹 Bootstrap (Composition Root)

- Central place for dependency wiring  
- Uses Factory Pattern  
- Easily swap implementations without changing core logic  

---

## ✨ Key Features

- Advanced nutrition calculation (BMR, TDEE, macros)  
- Clean layered architecture  
- Pluggable storage system  
- Optimized global state management  
- Modular and scalable design  

---

## 🛠️ Tech Stack

- React + TypeScript  
- Zustand  
- SOLID + OOP Architecture  
- LocalStorage + Remote APIs  

---

## 📉 Refactoring Highlights

- Reduced `App.tsx` from 200+ lines → ~60 lines  
- Eliminated prop drilling  
- Modularized business logic  
- Extracted reusable hooks and utilities  

---

---

## Backend (Railway + MongoDB Atlas)

The backend is in `backend/` and runs as an Express server on Railway.

### 1) MongoDB Atlas setup

- Create Atlas cluster
- Create a database user
- Allow network access (`0.0.0.0/0` for easiest setup)
- Copy SRV URI

### 2) Deploy backend to Railway

- Create a new Railway project and connect this repo
- `railway.json` is included and starts backend with:
  - `cd backend && npm start`

Set Railway environment variables:
- `MONGODB_URI` (required)
- `MONGODB_DB` (optional, default `caltrak`)
- `ADMIN_KEY` (required)
- `CORS_ORIGIN` (required, e.g. `https://your-frontend.vercel.app,http://localhost:5173`)

Health endpoint:
- `GET /health`

### 3) Frontend (Vercel) setup

In Vercel frontend env variables:
- `VITE_BACKEND_URL=https://<your-railway-service>.up.railway.app`
- `VITE_ADMIN_KEY=<same-admin-key>` (only if you use admin views from frontend)

### 4) Local development

Backend:
```bash
cd backend
npm install
npm run dev
```

Frontend:
```bash
npm install
npm run dev
```

Set local frontend env:
- `VITE_BACKEND_URL=http://localhost:3001`
