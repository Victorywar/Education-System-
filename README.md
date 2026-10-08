SMART COMMUNITY EDUCATION SYSTEM 🎓
=================================

A web application built to help underprivileged students learn practical skills through weekend and holiday community programs. 

Instead of reading static notes, students play through interactive, game-like levels (Level 1 to Level 10), solve challenges, assemble architectural models (like a skyscraper, bicycle, or bridge), and unlock an official certificate when they complete a course.

---

WHY THIS PROJECT?
-----------------

Traditional learning often relies on passive reading ("Mark as Completed"). This platform changes that by introducing:
* Interactive Learning: Every level requires active problem-solving or speech practice.
* Visual Motivation: A locked certificate unblurs step-by-step as students advance through levels.
* Community Support: Volunteers can upload study materials and host offline weekend classes.
* Administrative Oversight: Admins verify volunteers and monitor student activity to prevent dropouts.

---

USER ROLES & KEY FEATURES
-------------------------

1. Student Portal 🎒
* 10-Level Progressive Learning: Courses (Logical Reasoning, Coding, Communication, Abacus, Aptitude) feature progressive difficulty from beginner to advanced.
  * Level 1: 5 foundational questions.
  * Level 2: 10 intermediate questions.
  * Level 3+: 15 advanced questions.
* Story-Based Construction Canvas: Students can pick a theme:
  * 🏢 Skyscraper: Watch a tower build from foundation to roof spire.
  * 🚲 Bicycle: Assemble parts from frame and gears to spinning wheels.
  * 🤝 Bridge of Empathy: Build a connecting bridge between two riverbanks.
* Progressive Certificate Unlock: The certificate starts completely blurred. Completing levels clears the blur until Level 10 unlocks a printable certificate.
* Speech & Pronunciation Practice: Communication modules use browser microphone speech recognition to check pronunciation accuracy.
* Inactivity Reminder: A warning banner appears if a student has been inactive for 15 or more days.
* Weekend Class Enrollment: Students can browse nearby weekend batches and register for seats.

2. Volunteer Portal 🤝
* Create Classes: Schedule offline weekend or holiday classes with custom titles, dates, locations, and seat limits.
* Upload Study Materials: Share resources using links, videos, PDFs, documents, or images (up to 10 MB).
* Attendance & Roster: View registered student lists for every scheduled session.

3. Administrator Portal 🛡️
* Volunteer Approvals: Review and approve newly registered volunteer accounts before they can log in.
* 30-Day Inactive Student Tracking: Identify students inactive for 30+ days to follow up or remove dormant records.
* System Analytics: Track active learners, registered classes, and completed certificates.

---

TECHNOLOGY STACK
----------------

| Layer | Technologies Used |
| :--- | :--- |
| Frontend | React 18, Vite, Tailwind CSS, Lucide Icons, Web Speech API |
| Backend | Node.js, Express.js (REST API, JWT Authentication) |
| Database | MongoDB & Mongoose |
| Styling & Effects | Tailwind CSS, Custom SVG Canvas, CSS Keyframes |
| Tools & Version Control | Git, GitHub, npm |

---

PROJECT FOLDER STRUCTURE
------------------------

smart-community-education-system/
├── backend/
│   ├── config/             Database connection setup
│   ├── controllers/        Route controllers (auth, student, class, etc.)
│   ├── data/               Skills catalog and question challenges
│   ├── middleware/         JWT and role-based access checks
│   ├── models/             Mongoose schemas (Student, Volunteer, Class, etc.)
│   ├── routes/             Express API endpoints
│   ├── seed/               Database seed scripts
│   └── server.js           Main backend entry point
│
├── frontend/
│   ├── public/             Static icons and assets
│   ├── src/
│   │   ├── components/     Reusable UI cards, buttons, navbar, footer
│   │   ├── context/        Authentication context
│   │   ├── data/           Builder themes and skills data
│   │   ├── pages/          Student, Volunteer, Admin screens
│   │   ├── services/       Axios API service helpers
│   │   ├── App.jsx         App router and protected routes
│   │   └── main.jsx        React root entry point
│   ├── index.html
│   └── vite.config.js
│
├── .gitignore
└── README.md

---

HOW TO RUN THE PROJECT LOCALLY
------------------------------

1. Prerequisites
* Node.js (version 18 or above)
* MongoDB running locally or a MongoDB Atlas connection string
* Git

2. Clone the Repository
git clone https://github.com/Victorywar/Education-System-.git
cd Education-System-

3. Backend Setup
Step 1: Open a terminal and navigate to the backend folder:
cd backend
npm install

Step 2: Create a .env file inside the backend folder:
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/smart_community_education
JWT_SECRET=my_super_secret_jwt_key
NODE_ENV=development

Step 3: Seed the database with initial data:
npm run seed:admin
npm run seed
npm run seed:classes

Step 4: Start the backend server:
npm run dev
The backend will run on http://localhost:5000.

4. Frontend Setup
Step 1: Open a new terminal and navigate to the frontend folder:
cd frontend
npm install

Step 2: Start the Vite development server:
npm run dev
The frontend will run on http://localhost:5173.

---

DEMO LOGIN CREDENTIALS
----------------------

| Role | Username | Password | Login URL |
| :--- | :--- | :--- | :--- |
| Admin | admin | admin123 | /admin/login |
| Volunteer | volunteer | volunteer123 | /volunteer/login |
| Student | student | student123 | /login |

---

LICENSE
-------

This project is licensed under the MIT License.
