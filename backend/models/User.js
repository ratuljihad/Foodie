import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
    },
    role: {
        type: String,
        default: 'user',
    },
    coinBalances: [
        {
            restaurantId: {
                type: String, // Storing as String to match frontend/ordering logic
                required: true,
            },
            coins: {
                type: Number,
                default: 0,
            },
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export const User = mongoose.model('User', userSchema);
