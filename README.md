# 💉 VacciCare — Vaccination Management System

A full-stack web application for managing vaccination campaigns, appointments, and records.

---

## 👥 Team
| Name | Role |
|------|------|
| Your Friend | Backend Developer (Django, REST API, Database) |
| You | Frontend Developer (React, UI, API Integration) |

---

## 🛠️ Tech Stack

### Backend
- **Python** + **Django 6.0**
- **Django REST Framework** — API development
- **SimpleJWT** — JWT Authentication
- **SQLite** — Database
- **ReportLab** — PDF Certificate generation
- **django-cors-headers** — CORS handling

### Frontend
- **React** + **Vite**
- **Tailwind CSS** — Styling
- **Axios** — API calls
- **React Router** — Navigation
- **Context API** — Auth state management

---

## 📁 Project Structure

```
Covid_campaign/
├── backend/
│   ├── accounts/         # Users, Profiles, Roles, Auth
│   ├── campaigns/        # Campaigns & Vaccines
│   ├── operations/       # Bookings & Vaccination Records
│   ├── reviews/          # Campaign Reviews
│   ├── core/             # URL routing hub
│   ├── covid_campaign_system/  # Django settings
│   ├── .env              # Environment variables
│   └── manage.py
└── frontend/
    └── src/
        ├── pages/
        │   ├── LandingPage.jsx
        │   ├── ProfilePage.jsx
        │   ├── auth/
        │   │   ├── LoginPage.jsx
        │   │   └── RegisterPage.jsx
        │   ├── patient/
        │   │   ├── PatientDashboard.jsx
        │   │   ├── BookAppointment.jsx
        │   │   └── CampaignReviews.jsx
        │   └── doctor/
        │       ├── DoctorDashboard.jsx
        │       ├── ManageCampaigns.jsx
        │       ├── ManageVaccines.jsx
        │       └── VaccinatePage.jsx
        ├── context/
        │   └── AuthContext.jsx
        ├── services/
        │   └── api.js
        └── App.jsx
```

---

## 🚀 Setup & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- Git

---

### Backend Setup

```bash
# 1. Navigate to backend folder
cd backend

# 2. Create virtual environment
python -m venv venv

# 3. Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 4. Install dependencies
pip install django djangorestframework djangorestframework-simplejwt pillow reportlab python-decouple django-cors-headers

# 5. Create .env file in backend folder
# Add these lines:
# SECRET_KEY=your-secret-key-here
# DEBUG=True

# 6. Run migrations
python manage.py migrate

# 7. Create superuser (admin)
python manage.py createsuperuser

# 8. Start backend server
python manage.py runserver
```

Backend runs at: `http://127.0.0.1:8000`
Admin panel at: `http://127.0.0.1:8000/admin`

---

### Frontend Setup

```bash
# 1. Navigate to frontend folder
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 🔗 API Endpoints

### Authentication
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/v1/auth/register/patient/` | Public | Register as patient |
| POST | `/api/v1/auth/register/doctor/` | Doctor only | Register as doctor |
| POST | `/api/v1/auth/login/` | Public | Login & get JWT tokens |
| POST | `/api/v1/auth/change-password/` | Authenticated | Change password |
| GET/PUT | `/api/v1/profiles/me/` | Authenticated | View/update profile |
| GET | `/api/v1/doctors/` | Public | List all doctors |

### Campaigns
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/campaigns/` | Authenticated | List all campaigns |
| POST | `/api/v1/campaigns/` | Doctor | Create campaign |
| GET | `/api/v1/campaigns/<id>/vaccines/` | Authenticated | List vaccines in campaign |
| POST | `/api/v1/vaccines/` | Doctor | Add vaccine to campaign |
| PATCH | `/api/v1/vaccines/<id>/` | Doctor | Update vaccine |
| DELETE | `/api/v1/vaccines/<id>/` | Doctor | Delete vaccine |

### Bookings & Operations
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/bookings/my-bookings/` | Patient | View my bookings |
| POST | `/api/v1/bookings/` | Patient | Book appointment (auto creates dose 2) |
| POST | `/api/v1/bookings/<id>/cancel/` | Patient | Cancel booking |
| GET | `/api/v1/doctor/appointments/` | Doctor | View daily appointments |
| POST | `/api/v1/vaccinate/` | Doctor | Record vaccination |
| GET | `/api/v1/certificates/<nid>/` | Authenticated | Download PDF certificate |

### Reviews
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/campaigns/<id>/reviews/` | Authenticated | Get campaign reviews |
| POST | `/api/v1/reviews/` | Patient | Write a review |
| GET | `/api/v1/reviews/my-reviews/` | Patient | View my reviews |

---

## 📱 Frontend Pages

| Page | Route | Access |
|------|-------|--------|
| Landing Page | `/` | Public |
| Login | `/login` | Public |
| Register | `/register` | Public |
| Patient Dashboard | `/patient/dashboard` | Patient |
| Book Appointment | `/patient/book` | Patient |
| Campaign Reviews | `/patient/reviews` | Patient |
| Patient Profile | `/patient/profile` | Patient |
| Doctor Dashboard | `/doctor/dashboard` | Doctor |
| Manage Campaigns | `/doctor/campaigns` | Doctor |
| Manage Vaccines | `/doctor/campaigns/:id/vaccines` | Doctor |
| Record Vaccination | `/doctor/vaccinate/:id` | Doctor |
| Doctor Profile | `/doctor/profile` | Doctor |

---

## ✅ Features

- ✅ JWT Authentication (Login/Register)
- ✅ Role-based access control (Doctor & Patient)
- ✅ Patient registration with NID verification
- ✅ Doctor & Patient profile management
- ✅ Create & manage vaccination campaigns
- ✅ Add vaccines to campaigns with dose intervals
- ✅ Book vaccine appointments
- ✅ Auto-generate dose 2 based on dose interval
- ✅ Doctor records vaccinations with batch numbers
- ✅ Campaign reviews & ratings by patients
- ✅ PDF vaccination certificate download
- ✅ Django Admin panel for system management

---

## 🗄️ Database Schema

### Key Relationships
- **User** 1:1 **Profile** — Every user has one profile
- **User** M:N **Role** — Users can have multiple roles
- **Campaign** 1:N **Vaccine** — A campaign has many vaccines
- **Patient** 1:N **Booking** — A patient can have many bookings
- **Booking** 1:1 **VaccinationRecord** — One booking = one vaccination record
- **Patient** 1:N **CampaignReview** — A patient can review campaigns they attended

---

## 🔐 Test Credentials

### Admin
- URL: `http://127.0.0.1:8000/admin`
- Email: `admin@admin.com`
- Password: `admin1234`

### Doctor
- Email: `doctor@test.com`
- Password: `Test1234!`

### Patient
- Email: `patient2@test.com`
- Password: `Test1234!`

---

## 📝 Notes
- The `.env` file is required to run the backend
- SQLite database is used for development
- CORS is configured to allow requests from `http://localhost:5173`
- JWT access token expires in 1 hour, refresh token in 7 days