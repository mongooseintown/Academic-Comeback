const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const courses = require('./data/courses');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../client')));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true if using HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Create uploads directory if it doesn't exist
const uploadDir = './uploads/profiles';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for profile picture upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/profiles/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    }
});

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/academic-comeback';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    universityId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true,
        validate: {
            validator: function (v) {
                return /^C\d{6,}$/.test(v);
            },
            message: props => `${props.value} is not a valid University ID! Must start with 'C' followed by digits.`
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    semester: {
        type: Number,
        required: true,
        min: 1,
        max: 8
    },


    // Personal Information
    profilePicture: { type: String, default: '' },
    phone: { type: String, default: '' },
    dateOfBirth: { type: Date },
    bloodGroup: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', ''],
        default: ''
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other', ''],
        default: ''
    },

    // Academic Details
    department: { type: String, default: '' },
    // section removed
    batch: { type: String, default: '' },
    studentType: {
        type: String,
        enum: ['Regular', 'Irregular'],
        default: 'Regular'
    },
    currentCGPA: {
        type: Number,
        default: 0.00,
        min: 0,
        max: 4.00
    },
    targetCGPA: {
        type: Number,
        default: 0.00,
        min: 0,
        max: 4.00
    },
    completedCredits: { type: Number, default: 0 },
    expectedGraduation: { type: Date },
    extraCourses: [{ type: String }], // Array of course codes for extra enrolled courses


    // Contact & Address
    presentAddress: { type: String, default: '' },
    permanentAddress: { type: String, default: '' },
    city: { type: String, default: '' },
    country: { type: String, default: 'Bangladesh' },

    // Emergency Contact
    guardianName: { type: String, default: '' },
    guardianPhone: { type: String, default: '' },
    guardianRelationship: {
        type: String,
        enum: ['Father', 'Mother', 'Guardian', ''],
        default: ''
    },

    // Skills & Interests
    programmingLanguages: [{ type: String }],
    areasOfInterest: [{ type: String }],
    certifications: [{
        name: String,
        issuer: String,
        date: Date,
        url: String
    }],
    projects: [{
        title: String,
        description: String,
        url: String,
        technologies: [String]
    }],
    githubProfile: { type: String, default: '' },
    linkedinProfile: { type: String, default: '' },

    // Preferences & Settings
    studyGoals: { type: String, default: '' },
    preferredStudyTime: {
        type: String,
        enum: ['Morning', 'Afternoon', 'Evening', 'Night', ''],
        default: ''
    },
    notificationPreferences: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        push: { type: Boolean, default: true }
    },
    privacySettings: {
        profileVisibility: {
            type: String,
            enum: ['Public', 'University', 'Private'],
            default: 'University'
        }
    },

    // Metadata
    profileCompletionPercentage: { type: Number, default: 0 },
    lastProfileUpdate: { type: Date, default: Date.now },

    // Study Planner Tasks
    tasks: [{
        text: { type: String, required: true },
        completed: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
    }],

    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to calculate profile completion percentage
userSchema.methods.calculateProfileCompletion = function () {
    const fields = [
        this.name,
        this.universityId,
        this.email,
        this.semester,
        this.sessionType,
        this.profilePicture,
        this.phone,
        this.department,
        this.batch,
        this.currentCGPA > 0,
        this.completedCredits > 0,
        this.programmingLanguages && this.programmingLanguages.length > 0,
        this.areasOfInterest && this.areasOfInterest.length > 0,
        this.guardianName,
        this.guardianPhone
    ];

    const completedFields = fields.filter(field => field && field !== '' && field !== 0).length;
    const totalFields = fields.length;

    return Math.round((completedFields / totalFields) * 100);
};


const User = mongoose.model('User', userSchema);

// ==================== ROUTES ====================

