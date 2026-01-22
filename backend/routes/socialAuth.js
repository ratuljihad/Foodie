import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Restaurant } from '../models/Restaurant.js';

const router = express.Router();

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

// Store refresh tokens (in production, use Redis or database)
const refreshTokens = new Set();

// Helper function to generate tokens
const generateTokens = (payload) => {
    const secret = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-this-in-production';

    const accessToken = jwt.sign(payload, secret, { expiresIn: ACCESS_TOKEN_EXPIRY });
    const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: REFRESH_TOKEN_EXPIRY });
    return { accessToken, refreshToken };
};

// Helper function to generate random password for social users
const generateRandomPassword = () => {
    return Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
};

// Helper function to find or create social user
const findOrCreateSocialUser = async (profile, provider, role = 'user') => {
    const { id: providerId, email, name, picture } = profile;

    // Check if user exists with this provider ID
    let user = await User.findOne({ providerId, authProvider: provider });

    if (user) {
        // User exists, return it
        return user;
    }

    // Check if user exists with this email (from local or other provider)
    user = await User.findOne({ email });

    if (user) {
        // Email exists - link this provider to existing account
        // Update user to include new provider info
        user.authProvider = provider; // Update to latest provider
        user.providerId = providerId;
        if (picture && !user.profileImage) {
            user.profileImage = picture;
        }
        await user.save();
        return user;
    }

    // Create new user
    const randomPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    user = new User({
        email,
        password: hashedPassword,
        name,
        authProvider: provider,
        providerId,
        profileImage: picture || '',
        role,
    });

    await user.save();
    return user;
};

// Helper function to find or create social restaurant
const findOrCreateSocialRestaurant = async (profile, provider) => {
    const { id: providerId, email, name, picture } = profile;

    // Check if restaurant exists with this provider ID
    let restaurant = await Restaurant.findOne({
        email,
        // Restaurants don't have providerId field yet, so we check by email only
    });

    if (restaurant) {
        // Restaurant exists, return it
        return restaurant;
    }

    // For restaurants, we need additional info (country is required)
    // Return null to indicate additional info needed
    return null;
};

// Google OAuth Login
router.post('/google', async (req, res) => {
    try {
        const { credential, role = 'user' } = req.body;

        if (!credential) {
            return res.status(400).json({ error: 'Google credential is required' });
        }

        // Verify Google token
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

        let ticket;
        try {
            ticket = await client.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
        } catch (error) {
            console.error('Google token verification failed:', error);
            return res.status(401).json({ error: 'Invalid Google token' });
        }

        const payload = ticket.getPayload();
        const profile = {
            id: payload.sub,
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
        };

        if (role === 'restaurant') {
            // For restaurants, we need to handle differently
            // Check if restaurant exists
            const restaurant = await findOrCreateSocialRestaurant(profile, 'google');

            if (!restaurant) {
                // Restaurant doesn't exist, need to create with additional info
                // For now, return error asking for additional info
                return res.status(400).json({
                    error: 'Restaurant registration requires additional information',
                    needsRegistration: true,
                    profile,
                });
            }

            // Generate tokens
            const tokenPayload = { id: restaurant._id, email: restaurant.email, role: 'restaurant' };
            const { accessToken, refreshToken } = generateTokens(tokenPayload);
            refreshTokens.add(refreshToken);

            const restaurantObj = restaurant.toObject();
            delete restaurantObj.password;
            restaurantObj.id = restaurant._id;

            return res.json({
                user: restaurantObj,
                accessToken,
                refreshToken,
            });
        }

        // Handle user login
        const user = await findOrCreateSocialUser(profile, 'google', role);

        // Generate tokens
        const tokenPayload = { id: user._id, email: user.email, role: user.role };
        const { accessToken, refreshToken } = generateTokens(tokenPayload);
        refreshTokens.add(refreshToken);

        // Return user data (without password)
        const userObj = user.toObject();
        delete userObj.password;
        userObj.id = user._id;

        res.json({
            user: userObj,
            accessToken,
            refreshToken,
        });
    } catch (error) {
        console.error('Google OAuth error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Facebook OAuth Login
router.post('/facebook', async (req, res) => {
    try {
        const { accessToken, role = 'user' } = req.body;

        if (!accessToken) {
            return res.status(400).json({ error: 'Facebook access token is required' });
        }

        // Verify Facebook token and get user info
        let fbResponse;
        try {
            fbResponse = await axios.get(
                `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`
            );
        } catch (error) {
            console.error('Facebook token verification failed:', error);
            return res.status(401).json({ error: 'Invalid Facebook token' });
        }

        const fbData = fbResponse.data;

        if (!fbData.email) {
            return res.status(400).json({
                error: 'Email permission is required. Please grant email access to continue.'
            });
        }

        const profile = {
            id: fbData.id,
            email: fbData.email,
            name: fbData.name,
            picture: fbData.picture?.data?.url || '',
        };

        if (role === 'restaurant') {
            // For restaurants, we need to handle differently
            const restaurant = await findOrCreateSocialRestaurant(profile, 'facebook');

            if (!restaurant) {
                return res.status(400).json({
                    error: 'Restaurant registration requires additional information',
                    needsRegistration: true,
                    profile,
                });
            }

            // Generate tokens
            const tokenPayload = { id: restaurant._id, email: restaurant.email, role: 'restaurant' };
            const { accessToken: jwtAccessToken, refreshToken: jwtRefreshToken } = generateTokens(tokenPayload);
            refreshTokens.add(jwtRefreshToken);

            const restaurantObj = restaurant.toObject();
            delete restaurantObj.password;
            restaurantObj.id = restaurant._id;

            return res.json({
                user: restaurantObj,
                accessToken: jwtAccessToken,
                refreshToken: jwtRefreshToken,
            });
        }

        // Handle user login
        const user = await findOrCreateSocialUser(profile, 'facebook', role);

        // Generate tokens
        const tokenPayload = { id: user._id, email: user.email, role: user.role };
        const { accessToken: jwtAccessToken, refreshToken: jwtRefreshToken } = generateTokens(tokenPayload);
        refreshTokens.add(jwtRefreshToken);

        // Return user data (without password)
        const userObj = user.toObject();
        delete userObj.password;
        userObj.id = user._id;

        res.json({
            user: userObj,
            accessToken: jwtAccessToken,
            refreshToken: jwtRefreshToken,
        });
    } catch (error) {
        console.error('Facebook OAuth error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
