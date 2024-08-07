import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBRMjjr5remFfzHiScxfmXK79JwWQ7c-3M",
    authDomain: "login-lakshh.firebaseapp.com",
    projectId: "login-lakshh",
    storageBucket: "login-lakshh.appspot.com",
    messagingSenderId: "214721614258",
    appId: "1:214721614258:web:c3bebff238d815d25994ab",
    measurementId: "G-4EEXFMT14S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
auth.languageCode = 'en';
const provider = new GoogleAuthProvider();

const allowedDomain = '@spsu.ac.in';

const googleLogin = document.getElementById("google-login-btn");
googleLogin.addEventListener("click", function() {
    signInWithPopup(auth, provider)
    .then(async (result) => {
        const user = result.user;
        const email = user.email;

        if (email.endsWith(allowedDomain)) {
            // Check if user document exists in 'userRoles'
            const userRef = doc(db, 'userRoles', email);
            const userDoc = await getDoc(userRef);

            // Retrieve user data from 'preErp' collection
            const preErpRef = doc(db, 'preErp', email);
            const preErpDoc = await getDoc(preErpRef);

            if (!preErpDoc.exists()) {
                console.error("Your email Not Found.");
                alert('You are not allowed to use this Website. Contact SPSU Sports Department for resloving this issue.')
                return;
            }

            const preErpData = preErpDoc.data();

            if (!userDoc.exists()) {
                // Create new user document with role "user"
                await setDoc(userRef, {
                    ...preErpData, // Copy all fields from preErp
                    role: 'user' // Add role field
                });
                window.location.href = "user.html";
            } else {
                const role = userDoc.data().role;
                if (role === 'admin') {
                    window.location.href = "admin.html";
                } else {
                    window.location.href = "user.html";
                }
            }
        } else {
            alert('You must use an SPSU official account.');
            await signOut(auth);
        }
    }).catch((error) => {
        console.error(`Error: ${error.code} - ${error.message}`);
    });
});
