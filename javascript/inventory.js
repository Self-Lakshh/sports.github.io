import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

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

document.addEventListener("DOMContentLoaded", async () => {
    await loadSports();
});

async function loadSports() {
    try {
        const sportsList = document.getElementById("sports-list");
        const querySnapshot = await getDocs(collection(db, "inventory"));
        querySnapshot.forEach((doc) => {
            const sport = doc.id;
            const listItem = document.createElement("li");
            listItem.innerText = sport;
            listItem.onclick = () => loadInventoryDetails(sport);
            sportsList.appendChild(listItem);
        });
    } catch (error) {
        console.error("Error fetching sports: ", error);
    }
}

async function loadInventoryDetails(sport) {
    try {
        const inventoryTable = document.getElementById("inventory-table");
        inventoryTable.innerHTML = ""; // Clear previous details
        const inventoryDoc = await getDoc(doc(db, "inventory", sport));
        if (inventoryDoc.exists()) {
            const data = inventoryDoc.data();
            Object.keys(data).forEach((key) => {
                if (key.startsWith("i_")) {
                    const itemName = key.replace("i_", "");
                    const quantity = data[key];
                    inventoryTable.innerHTML += `
                        <tr>
                            <td>${itemName}</td>
                            <td>${quantity}</td>
                        </tr>
                    `;
                }
            });
        } else {
            console.log("No such document!");
        }
    } catch (error) {
        console.error("Error fetching inventory details: ", error);
    }
}
