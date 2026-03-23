# 🗑️ Smart Garbage Reporting System

A full-stack web application that lets citizens report garbage/waste using photo uploads and GPS location. Admins can view all reports on an interactive map and assign garbage trucks to resolve complaints.

---

## 📁 Project Structure

```
smart-garbage/
├── backend/                    # Node.js + Express API
│   ├── controllers/
│   │   ├── authController.js   # Register, login, get user
│   │   └── complaintController.js # CRUD for complaints
│   ├── middleware/
│   │   ├── auth.js             # JWT protect + adminOnly middleware
│   │   └── upload.js           # Multer + Cloudinary config
│   ├── models/
│   │   ├── User.js             # User schema (name, email, password, role)
│   │   └── Complaint.js        # Complaint schema (image, location, status)
│   ├── routes/
│   │   ├── auth.js             # /api/auth routes
│   │   └── complaints.js       # /api/complaints routes
│   ├── scripts/
│   │   └── seedAdmin.js        # One-time admin user seeder
│   ├── server.js               # Express app entry point
│   ├── .env.example            # Environment variable template
│   └── package.json
│
└── frontend/                   # React + Vite SPA
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx           # Top navigation
    │   │   ├── ComplaintCard.jsx    # Card for single complaint
    │   │   ├── ComplaintsMap.jsx    # Leaflet map with complaint pins
    │   │   └── StatusBadge.jsx     # Colored status chip
    │   ├── context/
    │   │   └── AuthContext.jsx     # Global auth state (login/logout)
    │   ├── pages/
    │   │   ├── LoginPage.jsx       # Login form
    │   │   ├── RegisterPage.jsx    # Register form
    │   │   ├── ReportPage.jsx      # Report garbage (photo + GPS)
    │   │   ├── UserDashboard.jsx   # User's submitted complaints
    │   │   └── AdminDashboard.jsx  # Admin: all complaints + map + update
    │   ├── utils/
    │   │   └── api.js              # Axios instance with auth interceptor
    │   ├── App.jsx                 # Router + protected routes
    │   ├── main.jsx                # React entry point
    │   └── index.css               # Tailwind directives + custom styles
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## 🔧 Prerequisites

Make sure you have these installed:
- **Node.js** v18+ → https://nodejs.org
- **npm** v9+
- **MongoDB Atlas** account (free) → https://mongodb.com/atlas
- **Cloudinary** account (free) → https://cloudinary.com

---

## ⚡ Quick Setup (Step by Step)

### Step 1 — Clone or create the project folder

```bash
# If you cloned from git:
git clone <your-repo-url>
cd smart-garbage

# Or just navigate to the folder you downloaded
```

---

### Step 2 — Set up MongoDB Atlas (free database)

1. Go to https://mongodb.com/atlas → Sign up / Log in
2. Create a new **Free Cluster** (M0 tier)
3. Under **Database Access** → Add a new user with username + password
4. Under **Network Access** → Add IP `0.0.0.0/0` (allow all — fine for dev)
5. Click **Connect** → **Connect your application** → Copy the connection string

It looks like:
```
mongodb+srv://myuser:mypassword@cluster0.abc12.mongodb.net/smart-garbage?retryWrites=true&w=majority
```

---

### Step 3 — Set up Cloudinary (free image hosting)

1. Go to https://cloudinary.com → Sign up / Log in
2. From the Dashboard, note your:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

---

### Step 4 — Configure Backend

```bash
cd backend

# Install dependencies
npm install

# Copy the .env template and fill in your values
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://your-connection-string-here
JWT_SECRET=pick_any_long_random_string_here_abc123xyz
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
ADMIN_EMAIL=admin@garbage.com
ADMIN_PASSWORD=Admin@123
```

**Seed the admin user** (run this once):
```bash
node scripts/seedAdmin.js
```
You should see: `✅ Admin created successfully!`

---

### Step 5 — Configure Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Copy the .env template
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

---

### Step 6 — Run the App

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Server running on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# App running on http://localhost:3000
```

Open your browser at **http://localhost:3000**

---

## 🔑 Default Credentials

| Role  | Email                | Password  |
|-------|----------------------|-----------|
| Admin | admin@garbage.com    | Admin@123 |
| User  | Register a new account |         |

---

## 📡 REST API Reference

### Auth Routes

| Method | Endpoint            | Auth      | Description              |
|--------|---------------------|-----------|--------------------------|
| POST   | /api/auth/register  | Public    | Create a new user account|
| POST   | /api/auth/login     | Public    | Login and get JWT token  |
| GET    | /api/auth/me        | Protected | Get current user profile |

**Register body:**
```json
{ "name": "Rahul", "email": "rahul@example.com", "password": "mypassword" }
```

**Login body:**
```json
{ "email": "rahul@example.com", "password": "mypassword" }
```

