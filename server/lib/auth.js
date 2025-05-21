import { betterAuth } from "better-auth";
import { MongoClient, ObjectId } from "mongodb";
import config from '../config/config.js';
import constants from '../constants.js';

import { mongodbAdapter } from "better-auth/adapters/mongodb";

const client = new MongoClient(`${config.db.uri}/${constants.dbName}?retryWrites=true&w=majority`);
const db = client.db();

const auth = betterAuth({
  database: mongodbAdapter(db),
  user: {
    additionalFields: {
      profileId: {
        type: "ObjectId",
        required: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Optional: Modify user data before creation
          return { data: { ...user } };
        },
        after: async (user) => {
          // console.log("User created:", user);
          // Create a profile document in the profiles collection
          try {
            const profileResult = await db.collection("profiles").insertOne({
              userId: new ObjectId(user.id), // Reference to the user
              bio: "", // Default empty bio
              avatar: "", // Default empty avatar
              createdAt: new Date(), // Timestamp
            });
            const profileId = profileResult.insertedId;
            // console.log("Profile created with ID:", profileId);
            // Update the User document with the profileId
            await db.collection("user").updateOne(
              { _id: new ObjectId(user.id) },
              { $set: { profileId } }
            );
          } catch (error) {
            console.error("Error creating profile document:", error);
            throw error;
          }
        },
      },
    },
  },
  advanced: {
        crossSubDomainCookies: {
            enabled: true,
            domain: ".onrender.com", // Domain with a leading period
        },
        defaultCookieAttributes: {
            secure: true,
            httpOnly: true,
            sameSite: "none",  // Allows CORS-based cookie sharing across subdomains
            partitioned: true, // New browser standards will mandate this for foreign cookies
        },
    },

  trustedOrigins: [
    'https://onrender.com',
    `${constants?.clientUrl}`,
    `${constants?.serverUrl}`,
  ],

  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: config?.betterAuth?.github?.clientId,
      clientSecret: config?.betterAuth?.github?.clientSecret
    },
    google: {
      clientId: config?.betterAuth?.google?.clientId,
      clientSecret: config?.betterAuth?.google?.clientSecret
    }
  },
});

export default auth;
