import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  onSnapshot,
} from "firebase/firestore";

let config = {
  apiKey: "AIzaSyDir-JGOJvHS6fsoUhqXw94HnIx7rVBSiQ",
  authDomain: "cloud-education-cb112.firebaseapp.com",
  projectId: "cloud-education-cb112",
  storageBucket: "cloud-education-cb112.appspot.com",
  messagingSenderId: "1771704143",
  appId: "1:1771704143:web:e7fbf8947f558a53c37f3a",
  measurementId: "G-WWEHYRNHPT",
};
const app = initializeApp(config);
const db = getFirestore(app);

export default db;
