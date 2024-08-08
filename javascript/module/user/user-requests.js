import { auth, db, doc, getDoc, collection, getDocs, addDoc, query, where, onAuthStateChanged } from '../firebase_config.js';

const requestsList = document.getElementById('requests-list');
const modal = document.getElementById('request-details-modal');
const requestItems = document.getElementById('request-items');
const reqDataElement = document.getElementById('request-data');
const returnTimeElement = document.getElementById('return-time');

// Fetch requests for the authenticated user by email
async function fetchUserRequests(email) {
    const requestsRef = collection(db, "requests");
    const q = query(requestsRef, where("email", "==", email)); // Filter by email
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        requestsList.innerHTML = '<p>No requests found.</p>';
        return;
    }

    snapshot.forEach(doc => {
        const requestData = doc.data();
        const requestCard = document.createElement('div');
        requestCard.className = 'request-card';
        requestCard.innerHTML = `
            <div class="req-small-info">
                <h3>${requestData.game}</h3>
                <p><strong>Status:</strong><a class="${requestData.status}"> ${requestData.status}</a></p>
            </div>
        `;

        
        const reqimg = document.createElement('div');
        reqimg.classList.add('sports-img');
        reqimg.innerHTML = `
            <img src="/assets/sports/${requestData.game}.webp"></img>
        `;

        requestCard.appendChild(reqimg);
        requestCard.onclick = () => showRequestDetails(requestData);
        requestsList.appendChild(requestCard);


    });
}

// Format timestamp to readable date string
function formatTimestamp(timestamp) {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate(); // Convert Firestore timestamp to JavaScript Date
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

// Show request details in a modal
function showRequestDetails(requestData) {
    requestItems.innerHTML = ''; // Clear previous items
    reqDataElement.innerHTML = ''; // Clear previous reqdata
    returnTimeElement.innerHTML = ''; // Clear previous return time
    
    // Display request data
    if (requestData.reqdata) {
        reqDataElement.textContent = `Request Data: ${requestData.reqdata}`;
    }
    
    // Display return time if the status is "issued"
    if (requestData.status === 'issued' && requestData.return_time) {
        returnTimeElement.textContent = `Return Time: ${formatTimestamp(requestData.return_time)}`;
    }
    
    // Iterate through all keys in requestData
    for (const [key, value] of Object.entries(requestData)) {
        if (key.startsWith('i_')) {
            // Clean up the key name
            const cleanedKey = key.replace(/^i_/, '').replace(/_/g, ' ');
            const itemElement = document.createElement('p');
            itemElement.textContent = `${cleanedKey.charAt(0).toUpperCase() + cleanedKey.slice(1)} - Quantity: ${value}`;
            requestItems.appendChild(itemElement);
        }
    }

    modal.style.display = 'flex';
    
}

// Initialize the page with the authenticated user's requests
onAuthStateChanged(auth, (user) => {
    if (user) {
        fetchUserRequests(user.email); // Pass the user's email to filter requests
    } else {
        requestsList.innerHTML = '<p>Please log in to view your requests.</p>';
    }
});
