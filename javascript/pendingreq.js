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

fetchPendingRequests();

async function fetchPendingRequests() {
    try {
        const q = query(collection(db, "requests"), where("status", "==", "pending"));
        const querySnapshot = await getDocs(q);
        let requestsList = document.getElementById('requests-list');
        requestsList.innerHTML = ''; // Clear previous list

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            let timestamp = data.reqdate;

            // Check if timestamp is defined and has the 'seconds' property
            let formattedDate = timestamp ? new Date(timestamp.seconds * 1000).toLocaleDateString() : 'N/A';

            let listItem = document.createElement('li');
            listItem.onclick = () => showDetails(doc.id, data);
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
            requestsList.appendChild(listItem);
        });
    } catch (error) {
        console.error("Error fetching requests: ", error);
    }
}

async function showDetails(requestId, data) {
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

async function rejectRequest() {
    let requestId = document.querySelector('.action-buttons').dataset.requestId;
    if (requestId) {
        await updateDoc(doc(db, "requests", requestId), {
            status: "rejected"
        });
        alert('Request rejected.');
        fetchPendingRequests(); // Refresh the list
    }
}

async function issueItems() {
    let requestId = document.querySelector('.action-buttons').dataset.requestId;
    let usageTime = document.querySelector('input[name="usage-time"]:checked').value;

    if (requestId && usageTime) {
        let returnTime = new Date(Date.now() + parseInt(usageTime) * 3600000);
        let returnTimestamp = Timestamp.fromDate(returnTime);

        // Update request status and return time
        await updateDoc(doc(db, "requests", requestId), {
            status: "issued",
            return_time: returnTimestamp
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

                console.log(`Item: ${itemName}, Available: ${availableQuantity}, Requested: ${requestedQuantity}`); // Debugging statement

                if (requestedQuantity !== undefined && requestedQuantity > 0) {
                    let newQuantity = (availableQuantity || 0) - requestedQuantity;
                    console.log(`Updating ${key} from ${availableQuantity} to ${newQuantity}`); // Debugging statement
                    inventoryUpdates[key] = newQuantity;
                }
            }
        });

        console.log('Inventory updates:', inventoryUpdates); // Debugging statement

        if (Object.keys(inventoryUpdates).length > 0) {
            await updateDoc(inventoryDocRef, inventoryUpdates);
        } else {
            console.log('No inventory updates needed.');
        }

        alert('Items issued.');
        fetchPendingRequests(); // Refresh the list
    } else {
        alert('Please select a usage time.');
    }
}

// Attach event listeners
document.querySelector('.action-buttons').querySelectorAll('button')[0].addEventListener('click', rejectRequest);
document.querySelector('.action-buttons').querySelectorAll('button')[1].addEventListener('click', issueItems);
