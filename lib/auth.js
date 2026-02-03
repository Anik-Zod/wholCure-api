import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is not set. Auth Mongo client cannot connect.');
  throw new Error('Missing MONGO_URI');
}

const client = new MongoClient(process.env.MONGO_URI);
// Ensure the client is connected before using the adapter
try {
  await client.connect();
  console.log('Auth MongoClient connected');
} catch (err) {
  console.error('Failed to connect Auth MongoClient', err);
  throw err;
}

const db = client.db(process.env.MONGO_DB_NAME || undefined);

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client
  }),
   
  emailAndPassword: {
    enabled: true,
    maxPasswordLength: 64,
    minPasswordLength: 8,
  },

  phoneAndPassword: {
    enabled: true,
    maxPasswordLength: 64,
    minPasswordLength: 8,
  },


});
