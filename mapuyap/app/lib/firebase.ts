import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  databaseURL:
    "https://mapuyap-536ba-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mapuyap-536ba",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);