// Signup Route
app.post('/api/signup', async (req, res) => {
    try {
        console.log('Signup Attempt:', req.body);
        const { name, email, password, universityId, semester } = req.body;

        // Validation
        if (!name || !email || !password || !universityId || !semester) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check if ID starts with 'C' (Basic check before db validation)
        if (!universityId.toUpperCase().startsWith('C')) {
            return res.status(400).json({
                success: false,
                message: "University ID must start with 'C'"
            });
        }

        // Validate semester range
        const semesterNum = parseInt(semester);
        if (isNaN(semesterNum) || semesterNum < 1 || semesterNum > 8) {
            return res.status(400).json({
                success: false,
                message: 'Semester must be between 1 and 8'
            });
        }

        // Validate session type


        // Check if user already exists (by email OR universityId)
        const existingUser = await User.findOne({
            $or: [{ email }, { universityId }]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this Email or University ID already exists'
            });
        }

        // Create new user
        const user = new User({
            name,
            email,
            password,
            universityId: universityId.toUpperCase(),
            semester: semesterNum
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, universityId: user.universityId },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        // Store user info in session
        req.session.userId = user._id;
        req.session.userName = user.name;
        req.session.universityId = user.universityId;
        req.session.semester = user.semester;

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                universityId: user.universityId,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error during signup'
        });
    }
});

// Login Route
app.post('/api/login', async (req, res) => {
    try {
        console.log('Login Attempt:', req.body);
        const { universityId, password } = req.body;

        // Validation
        if (!universityId || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide University ID and password'
            });
        }

        // Find user by University ID
        const user = await User.findOne({ universityId: universityId.toUpperCase() });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid University ID or password'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid University ID or password'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, universityId: user.universityId },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        // Store user info in session
        req.session.userId = user._id;
        req.session.userName = user.name;
        req.session.universityId = user.universityId;
        req.session.semester = user.semester;

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                universityId: user.universityId,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

// Logout Route
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error logging out'
            });
        }
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    });
});

// ==================== PROFILE ROUTES ====================

// Get Profile
app.get('/api/profile', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }

        const user = await User.findById(req.session.userId).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Calculate profile completion
        const completionPercentage = user.calculateProfileCompletion();
        user.profileCompletionPercentage = completionPercentage;
        await user.save();

        res.json({
            success: true,
            user: user,
            completionPercentage: completionPercentage
        });

    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update Profile
app.put('/api/profile', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }

        const {
            phone, dateOfBirth, bloodGroup, gender,
            department, batch, studentType,
            currentCGPA, targetCGPA, completedCredits, expectedGraduation,
            presentAddress, permanentAddress, city, country,
            guardianName, guardianPhone, guardianRelationship,
            programmingLanguages, areasOfInterest,
            githubProfile, linkedinProfile,
            studyGoals, preferredStudyTime,
            notificationPreferences, privacySettings
        } = req.body;

        const user = await User.findById(req.session.userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Update fields
        if (phone !== undefined) user.phone = phone;
        if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
        if (bloodGroup !== undefined) user.bloodGroup = bloodGroup;
        if (gender !== undefined) user.gender = gender;
        if (department !== undefined) user.department = department;
        if (batch !== undefined) user.batch = batch;
        if (studentType !== undefined) user.studentType = studentType;
        if (currentCGPA !== undefined) user.currentCGPA = currentCGPA;
        if (targetCGPA !== undefined) user.targetCGPA = targetCGPA;
        if (completedCredits !== undefined) user.completedCredits = completedCredits;
        if (expectedGraduation !== undefined) user.expectedGraduation = expectedGraduation;
        if (presentAddress !== undefined) user.presentAddress = presentAddress;
        if (permanentAddress !== undefined) user.permanentAddress = permanentAddress;
        if (city !== undefined) user.city = city;
        if (country !== undefined) user.country = country;
        if (guardianName !== undefined) user.guardianName = guardianName;
        if (guardianPhone !== undefined) user.guardianPhone = guardianPhone;
        if (guardianRelationship !== undefined) user.guardianRelationship = guardianRelationship;
        if (programmingLanguages !== undefined) user.programmingLanguages = programmingLanguages;
        if (areasOfInterest !== undefined) user.areasOfInterest = areasOfInterest;
        if (githubProfile !== undefined) user.githubProfile = githubProfile;
        if (linkedinProfile !== undefined) user.linkedinProfile = linkedinProfile;
        if (studyGoals !== undefined) user.studyGoals = studyGoals;
        if (preferredStudyTime !== undefined) user.preferredStudyTime = preferredStudyTime;
        if (notificationPreferences !== undefined) user.notificationPreferences = notificationPreferences;
        if (privacySettings !== undefined) user.privacySettings = privacySettings;

        user.lastProfileUpdate = Date.now();

        await user.save();

        // Recalculate completion
        const completionPercentage = user.calculateProfileCompletion();
        user.profileCompletionPercentage = completionPercentage;
        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: user,
            completionPercentage: completionPercentage
        });

    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Upload Profile Picture
