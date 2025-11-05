# Customer Management Backend API

A Next.js backend API for managing customer visit details with Supabase database integration.

---

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

Go to your Supabase project and run this SQL in the SQL Editor:

```sql
-- =============================================
-- Customer Management Database Schema
-- =============================================

-- Table 1: Customers Table
CREATE TABLE IF NOT EXISTS customers (
    adhaar_number VARCHAR(12) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    date_of_visit DATE NOT NULL,
    purpose_of_visit TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX idx_customers_date_of_visit ON customers(date_of_visit DESC);

-- Add trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================

-- Table 2: Admin Authentication Table
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Insert default admin user (username: admin, password: admin123)
-- IMPORTANT: Change this password after first login!

-- First, generate the password hash by running this in your project terminal:
-- node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('admin123', 10).then(console.log);"

-- Then insert with the generated hash:
INSERT INTO admin_users (username, password_hash)
VALUES ('admin', 'YOUR_GENERATED_HASH_HERE')
ON CONFLICT (username) DO NOTHING;
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here
JWT_SECRET=your-random-secret-key
```

**Get your Supabase credentials:**

1. Go to https://supabase.com → Your Project
2. **Project Settings** → **API**
3. Copy **Project URL** → `SUPABASE_URL`
4. Copy **service_role key** (NOT anon key!) → `SUPABASE_SERVICE_KEY`

**Generate JWT_SECRET (PowerShell):**

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### 4. Generate Admin Password Hash

Run this in your terminal to generate the password hash for the admin user:

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('admin123', 10).then(console.log);"
```

Copy the output and use it in the SQL INSERT statement above.

### 5. Start the Server

```bash
npm run dev
```

Server runs at: `http://localhost:3000`

**Test it:**

```bash
curl http://localhost:3000/api/health
```

---

## 📡 API Endpoints

| Endpoint            | Method    | Auth | Description               |
| ------------------- | --------- | ---- | ------------------------- |
| `/api/health`       | GET       | ❌   | Health check              |
| `/api/login`        | POST      | ❌   | Login & get token         |
| `/api/logout`       | POST      | ✅   | Logout                    |
| `/api/addClient`    | POST      | ✅   | Add customer              |
| `/api/getClient`    | GET       | ✅   | Get all/specific customer |
| `/api/updateClient` | PUT/PATCH | ✅   | Update customer           |
| `/api/deleteClient` | DELETE    | ✅   | Delete customer           |

---

## 🔐 Authentication

### Login

**Endpoint:** `POST /api/login`

**Request:**

```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "admin"
}
```

**Token Validity:** 24 hours

### Using the Token

Include in all authenticated requests:

```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 📝 Customer Management APIs

### Add Client

**Endpoint:** `POST /api/addClient`

**Headers:**

```
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

**Request Body:**

```json
{
  "adhaar_number": "123456789012",
  "name": "John Doe",
  "date_of_visit": "25-12-2023",
  "purpose_of_visit": "General consultation",
  "notes": "First visit"
}
```

**Required Fields:**

- `adhaar_number` (12 digits)
- `name`
- `date_of_visit` (dd-mm-yyyy format)
- `purpose_of_visit`

**Optional Fields:**

- `notes`

**Response:**

```json
{
  "success": true,
  "message": "Client added successfully",
  "data": {
    "adhaar_number": "123456789012",
    "name": "John Doe",
    "date_of_visit": "25-12-2023",
    "purpose_of_visit": "General consultation",
    "notes": "First visit",
    "created_at": "2025-11-05T10:30:00.000Z",
    "updated_at": "2025-11-05T10:30:00.000Z"
  }
}
```

---

### Get All Clients

**Endpoint:** `GET /api/getClient`

**Headers:**

```
Authorization: Bearer YOUR_TOKEN
```

