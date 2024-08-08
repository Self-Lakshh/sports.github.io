import { auth, db, doc, getDoc, collection, getDocs, addDoc, query, where, onAuthStateChanged } from '../firebase_config.js';


document.addEventListener('DOMContentLoaded', function () {
    const homebtn = document.getElementById('home-btn'); 
    const sportsContainer = document.getElementById('sports-container');
    const itemsContainer = document.getElementById('items-container');
    
    function createSportCard(sportName) {
        const sportName_cap = sportName.toUpperCase();
        const displayName = sportName_cap.replace(/_/g, ' ');
        const card = document.createElement('div');
        card.classList.add('sport-card');
        card.classList.add('inter-blkit');
        // card.textContent = displayName;
        card.innerHTML = `
            <img onclick="document.getElementById('menu-toggle').checked = false;" class="card-img" src="assets/sports/${sportName}.webp"></img>
            <span class="card-text">${displayName}</span>
        `;
        card.addEventListener('click', () => displayItems(sportName));
        sportsContainer.appendChild(card);
    }

    function toUpperCase(str) {
        return str.toUpperCase();
    }

    function displayItems(sportName) {
        sportsContainer.style.display = 'none';
        itemsContainer.style.display = 'flex';
        itemsContainer.innerHTML = '';

        const mainreqhold = document.createElement('div');
        mainreqhold.classList.add('main-req-holder');


        const docRef = doc(db, 'inventory', sportName);
        getDoc(docRef).then(docSnap => {
            if (docSnap.exists()) {
                const items = docSnap.data();
                const titlediv = document.createElement('div');
                titlediv.classList.add('title-holder');
                titlediv.innerHTML = `
                    <div class="title">
                        <span class="inter-blkit">${toUpperCase(sportName)}</span>
                    </div>
                `;

                mainreqhold.appendChild(titlediv);

                const checkouthead = document.createElement('div');
                checkouthead.classList.add('checkout-holder');
                checkouthead.innerHTML = `
                    <div class="check-out-title">
                        <span class="lato-bold">Make Your Request</span>
                    </div>

                `;

                mainreqhold.appendChild(checkouthead);

                
                const allitems = document.createElement('div');
                allitems.classList.add("all-items")

                for (const [itemName, quantity] of Object.entries(items)) {
                    const displayItemName = itemName.replace('i_', '').replace(/_/g, ' ');
                    const itemDiv = document.createElement('div');
                    itemDiv.classList.add('item-div');
                    itemDiv.innerHTML = `
                        <span class="lato-regular">${displayItemName} <span class="avl-quantity">${quantity}</span></span>
                        <div class="input-group">
                            <button class="decrement">-</button>
                            <input class="lato-regular" type="number" id="${itemName}" value="0" min="1" max="${quantity}">
                            <button class="increment">+</button>
                        </div>
                    `;
                    allitems.appendChild(itemDiv)

                    const decrementBtn = itemDiv.querySelector('.decrement');
                    const incrementBtn = itemDiv.querySelector('.increment');
                    const inputField = itemDiv.querySelector('input');

                    decrementBtn.addEventListener('click', () => {
                        let currentValue = parseInt(inputField.value);
                        if (currentValue > 1) { // Prevent values below min
                            inputField.value = currentValue - 1;
                        }
                    });
                
                    incrementBtn.addEventListener('click', () => {
                        let currentValue = parseInt(inputField.value);
                        if (currentValue < quantity) { // Prevent values above max
                            inputField.value = currentValue + 1;
                        }
                    });

                }
                
                mainreqhold.appendChild(allitems);

                itemsContainer.appendChild(mainreqhold);

                const reqbtnhold = document.createElement('div');
                reqbtnhold.classList.add("req-btn-holder");
                const requestBtn = document.createElement('button');
                requestBtn.classList.add("req-btn");
                requestBtn.textContent = 'Request Items';
                requestBtn.addEventListener('click', () => requestItems(sportName, items));
                reqbtnhold.appendChild(requestBtn);
                itemsContainer.appendChild(reqbtnhold);
                
            } else {
                console.log('No such document!');
            }
        }).catch(error => {
            console.log('Error getting document:', error);
        });
    }

    function gethome() {
        sportsContainer.style.display = 'grid';
        itemsContainer.style.display = 'none';
    }

    homebtn.addEventListener('click', () => gethome());

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
