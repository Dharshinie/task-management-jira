// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDYY3aCIenNowqGea0TSbP4UMWa1eDlzoM",
  authDomain: "task-management-jira.firebaseapp.com",
  projectId: "task-management-jira",
  storageBucket: "task-management-jira.firebasestorage.app",
  messagingSenderId: "601736800620",
  appId: "1:601736800620:web:334664a8f1df759c0b6b49"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// initialize and export Firestore database instance
export const db = getFirestore(app);