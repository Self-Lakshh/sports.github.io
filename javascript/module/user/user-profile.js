import { auth, db, doc, getDoc, collection, getDocs, addDoc, query, where, onAuthStateChanged } from '../firebase_config.js';

const User_name = document.getElementById('user-name');
const User_program = document.getElementById('user-program');

UserProfile();

function UserProfile() {
    onAuthStateChanged(auth, user => {
        if (user) {
            const userEmail = user.email;
            const userDocRef = doc(db, 'userRoles', userEmail);
            getDoc(userDocRef).then(userDocSnap => {
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    const Username = userData.name;
                    const Userprogram = userData.program;
                    User_name.innerText = `${Username}`;
                    User_program.innerText = `${Userprogram}`;
                }
            })
        }
    })
}