document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.getElementById('uploadArea');
    const imageInput = document.getElementById('imageInput');
    const buttonUploadArea = document.getElementById('buttonUploadArea');
    const buttonInput = document.getElementById('buttonInput');
    const zipUploadArea = document.getElementById('zipUploadArea');
    const zipInput = document.getElementById('zipInput');
    const titleInput = document.getElementById('titleInput');
    const urlInput = document.getElementById('urlInput');
    const buttonPosition = document.getElementById('buttonPosition');
    const positionValue = document.getElementById('positionValue');
    const buttonWidth = document.getElementById('buttonWidth');
    const widthValue = document.getElementById('widthValue');
    const fbPixelCheck = document.getElementById('fbPixelCheck');
    const fbPixelInputGroup = document.getElementById('fbPixelInputGroup');
    const fbPixelId = document.getElementById('fbPixelId');
    const generateBtn = document.getElementById('generateBtn');
    const generateZipBtn = document.getElementById('generateZipBtn');
    const previewArea = document.getElementById('previewArea');

    let uploadedImage = null;
    let uploadedImageName = 'bg.jpg';
    let uploadedButton = null;
    let uploadedButtonName = 'btn.jpg';
    let generatedFiles = {};

    // Upload area click handlers
    uploadArea.addEventListener('click', () => imageInput.click());
    buttonUploadArea.addEventListener('click', () => buttonInput.click());
    zipUploadArea.addEventListener('click', () => zipInput.click());

    // File input change handlers
    imageInput.addEventListener('change', handleBackgroundUpload);
    buttonInput.addEventListener('change', handleButtonUpload);
    zipInput.addEventListener('change', handleZipUpload);

    // Position slider handler
    buttonPosition.addEventListener('input', function() {
        positionValue.textContent = this.value;
        updatePreview();
    });

    // Width slider handler
    buttonWidth.addEventListener('input', function() {
        widthValue.textContent = this.value;
        updatePreview();
    });

    // Facebook Pixel checkbox handler
    fbPixelCheck.addEventListener('change', function() {
        if (this.checked) {
            fbPixelInputGroup.style.display = 'block';
        } else {
            fbPixelInputGroup.style.display = 'none';
            fbPixelId.value = '';
        }
    });

    // Generate button handler
    generateBtn.addEventListener('click', generateFiles);
    
    // Generate zip button handler
    generateZipBtn.addEventListener('click', generateZipPackage);

    // Background image drag and drop handlers
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleBackgroundFile(files[0]);
        }
    });

    // Button image drag and drop handlers
    buttonUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        buttonUploadArea.classList.add('dragover');
    });

    buttonUploadArea.addEventListener('dragleave', () => {
        buttonUploadArea.classList.remove('dragover');
    });

    buttonUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        buttonUploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleButtonFile(files[0]);
        }
    });

    // Zip upload drag and drop handlers
    zipUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        zipUploadArea.classList.add('dragover');
    });

    zipUploadArea.addEventListener('dragleave', () => {
        zipUploadArea.classList.remove('dragover');
    });

    zipUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        zipUploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].name.endsWith('.zip')) {
            handleZipFile(files[0]);
        }
    });

    function handleZipUpload(e) {
        const file = e.target.files[0];
        if (file) {
            handleZipFile(file);
        }
    }

    async function handleZipFile(file) {
        if (!file.name.endsWith('.zip')) {
            alert('Please select a ZIP file');
            return;
        }

        zipUploadArea.innerHTML = `
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Processing ZIP file...</p>
        `;

        try {
            const arrayBuffer = await file.arrayBuffer();
            const zip = await JSZip.loadAsync(arrayBuffer);
            
            // Get the zip filename without extension for folder search
            const zipName = file.name.replace('.zip', '');
            
            let bgFile = null;
            let btnFile = null;
            let bgFileName = '';
            let btnFileName = '';

            // First pass: Search in root level
            for (const [filename, zipEntry] of Object.entries(zip.files)) {
                if (zipEntry.dir) continue;
                
                const lowerFilename = filename.toLowerCase();
                const baseName = filename.split('/').pop().toLowerCase();
                
                // Check for background image
                if ((baseName === 'bg.jpg' || baseName === 'bg.png' || 
                     baseName === 'bg.jpeg') && !filename.includes('/')) {
                    bgFile = zipEntry;
                    bgFileName = filename;
                }
                
                // Check for button image
                if ((baseName === 'btn.jpg' || baseName === 'btn.png' || 
                     baseName === 'btn.jpeg') && !filename.includes('/')) {
                    btnFile = zipEntry;
                    btnFileName = filename;
                }
            }

            // Second pass: If not found, search in folder with same name as zip
            if (!bgFile || !btnFile) {
                for (const [filename, zipEntry] of Object.entries(zip.files)) {
                    if (zipEntry.dir) continue;
                    
                    const parts = filename.split('/');
                    if (parts.length >= 2) {
                        const folderName = parts[0].toLowerCase();
                        const baseName = parts[parts.length - 1].toLowerCase();
                        
                        // Check if folder name matches zip name
                        if (folderName === zipName.toLowerCase()) {
                            // Check for background image
                            if (!bgFile && (baseName === 'bg.jpg' || baseName === 'bg.png' || 
                                baseName === 'bg.jpeg')) {
                                bgFile = zipEntry;
                                bgFileName = filename;
                            }
                            
                            // Check for button image
                            if (!btnFile && (baseName === 'btn.jpg' || baseName === 'btn.png' || 
                                baseName === 'btn.jpeg')) {
                                btnFile = zipEntry;
                                btnFileName = filename;
                            }
                        }
                    }
                }
            }

            // Check if both files were found
            if (!bgFile || !btnFile) {
                const missing = [];
                if (!bgFile) missing.push('bg.jpg/png');
                if (!btnFile) missing.push('btn.jpg/png');
                
                zipUploadArea.innerHTML = `
                    <i class="fas fa-file-archive fa-3x mb-3 text-danger"></i>
                    <p class="text-danger">Missing files: ${missing.join(', ')}</p>
                    <small class="text-muted">ZIP should contain bg and btn images in root or in a folder named "${zipName}"</small>
                `;
                
                // Reset input
                zipInput.value = '';
                return;
            }

            // Extract the images
            const bgBlob = await bgFile.async('blob');
            const btnBlob = await btnFile.async('blob');

            // Convert to data URLs
            const bgDataUrl = await blobToDataURL(bgBlob);
            const btnDataUrl = await blobToDataURL(btnBlob);

            // Set the uploaded images
            uploadedImage = bgDataUrl;
            uploadedImageName = bgFileName.split('/').pop();
            uploadedButton = btnDataUrl;
            uploadedButtonName = btnFileName.split('/').pop();

            // Update the upload areas
            uploadArea.innerHTML = `
                <img src="${uploadedImage}" style="max-width: 100%; max-height: 200px; border-radius: 8px;">
                <p class="mt-2 mb-0"><strong>Background uploaded from ZIP!</strong></p>
                <small class="text-muted">${uploadedImageName}</small>
            `;

            buttonUploadArea.innerHTML = `
                <img src="${uploadedButton}" style="max-width: 100%; max-height: 120px; border-radius: 8px;">
                <p class="mt-2 mb-0"><strong>Button uploaded from ZIP!</strong></p>
                <small class="text-muted">${uploadedButtonName}</small>
            `;

            zipUploadArea.innerHTML = `
                <i class="fas fa-check-circle fa-3x mb-3 text-success"></i>
                <p class="text-success"><strong>ZIP processed successfully!</strong></p>
                <small class="text-muted">${file.name}</small>
            `;

            // Update preview
            updatePreview();

        } catch (error) {
            console.error('Error processing ZIP file:', error);
            zipUploadArea.innerHTML = `
                <i class="fas fa-file-archive fa-3x mb-3 text-danger"></i>
                <p class="text-danger">Error processing ZIP file</p>
                <small class="text-muted">${error.message}</small>
            `;
            zipInput.value = '';
        }
    }

    function handleBackgroundUpload(e) {
        const file = e.target.files[0];
        if (file) {
            handleBackgroundFile(file);
        }
    }

    function handleButtonUpload(e) {
        const file = e.target.files[0];
        if (file) {
            handleButtonFile(file);
        }
    }

    function handleBackgroundFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        uploadedImageName = file.name;
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedImage = e.target.result;
            updatePreview();
            uploadArea.innerHTML = `
                <img src="${uploadedImage}" style="max-width: 100%; max-height: 200px; border-radius: 8px;">
                <p class="mt-2 mb-0"><strong>Background uploaded successfully!</strong></p>
                <small class="text-muted">${file.name}</small>
            `;
        };
        reader.readAsDataURL(file);
    }

    function handleButtonFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        uploadedButtonName = file.name;
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedButton = e.target.result;
            updatePreview();
            buttonUploadArea.innerHTML = `
                <img src="${uploadedButton}" style="max-width: 100%; max-height: 120px; border-radius: 8px;">
                <p class="mt-2 mb-0"><strong>Button uploaded successfully!</strong></p>
                <small class="text-muted">${file.name}</small>
            `;
        };
        reader.readAsDataURL(file);
    }

    function updatePreview() {
        if (!uploadedImage) return;

        const position = buttonPosition.value;
        const width = buttonWidth.value;
        let buttonDisplay = '';
        
        if (uploadedButton) {
            buttonDisplay = `
                <div class="position-absolute w-100 text-center redirect-btn" style="top: ${position}%;">
                    <img src="${uploadedButton}" style="width: ${width}%; animation: pulse 0.9s infinite linear;" alt="Button Preview">
                </div>`;
        } else {
            // Create a default button for preview
            const buttonSvg = `data:image/svg+xml;base64,${btoa(`
                <svg width="200" height="60" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="200" height="60" rx="30" fill="#FF6B35"/>
                    <text x="100" y="38" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle" fill="white">CLICK HERE</text>
                </svg>
            `)}`;
            buttonDisplay = `
                <div class="position-absolute w-100 text-center redirect-btn" style="top: ${position}%;">
                    <img src="${buttonSvg}" style="width: ${width}%; animation: pulse 0.9s infinite linear;" alt="Button Preview">
                </div>`;
        }
        
        previewArea.innerHTML = `
            <div class="preview-container-generated position-relative d-inline-block">
                <img src="${uploadedImage}" style="width: 100%; height: auto; display: block;" id="bg" alt="bg">
                ${buttonDisplay}
            </div>
        `;
    }

    function generateFiles() {
        if (!uploadedImage) {
            alert('Please upload a background image first');
            return;
        }

        if (!uploadedButton) {
            alert('Please upload a button image first');
            return;
        }

        if (!urlInput.value) {
            alert('Please enter a redirect URL');
            return;
        }

        const title = titleInput.value || 'MEGA888';
        const redirectUrl = urlInput.value;
        const position = buttonPosition.value;
        const width = buttonWidth.value;
        const includeFbPixel = fbPixelCheck.checked;
        const pixelId = includeFbPixel ? fbPixelId.value.trim() : '';

        // Validate Facebook Pixel ID if checkbox is checked
        if (includeFbPixel && !pixelId) {
            alert('Please enter a Facebook Pixel ID or uncheck the Facebook Pixel option');
            return;
        }

        // Generate all required files
        generatedFiles = {
            'Lindex.html': generateMainHTML(title, position, width, './assets/load.html', pixelId),
            'L1.html': generateMainHTML(title, position, width, './assets/load1.html', pixelId),
            'L2.html': generateMainHTML(title, position, width, './assets/load2.html', pixelId),
            'L3.html': generateMainHTML(title, position, width, './assets/load3.html', pixelId),
            'L4.html': generateMainHTML(title, position, width, './assets/load4.html', pixelId),
            'assets/load.html': generateLoadHTML(redirectUrl),
            'assets/load1.html': generateLoadHTML(redirectUrl),
            'assets/load2.html': generateLoadHTML(redirectUrl),
            'assets/load3.html': generateLoadHTML(redirectUrl),
            'assets/load4.html': generateLoadHTML(redirectUrl),
            'css/style.css': generateStyleCSS(position, width),
        };

        // Show zip button
        generateZipBtn.style.display = 'block';
        document.getElementById('zipInfo').style.display = 'block';
    }

    function generateMainHTML(title, position, width, loadPath, fbPixelId = '') {
        const fbPixelCode = fbPixelId ? `
  <!-- Facebook Pixel Code -->
  <script>
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${fbPixelId}'); 
    fbq('track', 'PageView');
  </script>
  <noscript><img height="1" width="1" style="display:none"
    src="https://www.facebook.com/tr?id=${fbPixelId}&ev=PageView&noscript=1"
  /></noscript>
  <!-- End Facebook Pixel Code -->` : '';

        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta content="width=device-width,initial-scale=1" name="viewport">
  <meta name="description" content="">
  <title>${title}</title>
  <link rel="stylesheet" href="./css/style.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.3/css/bootstrap.min.css"
    integrity="sha512-jnSuA4Ss2PkkikSOLtYs8BlYIeeIK1h99ty4YfvRPAlzr377vr3CXDb7sb7eEEBYjDtcYj+AjBH3FLv5uSJuXg=="
    crossorigin="anonymous" referrerpolicy="no-referrer" />${fbPixelCode}
</head>
<body>
  <main class="d-lg-flex">
    <section class="position-relative d-lg-inline-block mx-lg-auto">
      <picture>
        <source type="image/webp" srcset="./image/bg.webp">
        <img src="./image/bg.jpg" id="bg" alt="bg">
      </picture>

      <div class="position-absolute w-100 text-center redirect-btn">
        <a id="redirectLink" href="${loadPath}">
          <picture>
            <source type="image/webp" srcset="./image/tombol/btn.webp">
            <img src="./image/tombol/btn.jpg" id="tekan" alt="button">
          </picture>
        </a>
      </div>
    </section>
  </main>

  <script src="https://code.jquery.com/jquery-3.6.4.min.js"></script>
  <script>
    $(document).ready(function () {
      // Get current URL
      let currentURL = window.location.href;

      // Check if URL contains parameters
      if (currentURL.includes('?')) {
        // Append all parameters to the redirect link
        let redirectURL = "${loadPath}?" + currentURL.split('?')[1];
        $('#redirectLink').attr('href', redirectURL);
      }
    });
  </script>
</body>
</html>`;
    }

    function generateLoadHTML(redirectUrl) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title></title>
</head>
<body>
  <script type="text/javascript">
    // Function to get current time in milliseconds since epoch
    function getCurrentTime() {
      return new Date().getTime();
    }

    setTimeout(function () {
      // Malaysia time offset from GMT (in milliseconds)
      var malaysiaOffset = 8 * 60 * 60 * 1000; // 8 hours * 60 minutes * 60 seconds * 1000 milliseconds

      // Function to calculate Malaysia time in milliseconds since epoch
      function getMalaysiaTime() {
        return getCurrentTime() + malaysiaOffset;
      }

      var originalUrl = window.location.href;
      var redirectData = [
        "${redirectUrl}",
        // Add more URLs if needed
      ];

      // Calculate loadIndex based on Malaysia time
      var loadIndex = Math.floor((getMalaysiaTime() / 1000 / 60 / 5) % redirectData.length);
      var redirectUrl = redirectData[loadIndex];

      // Extract parameters from the original URL
      var paramsStart = originalUrl.indexOf('?');
      if (paramsStart !== -1) {
        var paramsString = originalUrl.substring(paramsStart + 1);
        // Append parameters to the redirect URL
        redirectUrl += (redirectUrl.includes('?') ? '&' : '?') + paramsString;
      }

      window.location.href = redirectUrl;
    }, 10);
  </script>
</body>
</html>`;
    }

    function generateStyleCSS(position,width) {
        return `/* filepath: css/style.css */
/*-------------------------------------------General Styles---------------------------------------------*/
body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f4f4f4;
}

/*-------------------------------------------Background Image---------------------------------------------*/
#bg {
    width: 100%;
    height: auto;
}

/*-------------------------------------------Redirect Button---------------------------------------------*/
.redirect-btn {
    position: absolute;
    top: ${position}%;
}

.redirect-btn img {
    width: ${width}%;
    animation: pulse 0.9s infinite linear;
}

/*-------------------------------------------Keyframe Animation---------------------------------------------*/
@keyframes pulse {
    0% {
        transform: scale(0.9);
    }

    50% {
        transform: scale(1.1);
    }

    100% {
        transform: scale(0.9);
    }
}

/*-------------------------------------------Multi Device Screen Size---------------------------------------------*/
/* Large devices (desktops, 992px and up) */
@media (min-width: 992px) {
    #bg {
        height: 100vh;
    }
}`;
    }

    async function generateZipPackage() {
        if (!generatedFiles || Object.keys(generatedFiles).length === 0) {
            alert('Please generate files first');
            return;
        }

        // Show loading state
        const originalText = generateZipBtn.textContent;
        generateZipBtn.textContent = 'Generating ZIP with WebP conversion...';
        generateZipBtn.disabled = true;

        try {
            const zip = new JSZip();

            // Add HTML files
            zip.file('Lindex.html', generatedFiles['Lindex.html']);
            zip.file('L1.html', generatedFiles['L1.html']);
            zip.file('L2.html', generatedFiles['L2.html']);
            zip.file('L3.html', generatedFiles['L3.html']);
            zip.file('L4.html', generatedFiles['L4.html']);

            // Add assets folder
            const assetsFolder = zip.folder('assets');
            assetsFolder.file('load.html', generatedFiles['assets/load.html']);
            assetsFolder.file('load1.html', generatedFiles['assets/load1.html']);
            assetsFolder.file('load2.html', generatedFiles['assets/load2.html']);
            assetsFolder.file('load3.html', generatedFiles['assets/load3.html']);
            assetsFolder.file('load4.html', generatedFiles['assets/load4.html']);

            // Add image folder
            const imageFolder = zip.folder('image');
            
            // Convert base64 images to blobs and add to zip
            if (uploadedImage) {
                const bgBlob = await dataURLtoBlob(uploadedImage);
                imageFolder.file('bg.jpg', bgBlob);
                
                // Convert background image to WebP
                const bgWebP = await convertToWebP(uploadedImage, 0.8);
                const bgWebPBlob = await webpDataURLtoBlob(bgWebP);
                imageFolder.file('bg.webp', bgWebPBlob);
            }
            
            if (uploadedButton) {
                // Create tombol subfolder for button images
                const tombolFolder = imageFolder.folder('tombol');
                
                const btnBlob = await dataURLtoBlob(uploadedButton);
                tombolFolder.file('btn.jpg', btnBlob);
                
                // Convert button image to WebP
                const btnWebP = await convertToWebP(uploadedButton, 0.8);
                const btnWebPBlob = await webpDataURLtoBlob(btnWebP);
                tombolFolder.file('btn.webp', btnWebPBlob);
            }

            // Add CSS folder
            const cssFolder = zip.folder('css');
            cssFolder.file('style.css', generatedFiles['css/style.css']);

            // Generate and download zip
            const content = await zip.generateAsync({ type: 'blob' });
            const url = window.URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'image-button-automation-package.zip';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            // Show success message
            generateZipBtn.textContent = 'ZIP Downloaded Successfully!';
            setTimeout(() => {
                generateZipBtn.textContent = originalText;
                generateZipBtn.disabled = false;
            }, 2000);

        } catch (error) {
            console.error('Error generating zip:', error);
            alert('Error generating zip file. Please try again.');
            generateZipBtn.textContent = originalText;
            generateZipBtn.disabled = false;
        }
    }

    // Helper function to convert blob to data URL
    function blobToDataURL(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function (e) {
                resolve(e.target.result);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    // Helper function to convert data URL to blob
    function dataURLtoBlob(dataURL) {
        return new Promise((resolve) => {
            const arr = dataURL.split(',');
            const mime = arr[0].match(/:(.*?);/)[1];
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            resolve(new Blob([u8arr], { type: mime }));
        });
    }

    // Helper function to convert image to WebP format
    function convertToWebP(imageDataURL, quality = 0.8) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = img.width;
                canvas.height = img.height;
                
                ctx.drawImage(img, 0, 0);
                
                // Convert to WebP with specified quality
                const webpDataURL = canvas.toDataURL('image/webp', quality);
                resolve(webpDataURL);
            };
            img.src = imageDataURL;
        });
    }

    // Helper function to convert WebP data URL to blob
    function webpDataURLtoBlob(webpDataURL) {
        return new Promise((resolve) => {
            const arr = webpDataURL.split(',');
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            resolve(new Blob([u8arr], { type: 'image/webp' }));
        });
    }
});