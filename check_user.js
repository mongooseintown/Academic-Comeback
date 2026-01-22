const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/academic-comeback';

async function checkUser() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        const userSchema = new mongoose.Schema({
            universityId: String
        });
        const User = mongoose.model('User', userSchema);

        const user = await User.findOne({ universityId: 'C241079' });
        if (user) {
            console.log('User C241079 EXISTS');
        } else {
            console.log('User C241079 DOES NOT EXIST');
            const allUsers = await User.find({}, { universityId: 1 }).limit(5);
            console.log('Sample users in DB:', allUsers.map(u => u.universityId));
        }

        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

checkUser();
