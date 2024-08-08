import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

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
const auth = getAuth(app);
const db = getFirestore(app);

async function updateDocumentCount() {
  try {
    const userRolesCollection = collection(db, 'userRoles');
    const snapshot = await getDocs(userRolesCollection);
    const docCount = snapshot.size;

    // Update the inner HTML of the element with the ID 'total-users'
    document.getElementById('total-users').innerHTML = `${docCount}`;
  } catch (error) {
    console.error("Error fetching document count: ", error);
  }
}

async function updatePendingRequestsCount() {
  try {
    const requestsCollection = collection(db, 'requests');
    const q = query(requestsCollection, where('status', '==', 'pending'));
    const snapshot = await getDocs(q);
    const pendingCount = snapshot.size;

    // Update the inner HTML of the element with the ID 'pending-requests'
    document.getElementById('pending-requests-stats').innerHTML = `${pendingCount}`;
  } catch (error) {
    console.error("Error fetching pending requests count: ", error);
  }
}

async function updateRejectedRequestsCount() {
  try {
    const requestsCollection = collection(db, 'requests');
    const q = query(requestsCollection, where('status', '==', 'rejected'));
    const snapshot = await getDocs(q);
    const rejectedCount = snapshot.size;

    // Update the inner HTML of the element with the ID 'rejected-requests'
    document.getElementById('rejected-requests').innerHTML = `${rejectedCount}`;
  } catch (error) {
    console.error("Error fetching rejected requests count: ", error);
  }
}

async function updateInventoryItemCount() {
  try {
    const inventoryCollection = collection(db, 'inventory');
    const snapshot = await getDocs(inventoryCollection);
    
    let totalItemCount = 0;
    snapshot.forEach(doc => {
      const data = doc.data();
      for (const key in data) {
        if (data.hasOwnProperty(key) && typeof data[key] === 'number') {
          totalItemCount += data[key];
        }
      }
    });

    // Update the inner HTML of the element with the ID 'total-inventory-items'
    document.getElementById('total-inventory-items').innerHTML = `${totalItemCount}`;
  } catch (error) {
    console.error("Error fetching inventory item count: ", error);
  }
}

// Call the functions to update the counts
updateDocumentCount();
updatePendingRequestsCount();
updateRejectedRequestsCount();
updateInventoryItemCount();
