// firebaseAdmin.js
const admin = require("firebase-admin");
const serviceAccount = require("./deligo_firebase_private_key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "deligo-9f8b3.firebasestorage.app",
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

module.exports = { db, bucket, admin };
