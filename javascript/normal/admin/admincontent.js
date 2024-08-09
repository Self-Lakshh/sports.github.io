document.querySelectorAll('.sidenav-items a').forEach((navLink) => {
    navLink.addEventListener('click', function (event) {
        event.preventDefault();
        const targetSection = event.target.getAttribute('data-target');
        
        // Remove 'active' class from all nav links
        document.querySelectorAll('.sidenav-items a').forEach((link) => {
            link.classList.remove('active');
        });

        // Add 'active' class to the clicked nav link
        navLink.classList.add('active');

        // Hide all sections
        document.querySelectorAll('.content-section').forEach((section) => {
            section.classList.remove('active');
        });

        // Show the target section
        const section = document.getElementById(targetSection);
        section.classList.add('active');

        // Dynamically load the script and CSS related to the section
        try {
            if (targetSection === 'dashboard') {
                reloadScript('./javascript/module/admin/dashboard.js');
                reloadCSS('./css/admin/dashboard.css');
            } else if (targetSection === 'pending-requests') {
                reloadScript('./javascript/module/admin/pendingreq.js');
                reloadCSS('./css/admin/pendingreq.css');
            } else if (targetSection === 'return-items') {
                reloadScript('./javascript/module/admin/returnItems.js');
                reloadCSS('./css/admin/returnItems.css');
            } else if (targetSection === 'inventory') {
                reloadScript('./javascript/module/admin/inventory.js');
                reloadCSS('./css/admin/inventory.css');
            } else if (targetSection === 'reports') {
                reloadScript('./javascript/module/admin/reports.js');
                reloadCSS('./css/admin/reports.css');
            } else if (targetSection === 'activity-logs') {
                reloadScript('./javascript/module/admin/activitylogs.js');
                reloadCSS('./css/admin/activitylogs.css');
            } else if (targetSection === 'manage-users') {
                reloadScript('./javascript/module/admin/manageusers.js');
                reloadCSS('./css/admin/manageusers.css');
            }
        } catch (error) {
            console.error(`Error loading script or CSS for ${targetSection}:`, error);
        }
    });
});

// Function to reload a script
function reloadScript(scriptPath) {
    // Find existing script tag
    const existingScript = document.querySelector(`script[src="${scriptPath}"]`);
    if (existingScript) {
        existingScript.remove(); // Remove the old script
    }

    // Create new script element
    const script = document.createElement('script');
    script.src = scriptPath + `?t=${Date.now()}`; // Adding a timestamp to force reload
    script.type = 'module'; // Set the type to module
    script.defer = true; // Optional: to load it asynchronously

    // Append the script to the document
    document.body.appendChild(script);
    // console.log(`Your script file: ${scriptPath} is now loaded.`); debug set
}

// Function to reload a CSS file
function reloadCSS(cssPath) {
    // Find existing link tag
    const existingLink = document.querySelector(`link[href="${cssPath}"]`);
    if (existingLink) {
        existingLink.remove(); // Remove the old CSS
    }

    // Create new link element
    const link = document.createElement('link');
    link.href = cssPath + `?t=${Date.now()}`; // Adding a timestamp to force reload
    link.rel = 'stylesheet';

    // Append the link to the document head
    document.head.appendChild(link);
    // console.log(`Your CSS file: ${cssPath} is now loaded.`); debug set
}

// Trigger the click event on the active section to load its content on page load
document.querySelector('.sidenav-items a.active').click();

function showDetails(
    name,
    role,
    phone,
    course,
    item1,
    available1,
    requested1,
    item2,
    available2,
    requested2
) {
    document.getElementById("user-name").innerText = name;
    document.getElementById("user-role").innerText = role;
    document.getElementById("user-phone").innerText = phone;
    document.getElementById("user-course").innerText = course;

    let itemsList = document.getElementById("items-list");
    itemsList.innerHTML = `
        <tr>
            <td>${item1}</td>
            <td>${available1}</td>
            <td>${requested1}</td>
        </tr>
        <tr>
            <td>${item2}</td>
            <td>${available2}</td>
            <td>${requested2}</td>
        </tr>
    `;
}
