import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
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

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const email = user.email; // Use email as the document ID
    const userRef = doc(db, "userRoles", email);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists() || userDoc.data().role !== "user") {
      window.location.href = "index.html";
    } else {
      document.getElementById("content").style.display = "block"; // Show content
    }
  } else {
    window.location.href = "index.html";
  }
});
