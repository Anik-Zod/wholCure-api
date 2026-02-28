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

  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5000",
  trustedOrigins: [
    process.env.FRONTEND_URL,
    process.env.ADMIN_URL,
    process.env.OGAGLOW_URL,
    process.env.OGAGLOW_ADMIN_URL,
    process.env.FRONTEND_URL_LOCAL,
    process.env.ADMIN_URL_LOCAL,
    process.env.OGAGLOW_URL_LOCAL
  ].filter(Boolean),

  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    cookiePrefix: "ogaglow",
    // Ensure cookies are accessible across origins in dev (Lax) and strict in prod
    // However, for decoupled domains (cross-site), we need SameSite=None and Secure.
    // Better-Auth handles this automatically based on baseURL and production mode.
  },

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

  user: {
    additionalFields: {
      phoneNumber: {
        type: "string",
        required: false,
      },
      address: {
        type: "string",
        required: false,
      },
      city: {
        type: "string",
        required: false,
      },
      role: {
        type: "string",
        required: false,
        defaultValue: "customer",
      },
    }
  }

});
