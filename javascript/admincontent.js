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
