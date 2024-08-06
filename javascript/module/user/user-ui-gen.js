// Import the Firebase libraries
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { getFirestore, collection, doc, getDocs, getDoc, addDoc, query, where } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBRMjjr5remFfzHiScxfmXK79JwWQ7c-3M",
    authDomain: "login-lakshh.firebaseapp.com",
    projectId: "login-lakshh",
    storageBucket: "login-lakshh.appspot.com",
    messagingSenderId: "214721614258",
    appId: "1:214721614258:web:c3bebff238d815d25994ab",
    measurementId: "G-4EEXFMT14S",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

document.addEventListener('DOMContentLoaded', function () {
    const sportsContainer = document.getElementById('sports-container');
    const itemsContainer = document.getElementById('items-container');

    function createSportCard(sportName) {
        const displayName = sportName.replace(/_/g, ' ');
        const card = document.createElement('div');
        card.classList.add('sport-card');
        card.classList.add('poetsen-one-regular');
        card.textContent = displayName;
        card.addEventListener('click', () => displayItems(sportName));
        sportsContainer.appendChild(card);
    }

    function displayItems(sportName) {
        sportsContainer.style.display = 'none';
        itemsContainer.style.display = 'block';
        itemsContainer.innerHTML = '';

        const docRef = doc(db, 'inventory', sportName);
        getDoc(docRef).then(docSnap => {
            if (docSnap.exists()) {
                const items = docSnap.data();

                const titlediv = document.createElement('div');
                titlediv.classList.add('title-holder');
                titlediv.innerHTML = `
                    <div class="title">
                        <span class="poetsen-one-regular">${sportName}</span>
                    </div>
                `;

                itemsContainer.appendChild(titlediv);

                const checkouthead = document.createElement('div');
                checkouthead.classList.add('checkout-holder');
                checkouthead.innerHTML = `
                    <div class="check-out-title">
                        <span class="poetsen-one-regular">Make Your Request</span>
                    </div>

                `;

                itemsContainer.appendChild(checkouthead);

                for (const [itemName, quantity] of Object.entries(items)) {
                    const displayItemName = itemName.replace('i_', '').replace(/_/g, ' ');
                    const itemDiv = document.createElement('div');
                    itemDiv.classList.add('item-div');
                    itemDiv.innerHTML = `
                        <span>${displayItemName}: ${quantity}</span>
                        <input type="number" id="${itemName}" placeholder="Quantity" min="1" max="${quantity}">
                    `;
                    // const allitems = document.createElement('div');

                    itemsContainer.appendChild(itemDiv);
                }

                const requestBtn = document.createElement('button');
                requestBtn.textContent = 'Request Items';
                requestBtn.addEventListener('click', () => requestItems(sportName, items));
                itemsContainer.appendChild(requestBtn);
            } else {
                console.log('No such document!');
            }
        }).catch(error => {
            console.log('Error getting document:', error);
        });
    }

    function requestItems(sportName, items) {
        onAuthStateChanged(auth, user => {
            if (user) {
                const userEmail = user.email;
                const userDocRef = doc(db, 'userRoles', userEmail);
                getDoc(userDocRef).then(userDocSnap => {
                    if (userDocSnap.exists()) {
                        const userData = userDocSnap.data();
                        
                        // Check if the user already has a pending request
                        const requestsRef = collection(db, 'requests');
                        const q = query(requestsRef, where('email', '==', userEmail), where('status', '==', 'pending'));
                        getDocs(q).then(querySnapshot => {
                            if (querySnapshot.empty) {
                                // Collect requested items as top-level fields
                                const requestedItems = {};
                                let anyItemSelected = false; // Flag to check if any item is selected

                                for (const itemName of Object.keys(items)) {
                                    const quantityInput = document.getElementById(itemName);
                                    const requestedQuantity = quantityInput.value;
                                    if (requestedQuantity > 0) {
                                        requestedItems[itemName] = parseInt(requestedQuantity);
                                        anyItemSelected = true; // Set flag to true if any item is selected
                                    }
                                }

                                if (anyItemSelected) {
                                    const requestData = {
                                        ...userData,
                                        ...requestedItems,
                                        status: 'pending',
                                        reqdate: new Date(),
                                        email: userEmail,
                                        game: sportName
                                    };

                                    addDoc(requestsRef, requestData).then(() => {
                                        alert('Request successfully created!');
                                        // Optionally, reset the UI or show a success message
                                    }).catch(error => {
                                        console.log('Error creating request:', error);
                                    });
                                } else {
                                    alert('No items selected. Please select at least one item before submitting your request.');
                                }
                            } else {
                                alert('You already have a pending request. Please wait for it to be processed before making another request.');
                            }
                        }).catch(error => {
                            console.log('Error checking existing requests:', error);
                        });
                    } else {
                        console.log('No such user document!');
                    }
                }).catch(error => {
                    console.log('Error getting user document:', error);
                });
            } else {
                console.log('No user is signed in.');
            }
        });
    }

    const colRef = collection(db, 'inventory');
    getDocs(colRef).then(querySnapshot => {
        querySnapshot.forEach(doc => {
            createSportCard(doc.id);
        });
    }).catch(error => {
        console.log('Error getting documents: ', error);
    });
});