app.post('/api/profile/picture', upload.single('profilePicture'), async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const user = await User.findById(req.session.userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Delete old profile picture if exists
        if (user.profilePicture) {
            const oldPath = path.join(__dirname, user.profilePicture);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        // Save new picture path
        user.profilePicture = '/uploads/profiles/' + req.file.filename;
        user.lastProfileUpdate = Date.now();
        await user.save();

        res.json({
            success: true,
            message: 'Profile picture uploaded successfully',
            profilePicture: user.profilePicture
        });

    } catch (error) {
        console.error('Profile picture upload error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Delete Account
app.delete('/api/user', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }

        const userId = req.session.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Delete profile picture if exists
        if (user.profilePicture) {
            const profilePicPath = path.join(__dirname, user.profilePicture);
            if (fs.existsSync(profilePicPath)) {
                try {
                    fs.unlinkSync(profilePicPath);
                } catch (err) {
                    console.error('Error deleting profile picture:', err);
                }
            }
        }

        // Delete user from database
        await User.findByIdAndDelete(userId);

        // Destroy session
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.status(500).json({ success: false, message: 'Error deleting account' });
            }
            res.json({ success: true, message: 'Account deleted successfully' });
        });

    } catch (error) {
        console.error('Account deletion error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Check Auth Status
app.get('/api/check-auth', async (req, res) => {
    if (req.session.userId) {
        const user = await User.findById(req.session.userId).select('-password');
        if (!user) {
            return res.json({ success: true, authenticated: false });
        }
        res.json({
            success: true,
            authenticated: true,
            user: user
        });
    } else {
        res.json({
            success: true,
            authenticated: false
        });
    }
});

// Get My Courses (based on user's semester)
app.get('/api/my-courses', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        // Fetch user to get their semester
        const user = await User.findById(req.session.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Load courses data
        const courses = require('./data/courses.js');
        const userCourses = courses[user.semester] || [];

        res.json({
            success: true,
            semester: user.semester,
            courses: userCourses
        });

    } catch (error) {
        console.error('My Courses error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Serve dashboard page (protected route)
app.get('/dashboard.html', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/index.html');
    }
    res.sendFile(path.join(__dirname, '../client/dashboard.html'));
});

// Serve course details page (protected route)
app.get('/course-details.html', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/index.html');
    }
    res.sendFile(path.join(__dirname, '../client/course-details.html'));
});

// Serve roadmap page (protected route)
app.get('/syllabus-roadmap.html', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/index.html');
    }
    res.sendFile(path.join(__dirname, '../client/syllabus-roadmap.html'));
});

// Serve study planner page (protected route)
app.get('/study-planner.html', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/index.html');
    }
    res.sendFile(path.join(__dirname, '../client/study-planner.html'));
});

// Serve progress tracker page (protected route)
app.get('/progress-tracker.html', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/index.html');
    }
    res.sendFile(path.join(__dirname, '../client/progress-tracker.html'));
});

// Get Platform Stats (Public)
app.get('/api/stats', async (req, res) => {
    try {
        // Count total users
        const userCount = await User.countDocuments();

        // Calculate total courses from courses.js
        const courses = require('./data/courses.js');
        let courseCount = 0;
        Object.values(courses).forEach(semesterCourses => {
            if (Array.isArray(semesterCourses)) {
                courseCount += semesterCourses.length;
            }
        });

        res.json({
            success: true,
            students: userCount,
            courses: courseCount,
            freeAccess: '100%'
        });

    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching stats'
        });
    }
});

// ==================== COURSE MANAGEMENT APIs ====================

