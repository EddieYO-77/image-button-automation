document.addEventListener('DOMContentLoaded', function () {
    const uploadForm = document.getElementById('uploadForm');
    const imageInput = document.getElementById('imageInput');
    const urlInput = document.getElementById('urlInput');

    uploadForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const imageFile = imageInput.files[0];
        const url = urlInput.value;

        if (!imageFile || !url) {
            alert('Please upload an image and enter a URL.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const imageUrl = e.target.result;
            localStorage.setItem('uploadedImage', imageUrl);
            localStorage.setItem('redirectUrl', url);
            window.location.href = 'preview.html';
        };

        reader.readAsDataURL(imageFile);
    });
});