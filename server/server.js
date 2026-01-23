const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();


const app = express();

// Super Admin Config
const SUPER_ADMIN = 'C241079';

// Trust proxy for secure cookies on Render/Heroku
app.set('trust proxy', 1);

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

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary Storage for Multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'profiles',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        transformation: [{ width: 400, height: 400, crop: 'fill' }]
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
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


    role: {
        type: String,
        enum: ['Student', 'Moderator', 'Admin'],
        default: 'Student'
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

    // Academic Progress Tracking (Completed Course Segments)
    academicProgress: [{
        courseCode: { type: String, required: true },
        term: { type: String, enum: ['mid', 'final'], required: true },
        segmentId: { type: Number, required: true },
        completedAt: { type: Date, default: Date.now }
    }],

    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Course Resource Schema
const resourceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    link: { type: String, required: true },
    type: {
        type: String,
        enum: ['slides', 'pdfs', 'notes', 'playlists', 'prev_question', 'notice'],
        required: true
    },
    segment: { type: Number, default: 0 } // 0 means term-level (like prev questions)
});

// Course Schema
const courseSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    semester: { type: Number, required: true },
    credits: { type: Number, default: 0 },
    isExtra: { type: Boolean, default: false },
    mid: {
        syllabus: { type: String, default: '' },
        resources: [resourceSchema]
    },
    final: {
        syllabus: { type: String, default: '' },
        resources: [resourceSchema]
    },
    updatedAt: { type: Date, default: Date.now }
});

const Course = mongoose.model('Course', courseSchema);

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
        this.profilePicture,
        this.phone,
        this.gender,
        this.bloodGroup,
        this.department,
        this.batch,
        this.email !== '',
        this.completedCredits !== undefined && this.completedCredits > 0,
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
                email: user.email,
                semester: user.semester
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

        // Auto-promote Super Admin on Login
        if (user.universityId === SUPER_ADMIN && user.role !== 'Admin') {
            user.role = 'Admin';
            await user.save();
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
                email: user.email,
                profilePicture: user.profilePicture,
                completedCredits: user.completedCredits,
                role: user.role,
                semester: user.semester
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
            completedCredits, expectedGraduation,
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

        // Delete old profile picture if exists on Cloudinary
        if (user.profilePicture && user.profilePicture.includes('cloudinary')) {
            try {
                // Extract public ID from Cloudinary URL
                const publicId = user.profilePicture.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`profiles/${publicId}`);
            } catch (err) {
                console.error('Error deleting old Cloudinary image:', err);
            }
        }

        // Save new picture path (Cloudinary URL)
        user.profilePicture = req.file.path;
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

        // Delete profile picture if exists on Cloudinary
        if (user.profilePicture && user.profilePicture.includes('cloudinary')) {
            try {
                const publicId = user.profilePicture.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`profiles/${publicId}`);
            } catch (err) {
                console.error('Error deleting Cloudinary image during account deletion:', err);
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
// Middleware to check for specific roles
const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.session.userId) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }

        // Find user to check role
        User.findById(req.session.userId).then(user => {
            if (!user) return res.status(404).json({ success: false, message: 'User not found' });

            // Auto-promote Super Admin
            if (user.universityId === SUPER_ADMIN && user.role !== 'Admin') {
                user.role = 'Admin';
                user.save();
            }

            // Admin has access to all roles' permissions
            if (user.role === 'Admin' || roles.includes(user.role)) {
                return next();
            }

            return res.status(403).json({ success: false, message: 'Access denied: Unauthorized role' });
        }).catch(err => {
            console.error('Role check error:', err);
            res.status(500).json({ success: false, message: 'Server error during role validation' });
        });
    };
};

