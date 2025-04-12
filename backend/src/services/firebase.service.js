const admin = require('firebase-admin');
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : require('../config/firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

exports.verifyFirebaseToken = async (idToken) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    throw new Error('Invalid Firebase token');
  }
};

exports.getUserByEmail = async (email) => {
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    return userRecord;
  } catch (error) {
    throw new Error('User not found in Firebase');
  }
};

exports.createFirebaseUser = async (email, password) => {
  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      emailVerified: false
    });
    return userRecord;
  } catch (error) {
    throw new Error('Error creating Firebase user');
  }
};