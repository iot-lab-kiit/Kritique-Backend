import admin from "firebase-admin";
import dotenv from "dotenv";
dotenv.config();

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID as string,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL as string,
    privateKey: (process.env.FIREBASE_PRIVATE_KEY as string)?.replace(
      /\\n/g,
      "\n"
    ),
  }),
});

export const firebaseAuth: admin.auth.Auth = admin.auth();
