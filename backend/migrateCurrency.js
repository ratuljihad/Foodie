import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Food } from './models/Food.js';
import { Order } from './models/Order.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const EXCHANGE_RATE = 120;

async function migrate() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        // Convert Food prices
        console.log('Migrating Food prices...');
        const foods = await Food.find({});
        for (const food of foods) {
            food.price = food.price * EXCHANGE_RATE;
            await food.save();
        }
        console.log(`Updated ${foods.length} food items.`);

        // Convert Order totals
        console.log('Migrating Order prices...');
        const orders = await Order.find({});
        for (const order of orders) {
            order.total = (order.total || 0) * EXCHANGE_RATE;
            if (order.items && order.items.length > 0) {
                order.items = order.items.map(item => ({
                    ...item,
                    price: (item.price || 0) * EXCHANGE_RATE
                }));
            }
            await order.save();
        }
        console.log(`Updated ${orders.length} orders.`);

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
