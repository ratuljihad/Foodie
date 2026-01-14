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
    description: {
        type: String,
        default: 'A great place to eat.',
    },
    coinRate: {
        type: Number,
        default: 5,
    },
    coinThreshold: {
        type: Number,
        default: 100,
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
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export const Restaurant = mongoose.model('Restaurant', restaurantSchema);
