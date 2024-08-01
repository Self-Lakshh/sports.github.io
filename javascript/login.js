import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-analytics.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

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
const analytics = getAnalytics(app);
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
            console.log(user);

            const emailParts = email.split('@')[0].split('.');
            const name = emailParts[0];
            const course = emailParts[1].replace(/[0-9]/g, ''); // Remove numbers from course

            const userRef = doc(db, 'userRoles', email);
            const userDoc = await getDoc(userRef);

            // Retrieve phone number from preErp collection
            const preErpRef = doc(db, 'preErp', 'phone_no');
            const preErpDoc = await getDoc(preErpRef);

            if (!preErpDoc.exists()) {
                console.error("preErp document does not exist.");
                return;
            }

            const preErpData = preErpDoc.data();
            const phone_no = preErpData[email];

            if (!userDoc.exists()) {
                // If user does not exist, add to Firestore with role "user"
                await setDoc(userRef, {
                    name: name,
                    email: email,
                    course: course,
                    phone_no: phone_no, // Add phone number
                    role: 'user'
                });
                console.log("New user document created with role 'user'");
                window.location.href = "user.html";
            } else {
                const role = userDoc.data().role;
                console.log("Existing user role:", role);
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
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.customData ? error.customData.email : null;
        const credential = GoogleAuthProvider.credentialFromError(error);
        console.error(`Error ${errorCode}: ${errorMessage} (${email})`);
    });
});
