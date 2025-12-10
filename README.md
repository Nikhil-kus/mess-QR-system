# Mess QR System MVP

A simple web app to manage hostel mess meals using QR codes and Firebase.

## Setup Instructions

### 1. Firebase Setup
1. Go to [console.firebase.google.com](https://console.firebase.google.com/).
2. Create a new project.
3. Enable **Realtime Database** (start in **Test Mode** for simplicity, or set Rules below).
4. Register a Web App and copy the `firebaseConfig` object.
5. Paste the config into `services/firebase.ts`.

### 2. Database Rules
Go to **Realtime Database > Rules** and paste this:
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

### 3. Running the App
1. Install dependencies:
   ```bash
   npm install firebase html5-qrcode react react-dom react-scripts typescript
   ```
2. Start the dev server:
   ```bash
   npm start
   ```

## Admin Features

### 1. Admin Login
*   Navigate to Admin Login (`/#/admin/login`).
*   Enter the Admin Password.
*   **Default Password:** `admin123`.
*   **Custom Password:** Set the key `adminPassword` in your Firebase Realtime Database to your desired password string.

### 2. Admin Dashboard
*   Access "Add Student" or "Daily Reports".

### 3. Add Student
*   Fill details, generate ID, and save.
*   The system creates a record with `hasPaid: false` by default.

### 4. Daily Reports
*   View summary cards and detailed table of daily meals.

## User Flows

*   **Student:** Navigate to `/#/student?id={DB_ID}` to view their card.
*   **Mess Staff:** Navigate to `/#/scanner` to scan QR codes.