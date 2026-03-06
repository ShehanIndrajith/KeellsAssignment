# Keells HR Management System

Full-stack HR management system built for the Keells internship assignment.

## Tech Stack
- **Frontend**: React.js + Vite + Tailwind CSS
- **Backend**: ASP.NET Core Web API (.NET 8)
- **Database**: SQL Server
- **Data Access**: ADO.NET

## Project Structure
- `/frontend` — React application
- `/backend`  — ASP.NET Core Web API

## Getting Started

### Backend
1. Update connection string in `appsettings.json`
2. Run the SQL script in `/backend/Database/script.sql`
3. Run `dotnet run`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Features
- Department management (CRUD + Soft Delete + Reactivation)
- Employee management (CRUD + Soft Delete)
- Age auto-calculation from DOB
- Email validation
- React routing

## Database Setup
1. Open SQL Server Management Studio
2. Run the script at `Backend/Database/script.sql`

### Database file
backend/
└── Database/
    └── script.sql
