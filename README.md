# Full Stack User Management System

This project is a full-stack application built with Laravel (backend) and React (frontend). It features user authentication, role-based access control, and a phonebook system.

## Prerequisites

Before you begin, ensure you have the following installed:
- PHP (>= 8.1)
- Composer
- Node.js & npm
- MySQL
- Git

## Project Setup

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd <project-directory>
```

### 2. Backend Setup (Laravel)



1. Install PHP dependencies:
```bash
composer install
```

2. Generate application key:
```bash
php artisan key:generate
```

3. Run database migrations and seed:
```bash
php artisan migrate:fresh --seed
```

4. Start the Laravel server:
```bash
php artisan serve
```
The backend will be running on `http://localhost:8000`

### 3. Frontend Setup (React)

1. Navigate to the React directory:
```bash
cd react
```

2. Install Node dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm run dev
```
The frontend will be running on `http://localhost:3000`

## Default Admin Account

After running the seeders, you can log in with the following admin account:
- Email: admin@mail.com
- Password: 12345678

## Features

- User Authentication (Login/Signup)
- Role-based Access Control (Admin/Student)
- User Management (CRUD operations - Admin only)
- Phonebook (Accessible to all users)
- Pagination
- Responsive Design

## Project Structure

- `/` - Laravel backend
  - `/app` - Core application code
  - `/database` - Migrations and seeders
  - `/routes` - API routes

- `/react` - React frontend
  - `/src/views` - React components
  - `/src/components` - Reusable components
  - `/src/contexts` - React context providers

## Common Issues & Solutions

1. If you get a CORS error:
   - Ensure both servers are running
   - Check if the VITE_API_BASE_URL in React's .env matches your Laravel server URL

2. If database connection fails:
   - Verify your database credentials in Laravel's .env
   - Ensure MySQL service is running

3. If npm install fails:
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and package-lock.json and try again

## Development Workflow

1. Backend changes:
   - Make changes in Laravel
   - Run `php artisan serve` to test

2. Frontend changes:
   - Make changes in React code
   - Run `npm run dev` to see changes

## Additional Notes

- The application uses Laravel Sanctum for authentication
- React Router is used for frontend routing
- Role-based access control is implemented for the Users page
- All users can access the Phonebook feature
- The database seeder creates one admin user and 10 random users
