document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.getElementById('uploadArea');
    const imageInput = document.getElementById('imageInput');
    const buttonUploadArea = document.getElementById('buttonUploadArea');
    const buttonInput = document.getElementById('buttonInput');
    const zipUploadArea = document.getElementById('zipUploadArea');
    const zipInput = document.getElementById('zipInput');
    const elementUploadArea = document.getElementById('elementUploadArea');
    const elementInput = document.getElementById('elementInput');
    const elementsContainer = document.getElementById('elementsContainer');
    const titleInput = document.getElementById('titleInput');
    const urlInput = document.getElementById('urlInput');
    const buttonPosition = document.getElementById('buttonPosition');
    const positionValue = document.getElementById('positionValue');
    const buttonWidth = document.getElementById('buttonWidth');
    const widthValue = document.getElementById('widthValue');
    const buttonHorizontal = document.getElementById('buttonHorizontal');
    const horizontalValue = document.getElementById('horizontalValue');
    const extraButtonCheck = document.getElementById('extraButtonCheck');
    const extraButtonGroup = document.getElementById('extraButtonGroup');
    const extraButtonUploadArea = document.getElementById('extraButtonUploadArea');
    const extraButtonInput = document.getElementById('extraButtonInput');
    const extraButtonUrl = document.getElementById('extraButtonUrl');
    const extraButtonPosition = document.getElementById('extraButtonPosition');
    const extraPositionValue = document.getElementById('extraPositionValue');
    const extraButtonWidth = document.getElementById('extraButtonWidth');
    const extraWidthValue = document.getElementById('extraWidthValue');
    const extraButtonHorizontal = document.getElementById('extraButtonHorizontal');
    const extraHorizontalValue = document.getElementById('extraHorizontalValue');
    const animationSpeed = document.getElementById('animationSpeed');
    const animationSpeedValue = document.getElementById('animationSpeedValue');
    const extraAnimationSpeed = document.getElementById('extraAnimationSpeed');
    const extraAnimationSpeedValue = document.getElementById('extraAnimationSpeedValue');
    const buttonZIndex = document.getElementById('buttonZIndex');
    const buttonZIndexValue = document.getElementById('buttonZIndexValue');
    const extraButtonZIndex = document.getElementById('extraButtonZIndex');
    const extraButtonZIndexValue = document.getElementById('extraButtonZIndexValue');
    const fbPixelCheck = document.getElementById('fbPixelCheck');
    const fbPixelInputGroup = document.getElementById('fbPixelInputGroup');
    const fbPixelId = document.getElementById('fbPixelId');
    const zipFilename = document.getElementById('zipFilename');
    const generateBtn = document.getElementById('generateBtn');
    const previewArea = document.getElementById('previewArea');

    let uploadedImage = null;
    let uploadedImageName = 'bg.jpg';
    let uploadedButton = null;
    let uploadedButtonName = 'btn.jpg';
    let uploadedExtraButton = null;
    let uploadedExtraButtonName = 'btn2.jpg';
    let uploadedElements = []; // Array to store additional elements
    let generatedFiles = {};
    let previewIntervals = []; // Store intervals for preview sliders
    let guideFiles = []; // Store guide folder files (images/videos)

    // Debounce utility function for performance optimization
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Optimized preview update with debouncing
    const debouncedUpdatePreview = debounce(updatePreview, 50);

    // Upload area click handlers
    uploadArea.addEventListener('click', () => imageInput.click());
    buttonUploadArea.addEventListener('click', () => buttonInput.click());
    zipUploadArea.addEventListener('click', () => zipInput.click());
    elementUploadArea.addEventListener('click', () => elementInput.click());
    extraButtonUploadArea.addEventListener('click', () => extraButtonInput.click());

    // File input change handlers
    imageInput.addEventListener('change', handleBackgroundUpload);
    buttonInput.addEventListener('change', handleButtonUpload);
    zipInput.addEventListener('change', handleZipUpload);
    elementInput.addEventListener('change', handleElementUpload);
    extraButtonInput.addEventListener('change', handleExtraButtonUpload);

    // Position slider handler
    buttonPosition.addEventListener('input', function() {
        positionValue.textContent = this.value;
        debouncedUpdatePreview();
    });

    // Width slider handler
    buttonWidth.addEventListener('input', function() {
        widthValue.textContent = this.value;
        debouncedUpdatePreview();
    });

    // Button horizontal position slider handler
    buttonHorizontal.addEventListener('input', function() {
        const value = parseInt(this.value);
        if (value === 0) {
            horizontalValue.textContent = 'Center';
        } else if (value < 0) {
            horizontalValue.textContent = `${Math.abs(value)}% from Right`;
        } else {
            horizontalValue.textContent = `${value}% from Left`;
        }
        debouncedUpdatePreview();
    });

    // Extra button checkbox handler
    extraButtonCheck.addEventListener('change', function() {
        if (this.checked) {
            extraButtonGroup.style.display = 'block';
        } else {
            extraButtonGroup.style.display = 'none';
            uploadedExtraButton = null;
            extraButtonUrl.value = '';
        }
        debouncedUpdatePreview();
    });

    // Extra button position slider handler
    extraButtonPosition.addEventListener('input', function() {
        extraPositionValue.textContent = this.value;
        debouncedUpdatePreview();
    });

    // Extra button width slider handler
    extraButtonWidth.addEventListener('input', function() {
        extraWidthValue.textContent = this.value;
        debouncedUpdatePreview();
    });

    // Extra button horizontal position slider handler
    extraButtonHorizontal.addEventListener('input', function() {
        const value = parseInt(this.value);
        if (value === 0) {
            extraHorizontalValue.textContent = 'Center';
        } else if (value < 0) {
            extraHorizontalValue.textContent = `${Math.abs(value)}% from Right`;
        } else {
            extraHorizontalValue.textContent = `${value}% from Left`;
        }
        debouncedUpdatePreview();
    });

    // Animation speed slider handler
    animationSpeed.addEventListener('input', function() {
        animationSpeedValue.textContent = this.value;
        debouncedUpdatePreview();
    });

    // Extra button animation speed slider handler
    extraAnimationSpeed.addEventListener('input', function() {
        extraAnimationSpeedValue.textContent = this.value;
        debouncedUpdatePreview();
    });

    // Button z-index slider handler
    buttonZIndex.addEventListener('input', function() {
        buttonZIndexValue.textContent = this.value;
        debouncedUpdatePreview();
    });

    // Extra button z-index slider handler
    extraButtonZIndex.addEventListener('input', function() {
        extraButtonZIndexValue.textContent = this.value;
        debouncedUpdatePreview();
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

    // Generate button handler - now combines generate and download
    generateBtn.addEventListener('click', generateAndDownloadZip);
    
    // Helper function to handle drag and drop events
    function setupDragAndDrop(uploadArea, fileHandler, acceptAllImages = true) {
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
                if (!acceptAllImages && !files[0].name.endsWith('.zip')) {
                    return;
                }
                fileHandler(files);
            }
        });
    }

    // Setup drag and drop for all upload areas
    setupDragAndDrop(uploadArea, (files) => handleBackgroundFile(files[0]));
    setupDragAndDrop(buttonUploadArea, (files) => handleButtonFile(files[0]));
    setupDragAndDrop(extraButtonUploadArea, (files) => handleExtraButtonFile(files[0]));
    setupDragAndDrop(zipUploadArea, (files) => handleZipFile(files[0]), false);
    setupDragAndDrop(elementUploadArea, handleElementFiles);

    function handleElementUpload(e) {
        const files = e.target.files;
        if (files.length > 0) {
            handleElementFiles(files);
        }
    }

    function handleElementFiles(files) {
        Array.from(files).forEach((file, index) => {
            if (!file.type.startsWith('image/')) {
                alert(`File ${file.name} is not an image`);
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                const elementId = uploadedElements.length + 1;
                const element = {
                    id: elementId,
                    name: `element${elementId}`,
                    fileName: file.name,
                    dataUrl: e.target.result,
                    width: 30,
                    top: 50,
                    left: 0,  // 0 means centered, negative = move left, positive = move right
                    right: 0,  // Not used anymore, keeping for compatibility
                    animation: 'none',  // Animation option: none, pulse, moveNorthWest, moveNorthEast, moveSouthEast, moveSouthWest
                    animationSpeed: 0.9,  // Animation speed in seconds
                    multiImage: false,  // Whether this element uses multiple images
                    images: [e.target.result],  // Array to store multiple images
                    switchAnimation: 'pulse',  // pulse or slide
                    zIndex: 1  // Z-index for layering control
                };
                
                uploadedElements.push(element);
                renderElementControls();
                updatePreview();
            };
            reader.readAsDataURL(file);
        });
    }

    function renderElementControls() {
        elementsContainer.innerHTML = '';
        
        uploadedElements.forEach((element, index) => {
            const elementCard = document.createElement('div');
            elementCard.className = 'card mb-2';
            elementCard.innerHTML = `
                <div class="card-body p-2">
                    <div class="d-flex align-items-center mb-2">
                        <img src="${element.dataUrl}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; margin-right: 10px;">
                        <div class="flex-grow-1">
                            <strong>${element.name}</strong>
                            <small class="d-block text-muted">${element.fileName}</small>
                        </div>
                        <button class="btn btn-sm btn-danger" onclick="removeElement(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    
                    <div class="row g-2">
                        <div class="col-6">
                            <label class="form-label small">Width (%)</label>
                            <input type="range" class="form-range" min="5" max="100" value="${element.width}" 
                                onchange="updateElementProperty(${index}, 'width', this.value)">
                            <small class="text-muted">${element.width}%</small>
                        </div>
                        <div class="col-6">
                            <label class="form-label small">Top (%)</label>
                            <input type="range" class="form-range" min="0" max="100" value="${element.top}" 
                                onchange="updateElementProperty(${index}, 'top', this.value)">
                            <small class="text-muted">${element.top}%</small>
                        </div>
                        <div class="col-12">
                            <label class="form-label small">Horizontal Position (%)</label>
                            <input type="range" class="form-range" min="-50" max="50" value="${element.left}" 
                                onchange="updateElementProperty(${index}, 'left', this.value)">
                            <small class="text-muted">
                                ${element.left == 0 ? 'Center' : element.left < 0 ? `${Math.abs(element.left)}% from Right` : `${element.left}% from Left`}
                            </small>
                        </div>
                        <div class="col-6">
                            <label class="form-label small">Z-Index (Layer)</label>
                            <input type="range" class="form-range" min="1" max="100" value="${element.zIndex}" 
                                onchange="updateElementProperty(${index}, 'zIndex', this.value)">
                            <small class="text-muted">${element.zIndex}</small>
                        </div>
                        <div class="col-6">
                            <label class="form-label small">Animation Speed (seconds)</label>
                            <input type="range" class="form-range" min="0.3" max="5.0" step="0.1" value="${element.animationSpeed}" 
                                onchange="updateElementProperty(${index}, 'animationSpeed', this.value)">
                            <small class="text-muted">${element.animationSpeed}s</small>
                        </div>
                        <div class="col-12">
                            <label class="form-label small">Animation</label>
                            <select class="form-select form-select-sm" onchange="updateElementProperty(${index}, 'animation', this.value)" ${element.multiImage ? 'disabled' : ''}>
                                <option value="none" ${element.animation === 'none' ? 'selected' : ''}>None</option>
                                <option value="pulse" ${element.animation === 'pulse' ? 'selected' : ''}>Pulse</option>
                                <option value="pulse2" ${element.animation === 'pulse2' ? 'selected' : ''}>Pulse 2</option>
                                <option value="randomMove" ${element.animation === 'randomMove' ? 'selected' : ''}>Random Move</option>
                                <option value="moveNorthWest" ${element.animation === 'moveNorthWest' ? 'selected' : ''}>Move North West</option>
                                <option value="moveNorthEast" ${element.animation === 'moveNorthEast' ? 'selected' : ''}>Move North East</option>
                                <option value="moveSouthEast" ${element.animation === 'moveSouthEast' ? 'selected' : ''}>Move South East</option>
                                <option value="moveSouthWest" ${element.animation === 'moveSouthWest' ? 'selected' : ''}>Move South West</option>
                            </select>
                            ${element.multiImage ? '<small class="text-muted">Disabled when multi-image is enabled</small>' : ''}
                        </div>
                        <div class="col-12">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="multiImage${index}" 
                                    ${element.multiImage ? 'checked' : ''} 
                                    onchange="toggleMultiImage(${index}, this.checked)">
                                <label class="form-check-label small" for="multiImage${index}">
                                    Enable Multi-Image Switch
                                </label>
                            </div>
                        </div>
                        ${element.multiImage ? `
                        <div class="col-12" id="multiImageControls${index}">
                            <label class="form-label small">Switch Animation</label>
                            <select class="form-select form-select-sm mb-2" onchange="updateElementProperty(${index}, 'switchAnimation', this.value)">
                                <option value="pulse" ${element.switchAnimation === 'pulse' ? 'selected' : ''}>Pulse</option>
                                <option value="slide" ${element.switchAnimation === 'slide' ? 'selected' : ''}>Slide</option>
                            </select>
                            <label class="form-label small">Images (${element.images.length}/4)</label>
                            <div class="d-flex flex-wrap gap-1 mb-2">
                                ${element.images.map((img, imgIdx) => `
                                    <div class="position-relative" style="width: 40px; height: 40px;">
                                        <img src="${img}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px; border: 2px solid #007bff;">
                                        ${element.images.length > 1 ? `<button class="btn btn-sm btn-danger position-absolute top-0 end-0" 
                                            style="padding: 0; width: 16px; height: 16px; font-size: 10px; line-height: 1;" 
                                            onclick="removeElementImage(${index}, ${imgIdx})">×</button>` : ''}
                                    </div>
                                `).join('')}
                            </div>
                            ${element.images.length < 4 ? `
                            <div class="upload-area-small" id="addImageArea${index}" style="border: 2px dashed #ccc; border-radius: 8px; padding: 20px; text-align: center; cursor: pointer; background-color: #fafafa; transition: border-color 0.3s;">
                                <i class="fas fa-plus"></i> Add Image (${element.images.length}/4)
                                <p style="font-size: 11px; margin: 5px 0 0 0; color: #6c757d;">Click or drag image here</p>
                            </div>
                            <input type="file" id="elementImageInput${index}" accept="image/*" style="display: none;">
                            ` : '<small class="text-muted">Maximum 4 images reached</small>'}
                        </div>
                        ` : ''}
                    </div>
                </div>
            `;
            elementsContainer.appendChild(elementCard);
        });

        // Add drag and drop event listeners for add image areas
        uploadedElements.forEach((element, index) => {
            if (element.multiImage && element.images.length < 4) {
                const addImageArea = document.getElementById(`addImageArea${index}`);
                if (addImageArea) {
                    // Click to upload
                    addImageArea.addEventListener('click', () => addElementImage(index));
                    
                    // Drag and drop
                    addImageArea.addEventListener('dragover', (e) => {
                        e.preventDefault();
                        addImageArea.style.borderColor = '#007bff';
                        addImageArea.style.backgroundColor = '#e3f2fd';
                    });
                    
                    addImageArea.addEventListener('dragleave', () => {
                        addImageArea.style.borderColor = '#ccc';
                        addImageArea.style.backgroundColor = '#fafafa';
                    });
                    
                    addImageArea.addEventListener('drop', (e) => {
                        e.preventDefault();
                        addImageArea.style.borderColor = '#ccc';
                        addImageArea.style.backgroundColor = '#fafafa';
                        
                        const files = e.dataTransfer.files;
                        if (files.length > 0 && files[0].type.startsWith('image/')) {
                            handleAddElementImage(index, files[0]);
                        } else {
                            alert('Please drop an image file');
                        }
                    });
                }
            }
        });
    }

    // Make these functions global so they can be called from onclick handlers
    window.removeElement = function(index) {
        uploadedElements.splice(index, 1);
        // Rename remaining elements
        uploadedElements.forEach((el, idx) => {
            el.id = idx + 1;
            el.name = `element${idx + 1}`;
        });
        renderElementControls();
        debouncedUpdatePreview();
    };

    window.updateElementProperty = function(index, property, value) {
        uploadedElements[index][property] = value;
        renderElementControls();
        debouncedUpdatePreview();
    };

    window.toggleMultiImage = function(index, enabled) {
        uploadedElements[index].multiImage = enabled;
        if (!enabled) {
            // Keep only the first image when disabling
            uploadedElements[index].images = [uploadedElements[index].images[0]];
            uploadedElements[index].dataUrl = uploadedElements[index].images[0];
        }
        renderElementControls();
        debouncedUpdatePreview();
    };

    window.addElementImage = function(index) {
        const input = document.getElementById(`elementImageInput${index}`);
        if (!input) return;
        
        input.onchange = function(e) {
            const file = e.target.files[0];
            if (!file || !file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }
            
            handleAddElementImage(index, file);
        };
        input.click();
    };

    // Helper function to handle adding element image from both click and drag
    function handleAddElementImage(index, file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
            if (uploadedElements[index].images.length < 4) {
                uploadedElements[index].images.push(evt.target.result);
                renderElementControls();
                debouncedUpdatePreview();
            }
        };
        reader.readAsDataURL(file);
    }

    window.removeElementImage = function(index, imgIndex) {
        if (uploadedElements[index].images.length > 1) {
            uploadedElements[index].images.splice(imgIndex, 1);
            uploadedElements[index].dataUrl = uploadedElements[index].images[0];
            renderElementControls();
            debouncedUpdatePreview();
        }
    };

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
            let additionalFiles = []; // Store additional element images
            let guideFilesTemp = []; // Store guide folder files

            // First pass: Search in root level
            for (const [filename, zipEntry] of Object.entries(zip.files)) {
                if (zipEntry.dir) continue;
                if (filename.startsWith('__MACOSX/')) continue; // Ignore macOS metadata folder
                
                const lowerFilename = filename.toLowerCase();
                const baseName = filename.split('/').pop().toLowerCase();
                if (baseName.startsWith('._')) continue; // Ignore macOS resource fork files
                
                // Check for guide or guideline folder
                if (lowerFilename.includes('guide/') || lowerFilename.includes('guide\\') ||
                    lowerFilename.includes('guideline/') || lowerFilename.includes('guideline\\')) {
                    const ext = baseName.split('.').pop();
                    if (['jpg', 'jpeg', 'png', 'gif', 'mp4'].includes(ext)) {
                        guideFilesTemp.push({ file: zipEntry, name: filename, baseName: baseName });
                    }
                    continue; // Skip other processing for guide files
                }
                
                // Check for background image
                if ((baseName === 'bg.jpg' || baseName === 'bg.png' || 
                     baseName === 'bg.jpeg') && !filename.includes('/')) {
                    bgFile = zipEntry;
                    bgFileName = filename;
                }
                // Check for button image
                else if ((baseName === 'btn.jpg' || baseName === 'btn.png' || 
                     baseName === 'btn.jpeg') && !filename.includes('/')) {
                    btnFile = zipEntry;
                    btnFileName = filename;
                }
                // Check for other image files (additional elements)
                else if ((baseName.endsWith('.jpg') || baseName.endsWith('.png') || 
                         baseName.endsWith('.jpeg')) && !filename.includes('/')) {
                    additionalFiles.push({ file: zipEntry, name: filename });
                }
            }

            // Second pass: If not found, search in folder with same name as zip
            if (!bgFile || !btnFile) {
                for (const [filename, zipEntry] of Object.entries(zip.files)) {
                    if (zipEntry.dir) continue;
                    if (filename.startsWith('__MACOSX/')) continue;
                    
                    const parts = filename.split('/');
                    if (parts.length >= 2) {
                        const folderName = parts[0].toLowerCase();
                        const baseName = parts[parts.length - 1].toLowerCase();
                        if (baseName.startsWith('._')) continue;
                        
                        // Skip guide or guideline folder processing in second pass (already handled in first pass)
                        if (folderName.includes('guide') || parts.some(p => p.toLowerCase().includes('guide'))) {
                            continue;
                        }
                        
                        // Check if folder name matches zip name
                        if (folderName === zipName.toLowerCase()) {
                            // Check for background image
                            if (!bgFile && (baseName === 'bg.jpg' || baseName === 'bg.png' || 
                                baseName === 'bg.jpeg')) {
                                bgFile = zipEntry;
                                bgFileName = filename;
                            }
                            // Check for button image
                            else if (!btnFile && (baseName === 'btn.jpg' || baseName === 'btn.png' || 
                                baseName === 'btn.jpeg')) {
                                btnFile = zipEntry;
                                btnFileName = filename;
                            }
                            // Check for other image files (additional elements)
                            else if ((baseName.endsWith('.jpg') || baseName.endsWith('.png') || 
                                     baseName.endsWith('.jpeg'))) {
                                additionalFiles.push({ file: zipEntry, name: filename });
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

            // Process additional images as elements
            if (additionalFiles.length > 0) {
                for (let i = 0; i < additionalFiles.length; i++) {
                    const additionalFile = additionalFiles[i];
                    const blob = await additionalFile.file.async('blob');
                    const dataUrl = await blobToDataURL(blob);
                    const fileName = additionalFile.name.split('/').pop();
                    
                    // Add to elements array
                    const elementId = uploadedElements.length + 1;
                    uploadedElements.push({
                        id: elementId,
                        name: `element${elementId}`,
                        fileName: fileName,
                        dataUrl: dataUrl,
                        width: 50,
                        top: 50,
                        left: 0,
                        animation: 'none',
                        multiImage: false,
                        images: [dataUrl],
                        switchAnimation: 'pulse'
                    });
                }
                
                // Render element controls
                renderElementControls();
            }

            // Process guide files - Remove duplicates by filename
            if (guideFilesTemp.length > 0) {
                // Deduplicate by baseName
                const uniqueGuideFiles = [];
                const seenNames = new Set();
                
                for (const guideFile of guideFilesTemp) {
                    if (!seenNames.has(guideFile.baseName)) {
                        seenNames.add(guideFile.baseName);
                        uniqueGuideFiles.push(guideFile);
                    }
                }
                
                guideFiles = [];
                for (let i = 0; i < uniqueGuideFiles.length; i++) {
                    const guideFile = uniqueGuideFiles[i];
                    const blob = await guideFile.file.async('blob');
                    const ext = guideFile.baseName.split('.').pop();
                    const isVideo = ext === 'mp4';
                    
                    if (isVideo) {
                        // For videos, create a blob URL
                        const blobUrl = URL.createObjectURL(blob);
                        guideFiles.push({
                            type: 'video',
                            url: blobUrl,
                            name: guideFile.baseName
                        });
                    } else {
                        // For images, convert to data URL
                        const dataUrl = await blobToDataURL(blob);
                        guideFiles.push({
                            type: 'image',
                            url: dataUrl,
                            name: guideFile.baseName
                        });
                    }
                }
                
                // Display guide files
                displayGuideFiles();
            }

            zipUploadArea.innerHTML = `
                <i class="fas fa-check-circle fa-3x mb-3 text-success"></i>
                <p class="text-success"><strong>ZIP processed successfully!</strong></p>
                <small class="text-muted">${file.name}${additionalFiles.length > 0 ? ` (+${additionalFiles.length} element${additionalFiles.length > 1 ? 's' : ''})` : ''}${guideFiles.length > 0 ? ` (+${guideFiles.length} guide file${guideFiles.length > 1 ? 's' : ''})` : ''}</small>
            `;

            // Auto-detect button position if guide image exists
            if (guideFiles.length > 0 && uploadedImage && uploadedButton) {
                await autoDetectButtonPosition(guideFiles);
            }

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

    function displayGuideFiles() {
        const guideContainer = document.getElementById('guidePreviewArea');
        if (!guideContainer) return;

        if (guideFiles.length === 0) {
            guideContainer.innerHTML = '<p class="text-muted">No guide files found</p>';
            return;
        }

        let guideHTML = '<div class="guide-files-container">';
        guideHTML += '<h6 class="mb-3"><i class="fas fa-book"></i> Guide Files</h6>';
        
        guideFiles.forEach((file, index) => {
            if (file.type === 'video') {
                guideHTML += `
                    <div class="guide-item guide-video mb-3">
                        <video loop autoplay muted playsinline style="width: 100%; max-height: 300px; border-radius: 8px;">
                            <source src="${file.url}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                        <small class="d-block mt-1 text-muted">${file.name}</small>
                    </div>
                `;
            } else {
                guideHTML += `
                    <div class="guide-item guide-image mb-3">
                        <img src="${file.url}" alt="${file.name}" style="width: 100%; border-radius: 8px; cursor: pointer;" onclick="window.open('${file.url}', '_blank')">
                        <small class="d-block mt-1 text-muted">${file.name}</small>
                    </div>
                `;
            }
        });
        
        guideHTML += '</div>';
        guideContainer.innerHTML = guideHTML;
    }

    async function autoDetectButtonPosition(guideFiles) {
        try {
            // Find the first image guide file (not video)
            const guideImageFile = guideFiles.find(file => file.type === 'image');
            
            if (!guideImageFile) {
                console.log('No image guide file found, skipping auto-detection');
                return;
            }

            console.log('Auto-detecting button position from guide image:', guideImageFile.name);
            
            // Show analysis status
            const statusElement = document.createElement('div');
            statusElement.className = 'alert alert-info mt-3';
            statusElement.innerHTML = `
                <div class="d-flex align-items-center">
                    <div class="spinner-border spinner-border-sm me-2" role="status">
                        <span class="visually-hidden">Analyzing...</span>
                    </div>
                    <span>Analyzing guide image to detect button position...</span>
                </div>
            `;
            zipUploadArea.appendChild(statusElement);

            // Perform analysis with button image for template matching (more accurate)
            const result = await analyzeButtonPositionBrowser(
                guideImageFile.url,  // Guide image (complete design)
                uploadedImage,        // Background image (for fallback)
                uploadedButton        // Button image (for template matching)
            );
            
            console.log('Analysis result:', result);
            
            // Update sliders with detected values
            if (result.confidence > 30) { // Only apply if confidence is reasonable
                buttonPosition.value = result.top;
                positionValue.textContent = result.top;
                
                buttonWidth.value = result.width;
                widthValue.textContent = result.width;
                
                buttonHorizontal.value = result.horizontal;
                const value = parseInt(result.horizontal);
                if (value === 0) {
                    horizontalValue.textContent = 'Center';
                } else if (value < 0) {
                    horizontalValue.textContent = `${Math.abs(value)}% from Right`;
                } else {
                    horizontalValue.textContent = `${value}% from Left`;
                }
                
                // Update status to show success
                statusElement.className = 'alert alert-success mt-3';
                
                statusElement.innerHTML = `
                    <i class="fas fa-check-circle me-2"></i>
                    <strong>Button position detected!</strong>
                    <small class="d-block mt-1">
                        Top: ${result.top}% | Width: ${result.width}% | Confidence: ${result.confidence}%
                    </small>
                    <small class="text-muted d-block mt-1">You can adjust these values using the sliders above</small>
                `;
                
                // Update preview with new values
                updatePreview();
            } else {
                // Low confidence, show warning
                statusElement.className = 'alert alert-warning mt-3';
                statusElement.innerHTML = `
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    <strong>Could not reliably detect button position</strong>
                    <small class="d-block mt-1">Please adjust the button position manually using the sliders above</small>
                `;
            }

        } catch (error) {
            console.error('Error in auto-detection:', error);
            // Don't show error to user, just log it
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

    function handleExtraButtonUpload(e) {
        const file = e.target.files[0];
        if (file) {
            handleExtraButtonFile(file);
        }
    }

    // Generic image file handler
    function handleImageFile(file, uploadType, callback) {
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            callback(e.target.result, file.name);
            updatePreview();
        };
        reader.readAsDataURL(file);
    }

    function handleBackgroundFile(file) {
        handleImageFile(file, 'background', (dataUrl, fileName) => {
            uploadedImage = dataUrl;
            uploadedImageName = fileName;
            uploadArea.innerHTML = `
                <div class="uploaded-preview">
                    <img src="${uploadedImage}" alt="Background preview">
                    <div class="upload-overlay">
                        <i class="fas fa-check-circle"></i>
                        <p>Background uploaded</p>
                        <small>${fileName}</small>
                    </div>
                </div>
            `;
        });
    }

    function handleButtonFile(file) {
        handleImageFile(file, 'button', (dataUrl, fileName) => {
            uploadedButton = dataUrl;
            uploadedButtonName = fileName;
            buttonUploadArea.innerHTML = `
                <div class="uploaded-preview">
                    <img src="${uploadedButton}" alt="Button preview">
                    <div class="upload-overlay">
                        <i class="fas fa-check-circle"></i>
                        <p>Button uploaded</p>
                        <small>${fileName}</small>
                    </div>
                </div>
            `;
        });
    }

    function handleExtraButtonFile(file) {
        handleImageFile(file, 'extraButton', (dataUrl, fileName) => {
            uploadedExtraButton = dataUrl;
            uploadedExtraButtonName = fileName;
            extraButtonUploadArea.innerHTML = `
                <div class="uploaded-preview">
                    <img src="${uploadedExtraButton}" alt="Extra button preview">
                    <div class="upload-overlay">
                        <i class="fas fa-check-circle"></i>
                        <p>Extra button uploaded</p>
                        <small>${fileName}</small>
                    </div>
                </div>
            `;
        });
    }

    function updatePreview() {
        if (!uploadedImage) return;

        const position = buttonPosition.value;
        const width = buttonWidth.value;
        const horizontal = buttonHorizontal.value;
        const speed = animationSpeed.value;
        const btnZIndex = buttonZIndex.value;
        
        // Calculate horizontal position style
        const offset = Math.abs(horizontal);
        let horizontalStyle = '';
        if (horizontal < 0) {
            // Negative = move to left side, so use RIGHT property
            horizontalStyle = `right: ${offset}%;`;
        } else if (horizontal > 0) {
            // Positive = move to right side, so use LEFT property
            horizontalStyle = `left: ${offset}%;`;
        }
        // If horizontal == 0, no additional positioning needed (centered by default)
        
        let buttonDisplay = '';
        
        if (uploadedButton) {
            buttonDisplay = `
                <div class="position-absolute w-100 text-center redirect-btn" style="top: ${position}%; ${horizontalStyle} z-index: ${btnZIndex};">
                    <img src="${uploadedButton}" style="width: ${width}%; animation: pulse ${speed}s infinite linear;" alt="Button Preview">
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
                <div class="position-absolute w-100 text-center redirect-btn" style="top: ${position}%; ${horizontalStyle} z-index: ${btnZIndex};">
                    <img src="${buttonSvg}" style="width: ${width}%; animation: pulse ${speed}s infinite linear;" alt="Button Preview">
                </div>`;
        }
        
        // Extra button display
        let extraButtonDisplay = '';
        if (extraButtonCheck.checked && uploadedExtraButton) {
            const extraPosition = extraButtonPosition.value;
            const extraWidth = extraButtonWidth.value;
            const extraHorizontal = extraButtonHorizontal.value;
            const extraSpeed = extraAnimationSpeed.value;
            const extraBtnZIndex = extraButtonZIndex.value;
            
            // Calculate extra button horizontal position style
            const extraOffset = Math.abs(extraHorizontal);
            let extraHorizontalStyle = '';
            if (extraHorizontal < 0) {
                // Negative = move to left side, so use RIGHT property
                extraHorizontalStyle = `right: ${extraOffset}%;`;
            } else if (extraHorizontal > 0) {
                // Positive = move to right side, so use LEFT property
                extraHorizontalStyle = `left: ${extraOffset}%;`;
            }
            
            extraButtonDisplay = `
                <div class="position-absolute w-100 text-center extra-redirect-btn" style="top: ${extraPosition}%; ${extraHorizontalStyle} z-index: ${extraBtnZIndex};">
                    <img src="${uploadedExtraButton}" style="width: ${extraWidth}%; animation: pulse2 ${extraSpeed}s infinite linear;" alt="Extra Button Preview">
                </div>`;
        }

        // Generate elements display
        let elementsDisplay = '';
        uploadedElements.forEach(element => {
            const offset = Math.abs(element.left);
            let positionStyle = '';
            
            if (element.left < 0) {
                // Negative = move to left, so use RIGHT property
                positionStyle = `right: ${offset}%;`;
            } else if (element.left > 0) {
                // Positive = move to right, so use LEFT property
                positionStyle = `left: ${offset}%;`;
            }
            // If element.left == 0, no additional positioning needed (centered by default)
            
            if (element.multiImage && element.images.length > 1) {
                // Multi-image element - use JavaScript-based switching
                elementsDisplay += `
                <div class="position-absolute w-100 text-center element-preview-slider-${element.id}" style="top: ${element.top}%; ${positionStyle} z-index: ${element.zIndex};">
                    <img src="${element.images[0]}" id="previewSlider${element.id}" class="element-slider-img" style="width: ${element.width}%;" alt="${element.name}">
                </div>`;
            } else {
                // Single image element with regular animation
                const animationStyle = element.animation !== 'none' ? `animation: ${element.animation} ${element.animationSpeed}s infinite linear;` : '';
                
                elementsDisplay += `
                <div class="position-absolute w-100 text-center" style="top: ${element.top}%; ${positionStyle} z-index: ${element.zIndex};">
                    <img src="${element.dataUrl}" style="width: ${element.width}%; height: auto; ${animationStyle}" alt="${element.name}">
                </div>`;
            }
        });

        previewArea.innerHTML = `
            <div class="preview-container-generated position-relative d-inline-block">
                <img src="${uploadedImage}" style="width: 100%; height: auto; display: block;" id="bg" alt="bg">
                ${elementsDisplay}
                ${buttonDisplay}
                ${extraButtonDisplay}
            </div>
        `;

        // Clear existing intervals
        previewIntervals.forEach(interval => clearInterval(interval));
        previewIntervals = [];

        // Initialize sliders for multi-image elements
        uploadedElements.forEach(element => {
            if (element.multiImage && element.images.length > 1) {
                const animClass = element.switchAnimation === 'pulse' ? 'add-animation-zoom' : 'add-animation';
                const exitClass = 'exit-animation';
                let currentIndex = 0;
                const images = element.images;

                const interval = setInterval(() => {
                    currentIndex = (currentIndex + 1) % images.length;
                    const imgElement = document.getElementById(`previewSlider${element.id}`);
                    if (imgElement) {
                        imgElement.classList.remove(animClass);
                        imgElement.classList.add(exitClass);
                        setTimeout(() => {
                            imgElement.src = images[currentIndex];
                            imgElement.classList.remove(exitClass);
                            imgElement.classList.add(animClass);
                        }, 50);
                    }
                }, 3000);

                previewIntervals.push(interval);
            }
        });
    }

    async function generateAndDownloadZip() {
        // Check if user wants redirect-only mode (no images)
        const redirectOnlyMode = !uploadedImage && !uploadedButton;
        
        if (!urlInput.value) {
            alert('Please enter a redirect URL');
            return;
        }

        if (!redirectOnlyMode) {
            // Normal mode - validate images
            if (!uploadedImage) {
                alert('Please upload a background image first');
                return;
            }

            if (!uploadedButton) {
                alert('Please upload a button image first');
                return;
            }

            // Validate extra button if enabled
            if (extraButtonCheck.checked) {
                if (!uploadedExtraButton) {
                    alert('Please upload an extra button image or uncheck the extra button option');
                    return;
                }
                if (!extraButtonUrl.value) {
                    alert('Please enter a redirect URL for the extra button');
                    return;
                }
            }
        }

        const title = titleInput.value || 'HOME';
        const redirectUrl = urlInput.value;
        const position = buttonPosition.value;
        const width = buttonWidth.value;
        const horizontal = buttonHorizontal.value;
        const speed = animationSpeed.value;
        const btnZIndex = buttonZIndex.value;
        const extraButtonEnabled = extraButtonCheck.checked;
        const extraRedirectUrl = extraButtonEnabled ? extraButtonUrl.value : '';
        const extraPosition = extraButtonEnabled ? extraButtonPosition.value : 70;
        const extraWidth = extraButtonEnabled ? extraButtonWidth.value : 60;
        const extraHorizontal = extraButtonEnabled ? extraButtonHorizontal.value : 0;
        const extraSpeed = extraButtonEnabled ? extraAnimationSpeed.value : 0.9;
        const extraBtnZIndex = extraButtonEnabled ? extraButtonZIndex.value : 10;
        const includeFbPixel = fbPixelCheck.checked;
        const pixelId = includeFbPixel ? fbPixelId.value.trim() : '';

        // Validate Facebook Pixel ID if checkbox is checked
        if (includeFbPixel && !pixelId) {
            alert('Please enter a Facebook Pixel ID or uncheck the Facebook Pixel option');
            return;
        }

        // Show loading state
        const originalText = generateBtn.innerHTML;
        generateBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Generating ZIP...';
        generateBtn.disabled = true;

        try {
            // Generate all required files
            let generatedFiles = {};
            
            if (redirectOnlyMode) {
                // Redirect-only mode: Generate simple HTML files
                generatedFiles = {
                    'Lindex.html': generateRedirectOnlyHTML(title, './assets/load.html'),
                    'L1.html': generateRedirectOnlyHTML(title, './assets/load1.html'),
                    'L2.html': generateRedirectOnlyHTML(title, './assets/load2.html'),
                    'L3.html': generateRedirectOnlyHTML(title, './assets/load3.html'),
                    'L4.html': generateRedirectOnlyHTML(title, './assets/load4.html'),
                    'assets/load.html': generateLoadHTML(redirectUrl),
                    'assets/load1.html': generateLoadHTML(redirectUrl),
                    'assets/load2.html': generateLoadHTML(redirectUrl),
                    'assets/load3.html': generateLoadHTML(redirectUrl),
                    'assets/load4.html': generateLoadHTML(redirectUrl),
                };
            } else {
                // Normal mode: Generate full landing page files
                generatedFiles = {
                    'Lindex.html': generateMainHTML(title, position, width, horizontal, './assets/load.html', pixelId, extraButtonEnabled, extraPosition, extraWidth, extraHorizontal, './assets/loadExtra.html', speed, extraSpeed, btnZIndex, extraBtnZIndex),
                    'L1.html': generateMainHTML(title, position, width, horizontal, './assets/load1.html', pixelId, extraButtonEnabled, extraPosition, extraWidth, extraHorizontal, './assets/loadExtra1.html', speed, extraSpeed, btnZIndex, extraBtnZIndex),
                    'L2.html': generateMainHTML(title, position, width, horizontal, './assets/load2.html', pixelId, extraButtonEnabled, extraPosition, extraWidth, extraHorizontal, './assets/loadExtra2.html', speed, extraSpeed, btnZIndex, extraBtnZIndex),
                    'L3.html': generateMainHTML(title, position, width, horizontal, './assets/load3.html', pixelId, extraButtonEnabled, extraPosition, extraWidth, extraHorizontal, './assets/loadExtra3.html', speed, extraSpeed, btnZIndex, extraBtnZIndex),
                    'L4.html': generateMainHTML(title, position, width, horizontal, './assets/load4.html', pixelId, extraButtonEnabled, extraPosition, extraWidth, extraHorizontal, './assets/loadExtra4.html', speed, extraSpeed, btnZIndex, extraBtnZIndex),
                    'assets/load.html': generateLoadHTML(redirectUrl),
                    'assets/load1.html': generateLoadHTML(redirectUrl),
                    'assets/load2.html': generateLoadHTML(redirectUrl),
                    'assets/load3.html': generateLoadHTML(redirectUrl),
                    'assets/load4.html': generateLoadHTML(redirectUrl),
                    'css/style.css': generateStyleCSS(position, width, horizontal, extraButtonEnabled, extraPosition, extraWidth, extraHorizontal, speed, extraSpeed, btnZIndex, extraBtnZIndex),
                };

                // Add extra button load files if enabled
                if (extraButtonEnabled) {
                    generatedFiles['assets/loadExtra.html'] = generateLoadHTML(extraRedirectUrl);
                    generatedFiles['assets/loadExtra1.html'] = generateLoadHTML(extraRedirectUrl);
                    generatedFiles['assets/loadExtra2.html'] = generateLoadHTML(extraRedirectUrl);
                    generatedFiles['assets/loadExtra3.html'] = generateLoadHTML(extraRedirectUrl);
                    generatedFiles['assets/loadExtra4.html'] = generateLoadHTML(extraRedirectUrl);
                }
            }

            // Create ZIP package
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

            // Add extra button load files if exists
            if (generatedFiles['assets/loadExtra.html']) {
                assetsFolder.file('loadExtra.html', generatedFiles['assets/loadExtra.html']);
                assetsFolder.file('loadExtra1.html', generatedFiles['assets/loadExtra1.html']);
                assetsFolder.file('loadExtra2.html', generatedFiles['assets/loadExtra2.html']);
                assetsFolder.file('loadExtra3.html', generatedFiles['assets/loadExtra3.html']);
                assetsFolder.file('loadExtra4.html', generatedFiles['assets/loadExtra4.html']);
            }

            // Add images and CSS only in normal mode
            if (!redirectOnlyMode) {
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

                // Add extra button if exists
                if (uploadedExtraButton) {
                    const btn2Blob = await dataURLtoBlob(uploadedExtraButton);
                    tombolFolder.file('btn2.jpg', btn2Blob);
                    
                    // Convert extra button image to WebP
                    const btn2WebP = await convertToWebP(uploadedExtraButton, 0.8);
                    const btn2WebPBlob = await webpDataURLtoBlob(btn2WebP);
                    tombolFolder.file('btn2.webp', btn2WebPBlob);
                }
            }

            // Add element images
            if (uploadedElements.length > 0) {
                const elementsFolder = imageFolder.folder('elements');
                
                for (const element of uploadedElements) {
                    if (element.multiImage && element.images.length > 1) {
                        // Multi-image element - save all images
                        for (let i = 0; i < element.images.length; i++) {
                            const imgBlob = await dataURLtoBlob(element.images[i]);
                            elementsFolder.file(`${element.name}_${i + 1}.jpg`, imgBlob);
                            
                            // Convert to WebP
                            const imgWebP = await convertToWebP(element.images[i], 0.8);
                            const imgWebPBlob = await webpDataURLtoBlob(imgWebP);
                            elementsFolder.file(`${element.name}_${i + 1}.webp`, imgWebPBlob);
                        }
                    } else {
                        // Single image element
                        const elemBlob = await dataURLtoBlob(element.dataUrl);
                        elementsFolder.file(`${element.name}.jpg`, elemBlob);
                        
                        // Convert element image to WebP
                        const elemWebP = await convertToWebP(element.dataUrl, 0.8);
                        const elemWebPBlob = await webpDataURLtoBlob(elemWebP);
                        elementsFolder.file(`${element.name}.webp`, elemWebPBlob);
                    }
                }
            }

                // Add CSS folder
                const cssFolder = zip.folder('css');
                cssFolder.file('style.css', generatedFiles['css/style.css']);
            }

            // Generate and download zip
            const content = await zip.generateAsync({ type: 'blob' });
            const url = window.URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            
            // Get custom filename from input, sanitize it, and add .zip extension
            let customFilename = zipFilename.value.trim();
            // Remove any .zip extension if user added it
            customFilename = customFilename.replace(/\.zip$/i, '');
            // Sanitize filename - remove invalid characters
            customFilename = customFilename.replace(/[^a-z0-9_-]/gi, '-');
            // Use default if empty
            if (!customFilename) {
                customFilename = 'landing-page-package';
            }
            
            a.download = customFilename + '.zip';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            // Show success message
            generateBtn.innerHTML = '<i class="fas fa-check"></i> ZIP Downloaded Successfully!';
            setTimeout(() => {
                generateBtn.innerHTML = originalText;
                generateBtn.disabled = false;
            }, 2000);

        } catch (error) {
            console.error('Error generating zip:', error);
            alert('Error generating zip file. Please try again.');
            generateBtn.innerHTML = originalText;
            generateBtn.disabled = false;
        }
    }

    function generateMultiImageScripts() {
        let scripts = '';
        
        uploadedElements.forEach(element => {
            if (element.multiImage && element.images.length > 1) {
                const animClass = element.switchAnimation === 'pulse' ? 'add-animation-zoom' : 'add-animation';
                const exitClass = 'exit-animation';
                
                // Generate image paths array
                const imagePaths = element.images.map((img, idx) => 
                    `'./image/elements/${element.name}_${idx + 1}.jpg'`
                ).join(', ');
                
                scripts += `
      // Slider for ${element.name}
      var images${element.id} = [${imagePaths}];
      var currentIndex${element.id} = 0;

      function changeImage${element.id}() {
        currentIndex${element.id} = (currentIndex${element.id} + 1) % images${element.id}.length;
        $('#slider${element.id}').removeClass('${animClass}');
        $('#slider${element.id}').addClass('${exitClass}');
        setTimeout(function () {
          $('#slider${element.id}').attr('src', images${element.id}[currentIndex${element.id}]);
          var webpSrc = images${element.id}[currentIndex${element.id}].replace('.jpg', '.webp');
          $('#slider${element.id}').prev('source').attr('srcset', webpSrc);
          $('#slider${element.id}').removeClass('${exitClass}');
          $('#slider${element.id}').addClass('${animClass}');
        }, 50);
      }

      setInterval(changeImage${element.id}, 3000);
`;
            }
        });
        
        return scripts;
    }

    function generateRedirectOnlyHTML(title, loadPath) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta content="width=device-width,initial-scale=1" name="viewport">
  <meta name="description" content="">
  <title>${title}</title>
</head>
<body>
  <script>
    window.location.href = "${loadPath}";
  </script>
</body>
</html>`;
    }

    function generateMainHTML(title, position, width, horizontal, loadPath, fbPixelId = '', extraButtonEnabled = false, extraPosition = 70, extraWidth = 60, extraHorizontal = 0, extraLoadPath = '', animSpeed = 0.9, extraAnimSpeed = 0.9, btnZIndex = 10, extraBtnZIndex = 10) {
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

        // Generate elements HTML
        let elementsHTML = '';
        uploadedElements.forEach(element => {
            const offset = Math.abs(element.left);
            let positionStyle = '';
            
            if (element.left < 0) {
                // Negative = move to left, so use RIGHT property
                positionStyle = `right: ${offset}%;`;
            } else if (element.left > 0) {
                // Positive = move to right, so use LEFT property
                positionStyle = `left: ${offset}%;`;
            }
            // If element.left == 0, no additional positioning needed (centered by default)
            
            if (element.multiImage && element.images.length > 1) {
                // Multi-image element - use JavaScript-based switching
                elementsHTML += `
      <div class="position-absolute w-100 text-center element-slider-${element.id}" style="top: ${element.top}%; ${positionStyle} z-index: ${element.zIndex};">
        <picture>
          <source type="image/webp" srcset="./image/elements/${element.name}_1.webp">
          <img src="./image/elements/${element.name}_1.jpg" id="slider${element.id}" class="element-slider-img" style="width: ${element.width}%;" alt="${element.name}">
        </picture>
      </div>`;
            } else {
                // Single image element with regular animation
                const animationClass = element.animation !== 'none' ? ` element-anim-${element.animation}` : '';
                
                elementsHTML += `
      <div class="position-absolute w-100 text-center element-${element.name}" style="top: ${element.top}%; ${positionStyle} z-index: ${element.zIndex};">
        <picture>
          <source type="image/webp" srcset="./image/elements/${element.name}.webp">
          <img src="./image/elements/${element.name}.jpg" class="element-img${animationClass}" style="width: ${element.width}%; animation-duration: ${element.animationSpeed}s;" alt="${element.name}">
        </picture>
      </div>`;
            }
        });

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
    <section class="position-relative d-lg-inline-block mx-lg-auto overflow-hidden">
      <picture>
        <source type="image/webp" srcset="./image/bg.webp">
        <img src="./image/bg.jpg" id="bg" alt="bg">
      </picture>
${elementsHTML}
      <div class="position-absolute w-100 text-center redirect-btn">
        <a id="redirectLink" href="${loadPath}">
          <picture>
            <source type="image/webp" srcset="./image/tombol/btn.webp">
            <img src="./image/tombol/btn.jpg" id="tekan" alt="button">
          </picture>
        </a>
      </div>${extraButtonEnabled ? `
      <div class="position-absolute w-100 text-center extra-redirect-btn">
        <a id="extraRedirectLink" href="${extraLoadPath}">
          <picture>
            <source type="image/webp" srcset="./image/tombol/btn2.webp">
            <img src="./image/tombol/btn2.jpg" id="tekan2" alt="extra button">
          </picture>
        </a>
      </div>` : ''}
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
        $('#redirectLink').attr('href', redirectURL);${extraButtonEnabled ? `
        
        // Append parameters to extra button redirect link
        let extraRedirectURL = "${extraLoadPath}?" + currentURL.split('?')[1];
        $('#extraRedirectLink').attr('href', extraRedirectURL);` : ''}
      }

      // Multi-image slider functionality
${generateMultiImageScripts()}
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

    function generateStyleCSS(position, width, horizontal, extraButtonEnabled = false, extraPosition = 70, extraWidth = 60, extraHorizontal = 0, animSpeed = 0.9, extraAnimSpeed = 0.9, btnZIndex = 10, extraBtnZIndex = 10) {
        // Calculate horizontal position styles
        const offset = Math.abs(horizontal);
        let horizontalCSS = '';
        if (horizontal < 0) {
            horizontalCSS = `right: ${offset}%;`;
        } else if (horizontal > 0) {
            horizontalCSS = `left: ${offset}%;`;
        }
        
        // Calculate extra button horizontal position styles
        const extraOffset = Math.abs(extraHorizontal);
        let extraHorizontalCSS = '';
        if (extraHorizontal < 0) {
            extraHorizontalCSS = `right: ${extraOffset}%;`;
        } else if (extraHorizontal > 0) {
            extraHorizontalCSS = `left: ${extraOffset}%;`;
        }
        
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
    ${horizontalCSS}
    z-index: ${btnZIndex};
}

.redirect-btn img {
    width: ${width}%;
    animation: pulse ${animSpeed}s infinite linear;
}
${extraButtonEnabled ? `
/*-------------------------------------------Extra Redirect Button---------------------------------------------*/
.extra-redirect-btn {
    position: absolute;
    top: ${extraPosition}%;
    ${extraHorizontalCSS}
    z-index: ${extraBtnZIndex};
}

.extra-redirect-btn img {
    width: ${extraWidth}%;
    animation: pulse2 ${extraAnimSpeed}s infinite linear;
}
` : ''}
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

@keyframes pulse2 {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.05);
    }

    100% {
        transform: scale(1);
    }
}

@keyframes moveNorthWest {
    0% {
        transform: translate(0, 0);
    }
    
    50% {
        transform: translate(-30px, -30px);
    }

    100% {
        transform: translate(0, 0);
    }
}

@keyframes moveNorthEast {
    0% {
        transform: translate(0, 0);
    }
    
    50% {
        transform: translate(30px, -30px);
    }

    100% {
        transform: translate(0, 0);
    }
}

@keyframes moveSouthEast {
    0% {
        transform: translate(0, 0);
    }
    
    50% {
        transform: translate(30px, 30px);
    }

    100% {
        transform: translate(0, 0);
    }
}

@keyframes moveSouthWest {
    0% {
        transform: translate(0, 0);
    }
    
    50% {
        transform: translate(-30px, 30px);
    }

    100% {
        transform: translate(0, 0);
    }
}

@keyframes imageSwitchPulse {
    0%, 24% {
        opacity: 1;
        transform: scale(1);
    }
    25%, 49% {
        opacity: 0;
        transform: scale(0.8);
    }
    50%, 74% {
        opacity: 1;
        transform: scale(1);
    }
    75%, 99% {
        opacity: 0;
        transform: scale(0.8);
    }
    100% {
        opacity: 1;
        transform: scale(1);
    }
}

@keyframes imageSwitchSlide {
    0%, 24% {
        opacity: 1;
        transform: translateX(0);
    }
    25%, 49% {
        opacity: 0;
        transform: translateX(50px);
    }
    50%, 74% {
        opacity: 1;
        transform: translateX(0);
    }
    75%, 99% {
        opacity: 0;
        transform: translateX(-50px);
    }
    100% {
        opacity: 1;
        transform: translateX(0);
    }
}

/* Multi-image slider animations */
@keyframes zoomOut {
    from {
        opacity: 1;
        transform: scale(1);
    }
    to {
        opacity: 0;
        transform: scale(0.8);
    }
}

@keyframes zoomIn {
    from {
        opacity: 0;
        transform: scale(0.8);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

@keyframes slideOut {
    from {
        opacity: 1;
        transform: translateX(0);
    }
    to {
        opacity: 0;
        transform: translateX(-100px);
    }
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateX(100px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.exit-animation {
    animation: zoomOut 0.5s ease-out forwards;
}

.add-animation-zoom {
    animation: zoomIn 0.5s ease-in forwards;
}

.add-animation {
    animation: slideIn 0.5s ease-in forwards;
}

.multi-image-container {
    position: relative;
    display: inline-block;
}

.multi-image-container img {
    width: 100%;
    height: auto;
}

.multi-image-container img:first-child {
    position: relative;
    display: block;
}

.multi-image-container img:not(:first-child) {
    position: absolute;
    top: 0;
    left: 0;
}

.multi-image-container img:nth-child(1) {
    animation-delay: 0s;
}

.multi-image-container img:nth-child(2) {
    animation-delay: 2s;
}

.multi-image-container img:nth-child(3) {
    animation-delay: 4s;
}

.multi-image-container img:nth-child(4) {
    animation-delay: 6s;
}

/*-------------------------------------------Element Animations---------------------------------------------*/
.element-img {
    display: inline-block;
}

.element-anim-pulse {
    animation: pulse infinite linear;
}

.element-anim-pulse2 {
    animation: pulse2 infinite linear;
}

.element-anim-randomMove {
    animation: randomMove infinite linear;
}

.element-anim-moveNorthWest {
    animation: moveNorthWest infinite linear;
}

.element-anim-moveNorthEast {
    animation: moveNorthEast infinite linear;
}

.element-anim-moveSouthEast {
    animation: moveSouthEast infinite linear;
}

.element-anim-moveSouthWest {
    animation: moveSouthWest infinite linear;
}

@keyframes randomMove {
    0% {
        transform: translate(0px, 0px);
    }
    
    10% {
        transform: translate(8px, -5px);
    }
    
    20% {
        transform: translate(-3px, 12px);
    }
    
    30% {
        transform: translate(15px, 3px);
    }
    
    40% {
        transform: translate(-8px, -10px);
    }
    
    50% {
        transform: translate(5px, 8px);
    }
    
    60% {
        transform: translate(-12px, 2px);
    }
    
    70% {
        transform: translate(10px, -8px);
    }
    
    80% {
        transform: translate(-5px, 15px);
    }
    
    90% {
        transform: translate(3px, -3px);
    }
    
    100% {
        transform: translate(0px, 0px);
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