**Response:**

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "adhaar_number": "123456789012",
      "name": "John Doe",
      "date_of_visit": "25-12-2023",
      "purpose_of_visit": "General consultation",
      "notes": "First visit",
      "created_at": "2025-11-05T10:30:00.000Z",
      "updated_at": "2025-11-05T10:30:00.000Z"
    }
  ]
}
```

---

### Get Specific Client

**Endpoint:** `GET /api/getClient?adhaar_number=123456789012`

**Headers:**

```
Authorization: Bearer YOUR_TOKEN
```

**Response:**

```json
{
  "success": true,
  "data": {
    "adhaar_number": "123456789012",
    "name": "John Doe",
    "date_of_visit": "25-12-2023",
    "purpose_of_visit": "General consultation",
    "notes": "First visit"
  }
}
```

---

### Update Client

**Endpoint:** `PUT /api/updateClient` or `PATCH /api/updateClient`

**Headers:**

```
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

**Update Multiple Fields:**

```json
{
  "adhaar_number": "123456789012",
  "name": "John Doe Updated",
  "date_of_visit": "26-12-2023",
  "purpose_of_visit": "Follow-up consultation",
  "notes": "Second visit"
}
```

**Update Single Field:**

```json
{
  "adhaar_number": "123456789012",
  "notes": "Updated notes only"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Client updated successfully",
  "data": {
    "adhaar_number": "123456789012",
    "name": "John Doe Updated",
    "date_of_visit": "26-12-2023",
    "purpose_of_visit": "Follow-up consultation",
    "notes": "Second visit"
  }
}
```

---

### Delete Client

**Endpoint:** `DELETE /api/deleteClient?adhaar_number=123456789012`

**Headers:**

```
Authorization: Bearer YOUR_TOKEN
```

**Response:**

```json
{
  "success": true,
  "message": "Client deleted successfully",
  "deleted": {
    "adhaar_number": "123456789012",
    "name": "John Doe Updated"
  }
}
```

---

## 🧪 Testing in Postman

### 1. Health Check

- Method: `GET`
- URL: `http://localhost:3000/api/health`
- No auth needed

### 2. Login

- Method: `POST`
- URL: `http://localhost:3000/api/login`
- Body (raw JSON):

```json
{
  "username": "admin",
  "password": "admin123"
}
```

- **In Tests tab, add this to auto-save token:**

```javascript
if (pm.response.code === 200) {
  const response = pm.response.json();
  pm.environment.set("token", response.token);
}
```

### 3. Add Client

- Method: `POST`
- URL: `http://localhost:3000/api/addClient`
- Headers: `Authorization: Bearer {{token}}`
- Body (raw JSON):

```json
{
  "adhaar_number": "123456789012",
  "name": "John Doe",
  "date_of_visit": "05-11-2025",
  "purpose_of_visit": "General consultation",
  "notes": "First visit"
}
```

### 4. Get All Clients

- Method: `GET`
- URL: `http://localhost:3000/api/getClient`
- Headers: `Authorization: Bearer {{token}}`

### 5. Get Specific Client

- Method: `GET`
- URL: `http://localhost:3000/api/getClient?adhaar_number=123456789012`
- Headers: `Authorization: Bearer {{token}}`

### 6. Update Client

- Method: `PUT`
- URL: `http://localhost:3000/api/updateClient`
- Headers: `Authorization: Bearer {{token}}`
- Body (raw JSON):

```json
{
  "adhaar_number": "123456789012",
  "notes": "Updated notes"
}
```

### 7. Delete Client

- Method: `DELETE`
- URL: `http://localhost:3000/api/deleteClient?adhaar_number=123456789012`
- Headers: `Authorization: Bearer {{token}}`

---

## 📱 Mobile App Integration

### React Native Example

```javascript
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://your-api-url";

// Login
const login = async (username, password) => {
  const response = await axios.post(`${API_URL}/api/login`, {
    username,
    password,
  });

  const { token } = response.data;
  await AsyncStorage.setItem("authToken", token);
  return token;
};

// Add Client
const addClient = async (clientData) => {
  const token = await AsyncStorage.getItem("authToken");

  const response = await axios.post(
    `${API_URL}/api/addClient`,
    {
      adhaar_number: clientData.adhaarNumber,
      name: clientData.name,
      date_of_visit: clientData.dateOfVisit, // dd-mm-yyyy format
      purpose_of_visit: clientData.purpose,
      notes: clientData.notes,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};

// Get All Clients
const getAllClients = async () => {
  const token = await AsyncStorage.getItem("authToken");

  const response = await axios.get(`${API_URL}/api/getClient`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.data;
};

// Update Client
const updateClient = async (adhaarNumber, updates) => {
  const token = await AsyncStorage.getItem("authToken");

  const response = await axios.put(
    `${API_URL}/api/updateClient`,
    {
      adhaar_number: adhaarNumber,
      ...updates,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};

// Delete Client
const deleteClient = async (adhaarNumber) => {
  const token = await AsyncStorage.getItem("authToken");

  const response = await axios.delete(
    `${API_URL}/api/deleteClient?adhaar_number=${adhaarNumber}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};
