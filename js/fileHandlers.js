/**
 * File upload handlers module
 * Handles all file uploads including drag-and-drop, image processing, and ZIP extraction
 * @module fileHandlers
 */

import { CONFIG } from './constants.js';
import { state, updateFile, addElement } from './state.js';
import { blobToDataURL, showAlert } from './utils.js';
import { updatePreview } from './previewRenderer.js';
import { renderElementControls, displayGuideFiles } from './ui.js';
import { autoDetectButtonPosition } from './detection.js';

/**
 * Setup drag and drop functionality for upload areas
 * @param {HTMLElement} uploadArea - The element to enable drag-and-drop on
 * @param {Function} fileHandler - Callback function to handle dropped files
 * @param {boolean} [acceptAllImages=true] - Whether to accept all images or only ZIP files
 */
export function setupDragAndDrop(uploadArea, fileHandler, acceptAllImages = true) {
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

/**
 * Handle generic image file upload with callback
 * @param {File} file - The image file to upload
 * @param {string} uploadType - Type identifier for the upload (e.g., 'background', 'button')
 * @param {Function} callback - Callback function(dataUrl, fileName) to handle the loaded image
 */
export function handleImageFile(file, uploadType, callback) {
    if (!file.type.startsWith('image/')) {
        showAlert('Please select an image file', 'warning');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        callback(e.target.result, file.name);
        updatePreview();
    };
    reader.readAsDataURL(file);
}

/**
 * Handle background image file upload
 * Updates state and UI with the uploaded background
 * @param {File} file - The background image file
 */
export function handleBackgroundFile(file) {
    handleImageFile(file, 'background', (dataUrl, fileName) => {
        updateFile('background', dataUrl, fileName);
        const uploadArea = document.getElementById('uploadArea');
        uploadArea.innerHTML = `
            <div class="uploaded-preview">
                <img src="${dataUrl}" alt="Background preview">
                <div class="upload-overlay">
                    <i class="fas fa-check-circle"></i>
                    <p>Background uploaded</p>
                    <small>${fileName}</small>
                </div>
            </div>
        `;
    });
}

/**
 * Handle main button image file upload
 * Updates state and UI with the uploaded button
 * @param {File} file - The button image file
 */
export function handleButtonFile(file) {
    handleImageFile(file, 'button', (dataUrl, fileName) => {
        updateFile('button', dataUrl, fileName);
        const buttonUploadArea = document.getElementById('buttonUploadArea');
        buttonUploadArea.innerHTML = `
            <div class="uploaded-preview">
                <img src="${dataUrl}" alt="Button preview">
                <div class="upload-overlay">
                    <i class="fas fa-check-circle"></i>
                    <p>Button uploaded</p>
                    <small>${fileName}</small>
                </div>
            </div>
        `;
    });
}

/**
 * Handle extra button image file upload
 * Updates state and UI with the uploaded extra button
 * @param {File} file - The extra button image file
 */
export function handleExtraButtonFile(file) {
    handleImageFile(file, 'extraButton', (dataUrl, fileName) => {
        updateFile('extraButton', dataUrl, fileName);
        const extraButtonUploadArea = document.getElementById('extraButtonUploadArea');
        extraButtonUploadArea.innerHTML = `
            <div class="uploaded-preview">
                <img src="${dataUrl}" alt="Extra button preview">
                <div class="upload-overlay">
                    <i class="fas fa-check-circle"></i>
                    <p>Extra button uploaded</p>
                    <small>${fileName}</small>
                </div>
            </div>
        `;
    });
}

/**
 * Handle third button image file upload
 * Updates state and UI with the uploaded third button
 * @param {File} file - The third button image file
 */
export function handleThirdButtonFile(file) {
    handleImageFile(file, 'thirdButton', (dataUrl, fileName) => {
        updateFile('thirdButton', dataUrl, fileName);
        const thirdButtonUploadArea = document.getElementById('thirdButtonUploadArea');
        thirdButtonUploadArea.innerHTML = `
            <div class="uploaded-preview">
                <img src="${dataUrl}" alt="Third button preview">
                <div class="upload-overlay">
                    <i class="fas fa-check-circle"></i>
                    <p>Third button uploaded</p>
                    <small>${fileName}</small>
                </div>
            </div>
        `;
    });
}

/**
 * Handle multiple element image files upload
 * Creates element objects for each uploaded image and adds them to state
 * @param {FileList} files - List of image files to upload as elements
 */
export function handleElementFiles(files) {
    Array.from(files).forEach((file) => {
        if (!file.type.startsWith('image/')) {
            showAlert(`File ${file.name} is not an image`, 'warning');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const elementId = state.elements.length + 1;
            const element = {
                id: elementId,
                name: `element${elementId}`,
                fileName: file.name,
                dataUrl: e.target.result,
                width: CONFIG.DEFAULT_ELEMENT_WIDTH,
                top: CONFIG.DEFAULT_ELEMENT_TOP,
                left: CONFIG.DEFAULT_ELEMENT_LEFT,
                right: 0,
                animation: 'none',
                animationSpeed: CONFIG.DEFAULT_ELEMENT_ANIMATION_SPEED,
                multiImage: false,
                images: [e.target.result],
                switchAnimation: 'pulse',
                zIndex: CONFIG.DEFAULT_ELEMENT_Z_INDEX
            };
            
            addElement(element);
            renderElementControls();
            updatePreview();
        };
        reader.readAsDataURL(file);
    });
}

/**
 * Handle ZIP file upload and extraction
 * Processes ZIP files to extract background, button, element images, and guide files
 * Supports auto-detection of button position from guide images
 * @async
 * @param {File} file - The ZIP file to process
 * @returns {Promise<void>}
 * @throws {Error} If ZIP processing fails
 */
export async function handleZipFile(file) {
    if (!file.name.endsWith('.zip')) {
        showAlert('Please select a ZIP file', 'warning');
        return;
    }

    const zipUploadArea = document.getElementById('zipUploadArea');
    const uploadArea = document.getElementById('uploadArea');
    const buttonUploadArea = document.getElementById('buttonUploadArea');
    const zipInput = document.getElementById('zipInput');

    zipUploadArea.innerHTML = `
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Processing ZIP file...</p>
    `;

    try {
        const arrayBuffer = await file.arrayBuffer();
        const zip = await JSZip.loadAsync(arrayBuffer);
        
        const zipName = file.name.replace('.zip', '');
        
        let bgFile = null;
        let btnFile = null;
        let bgFileName = '';
        let btnFileName = '';
        let additionalFiles = [];
        let guideFilesTemp = [];

        // First pass: Search in root level
        for (const [filename, zipEntry] of Object.entries(zip.files)) {
            if (zipEntry.dir) continue;
            if (filename.startsWith('__MACOSX/')) continue;
            
            const lowerFilename = filename.toLowerCase();
            const baseName = filename.split('/').pop().toLowerCase();
            if (baseName.startsWith('._')) continue;
            
            // Check for guide folder
            if (lowerFilename.includes('guide/') || lowerFilename.includes('guide\\') ||
                lowerFilename.includes('guideline/') || lowerFilename.includes('guideline\\')) {
                if (baseName.match(/\.(jpg|jpeg|png|gif|mp4|webm|mov)$/i)) {
                    guideFilesTemp.push({ filename, zipEntry });
                }
                continue;
            }
            
            // Check for background image
            if ((baseName === 'bg.jpg' || baseName === 'bg.png' || baseName === 'bg.jpeg') && !filename.includes('/')) {
                bgFile = zipEntry;
                bgFileName = filename;
            }
            // Check for button image
            else if ((baseName === 'btn.jpg' || baseName === 'btn.png' || baseName === 'btn.jpeg') && !filename.includes('/')) {
                btnFile = zipEntry;
                btnFileName = filename;
            }
            // Check for additional images (not bg or btn)
            else if (!filename.includes('/') && baseName.match(/\.(jpg|jpeg|png|gif)$/i)) {
                additionalFiles.push({ filename, zipEntry });
            }
        }

        // Second pass: If not found, search in folder with same name as zip
        if (!bgFile || !btnFile) {
            for (const [filename, zipEntry] of Object.entries(zip.files)) {
                if (zipEntry.dir) continue;
                if (filename.startsWith('__MACOSX/')) continue;
                
                const parts = filename.split('/');
                const baseName = parts[parts.length - 1].toLowerCase();
                if (baseName.startsWith('._')) continue;
                
                if (parts.length === 2 && parts[0].toLowerCase() === zipName.toLowerCase()) {
                    if ((baseName === 'bg.jpg' || baseName === 'bg.png' || baseName === 'bg.jpeg') && !bgFile) {
                        bgFile = zipEntry;
                        bgFileName = filename;
                    }
                    else if ((baseName === 'btn.jpg' || baseName === 'btn.png' || baseName === 'btn.jpeg') && !btnFile) {
                        btnFile = zipEntry;
                        btnFileName = filename;
                    }
                    else if (baseName.match(/\.(jpg|jpeg|png|gif)$/i)) {
                        additionalFiles.push({ filename, zipEntry });
                    }
                }
            }
        }

        // Check if both files were found
        if (!bgFile || !btnFile) {
            const missing = [];
            if (!bgFile) missing.push('bg');
            if (!btnFile) missing.push('btn');
            
            zipUploadArea.innerHTML = `
                <i class="fas fa-file-archive fa-3x mb-3 text-danger"></i>
                <p class="text-danger">Missing files: ${missing.join(', ')}</p>
                <small class="text-muted">ZIP should contain bg and btn images</small>
            `;
            zipInput.value = '';
            return;
        }

        // Extract the images
        const bgBlob = await bgFile.async('blob');
        const btnBlob = await btnFile.async('blob');
        const bgDataUrl = await blobToDataURL(bgBlob);
        const btnDataUrl = await blobToDataURL(btnBlob);

        // Update state
        updateFile('background', bgDataUrl, bgFileName.split('/').pop());
        updateFile('button', btnDataUrl, btnFileName.split('/').pop());

        // Update UI
        uploadArea.innerHTML = `
            <img src="${bgDataUrl}" style="max-width: 100%; max-height: 200px; border-radius: 8px;">
            <p class="mt-2 mb-0"><strong>Background uploaded from ZIP!</strong></p>
            <small class="text-muted">${bgFileName.split('/').pop()}</small>
        `;

        buttonUploadArea.innerHTML = `
            <img src="${btnDataUrl}" style="max-width: 100%; max-height: 120px; border-radius: 8px;">
            <p class="mt-2 mb-0"><strong>Button uploaded from ZIP!</strong></p>
            <small class="text-muted">${btnFileName.split('/').pop()}</small>
        `;

        // Process additional images as elements
        if (additionalFiles.length > 0) {
            for (let i = 0; i < additionalFiles.length; i++) {
                const { filename, zipEntry } = additionalFiles[i];
                const blob = await zipEntry.async('blob');
                const dataUrl = await blobToDataURL(blob);
                
                const elementId = state.elements.length + 1;
                const element = {
                    id: elementId,
                    name: `element${elementId}`,
                    fileName: filename.split('/').pop(),
                    dataUrl: dataUrl,
                    width: CONFIG.DEFAULT_ELEMENT_WIDTH,
                    top: CONFIG.DEFAULT_ELEMENT_TOP,
                    left: 0,
                    right: 0,
                    animation: 'none',
                    animationSpeed: CONFIG.DEFAULT_ELEMENT_ANIMATION_SPEED,
                    multiImage: false,
                    images: [dataUrl],
                    switchAnimation: 'pulse',
                    zIndex: CONFIG.DEFAULT_ELEMENT_Z_INDEX
                };
                
                addElement(element);
            }
            renderElementControls();
        }

        // Process guide files
        if (guideFilesTemp.length > 0) {
            const { displayGuideFiles } = await import('./ui.js');
            const { setGuideFiles } = await import('./state.js');
            
            const uniqueGuideFiles = [];
            const seenNames = new Set();
            
            for (const guideFile of guideFilesTemp) {
                const baseName = guideFile.filename.split('/').pop().toLowerCase();
                if (!seenNames.has(baseName)) {
                    seenNames.add(baseName);
                    uniqueGuideFiles.push(guideFile);
                }
            }
            
            const processedGuideFiles = [];
            for (let i = 0; i < uniqueGuideFiles.length; i++) {
                const { filename, zipEntry } = uniqueGuideFiles[i];
                const blob = await zipEntry.async('blob');
                const url = await blobToDataURL(blob);
                const baseName = filename.split('/').pop();
                const isVideo = baseName.match(/\.(mp4|webm|mov)$/i);
                
                processedGuideFiles.push({
                    name: baseName,
                    url: url,
                    type: isVideo ? 'video' : 'image'
                });
            }
            
            setGuideFiles(processedGuideFiles);
            displayGuideFiles();
        }

        zipUploadArea.innerHTML = `
            <i class="fas fa-check-circle fa-3x mb-3 text-success"></i>
            <p class="text-success"><strong>ZIP processed successfully!</strong></p>
            <small class="text-muted">${file.name}${additionalFiles.length > 0 ? ` (+${additionalFiles.length} element${additionalFiles.length > 1 ? 's' : ''})` : ''}${guideFilesTemp.length > 0 ? ` (+${guideFilesTemp.length} guide file${guideFilesTemp.length > 1 ? 's' : ''})` : ''}</small>
        `;

        // Auto-detect button position if guide image exists
        if (guideFilesTemp.length > 0 && state.files.background && state.files.button) {
            await autoDetectButtonPosition();
        }

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