app.get('/api/check-auth', async (req, res) => {
    if (req.session.userId) {
        const user = await User.findById(req.session.userId).select('-password');
        if (!user) {
            return res.json({ success: true, authenticated: false });
        }

        // Auto-promote Super Admin in Auth Check
        if (user.universityId === SUPER_ADMIN && user.role !== 'Admin') {
            user.role = 'Admin';
            await user.save();
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

        // Get semester courses from DB
        const userCourses = await Course.find({ semester: user.semester });

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

        // Get all courses from DB
        const allCourses = await Course.find({}).sort({ semester: 1, code: 1 });

        // Get user's enrolled codes (semester courses + extra courses)
        const enrolledCodes = [
            ...(await Course.find({ semester: user.semester })).map(c => c.code),
            ...(user.extraCourses || [])
        ];

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

        // Get semester courses from DB
        const semesterCourses = await Course.find({ semester: user.semester });

        // Get extra courses from DB
        const extraCourseCodes = user.extraCourses || [];
        const extraCourses = await Course.find({ code: { $in: extraCourseCodes } });

        // Combine and format
        const allUserCourses = [
            ...semesterCourses.map(c => ({ ...c.toObject(), isExtra: false })),
            ...extraCourses.map(c => ({ ...c.toObject(), isExtra: true }))
        ];

        res.json({
            success: true,
            courses: allUserCourses,
            user: {
                id: user._id,
                name: user.name,
                universityId: user.universityId,
                email: user.email,
                profilePicture: user.profilePicture,
                role: user.role,
                semester: user.semester,
                academicProgress: user.academicProgress
            },
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

        // Check if course exists in DB
        const course = await Course.findOne({ code: courseCode });

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Check if already enrolled (in semester courses or extra courses)
        const isAlreadyEnrolled = (course.semester === user.semester) || (user.extraCourses || []).includes(courseCode);

        if (isAlreadyEnrolled) {
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


// ==================== ACADEMIC PROGRESS TRACKING ====================

// ==================== MODERATOR APIs ====================

// Add dynamic resource to a course
app.post('/api/moderator/add-resource', checkRole(['Moderator', 'Admin']), async (req, res) => {
    try {
        const { courseCode, term, name, link, type, segment } = req.body;

        if (!courseCode || !term || !name || !link || !type) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const course = await Course.findOne({ code: courseCode });
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        const newResource = {
            name,
            link,
            type,
            segment: segment || 0
        };

        if (term === 'mid') {
            course.mid.resources.push(newResource);
        } else {
            course.final.resources.push(newResource);
        }

        course.updatedAt = Date.now();
        await course.save();

        res.json({ success: true, message: 'Resource added successfully', course });
    } catch (error) {
        console.error('Moderator Add Resource error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Delete resource from a course
app.delete('/api/moderator/delete-resource', checkRole(['Moderator', 'Admin']), async (req, res) => {
    try {
        const { courseCode, term, resourceId } = req.body;

        if (!courseCode || !term || !resourceId) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const course = await Course.findOne({ code: courseCode });
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        if (term === 'mid') {
            course.mid.resources = course.mid.resources.filter(r => r._id.toString() !== resourceId);
        } else {
            course.final.resources = course.final.resources.filter(r => r._id.toString() !== resourceId);
        }

        course.updatedAt = Date.now();
        await course.save();

        res.json({ success: true, message: 'Resource deleted successfully' });
    } catch (error) {
        console.error('Moderator Delete Resource error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


// ==================== ADMIN APIs ====================

// Promote Student to Moderator (Admin Only)
app.post('/api/admin/promote', checkRole(['Admin']), async (req, res) => {
    try {
        const { universityId } = req.body;
        if (!universityId) return res.status(400).json({ success: false, message: 'University ID required' });

        const user = await User.findOne({ universityId: universityId.toUpperCase() });
        if (!user) return res.status(404).json({ success: false, message: 'Student not found in database' });

        user.role = 'Moderator';
        await user.save();

        res.json({ success: true, message: `${user.name} promoted to Moderator` });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Demote Moderator to Student (Admin Only)
app.post('/api/admin/demote', checkRole(['Admin']), async (req, res) => {
    try {
        const { universityId } = req.body;
        if (!universityId) return res.status(400).json({ success: false, message: 'University ID required' });

        const user = await User.findOne({ universityId: universityId.toUpperCase() });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Cannot demote Super Admin
        if (user.universityId === SUPER_ADMIN) {
            return res.status(400).json({ success: false, message: 'Cannot demote Super Admin' });
        }

        user.role = 'Student';
        await user.save();

        res.json({ success: true, message: `${user.name} demoted to Student` });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// List all Moderators (Admin Only)
app.get('/api/admin/moderators', checkRole(['Admin']), async (req, res) => {
    try {
        const moderators = await User.find({ role: 'Moderator' }).select('name universityId role');
        res.json({ success: true, moderators });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Toggle academic segment completion

// Toggle academic segment completion
app.post('/api/academic-progress/toggle', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }

        const { courseCode, term, segmentId } = req.body;

        if (!courseCode || !term || segmentId === undefined) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check if segment is already completed
        const existingIndex = (user.academicProgress || []).findIndex(
            p => p.courseCode === courseCode && p.term === term && p.segmentId === Number(segmentId)
        );

        if (existingIndex > -1) {
            // Remove it (Toggle OFF)
            user.academicProgress.splice(existingIndex, 1);
        } else {
            // Add it (Toggle ON)
            if (!user.academicProgress) user.academicProgress = [];
            user.academicProgress.push({
                courseCode,
                term,
                segmentId: Number(segmentId),
                completedAt: Date.now()
            });
        }

        await user.save();
        res.json({
            success: true,
            message: existingIndex > -1 ? 'Progress removed' : 'Progress saved',
            academicProgress: user.academicProgress
        });

    } catch (error) {
        console.error('Error toggling academic progress:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 Academic Comeback Backend Started`);
});
