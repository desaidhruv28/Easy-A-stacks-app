# React + Node.js + MongoDB Application

## Prerequisites
- Node.js
- MongoDB installed and running locally

## Setup Instructions

### MongoDB
1. Ensure MongoDB is installed and running locally
2. Default connection URL: mongodb://localhost:27017/myapp

### Backend
1. cd backend
2. npm install
3. Create .env file with your MongoDB URI
4. npm run dev

### Frontend
1. cd frontend
2. npm install
3. npm start

## Available Scripts

In the backend directory:
- `npm run dev`: Starts the backend server with nodemon
- `npm start`: Starts the backend server

In the frontend directory:
- `npm start`: Starts the development server
- `npm run build`: Builds the app for production

## API Endpoints
- GET /api/users: Get all users
- POST /api/users: Create a new user
