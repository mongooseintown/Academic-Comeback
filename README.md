# Academic Comeback - EdTech Platform

A modern educational platform with user authentication and MongoDB integration.

## 🚀 Features

- ✅ User Registration & Login
- ✅ MongoDB Database Integration
- ✅ Password Hashing with bcrypt
- ✅ JWT Authentication
- ✅ Session Management
- ✅ Protected Dashboard Route
- ✅ Responsive Design
- ✅ Modern UI with Animations

## 📋 Prerequisites

Before running this project, make sure you have:

1. **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
2. **MongoDB** - You can use either:
   - Local MongoDB installation - [Download here](https://www.mongodb.com/try/download/community)
   - MongoDB Atlas (Cloud) - [Sign up here](https://www.mongodb.com/cloud/atlas/register)

## 🛠️ Installation & Setup

### Step 1: Install Dependencies

Open terminal in the project directory and run:

```bash
npm install
```

### Step 2: Configure MongoDB

1. **If using Local MongoDB:**
   - Make sure MongoDB is running on your system
   - The default connection string is: `mongodb://localhost:27017/academic-comeback`

2. **If using MongoDB Atlas (Cloud):**
   - Create a free cluster on MongoDB Atlas
   - Get your connection string
   - Update the `.env` file with your connection string

### Step 3: Configure Environment Variables

The `.env` file is already created. Update it if needed:

```env
MONGODB_URI=mongodb://localhost:27017/academic-comeback
JWT_SECRET=your-secret-key-change-this-in-production
PORT=3000
SESSION_SECRET=your-session-secret-change-this-in-production
```

**Important:** Change the secret keys in production!

### Step 4: Start the Server

```bash
npm start
```

Or for development with auto-restart:

```bash
npm run dev
```

You should see:
```
✅ Connected to MongoDB
🚀 Server running on http://localhost:3000
📚 Academic Comeback Backend Started
```

### Step 5: Access the Application

Open your browser and go to:
- **Landing Page:** http://localhost:3000/index.html
- **About Page:** http://localhost:3000/about.html
- **Dashboard:** http://localhost:3000/dashboard.html (requires login)

## 📱 How to Use

### Sign Up
1. Click "Sign Up" button in the navbar
2. Fill in your name, email, and password
3. Click "Sign Up"
4. You'll be automatically logged in and redirected to the dashboard

### Log In
1. Click "Log In" button in the navbar
2. Enter your email and password
3. Click "Log In"
4. You'll be redirected to the dashboard

### Dashboard
- After logging in, you'll see your personalized dashboard
- Your name and email will be displayed
- Click "Log Out" to sign out

## 🗂️ Project Structure

```
Academic Comeback/
├── server.js           # Express server with MongoDB
├── package.json        # Dependencies
├── .env               # Environment variables
├── index.html         # Landing page
├── about.html         # About page
├── dashboard.html     # Protected dashboard page
├── styles.css         # Global styles
├── script.js          # Landing page scripts
├── dashboard.js       # Dashboard scripts
└── README.md          # This file
```

## 🔒 Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT token authentication
- ✅ Session-based authentication
- ✅ Protected routes
- ✅ CORS enabled
- ✅ Input validation

## 🐛 Troubleshooting

### Server won't start
- Make sure MongoDB is running
- Check if port 3000 is available
- Verify all dependencies are installed

### Can't connect to MongoDB
- Check if MongoDB service is running
- Verify the connection string in `.env`
- For Atlas, check your IP whitelist

### Login/Signup not working
- Make sure the server is running
- Check browser console for errors
- Verify the API endpoint URLs

## 📝 API Endpoints

- `POST /api/signup` - Register new user
- `POST /api/login` - Login user
- `POST /api/logout` - Logout user
- `GET /api/check-auth` - Check authentication status

## 🎨 Technologies Used

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **Authentication:** JWT, bcryptjs
- **Session:** express-session

## 📄 License

This project is for educational purposes.

## 👨‍💻 Development

To run in development mode with auto-restart:

```bash
npm run dev
```

This uses nodemon to automatically restart the server when files change.

---

**Happy Learning! 🎓**
