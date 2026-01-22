import mongoose from 'mongoose';

const discountSchema = new mongoose.Schema({
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true,
    },
    code: {
        type: String,
        required: true,
        uppercase: true,
        trim: true,
    },
    type: {
        type: String,
        enum: ['percentage', 'flat'],
        required: true,
    },
    value: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    minOrder: {
        type: Number,
        default: 0,
    },
    validFrom: {
        type: Date,
        required: true,
    },
    validUntil: {
        type: Date,
        required: true,
    },
    usageLimit: {
        type: Number,
        default: null, // null means unlimited
    },
    usedCount: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

// Compound index to ensure code is unique per restaurant
discountSchema.index({ restaurantId: 1, code: 1 }, { unique: true });

export const Discount = mongoose.model('Discount', discountSchema);
