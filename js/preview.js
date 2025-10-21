// This file handles the display of the uploaded image and URL on the preview page, modifying the title and button position accordingly.

document.addEventListener('DOMContentLoaded', function () {
    // Get the uploaded image and URL from local storage
    const uploadedImage = localStorage.getItem('uploadedImage');
    const userUrl = localStorage.getItem('userUrl');

    // Modify the title of the page
    document.title = "Image Preview";

    // Display the uploaded image
    const imageContainer = document.getElementById('imageContainer');
    if (uploadedImage) {
        const imgElement = document.createElement('img');
        imgElement.src = uploadedImage;
        imgElement.alt = 'Uploaded Image';
        imgElement.style.width = '100%'; // Adjust as needed
        imageContainer.appendChild(imgElement);
    }

    // Adjust the button position based on the uploaded image
    const redirectButton = document.getElementById('redirectButton');
    redirectButton.style.position = 'absolute';
    redirectButton.style.top = '83%'; // Set button position

    // Update the redirect URL
    if (userUrl) {
        redirectButton.href = userUrl;
    }
});