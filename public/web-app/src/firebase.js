import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDPki4OvYu3DRXf__FsQj81vuZXsF-n380",
  authDomain: "aqi-hackathon-150925.firebaseapp.com",
  databaseURL: "https://aqi-hackathon-150925-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "aqi-hackathon-150925",
  storageBucket: "aqi-hackathon-150925.firebasestorage.app",
  messagingSenderId: "688524802229",
  appId: "1:688524802229:web:3a7bcda5d877cb15a2e6fc",
  measurementId: "G-4144PCG7J4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };
