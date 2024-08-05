import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, doc, updateDoc, Timestamp, getDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

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
const db = getFirestore(app);

fetchIssuedRequests();

async function fetchIssuedRequests() {
    try {
        const q = query(collection(db, "requests"), where("status", "==", "issued"));
        const querySnapshot = await getDocs(q);
        let returnedItemsList = document.getElementById('return-items');
        returnedItemsList.innerHTML = ''; // Clear previous list

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            let timestamp = data.return_time;

            // Check if timestamp is defined and has the 'seconds' property
            let formattedDate = timestamp ? new Date(timestamp.seconds * 1000).toLocaleDateString() : 'N/A';

            let listItem = document.createElement('li');
            listItem.onclick = () => showReturnDetails(doc.id, data);
            listItem.innerHTML = `
            <div class="req-details">
                <div><i class="bi bi-person-fill bt-icons"></i><span> ${data.name}</span></div>
                <div><i class="bi bi-award-fill bt-icons"></i><span>${data.role}</span></div>
            </div>
            <div class="req-details">
                <span><i class="bi bi-eject-fill bt-icons"></i>${data.game}</span> 
                <span><i class="bi bi-calendar-month bt-icons"></i>${formattedDate}</span>
            <div>
                `;
            returnedItemsList.appendChild(listItem);
        });
    } catch (error) {
        console.error("Error fetching issued requests: ", error);
    }
}

async function showReturnDetails(requestId, data) {
    document.getElementById('user-name').innerText = data.name;
    document.getElementById('user-role').innerText = data.role;
    document.getElementById('user-phone').innerText = data.phone_no;
    document.getElementById('user-course').innerText = data.course;

    let itemsList = document.getElementById('items-list');
    itemsList.innerHTML = ''; // Clear previous items

    let inventoryDocRef = doc(db, "inventory", data.game);
    let inventoryDoc = await getDoc(inventoryDocRef);
    let inventoryData = inventoryDoc.data();

    Object.keys(data).forEach(key => {
        if (key.startsWith('i_')) {
            let itemName = key.replace('i_', '');
            let requestedQuantity = data[key];
            let availableQuantity = inventoryData[key];

            itemsList.innerHTML += `
                <tr>
                    <td>${itemName}</td>
                    <td>${availableQuantity}</td>
                    <td>${requestedQuantity}</td>
                </tr>
            `;
        }
    });

    document.querySelector('.action-buttons').dataset.requestId = requestId;
}

async function markAsReturned() {
    let requestId = document.querySelector('.action-buttons').dataset.requestId;
    if (requestId) {
        // Update request status to 'returned'
        await updateDoc(doc(db, "requests", requestId), {
            status: "returned"
        });

        // Fetch the request document
        let requestDoc = await getDoc(doc(db, "requests", requestId));
        let data = requestDoc.data();
        let game = data.game;
        let inventoryDocRef = doc(db, "inventory", game);
        let inventoryDoc = await getDoc(inventoryDocRef);
        let inventoryData = inventoryDoc.data();

        // Prepare updates for inventory
        let inventoryUpdates = {};
        Object.keys(data).forEach(key => {
            // Check if the key starts with 'i_' and it's not the game field
            if (key.startsWith('i_') && key !== 'game') {
                let itemName = key.replace('i_', '');
                let availableQuantity = inventoryData[key];
                let requestedQuantity = data[key]; // Use the requested quantity from the request data

                if (requestedQuantity !== undefined && requestedQuantity > 0) {
                    let newQuantity = (availableQuantity || 0) + requestedQuantity;
                    inventoryUpdates[key] = newQuantity;
                }
            }
        });

        if (Object.keys(inventoryUpdates).length > 0) {
            await updateDoc(inventoryDocRef, inventoryUpdates);
        }

        alert('Items returned and inventory updated.');
        fetchIssuedRequests(); // Refresh the list
    }
}

// Attach event listeners
document.querySelector('.action-buttons').querySelectorAll('button')[0].addEventListener('click', markAsReturned);
