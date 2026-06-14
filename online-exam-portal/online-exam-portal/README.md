# 📝 Online Exam Portal
**Full Stack Project | Java Spring Boot + MySQL + HTML/CSS/JS**

---

## 🛠️ Tech Stack
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Java 17 + Spring Boot 3.2
- **Database:** MySQL 8.0
- **Auth:** JWT (JSON Web Tokens) + Spring Security

---

## 📁 Project Structure
```
online-exam-portal/
├── frontend/
|   |── static
|          |──Logo.png
│   ├── index.html              ← Login & Register
│   ├── student-dashboard.html  ← Student UI
│   ├── admin-dashboard.html    ← Admin UI
│   ├── css/style.css
│   └── js/
│       ├── app.js              ← Shared utilities
│       ├── student.js          ← Student logic
│       └── admin.js            ← Admin logic
├── backend/
│   ├── pom.xml
│   └── src/main/java/com/examportal/
│       ├── model/              ← JPA Entities
│       ├── repository/         ← Spring Data JPA
│       ├── controller/         ← REST API
│       ├── security/           ← JWT + Spring Security
│       └── OnlineExamPortalApplication.java
├── database/
│   └── schema.sql              ← MySQL schema + sample data
└── README.md
```

---

## ⚙️ Setup Instructions

### Step 1: Database Setup
1. Install MySQL 8.0 and start it
2. Open MySQL Workbench or terminal
3. Run the SQL file:
```sql
source /path/to/database/schema.sql
```

### Step 2: Backend Setup
1. Install **Java 17** and **Maven**
2. Open `backend/src/main/resources/application.properties`
3. Update your MySQL password:
```properties
spring.datasource.password=YOUR_MYSQL_PASSWORD
```
4. Navigate to backend folder and run:
```bash
cd online-exam-portal
cd backend
mvn spring-boot:run
```
5. Backend will start at: `http://localhost:8080`

### Step 3: Frontend Setup
1. No build tool needed — pure HTML/CSS/JS!
2. Open `frontend/index.html` in your browser
3. Or use VS Code Live Server extension for best experience

---

## 🔐 Demo Login Credentials
| Role    | Email                  | Password    |
|---------|------------------------|-------------|
| Admin   | admin@exam.com         | admin123    |
| Student | student@exam.com       | student123  |

---

## ✨ Features

### 👨‍💼 Admin
- ✅ Login with JWT authentication
- ✅ Dashboard with stats (students, exams, attempts)
- ✅ Create, Edit, Delete exams
- ✅ Add / Delete questions with 4 options (MCQ)
- ✅ View all student results

### 🎓 Student
- ✅ Login / Register
- ✅ View available exams
- ✅ Take timed exam with countdown timer
- ✅ Auto-submit when time runs out
- ✅ Navigate between questions
- ✅ See answered/unanswered question dots
- ✅ Instant result with score & pass/fail
- ✅ View exam history

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint           | Description      |
|--------|--------------------|------------------|
| POST   | /api/auth/login    | Login            |
| POST   | /api/auth/register | Register student |

### Admin (requires ADMIN JWT)
| Method | Endpoint                        | Description           |
|--------|---------------------------------|-----------------------|
| GET    | /api/admin/exams                | Get all exams         |
| POST   | /api/admin/exams                | Create exam           |
| PUT    | /api/admin/exams/{id}           | Update exam           |
| DELETE | /api/admin/exams/{id}           | Delete exam           |
| GET    | /api/admin/exams/{id}/questions | Get questions         |
| POST   | /api/admin/exams/{id}/questions | Add question          |
| DELETE | /api/admin/questions/{id}       | Delete question       |
| GET    | /api/admin/results              | Get all results       |
| GET    | /api/admin/stats                | Dashboard stats       |

### Student (requires STUDENT JWT)
| Method | Endpoint                            | Description         |
|--------|-------------------------------------|---------------------|
| GET    | /api/student/exams                  | Get available exams |
| POST   | /api/student/exams/{id}/start       | Start exam          |
| POST   | /api/student/exams/submit/{id}      | Submit exam         |
| GET    | /api/student/results                | My results          |

---

## 📦 Maven Dependencies
- spring-boot-starter-web
- spring-boot-starter-security
- spring-boot-starter-data-jpa
- mysql-connector-j
- jjwt (JWT tokens)
- lombok
- spring-boot-starter-validation

---

## 🚀 Deployment
- **Frontend:** Deploy on Netlify / Vercel / GitHub Pages
- **Backend:** Deploy on Render / Railway / AWS EC2
- **Database:** MySQL on PlanetScale / AWS RDS / local server

---

*Built for Final Year Engineering Project — TCS Domain*
