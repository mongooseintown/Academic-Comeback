const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// Define Schemas (Must match server.js)
const resourceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    link: { type: String, required: true },
    type: { type: String, required: true },
    segment: { type: Number, default: 0 }
});

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
    }
});

const Course = mongoose.model('Course', courseSchema);

// Import Data
const coursesData = require('./data/courses');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/academic-comeback';

async function migrate() {
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB for migration');

        // Clear existing courses to avoid duplicates during dev
        await Course.deleteMany({});
        console.log('🗑️  Cleared existing courses');

        let totalCourses = 0;
        for (const semester in coursesData) {
            const coursesList = coursesData[semester];
            for (const courseInfo of coursesList) {
                const newCourse = new Course({
                    ...courseInfo,
                    semester: parseInt(semester)
                });
                await newCourse.save();
                totalCourses++;
            }
        }

        console.log(`🎉 Successfully migrated ${totalCourses} courses!`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
