import { auth, db, doc, getDoc, collection, getDocs, addDoc, query, where, onAuthStateChanged } from '../firebase_config.js';

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const email = user.email;
    
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