```

---

## 🗄️ Database Schema

### Customers Table

- `adhaar_number` VARCHAR(12) PRIMARY KEY - 12-digit Aadhaar number
- `name` VARCHAR(255) NOT NULL - Customer name
- `date_of_visit` DATE NOT NULL - Visit date (stored as yyyy-mm-dd, input/output as dd-mm-yyyy)
- `purpose_of_visit` TEXT NOT NULL - Purpose of visit
- `notes` TEXT - Optional notes
- `created_at` TIMESTAMP - Auto-generated
- `updated_at` TIMESTAMP - Auto-updated

### Admin Users Table

- `id` SERIAL PRIMARY KEY
- `username` VARCHAR(100) UNIQUE NOT NULL
- `password_hash` VARCHAR(255) NOT NULL
- `created_at` TIMESTAMP
- `updated_at` TIMESTAMP

---

## ⚠️ Important Notes

1. **Date Format:** Always use `dd-mm-yyyy` format (e.g., `25-12-2023`)
2. **Aadhaar Number:** Must be exactly 12 digits
3. **Required Fields:** adhaar_number, name, date_of_visit, purpose_of_visit
4. **Optional Field:** notes
5. **Token Expiry:** 24 hours - login again after expiry
6. **Default Admin:** username: `admin`, password: `admin123` (change this!)

---

## 🔒 Security

- ✅ JWT-based authentication
- ✅ Bcrypt password hashing
- ✅ Service role key for backend operations
- ✅ Token expires after 24 hours
- ⚠️ Use HTTPS in production
- ⚠️ Never expose service_role key in client-side code
- ⚠️ Change default admin password immediately

---

## 🚨 Troubleshooting

### "Missing Supabase environment variables"

- Verify `.env.local` exists in root directory
- Check variable names: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `JWT_SECRET`
- Restart dev server after creating `.env.local`

### "Invalid credentials" on login

- Ensure `admin_users` table exists in Supabase
- Verify password hash was generated correctly
- Run: `node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('admin123', 10).then(console.log);"`
- Update the hash in the database

### "Invalid date format"

- Use `dd-mm-yyyy` format (e.g., `05-11-2025`)
- Ensure day, month, year are valid
- Use leading zeros (e.g., `05-11-2025`, not `5-11-2025`)

### "Missing or invalid authorization header"

- Include `Authorization: Bearer YOUR_TOKEN` in headers
- Token should be from `/api/login` response
- Token expires after 24 hours

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel settings
4. Deploy

### Environment Variables for Production

- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `JWT_SECRET` (generate a strong random key)

---

## 📊 Error Codes

| Code | Meaning      | Common Causes                  |
| ---- | ------------ | ------------------------------ |
| 200  | Success      | Request completed successfully |
| 201  | Created      | Client added successfully      |
| 400  | Bad Request  | Missing/invalid fields         |
| 401  | Unauthorized | Missing/invalid token          |
| 404  | Not Found    | Client doesn't exist           |
| 409  | Conflict     | Duplicate Aadhaar number       |
| 500  | Server Error | Database/server issue          |

---

## 📦 Project Structure

```
customer-management/
├── src/
│   ├── app/api/
│   │   ├── health/route.ts
│   │   ├── login/route.ts
│   │   ├── logout/route.ts
│   │   ├── addClient/route.ts
│   │   ├── getClient/route.ts
│   │   ├── updateClient/route.ts
│   │   └── deleteClient/route.ts
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── auth.ts
│   │   └── dateUtils.ts
│   └── middleware/
│       └── authMiddleware.ts
├── .env.local (create this)
├── package.json
└── README.md
```

---

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

---

## 📄 License

MIT

---

**Happy Coding! 🎉**
