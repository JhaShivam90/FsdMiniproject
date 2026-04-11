# SwachhNet - Smart Garbage Reporting System

A comprehensive municipal garbage management and reporting system designed for BMC wark operations. This system handles the complete dispatch flow, allowing citizens to file reports, algorithms connecting complaints to geographical ward offices, and automatically dispatching truck drivers who will arrive, clean the issue, and provide photo verification via a live worker dashboard.

## Prerequisites

Before running the project locally, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16.0 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local installation or MongoDB Atlas cloud URI)
- API Keys for Cloudinary (For image persistence)

## Installation & Local Setup

### 1. Database & Cloudinary Configuration (Backend)
Navigate to the `backend` folder and configure your environment variables.

```bash
cd backend
npm install
```

Copy the `.env.example` file to create your own configuration:
- Duplicate `backend/.env.example` -> `backend/.env`
- Insert your MongoDB connection URI and Cloudinary credentials.

### 2. Configure Frontend
Navigate to the `frontend` folder and set up environment variables there.

```bash
cd ../frontend
npm install
```

- Duplicate `frontend/.env.example` -> `frontend/.env`
- Set `VITE_API_URL` to point to the backend (e.g., `http://localhost:5000/api`)

### 3. Database Seeding
You need realistic administrative data before interacting with the tool.
To wipe any old tables and seed the exact 8 Ward Authorities and 12 Trucks (with functional routing GPS data):
```bash
cd backend
node scripts/seedData.js
```

### 4. Running the Application
You'll need two terminal windows to run both the frontend and backend servers.

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```
Open your browser to `http://localhost:5173` (or the port Vite provides) to start.

---

## Logins for Sandbox Testing

The seed script (`seedData.js`) creates out-of-the-box accounts using a single universal password: `password123`.

**Citizen Account** (To submit a mock report):
- `user@test.com`

**Ward Admin Authorities** (To assign dispatch logic / manually review completed trips):
- `p_north@bmc.gov.in` (Malad Ward)
- `r_central@bmc.gov.in` (Borivali Ward)
- `k_west@bmc.gov.in` (Andheri West Ward)
- (Check `seedData.js` for the other active 5 authority emails).

**Truck Drivers** (To take "After" pictures of the completed dispatch):
- Gorai Garage: `driver1@test.com`, `driver2@test.com`, `driver3@test.com`
- Malad Garage: `driver4@test.com`, `driver5@test.com`, `driver6@test.com`
- Santacruz Garage: `driver7@test.com`, etc.
- Versova Garage: `driver10@test.com`, etc.
