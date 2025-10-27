/**
 * UI rendering and controls module
 * Handles rendering of element controls, guide files display, and UI interactions
 * @module ui
 */

import { state, removeElement as removeElementFromState, updateElementProperty as updateElementPropertyInState } from './state.js';
import { updatePreview } from './previewRenderer.js';
import { CONFIG } from './constants.js';
import { formatHorizontalLabel, blobToDataURL, showAlert } from './utils.js';

/**
 * Render element control cards in the UI
 * Creates interactive control panels for each uploaded element
 * with sliders for position, size, z-index, and animation settings
 */
export function renderElementControls() {
    const elementsContainer = document.getElementById('elementsContainer');
    elementsContainer.innerHTML = '';
    
    state.elements.forEach((element, index) => {
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
                    <button class="btn btn-sm btn-danger" onclick="window.removeElement(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                
                <div class="row g-2">
                    <div class="col-6">
                        <label class="form-label small">Width (%)</label>
                        <input type="range" class="form-range" min="5" max="100" value="${element.width}" 
                            onchange="window.updateElementProperty(${index}, 'width', this.value)">
                        <small class="text-muted">${element.width}%</small>
                    </div>
                    <div class="col-6">
                        <label class="form-label small">Top (%)</label>
                        <input type="range" class="form-range" min="0" max="100" value="${element.top}" 
                            onchange="window.updateElementProperty(${index}, 'top', this.value)">
                        <small class="text-muted">${element.top}%</small>
                    </div>
                    <div class="col-12">
                        <label class="form-label small">Horizontal Position (%)</label>
                        <input type="range" class="form-range" min="-50" max="50" value="${element.left}" 
                            onchange="window.updateElementProperty(${index}, 'left', this.value)">
                        <small class="text-muted">
                            ${formatHorizontalLabel(element.left)}
                        </small>
                    </div>
                    <div class="col-6">
                        <label class="form-label small">Z-Index (Layer)</label>
                        <input type="range" class="form-range" min="1" max="100" value="${element.zIndex}" 
                            onchange="window.updateElementProperty(${index}, 'zIndex', this.value)">
                        <small class="text-muted">${element.zIndex}</small>
                    </div>
                    <div class="col-6">
                        <label class="form-label small">Animation Speed (seconds)</label>
                        <input type="range" class="form-range" min="0.3" max="5.0" step="0.1" value="${element.animationSpeed}" 
                            onchange="window.updateElementProperty(${index}, 'animationSpeed', this.value)">
                        <small class="text-muted">${element.animationSpeed}s</small>
                    </div>
                    <div class="col-12">
                        <label class="form-label small">Animation</label>
                        <select class="form-select form-select-sm" onchange="window.updateElementProperty(${index}, 'animation', this.value)" ${element.multiImage ? 'disabled' : ''}>
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
                                onchange="window.toggleMultiImage(${index}, this.checked)">
                            <label class="form-check-label small" for="multiImage${index}">
                                Enable Multi-Image Switch
                            </label>
                        </div>
                    </div>
                    ${element.multiImage ? `
                    <div class="col-12" id="multiImageControls${index}">
                        <label class="form-label small">Switch Animation</label>
                        <select class="form-select form-select-sm mb-2" onchange="window.updateElementProperty(${index}, 'switchAnimation', this.value)">
                            <option value="pulse" ${element.switchAnimation === 'pulse' ? 'selected' : ''}>Pulse</option>
                            <option value="slide" ${element.switchAnimation === 'slide' ? 'selected' : ''}>Slide</option>
                        </select>
                        <label class="form-label small">Images (${element.images.length}/${CONFIG.MAX_MULTI_IMAGES})</label>
                        <div class="d-flex flex-wrap gap-1 mb-2">
                            ${element.images.map((img, imgIdx) => `
                                <div class="position-relative" style="width: 40px; height: 40px;">
                                    <img src="${img}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px; border: 2px solid #007bff;">
                                    ${element.images.length > 1 ? `<button class="btn btn-sm btn-danger position-absolute top-0 end-0" 
                                        style="padding: 0; width: 16px; height: 16px; font-size: 10px; line-height: 1;" 
                                        onclick="window.removeElementImage(${index}, ${imgIdx})">×</button>` : ''}
                                </div>
                            `).join('')}
                        </div>
                        ${element.images.length < CONFIG.MAX_MULTI_IMAGES ? `
                        <div class="upload-area-small" id="addImageArea${index}" style="border: 2px dashed #ccc; border-radius: 8px; padding: 20px; text-align: center; cursor: pointer; background-color: #fafafa; transition: border-color 0.3s;">
                            <i class="fas fa-plus"></i> Add Image (${element.images.length}/${CONFIG.MAX_MULTI_IMAGES})
                            <p style="font-size: 11px; margin: 5px 0 0 0; color: #6c757d;">Click or drag image here</p>
                        </div>
                        <input type="file" id="elementImageInput${index}" accept="image/*" style="display: none;">
                        ` : '<small class="text-muted">Maximum images reached</small>'}
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
        elementsContainer.appendChild(elementCard);
    });

    // Setup drag and drop for add image areas
    state.elements.forEach((element, index) => {
        if (element.multiImage && element.images.length < CONFIG.MAX_MULTI_IMAGES) {
            const addImageArea = document.getElementById(`addImageArea${index}`);
            if (addImageArea) {
                addImageArea.onclick = () => window.addElementImage(index);
                
                addImageArea.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    addImageArea.style.borderColor = '#007bff';
                });
                
                addImageArea.addEventListener('dragleave', () => {
                    addImageArea.style.borderColor = '#ccc';
                });
                
                addImageArea.addEventListener('drop', (e) => {
                    e.preventDefault();
                    addImageArea.style.borderColor = '#ccc';
                    const file = e.dataTransfer.files[0];
                    if (file && file.type.startsWith('image/')) {
                        handleAddElementImage(index, file);
                    }
                });
            }
        }
    });
}

/**
 * Display guide files from ZIP upload
 * Renders guide images and videos in the preview area
 * Supports both image and video guide files
 */
export function displayGuideFiles() {
    const guideContainer = document.getElementById('guidePreviewArea');
    if (!guideContainer) return;

    const guideFiles = state.ui.guideFiles;
    if (guideFiles.length === 0) {
        guideContainer.innerHTML = '<p class="text-muted">No guide files found</p>';
        return;
    }

    let guideHTML = '<div class="guide-files-container">';
    guideHTML += '<h6 class="mb-3"><i class="fas fa-book"></i> Guide Files</h6>';
    
    guideFiles.forEach((file) => {
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

/**
 * Handle adding an additional image to a multi-image element
 * @param {number} index - Index of the element to add image to
 * @param {File} file - Image file to add
 */
function handleAddElementImage(index, file) {
    const reader = new FileReader();
    reader.onload = function(evt) {
        if (state.elements[index].images.length < CONFIG.MAX_MULTI_IMAGES) {
            state.elements[index].images.push(evt.target.result);
            renderElementControls();
            updatePreview();
        }
    };
    reader.readAsDataURL(file);
}

/**
 * Global window functions for inline onclick handlers
 * These functions are exposed to the global scope for use in dynamically generated HTML
 */

/**
 * Remove an element from the state and UI
 * @global
 * @param {number} index - Index of element to remove
 */
window.removeElement = function(index) {
    removeElementFromState(index);
    renderElementControls();
    updatePreview();
};

/**
 * Update a property of an element
 * @global
 * @param {number} index - Index of element to update
 * @param {string} property - Property name to update
 * @param {*} value - New value for the property
 */
window.updateElementProperty = function(index, property, value) {
    updateElementPropertyInState(index, property, value);
    renderElementControls();
    updatePreview();
};

/**
 * Toggle multi-image mode for an element
 * @global
 * @param {number} index - Index of element
 * @param {boolean} enabled - Whether to enable multi-image mode
 */
window.toggleMultiImage = function(index, enabled) {
    state.elements[index].multiImage = enabled;
    if (!enabled) {
        state.elements[index].images = [state.elements[index].images[0]];
        state.elements[index].dataUrl = state.elements[index].images[0];
    }
    renderElementControls();
    updatePreview();
};

/**
 * Open file picker to add image to multi-image element
 * @global
 * @param {number} index - Index of element to add image to
 */
window.addElementImage = function(index) {
    const input = document.getElementById(`elementImageInput${index}`);
    if (!input) return;
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file || !file.type.startsWith('image/')) {
            showAlert('Please select an image file', 'warning');
            return;
        }
        handleAddElementImage(index, file);
    };
    input.click();
};

/**
 * Remove an image from a multi-image element
 * @global
 * @param {number} index - Index of element
 * @param {number} imgIndex - Index of image to remove
 */
window.removeElementImage = function(index, imgIndex) {
    if (state.elements[index].images.length > 1) {
        state.elements[index].images.splice(imgIndex, 1);
        state.elements[index].dataUrl = state.elements[index].images[0];
        renderElementControls();
        updatePreview();
    }
};
