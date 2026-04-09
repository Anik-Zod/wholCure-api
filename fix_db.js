import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

async function fixDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const result = await mongoose.connection.db.collection('admins').updateMany(
      {},
      { $set: { isActive: true, isEmailVerified: true } }
    );
    console.log('Fixed DB:', result);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

fixDB();
