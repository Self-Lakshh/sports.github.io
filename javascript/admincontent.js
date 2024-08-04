document.addEventListener("DOMContentLoaded", function () {
  const links = document.querySelectorAll(".sidenav-items a");
  const sections = document.querySelectorAll(".content-section");

  links.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      // Remove active class from all links
      links.forEach((l) => l.classList.remove("active"));

      // Add active class to the clicked link
      this.classList.add("active");

      // Get the target section
      const target = this.getAttribute("data-target");

      // Hide all sections
      sections.forEach((section) => section.classList.remove("active"));

      // Show the target section
      document.getElementById(target).classList.add("active");
    });
  });

  // Optionally, you can display the first section by default
  if (sections.length > 0) {
    sections[0].classList.add("active");
  }
});

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
