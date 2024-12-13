// Import the functions you need from the SDKs you need
import { initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCt0Dv4RLQAXuNRVOVrkce2du9qGxbRLz8",
  authDomain: "social-qa-weight-tracker.firebaseapp.com",
  projectId: "social-qa-weight-tracker",
  storageBucket: "social-qa-weight-tracker.appspot.com",
  messagingSenderId: "492938673700",
  appId: "1:492938673700:web:6a015b5a503431d9d862b1",
  measurementId: "G-L477V2THTE"
};

const firebaseApp: FirebaseApp = initializeApp(firebaseConfig)
export const db = getFirestore(firebaseApp)
getAnalytics(firebaseApp);