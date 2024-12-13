// Import the functions you need from the SDKs you need
import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBCFzT35bMFPBaHWDN4WR2QcQCpJ6S-aIE",
  authDomain: "social-qa-weight-tracker.firebaseapp.com",
  projectId: "social-qa-weight-tracker",
  storageBucket: "social-qa-weight-tracker.appspot.com",
  messagingSenderId: "392089484012",
  appId: "1:392089484012:web:39e23d243a3cfff0f503c9",
  measurementId: "G-EZY3S8BK63"
};

// Initialize Firebase
const firebaseApp: FirebaseApp = initializeApp(firebaseConfig)
export const db = getFirestore(firebaseApp)
getAnalytics(firebaseApp);