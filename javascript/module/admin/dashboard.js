import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBRMjjr5remFfzHiScxfmXK79JwWQ7c-3M",
  authDomain: "login-lakshh.firebaseapp.com",
  projectId: "login-lakshh",
  storageBucket: "login-lakshh.appspot.com",
  messagingSenderId: "214721614258",
  appId: "1:214721614258:web:c3bebff238d815d25994ab",
  measurementId: "G-4EEXFMT14S",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function updateDocumentCount() {
  try {
    const userRolesCollection = collection(db, 'userRoles');
    const snapshot = await getDocs(userRolesCollection);
    const docCount = snapshot.size;

    // Update the inner HTML of the element with the ID 'total-users'
    document.getElementById('total-users').innerHTML = `${docCount}`;
  } catch (error) {
    console.error("Error fetching document count: ", error);
  }
}

// Call the function to update the document count
updateDocumentCount();
