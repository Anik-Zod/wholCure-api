import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

async function updateAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const result = await mongoose.connection.db.collection('admins').updateOne(
      { email: 'admin@wholcare.com' },
      { $set: { role: 'superadmin' } }
    );
    console.log('Update result:', result);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

updateAdmin();
