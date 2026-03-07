                        Vaccination Management System

The Vaccination Management System allows users to manage vaccination records efficiently. Patients can register, provide their medical details, and select required vaccinations. The system ensures scheduling, dose booking, and patient-doctor interaction for better vaccination campaign management. The platform will support at least 3-4 vaccination campaigns at a time.


### Backend Tools
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

## 📝 Notes
- The `.env` file is required to run the backend
- SQLite database is used for development
- CORS is configured to allow requests from `http://localhost:5173`
- JWT access token expires in 1 hour, refresh token in 7 days

## Contributors
- JimIITDU (official university account), JimIIT (personal account - same developer)
- MD. MERAJUL ISLAM (official University account)