// JavaScript to display images one at a time in a continuous loop
window.onload = function() {
  let images = document.querySelectorAll(".feature img");
  let currentImageIndex = 0;

  // Function to show the next image
  function showNextImage() {
      images[currentImageIndex].style.display = "none"; // Hide current image
      currentImageIndex = (currentImageIndex + 1) % images.length; // Loop back to first image after last
      images[currentImageIndex].style.display = "block"; // Show next image
  }

  // Initialize first image as visible
  images[currentImageIndex].style.display = "block";
  
  // Set interval to switch images every 3 seconds
  setInterval(showNextImage, 3000);
};
