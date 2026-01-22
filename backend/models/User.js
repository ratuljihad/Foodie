import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: function () {
            // Password only required for local authentication
            return this.authProvider === 'local';
        },
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
    authProvider: {
        type: String,
        enum: ['local', 'google', 'facebook'],
        default: 'local',
    },
    providerId: {
        type: String,
        sparse: true, // Allows null values while maintaining uniqueness for non-null values
    },
    profileImage: {
        type: String,
    },
    currency: {
        type: String,
        default: 'BDT',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Compound index for social login uniqueness
userSchema.index({ providerId: 1, authProvider: 1 }, { unique: true, sparse: true });


export const User = mongoose.model('User', userSchema);
