# 🚀 CalTrak — High-Performance Nutrition Engine

> A scalable, modular nutrition planning system built with Clean Architecture, SOLID principles, and OOP.

---

## 🧠 Why This Project Exists

Most calorie tracking apps are feature-heavy but poorly structured.

CalTrak focuses on:
- Architecture-first design  
- Separation of concerns  
- Scalability and maintainability  

This is a **system design project disguised as a nutrition app**.

---

## ✨ What Makes It Different

- 🔥 Layered architecture (not messy React code)
- 🧠 Strong domain modeling (Macro, NutritionPlan, UserProfile)
- 🔌 Swappable data sources (LocalStorage, MongoDB, Google Sheets)
- ⚙️ Dependency inversion applied correctly
- 🚫 No prop drilling (Zustand)

---

## 🏗️ Architecture

- **UI Layer** → React components (presentation only)  
- **Controllers** → Business logic  
- **Services** → Interfaces + implementations  
- **Data Layer** → Storage systems  

---

## 📊 Diagrams

### ER Diagram
<p align="center">
  <img src="assets/diagrams/ER Diagram.png" width="700"/>
</p>

### Sequence Diagram
<p align="center">
  <img src="assets/diagrams/Sequence Diagram.png" width="700"/>
</p>

### Use Case Diagram
<p align="center">
  <img src="assets/diagrams/UseCase Diagram.png" width="700"/>
</p>

---

## 🧩 Core Architecture

### 🔹 Domain Models

#### Macro
- Handles calorie calculations  
- Maintains macro ratios  
- `rebalanceTo()` for adjustments  

#### UserProfile
- Normalizes user data  
- Core domain entity  

#### NutritionPlan
- Aggregate root  
- Converts to legacy format  

---

### 🔹 Controllers

#### NutritionController
- `calcBMR()`  
- `calcTDEE()`  
- `calcMacros()`  
- `buildMilestones()`  
- `buildTimeline()`  

#### SessionController
- Manages sessions  
- Syncs local + remote data  

---

### 🔹 Services

**Interfaces**
- `ISessionRepository`  
- `IRemoteSessionService`  

**Implementations**
- `LocalSessionRepository` → localStorage  
- `MongoRemoteService` → MongoDB  
- `SheetsRemoteService` → Google Sheets  

---

### 🔹 Global State (Zustand)

- Eliminates prop drilling  
- Minimal boilerplate  
- Acts as a central store  

---

### 🔹 Custom Hooks

- `useCalculation` → calculate + save + navigate  
- `useAdminAccess` → authentication control  
- `useKeyboardShortcuts` → UX shortcuts  

---

### 🔹 Bootstrap (Composition Root)

- Central dependency injection  
- Uses Factory Pattern  
- Easily swap implementations  

---

## ⚙️ Features

- 📈 BMR, TDEE, macro calculations  
- 🔄 Pluggable backend system  
- ⚡ Optimized global state  
- 🧩 Modular architecture  

---

## 🛠️ Tech Stack

- React + TypeScript  
- Zustand  
- Express (Backend)  
- MongoDB Atlas  
- Railway  
- Vercel  

---

## 📉 Refactoring Impact

- Reduced `App.tsx` from 200+ lines → ~60 lines  
- Eliminated prop drilling  
- Extracted reusable logic  
- Clean separation of concerns  

