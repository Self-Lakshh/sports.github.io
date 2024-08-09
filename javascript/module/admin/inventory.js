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

async function downloadExcel() {
    const ExcelJS = window.ExcelJS; // Use this if using the CDN

    // Create a new workbook
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Inventory');

    // Define styles
    const headerStyle = {
        font: { bold: true, color: { argb: 'FFFF0000' } }, // Bold red text
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } }, // Yellow background
        alignment: { horizontal: 'center' },
        border: {
            top: { style: 'thin', color: { argb: '000000' } },
            left: { style: 'thin', color: { argb: '000000' } },
            bottom: { style: 'thin', color: { argb: '000000' } },
            right: { style: 'thin', color: { argb: '000000' } },
        }
    };

    const cellStyle = {
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } }, // White background
        font: { color: { argb: 'FF000000' } }, // Black text
        border: {
            top: { style: 'thin', color: { argb: '000000' } },
            left: { style: 'thin', color: { argb: '000000' } },
            bottom: { style: 'thin', color: { argb: '000000' } },
            right: { style: 'thin', color: { argb: '000000' } },
        }
    };

    // Add headers
    ws.addRow(['Sport', 'Item Name', 'Quantity']).eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.style = headerStyle;
    });

    // Prepare data for each sport
    let data = [];
    let sportName = '';
    allInventoryData.forEach(sportData => {
        const sport = sportData.sport;
        sportName = sport.replace(/_/g, ' '); // Store the current sport name
        const items = sportData.data;
        Object.keys(items).forEach(key => {
            if (key.startsWith("i_")) {
                const itemName = key.replace("i_", "");
                const quantity = items[key];
                data.push([sportName, itemName.replace(/_/g, ' '), quantity]);
            }
        });
    });

    // Add data rows
    let startRow = 2;
    let currentSportName = '';
    data.forEach((row, index) => {
        const rowNum = ws.addRow(row);
        if (row[0] !== currentSportName) {
            // Merge cells for the previous sport name
            if (currentSportName !== '') {
                ws.mergeCells(startRow, 1, rowNum.number - 1, 1);
            }
            startRow = rowNum.number;
            currentSportName = row[0];
        }
        rowNum.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            cell.style = cellStyle;
        });
    });
    // Merge cells for the last sport
    if (data.length > 0) {
        ws.mergeCells(startRow, 1, data.length + 1, 1);
    }

    // Set column widths
    ws.getColumn(1).width = 20; // Sport
    ws.getColumn(2).width = 30; // Item Name
    ws.getColumn(3).width = 10; // Quantity

    // Generate Excel file and trigger download
    wb.xlsx.writeBuffer().then(buffer => {
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'entire_inventory.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
    });
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    
    if (file) {
        const reader = new FileReader();

        reader.onload = async (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(data);

            // Assuming the first sheet is the one to process
            const worksheet = workbook.worksheets[0];
            const jsonData = [];
            worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
                if (rowNumber > 1) { // Skip header row
                    const sport = row.getCell(1).value;
                    const itemName = row.getCell(2).value;
                    const quantity = row.getCell(3).value;

                    if (sport && itemName && quantity) {
                        jsonData.push([sport, itemName, quantity]);
                    }
                }
            });

            // Process the JSON data and update Firestore
            try {
                const inventoryCollection = collection(db, "inventory");

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