**Login response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": "...", "name": "Rahul", "email": "...", "role": "user" }
}
```

---

### Complaint Routes

| Method | Endpoint                | Auth         | Description                    |
|--------|-------------------------|--------------|--------------------------------|
| POST   | /api/complaints         | User         | Submit new complaint (multipart)|
| GET    | /api/complaints/user    | User         | Get current user's complaints  |
| GET    | /api/complaints/all     | Admin only   | Get all complaints             |
| PATCH  | /api/complaints/:id     | Admin only   | Update complaint status        |
| GET    | /api/complaints/:id     | Protected    | Get single complaint           |

**POST /api/complaints** — multipart/form-data:
```
image: <file>
latitude: 19.0760
longitude: 72.8777
address: "Bandra West, Mumbai"  (optional)
description: "Large pile near bus stop"  (optional)
```

**PATCH /api/complaints/:id** body:
```json
{ "status": "assigned" }
```
Valid statuses: `open` → `assigned` → `resolved`

---

## 🎨 Features Overview

### User
- ✅ Register / Login with JWT authentication
- ✅ Report garbage with photo upload (up to 5MB)
- ✅ Auto-capture GPS location via browser
- ✅ Reverse geocoding (address from coordinates via OpenStreetMap)
- ✅ Drag & drop image upload
- ✅ View all personal complaints with status
- ✅ Filter complaints by status

### Admin
- ✅ Secure admin-only dashboard
- ✅ View all complaints across all users
- ✅ Interactive Leaflet map with color-coded pins
- ✅ Color legend: 🔴 Open / 🟡 Assigned / 🟢 Resolved
- ✅ One-click truck assignment (Open → Assigned)
- ✅ One-click resolution (Assigned → Resolved)
- ✅ Filter by status
- ✅ Resolution progress bar

---

## 🚀 Deployment Guide

### Deploy Backend to Render (free)

1. Push your backend folder to a GitHub repo
2. Go to https://render.com → New Web Service
3. Connect your GitHub repo
4. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment Variables:** Add all the same .env values
5. Click **Create Web Service**
6. Note your deployed URL: `https://your-app.onrender.com`

### Deploy Frontend to Vercel (free)

1. Push your frontend folder to a GitHub repo (or monorepo)
2. Go to https://vercel.com → New Project
3. Import your repo, set **Root Directory** to `frontend`
4. Add environment variable:
   - `VITE_API_URL` = `https://your-app.onrender.com/api`
5. Click **Deploy**

---

## 🔍 How Each Part Works (Beginner Guide)

### JWT Authentication
When you log in, the server creates a special encrypted token (JWT). This token is stored in your browser. Every time you make an API request, this token is sent in the Authorization header so the server knows who you are — without needing to log in again.

### Image Upload Flow
1. User selects image in browser
2. Frontend sends the image as `multipart/form-data` via Axios
3. Multer (Express middleware) intercepts the file
4. CloudinaryStorage automatically streams the file to Cloudinary cloud
5. Multer returns `req.file.path` = the public Cloudinary URL
6. This URL is saved in MongoDB

### GPS Location
The browser's `navigator.geolocation.getCurrentPosition()` API returns latitude/longitude. We then make a free API call to OpenStreetMap's Nominatim service to reverse-geocode this into a human-readable address.

### Admin Map (Leaflet)
React-Leaflet renders an OpenStreetMap tile layer. For each complaint, we place a custom `divIcon` marker at its latitude/longitude coordinates. Clicking a marker shows a popup with the image, address, and status.

---

## 🧪 Testing the API with Thunder Client or Postman

1. **Register:** POST `http://localhost:5000/api/auth/register`
   ```json
   { "name": "Test User", "email": "test@test.com", "password": "test123" }
   ```

2. **Login:** POST `http://localhost:5000/api/auth/login` → copy the token

3. **Submit complaint:** POST `http://localhost:5000/api/complaints`
   - Set Header: `Authorization: Bearer <token>`
   - Body: form-data with `image` file, `latitude`, `longitude`

4. **View your complaints:** GET `http://localhost:5000/api/complaints/user`
   - Header: `Authorization: Bearer <token>`

---

## 🛠️ Tech Stack

| Layer     | Technology               | Why                          |
|-----------|--------------------------|------------------------------|
| Frontend  | React 18 + Vite          | Fast, modern SPA framework   |
| Styling   | Tailwind CSS             | Utility-first, responsive    |
| Routing   | React Router v6          | Client-side navigation       |
| HTTP      | Axios                    | Promise-based API calls      |
| Maps      | Leaflet + React-Leaflet  | Free, open-source maps       |
| Backend   | Node.js + Express.js     | Fast, minimal REST API       |
| Database  | MongoDB + Mongoose       | Flexible NoSQL for documents |
| Auth      | JWT + bcryptjs           | Stateless, secure auth       |
| Images    | Cloudinary               | Cloud image storage + CDN    |
| Upload    | Multer + Cloudinary SDK  | Stream files to cloud        |
