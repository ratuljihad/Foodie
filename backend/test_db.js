import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            console.error('Error: MONGODB_URI is not defined in .env');
            process.exit(1);
        }
        console.log(`Attempting to connect to: ${uri.replace(/:([^:@]{1,})@/, ':****@')}`); // Mask password
        const conn = await mongoose.connect(uri);
        console.log(`✅ Success! MongoDB Connected: ${conn.connection.host}`);
        console.log(`Database Name: ${conn.connection.name}`);
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    }
};

connectDB();
