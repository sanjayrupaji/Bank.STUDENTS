# MongoDB Setup Guide

The banking app uses **multi-document transactions** (for deposits, withdrawals, and transfers),
which require MongoDB to run as a **replica set** — a plain standalone installation will throw:

> `MongoServerError: Transaction numbers are only allowed on a replica set member or mongos`

Choose one of the two options below.

---

## ✅ Option A — MongoDB Atlas (Recommended — No Local Setup)

MongoDB Atlas has a **free tier (M0)** that supports replica sets out of the box.

1. Go to **https://cloud.mongodb.com** and sign up (free)
2. Create a **Free Shared Cluster (M0 Sandbox)**
3. **Database Access** → Add a database user
   - Username: `bankuser` (or anything you like)
   - Password: generate a secure password
   - Role: `Read and write to any database`
4. **Network Access** → Add IP Address → `0.0.0.0/0` (allow from anywhere for dev)
5. **Connect** → **Connect your application** → Driver: Node.js → copy the string
6. Open `backend/.env` and set:
   ```env
   MONGO_URI=mongodb+srv://bankuser:<password>@cluster0.xxxxx.mongodb.net/studentbank?retryWrites=true&w=majority
   ```
   Replace `<password>` with the password you set in step 3.

7. Start the backend:
   ```powershell
   cd backend
   npm run dev
   ```

---

## 🖥️ Option B — Local MongoDB with Replica Set (Windows)

### Step 1: Install MongoDB

Download and install [MongoDB Community Edition](https://www.mongodb.com/try/download/community).
During installation, check **"Install MongoDB as a Service"**.

Or install via winget:
```powershell
winget install MongoDB.Server
```

### Step 2: Stop the Default MongoDB Service

```powershell
# Run as Administrator
net stop MongoDB
```

### Step 3: Create a Data Directory

```powershell
New-Item -ItemType Directory -Force "C:\data\rs0"
```

### Step 4: Start MongoDB with Replica Set Mode

```powershell
# Run in a NEW terminal window (keep it open)
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" `
  --replSet rs0 `
  --dbpath "C:\data\rs0" `
  --port 27017 `
  --bind_ip 127.0.0.1
```

> **Adjust the version path** (`7.0`) to match your installed MongoDB version.

### Step 5: Initialize the Replica Set (one-time only)

Open another terminal and run:

```powershell
"C:\Program Files\MongoDB\Server\7.0\bin\mongosh.exe" --eval "rs.initiate()"
```

You should see:
```json
{ "ok": 1 }
```

### Step 6: Configure `.env`

In `backend/.env`, set:
```env
MONGO_URI=mongodb://127.0.0.1:27017/studentbank_banking?replicaSet=rs0
```

### Step 7: Start the Backend

```powershell
cd backend
npm run dev
```

You should see:
```
info: MongoDB connected
info: Banking API listening on port 3000
```

---

## 🌐 Verifying the Connection

Once the backend is running, open:
```
http://localhost:3000/api/health
```

Expected response:
```json
{
  "success": true,
  "data": {
    "database": "connected",
    "uptime": 12
  }
}
```

---

## 🚀 Starting the Full App

Open **two terminals**:

**Terminal 1 — Backend:**
```powershell
cd "backend"
npm run dev
```

**Terminal 2 — Frontend:**
```powershell
cd "banking-dashboard"
npm run dev
```

Then open: **http://localhost:5173**

### Seed the Admin Account (first time only):
```powershell
cd backend
npm run seed:admin
```

This creates the admin user defined in `ADMIN_EMAIL` and `ADMIN_PASSWORD` in your `.env`.
