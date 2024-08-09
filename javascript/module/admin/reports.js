import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

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

// Function to retrieve and display requests from Firestore
async function getRequests(filter = {}) {
    let q = query(collection(db, 'requests'));

    // Apply status filters if any are selected
    if (filter.status && filter.status.length > 0) {
        q = query(q, where('status', 'in', filter.status));
    }

    // Apply date sorting
    q = query(q, orderBy('reqdate', 'desc'));

    const snapshot = await getDocs(q);
    const requests = snapshot.docs.map(doc => {
        const data = doc.data();
        const equipments = Object.keys(data)
            .filter(key => key.startsWith('i_')) // Identify fields that start with "i_"
            .map(key => ({
                name: key.replace('i_', ''), // Use the field name without "i_" as the item name
                quantity: data[key] // Use the field value as the quantity
            }));

        return {
            ...data,
            equipments, // Add the dynamically created equipments array to the request
            id: doc.id // Include the document ID
        };
    });

    populateTable(requests);
}


// Function to populate table
function populateTable(requests) {
    const tbody = document.getElementById('requestBody');
    tbody.innerHTML = '';

    requests.forEach((request, index) => {
        const equipments = request.equipments || [];
        const equipmentCount = equipments.length || 1;

        // Check if reqdate exists and convert it to a formatted date string
        const requestDate = request.reqdate ? formatDate(request.reqdate.toDate()) : 'N/A';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td rowspan="${equipmentCount}">${index + 1}</td>
            <td rowspan="${equipmentCount}">${request.id}</td>
            <td rowspan="${equipmentCount}">${requestDate}</td>
            <td rowspan="${equipmentCount}">${request.name}</td>
            <td rowspan="${equipmentCount}">${request.enroll_no}</td>
            <td rowspan="${equipmentCount}">${request.game}</td>
            <td>${equipments[0]?.name || 'N/A'}</td>
            <td>${equipments[0]?.quantity || 'N/A'}</td>
            <td rowspan="${equipmentCount}">${request.status}</td>
        `;
        tbody.appendChild(tr);

        for (let i = 1; i < equipments.length; i++) {
            const trItem = document.createElement('tr');
            trItem.innerHTML = `
                <td>${equipments[i].name}</td>
                <td>${equipments[i].quantity}</td>
            `;
            tbody.appendChild(trItem);
        }
    });
}

// Function to filter and update the table
function filterTable() {
    const filter = {};

    // Get selected status filters
    const statusFilters = Array.from(document.querySelectorAll('input[type=checkbox]:checked'))
        .map(checkbox => checkbox.value);

    if (statusFilters.length > 0) {
        filter.status = statusFilters;
    }

    // Fetch filtered and sorted requests
    getRequests(filter);
}

// Event listeners for filter and buttons
document.getElementById('filterButton').addEventListener('click', filterTable);


document.getElementById('backupButton').addEventListener('click', () => {
    // Logic to backup the filtered data to a new Firestore collection
});

// On load, fetch today's requests sorted by date
getRequests();

// Function to format date as DD-MM-YYYY
function formatDate(date) {
    return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
}


document.getElementById('downloadButton').addEventListener('click', async () => {
    await downloadExcel();
});


async function downloadExcel() {
    const ExcelJS = window.ExcelJS; // Use this if using the CDN

    // Create a new workbook and worksheet
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Requests');

    // Define styles
    const headerStyle = {
        font: { bold: true, color: { argb: 'FFFF0000' }, size: 12 }, // Bold red text with font size 12
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } }, // Yellow background
        alignment: { horizontal: 'center', vertical: 'middle' }, // Center text horizontally and vertically
        border: {
            top: { style: 'thick', color: { argb: '000000' } },
            left: { style: 'thick', color: { argb: '000000' } },
            bottom: { style: 'thick', color: { argb: '000000' } },
            right: { style: 'thick', color: { argb: '000000' } },
        }
    };

    const cellStyle = {
        font: { size: 11 }, // Font size 11 for regular cells
        alignment: { horizontal: 'left', vertical: 'middle' }, // Left align text horizontally and center vertically
        border: {
            top: { style: 'thin', color: { argb: '000000' } },
            left: { style: 'thin', color: { argb: '000000' } },
            bottom: { style: 'thin', color: { argb: '000000' } },
            right: { style: 'thin', color: { argb: '000000' } },
        }
    };

    // Add the headers
    const headerRow = ws.addRow(['S. No.', 'Request IDs', 'Date', 'Name', 'Enrollment No.', 'Sports', 'Equipments', 'Quantity', 'Status']);
    headerRow.eachCell((cell) => {
        cell.style = headerStyle;
    });

    // Fetch the actual request data from Firestore
    const q = query(collection(db, 'requests'), orderBy('reqdate', 'desc'));
    const snapshot = await getDocs(q);

    const requests = snapshot.docs.map((doc, index) => {
        const data = doc.data();
        const equipments = Object.keys(data)
            .filter(key => key.startsWith('i_')) // Identify fields that start with "i_"
            .map(key => ({
                item: key.replace('i_', '').replace(/_/g, ' '), // Use the field name without "i_" as the item name
                quantity: data[key] // Use the field value as the quantity
            }));

        return {
            serial: index + 1,
            requestId: doc.id,
            date: data.reqdate.toDate().toLocaleDateString('en-GB'), // Convert to DD-MM-YYYY format
            name: data.name,
            enrollmentNo: data.enroll_no,
            sports: data.game,
            equipments: equipments,
            status: data.status
        };
    });

    // Add the request data to the worksheet
    requests.forEach((request) => {
        const firstRow = ws.addRow([
            request.serial,
            request.requestId,
            request.date,
            request.name,
            request.enrollmentNo,
            request.sports,
            request.equipments[0]?.item.replace(/_/g, ' ') || 'N/A',
            request.equipments[0]?.quantity || 'N/A',
            request.status
        ]);
        firstRow.eachCell((cell) => {
            cell.style = cellStyle;
        });

        // Add rows for additional equipment
        for (let i = 1; i < request.equipments.length; i++) {
            const equipment = request.equipments[i];
            const equipmentRow = ws.addRow([
                '', // Leave S. No. blank for additional rows
                '', // Leave Request IDs blank for additional rows
                '', // Leave Date blank for additional rows
                '', // Leave Name blank for additional rows
                '', // Leave Enrollment No. blank for additional rows
                '', // Leave Sports blank for additional rows
                equipment.item,
                equipment.quantity,
                '' // Leave Status blank for additional rows
            ]);
            equipmentRow.eachCell((cell) => {
                cell.style = cellStyle;
            });
        }

        // Merge cells for the first row of each multi-equipment request
        if (request.equipments.length > 1) {
            const lastRow = ws.lastRow.number; // Get the last row number for merging
            ws.mergeCells(firstRow.number, 1, lastRow, 1); // Merge S. No.
            ws.mergeCells(firstRow.number, 2, lastRow, 2); // Merge Request IDs
            ws.mergeCells(firstRow.number, 3, lastRow, 3); // Merge Date
            ws.mergeCells(firstRow.number, 4, lastRow, 4); // Merge Name
            ws.mergeCells(firstRow.number, 5, lastRow, 5); // Merge Enrollment No.
            ws.mergeCells(firstRow.number, 6, lastRow, 6); // Merge Sports
            ws.mergeCells(firstRow.number, 9, lastRow, 9); // Merge Status
        }
    });

    // Adjust column widths for better readability
    ws.columns.forEach(column => {
        column.width = column.values.reduce((max, value) => Math.max(max, value ? value.toString().length : 0), 15);
    });

    // Save the Excel file
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Requests.xlsx';
    link.click();
}





