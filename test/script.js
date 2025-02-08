const jobTitles = [
    "Senior UI Developer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
  ];
  
  let currentPage = 0;
  
  function updateTitle() {
    document.getElementById("job-title").innerText = jobTitles[currentPage];
  
    document.querySelectorAll(".dot").forEach((dot, index) => {
      dot.classList.toggle("active", index === currentPage);
    });
  }
  
  function nextPage() {
    currentPage = (currentPage + 1) % jobTitles.length; // Move to the next title in a circular manner
    updateTitle();
  }
  
  function goToPage(pageIndex) {
    currentPage = pageIndex;
    updateTitle();
  }
  
  // Initialize the first title
  updateTitle();
  