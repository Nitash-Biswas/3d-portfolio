

// Function to smoothly scroll to a section when clicking on a navigation item
function scrollToSection(sectionId, duration) {
    const section = document.getElementById(sectionId);
    if (section) {
      const targetPosition = section.offsetTop;
      const startPosition = window.pageYOffset;
      const distance = targetPosition - startPosition;
      const startTime = performance.now();
  
      function scrollStep(timestamp) {
        const currentTime = timestamp || performance.now();
        const elapsedTime = currentTime - startTime;
        const scrollProgress = Math.min(elapsedTime / duration, 1);
        const scrollPosition = startPosition + distance * scrollProgress;
  
        window.scrollTo(0, scrollPosition);
  
        if (scrollProgress < 1) {
          window.requestAnimationFrame(scrollStep);
        }
      }
  
      window.requestAnimationFrame(scrollStep);
    }
  }

// Handle form submission with AJAX
document.getElementById("myform").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent default form submission

    var form = event.target;
    var formData = new FormData(form); // Create FormData object from the form

    var xhr = new XMLHttpRequest(); // Create XMLHttpRequest object
    xhr.open("POST", form.action, true); // Set up the request

    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
        // Form submission successful, update the submit button text
        var submitButton = document.getElementById("submit");
        submitButton.textContent = "Message Sent 👍";
        submitButton.disabled = true;

        setTimeout(function() {
          // Re-enable the submit button and revert its text back to "Submit"
          submitButton.disabled = false;
          submitButton.textContent = "Submit";
        }, 5000);
      } else {
        // Form submission failed, handle the error
        console.log("Form submission failed");
      }
    };

    xhr.send(formData); // Send the form data via AJAX
  });
  