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
    document.getElementById('user-program').innerText = data.program;

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

        // Convert return time to IST (Indian Standard Time)
        let optionsDate = { year: 'numeric', month: '2-digit', day: '2-digit' };
        let optionsTime = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };

        let dateFormatter = new Intl.DateTimeFormat('en-IN', optionsDate);
        let timeFormatter = new Intl.DateTimeFormat('en-IN', optionsTime);

        // Format date and time
        let date = dateFormatter.format(returnTime);
        let time = timeFormatter.format(returnTime);

        let formattedDate = date.replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$2-$1'); // Convert to YYYY-MM-DD
        let formattedTime = time; // Format as HH:MM:SS

        // Update request status and return time
        await updateDoc(doc(db, "requests", requestId), {
            status: "issued",
            return_time: returnTimestamp
        });

        // Fetch the request document
        let requestDoc = await getDoc(doc(db, "requests", requestId));
        let data = requestDoc.data();
        let game = data.game;
        let name = data.name;
        let email = data.email; // Assuming email field exists in the request document
        let inventoryDocRef = doc(db, "inventory", game);
        let inventoryDoc = await getDoc(inventoryDocRef);
        let inventoryData = inventoryDoc.data();

        const tablebody = document.createElement('tbody');

        // Prepare updates for inventory
        let inventoryUpdates = {};
        let issuedItems = []; // To store issued items for the email
        Object.keys(data).forEach(key => {
            if (key.startsWith('i_') && key !== 'game') {
                let itemName = key.replace('i_', '');
                let availableQuantity = inventoryData[key];
                let requestedQuantity = data[key];

                console.log(`Item: ${itemName}, Available: ${availableQuantity}, Requested: ${requestedQuantity}`);

                const tablerow = document.createElement('tr');
                tablerow.innerHTML = `
                    <td style="border: 1px solid #dddddd;">${itemName}</td>
                    <td style="border: 1px solid #dddddd;">${requestedQuantity}</td>
                `;

                tablebody.appendChild(tablerow);

                if (requestedQuantity !== undefined && requestedQuantity > 0) {
                    let newQuantity = (availableQuantity || 0) - requestedQuantity;
                    console.log(`Updating ${key} from ${availableQuantity} to ${newQuantity}`);
                    inventoryUpdates[key] = newQuantity;
                    issuedItems.push(`${itemName}: ${requestedQuantity}`);
                }
            }
        });

        // Update inventory
        await updateDoc(inventoryDocRef, inventoryUpdates);

        alert(`items issued. to user ${name}.`);


        // Prepare email template parameters
        let templateParams = {
            to_email: email,
            subject: `Your Requested ${game} Items have been Issued`,
            main_mail: `
                <body style="font-family: salmon, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; background-color: #ffffff; margin-top: 20px;">
                        <tr>
                            <td align="center" style="padding: 20px 0; background-color: #FEA40E; color: #ffffff;">
                                <h1 style="margin: 0;">SPSU SPORTS ERP</h1>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 20px;">
                                <p style="font-size: 16px; color: #333333;">
                                    Dear ${name},
                                </p>
                                <p style="font-size: 16px; color: #333333;">
                                    We are pleased to inform you that your request for the following sports items has been approved and issued. Please kindly collect your items from the sports room.
                                </p>
                                <table border="1" cellpadding="10" cellspacing="0" width="100%" style="border-collapse: collapse; margin: 20px 0;">
                                    <thead>
                                        <tr style="background-color: #f2f2f2;">
                                            <th style="border: 1px solid #dddddd; text-align: left;">Item</th>
                                            <th style="border: 1px solid #dddddd; text-align: left;">Quantity</th>
                                        </tr>
                                    </thead>
                                    ${tablebody.innerHTML}
                                </table>
                                <p style="font-size: 16px; color: #333333;">
                                    You can collect these items from the sports room. Please ensure to return the items by <strong>${formattedTime} on ${formattedDate}</strong>.
                                </p>
                                <p style="font-size: 16px; color: #333333;">
                                    Thank you for using the Sports Inventory Management System.
                                </p>
                                <p style="font-size: 16px; color: #333333;">
                                    Best regards,<br>
                                    SPSU Sports Inventory Management Team
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" style="padding: 10px; background-color: #FEA40E; color: #ffffff;">
                                <p style="margin: 0; font-size: 14px;">&copy; 2024 SPSU Sports Inventory Management System. All rights reserved.</p>
                            </td>
                        </tr>
                    </table>
                </body>
            `,
            reply_to: 'spsusports.erp@spsu.ac.in'
        };

        emailjs.init({
            publicKey: 'akGkFTsSUSsKuIdXP'
        });

        // Send email using EmailJS
        emailjs.send("spsu_sports", "template_cj6i30v", templateParams)
            .then((response) => {
                alert(`Email sent successfully to ${email}`);
                console.log('Email sent successfully!', response.status, response.text);
            }, (error) => {
                console.error('Failed to send email:', error);
                alert(`Failed to send email`);
            });
    }
}



// Attach event listeners
document.querySelector('.action-buttons').querySelectorAll('button')[0].addEventListener('click', rejectRequest);
document.querySelector('.action-buttons').querySelectorAll('button')[1].addEventListener('click', issueItems);
