const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const findUser = async () => {
    await connectDB();
    const name = "hari koiral"; 
    // Search for name containing "hari" or "koiral" case insensitive
    const users = await User.find({ 
        name: { $regex: 'hari', $options: 'i' } 
    });
    
    console.log("Found users:");
    users.forEach(u => {
        console.log(`Name: ${u.name}`);
        console.log(`Email: ${u.email}`);
        console.log(`Role: ${u.role}`);
        console.log('---');
    });
    process.exit();
};

findUser();
