import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-analytics.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

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
auth.languageCode = 'en';
const provider = new GoogleAuthProvider();

const googleLogin = document.getElementById("google-login-btn");
googleLogin.addEventListener("click", function() {
	alert(5)
});
