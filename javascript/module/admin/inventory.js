import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

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

let allInventoryData = [];

loadSports();

async function loadSports() {
    try {
        const sportsList = document.getElementById("sports-list");
        sportsList.innerHTML = ""; // Clear old sports list

        const querySnapshot = await getDocs(collection(db, "inventory"));
        allInventoryData = []; // Clear previous data

        querySnapshot.forEach((doc) => {
            const sport = doc.id;
            allInventoryData.push({ sport, data: doc.data() });

            const listItem = document.createElement("li");
            listItem.innerText = sport.replace(/_/g, ' ');
            listItem.onclick = () => loadInventoryDetails(sport);
            sportsList.appendChild(listItem);
        });

        // Add event listener to the download button
        document.getElementById("inv-download-btn").onclick = downloadExcel;

    } catch (error) {
        console.error("Error fetching sports: ", error);
    }
}

async function loadInventoryDetails(sport) {
    try {
        const inventoryTable = document.getElementById("inventory-table");
        inventoryTable.innerHTML = ""; // Clear previous inventory details

        const inventoryDoc = await getDoc(doc(db, "inventory", sport));
        if (inventoryDoc.exists()) {
            const data = inventoryDoc.data();
            let rows = [];
            Object.keys(data).forEach((key) => {
                if (key.startsWith("i_")) {
                    const itemName = key.replace("i_", "");
                    const quantity = data[key];
                    inventoryTable.innerHTML += `
                        <tr>
                            <td>${itemName.replace(/_/g, ' ')}</td>
                            <td>${quantity}</td>
                        </tr>
                    `;
                    rows.push([itemName.replace(/_/g, ' '), quantity]);
                }
            });

        } else {
            console.log("No such document!");
        }
    } catch (error) {
        console.error("Error fetching inventory details: ", error);
    }
}

function downloadExcel() {
    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Add headers
    const header = ['Sport', 'Item Name', 'Quantity'];

    // Prepare data for each sport
    let data = [];
    allInventoryData.forEach(sportData => {
        const sport = sportData.sport;
        const items = sportData.data;
        Object.keys(items).forEach(key => {
            if (key.startsWith("i_")) {
                const itemName = key.replace("i_", "");
                const quantity = items[key];
                data.push([sport.replace(/_/g, ' '), itemName.replace(/_/g, ' '), quantity]);
            }
        });
    });

    // Add header and data to the worksheet
    const ws = XLSX.utils.aoa_to_sheet([header, ...data]);

    // Add worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory');

    // Generate Excel file and trigger download
    XLSX.writeFile(wb, 'entire_inventory.xlsx');
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    
    if (file) {
        const reader = new FileReader();

        reader.onload = async (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            // Assuming the first sheet is the one to process
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // Process the JSON data and update Firestore
            try {
                const inventoryCollection = collection(db, "inventory");

                // Remove header from data
                jsonData.shift();

                jsonData.forEach(async (row) => {
                    const [sport, itemName, quantity] = row;
                    if (sport && itemName && quantity) {
                        const sportRef = doc(inventoryCollection, sport.replace(/ /g, '_'));
                        const itemField = `i_${itemName.replace(/ /g, '_')}`;
                        await setDoc(sportRef, { [itemField]: quantity }, { merge: true });
                    }
                });

                alert('Inventory updated successfully!');
                loadSports(); // Reload sports list to reflect changes
            } catch (error) {
                console.error("Error updating inventory: ", error);
                alert('Error updating inventory. Check the console for details.');
            }
        };

        reader.readAsArrayBuffer(file);
    } else {
        alert('Please select a file.');
    }
}

// Add the event listener once
document.getElementById('file-input').addEventListener('change', handleFileSelect);
