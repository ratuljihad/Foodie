import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema({
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
        default: 'restaurant',
    },
    address: {
        type: String,
    },
    cuisine: {
        type: String,
        default: 'Multi-cuisine',
    },
    country: {
        type: String,
        required: true,
        trim: true,
        enum: ['Bangladesh', 'India', 'Italy', 'China', 'Thailand', 'USA', 'UK', 'Mexico', 'Japan'],
    },
    description: {
        type: String,
        default: 'A great place to eat.',
    },
    rating: {
        type: Number,
        default: 4.5,
    },
    eta: {
        type: String,
        default: '30-45 mins',
    },
    image: {
        type: String,
        default: '',
    },
    thumbnail: {
        type: String,
        default: '',
    },
    gallery: {
        type: [String],
        default: [],
    },
    logo: {
        type: String,
        default: '',
    },
    logoStatus: {
        type: String,
        enum: ['none', 'pending', 'approved', 'rejected'],
        default: 'none',
    },
    logoSettings: {
        width: { type: Number, default: 40 },
        height: { type: Number, default: 40 },
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 },
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export const Restaurant = mongoose.model('Restaurant', restaurantSchema);
