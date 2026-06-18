# 🎓 Placement Hub — Campus Placement Portal

A full-stack MERN web application for managing campus placements.

## 🚀 Tech Stack

- *Frontend:* React.js, React Router DOM, CSS
- *Backend:* Node.js, Express.js
- *Database:* MongoDB Atlas
- *Authentication:* JWT (JSON Web Tokens)

## 👥 Roles

| Role | Access |
|------|--------|
| Student | View companies, apply, track applications |
| Coordinator | Manage department companies and students |
| Placement Head | Manage all departments, process shortlisting |
| Admin | Full system access |

## ✨ Features

- Role-based access control
- Department-wise isolation
- CGPA eligibility filtering
- Application deadline alerts
- Automated shortlisting via CSV upload
- Automated notifications
- Announcement board with auto-expiry
- Company registration link integration

## 📦 Installation

### Backend
bash
cd server
npm install
npm run dev


### Frontend
bash
cd frontend
npm install
npm start


## 🔧 Environment Variables

Create server/.env file:
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret_key

## 👨‍💻 Team

- Karthik — Backend Developer
- Sowmya — Frontend Developer

## 📅 Development Timeline

- Days 1-9: Backend APIs + HTML Frontend
- Days 10-13: React Dashboard
- Days 14-15: Placement Head Role
- Day 16: Advanced Features
