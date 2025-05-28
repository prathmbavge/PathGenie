import { betterAuth } from "better-auth";
import { MongoClient, ObjectId } from "mongodb";
import config from '../config/config.js';
import constants from '../constants.js';
// import { Resend } from "resend";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
// const resend = new Resend(constants.RESEND_API_KEY);
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
  trustedOrigins: [
    'https://onrender.com',
    `${constants?.clientUrl}`,
    `${constants?.serverUrl}`,
  ],

  emailAndPassword: {
    enabled: true,
    // requireEmailVerification: true,
    // emailVerification: {
    //   sendOnSignUp: true,
    //   autoSignInAfterVerification: true,
    //   sendVerificationEmail: async ({ user, url }) => {
    //     await resend.emails.send({
    //       from: "PathGenie <onboarding@resend.dev>",
    //       to: user.email,
    //       subject: "Verify your email",
    //       html: `<a href="${url}">Click here to verify your email</a>`,
    //     });
    //   },
    //   sendResetPassword: async ({ user, url }) => {
    //   await resend.emails.send({
    //     from: "Your App <onboarding@resend.dev>",
    //     to: user.email,
    //     subject: "Reset your password",
    //     html: `<a href="${url}">Click here to reset your password</a>`,
    //   });
    // },
    // },
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