// Get all available courses with user's enrolled courses
app.get('/api/all-courses', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }

        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Flatten all courses from all semesters
        const allCourses = [];
        for (let sem in courses) {
            courses[sem].forEach(course => {
                allCourses.push({
                    ...course,
                    semester: parseInt(sem)
                });
            });
        }

        // Get user's enrolled extra courses
        let enrolledCodes = user.extraCourses || [];

        // Also add current semester courses to enrolled list logic so they show as added
        if (courses[user.semester]) {
            const currentSemesterCodes = courses[user.semester].map(c => c.code);
            enrolledCodes = [...enrolledCodes, ...currentSemesterCodes];
        }

        const enrolledCourses = enrolledCodes.map(code => ({ code }));

        res.json({
            success: true,
            courses: allCourses,
            enrolledCourses: enrolledCourses,
            userSemester: user.semester
        });

    } catch (error) {
        console.error('Error fetching all courses:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get user's enrolled courses (semester courses + extra courses)
app.get('/api/user-courses', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }

        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Get semester courses
        const semesterCourses = courses[user.semester] || [];

        // Get extra courses
        const extraCourseCodes = user.extraCourses || [];
        const extraCourses = [];

        for (let sem in courses) {
            courses[sem].forEach(course => {
                if (extraCourseCodes.includes(course.code)) {
                    extraCourses.push({
                        ...course,
                        isExtra: true,
                        semester: parseInt(sem)
                    });
                }
            });
        }

        // Combine all courses
        const allUserCourses = [
            ...semesterCourses.map(c => ({ ...c, isExtra: false })),
            ...extraCourses
        ];

        res.json({
            success: true,
            courses: allUserCourses,
            semester: user.semester
        });

    } catch (error) {
        console.error('Error fetching user courses:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Add extra course to user profile
app.post('/api/add-course', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }

        const { courseCode } = req.body;

        if (!courseCode) {
            return res.status(400).json({ success: false, message: 'Course code is required' });
        }

        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check if course exists
        let courseExists = false;
        for (let sem in courses) {
            if (courses[sem].some(c => c.code === courseCode)) {
                courseExists = true;
                break;
            }
        }

        if (!courseExists) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Check if already enrolled (in semester courses or extra courses)
        const semesterCourses = courses[user.semester] || [];
        const alreadyInSemester = semesterCourses.some(c => c.code === courseCode);
        const alreadyInExtra = (user.extraCourses || []).includes(courseCode);

        if (alreadyInSemester || alreadyInExtra) {
            return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
        }

        // Add to extra courses
        if (!user.extraCourses) {
            user.extraCourses = [];
        }
        user.extraCourses.push(courseCode);
        await user.save();

        res.json({
            success: true,
            message: 'Course added successfully',
            extraCourses: user.extraCourses
        });

    } catch (error) {
        console.error('Error adding course:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Remove extra course from user profile
app.post('/api/remove-course', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }

        const { courseCode } = req.body;

        if (!courseCode) {
            return res.status(400).json({ success: false, message: 'Course code is required' });
        }

        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (!user.extraCourses || !user.extraCourses.includes(courseCode)) {
            return res.status(400).json({ success: false, message: 'Course not found in extra courses' });
        }

        // Remove from extra courses
        user.extraCourses = user.extraCourses.filter(code => code !== courseCode);
        await user.save();

        res.json({
            success: true,
            message: 'Course removed successfully',
            extraCourses: user.extraCourses
        });

    } catch (error) {
        console.error('Error removing course:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// ==================== STUDY PLANNER TASKS = :id ====================

// Get all tasks
app.get('/api/tasks', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }
        const user = await User.findById(req.session.userId).select('tasks');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, tasks: user.tasks });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Add a new task
app.post('/api/tasks', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ success: false, message: 'Task text is required' });
        }
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        user.tasks.push({ text });
        await user.save();
        res.json({ success: true, task: user.tasks[user.tasks.length - 1] });
    } catch (error) {
        console.error('Error adding task:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Delete a task
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        user.tasks = user.tasks.filter(task => task._id.toString() !== req.params.id);
        await user.save();
        res.json({ success: true, message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Toggle task completion
app.patch('/api/tasks/:id', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const task = user.tasks.id(req.params.id);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }
        task.completed = !task.completed;
        await user.save();
        res.json({ success: true, task });
    } catch (error) {
        console.error('Error toggling task:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 Academic Comeback Backend Started`);
});
