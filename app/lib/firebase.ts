// Import functions from Firebase SDK
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBJm9akmo-M8OTOMrF0K0XGvnDGZJhTfvc",
  authDomain: "my-jaaria-ae927.firebaseapp.com",
  databaseURL: "https://my-jaaria-ae927-default-rtdb.firebaseio.com",
  projectId: "my-jaaria-ae927",
  storageBucket: "my-jaaria-ae927.firebasestorage.app",
  messagingSenderId: "626960757237",
  appId: "1:626960757237:web:20a9770b37535521e6b0bc",
  measurementId: "G-RD8QERCGMJ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);
