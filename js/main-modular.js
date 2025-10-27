/**
 * Main application entry point - Modular version
 * This file orchestrates all modules and sets up event listeners
 * Handles user interactions and coordinates between modules
 * @module main-modular
 */

import { state, updateConfig } from './state.js';
import { CONFIG } from './constants.js';
import { debounce, formatHorizontalLabel } from './utils.js';
import { updatePreview } from './previewRenderer.js';
import { 
    setupDragAndDrop,
    handleBackgroundFile,
    handleButtonFile,
    handleExtraButtonFile,
    handleThirdButtonFile,
    handleElementFiles,
    handleZipFile 
} from './fileHandlers.js';

/**
 * Initialize application when DOM is ready
 * Sets up all event listeners and initializes the UI
 */
document.addEventListener('DOMContentLoaded', function() {
    // Get all DOM elements
    const elements = {
        uploadArea: document.getElementById('uploadArea'),
        imageInput: document.getElementById('imageInput'),
        buttonUploadArea: document.getElementById('buttonUploadArea'),
        buttonInput: document.getElementById('buttonInput'),
        zipUploadArea: document.getElementById('zipUploadArea'),
        zipInput: document.getElementById('zipInput'),
        elementUploadArea: document.getElementById('elementUploadArea'),
        elementInput: document.getElementById('elementInput'),
        
        titleInput: document.getElementById('titleInput'),
        urlInput: document.getElementById('urlInput'),
        
        buttonPosition: document.getElementById('buttonPosition'),
        positionValue: document.getElementById('positionValue'),
        buttonWidth: document.getElementById('buttonWidth'),
        widthValue: document.getElementById('widthValue'),
        buttonHorizontal: document.getElementById('buttonHorizontal'),
        horizontalValue: document.getElementById('horizontalValue'),
        buttonZIndex: document.getElementById('buttonZIndex'),
        buttonZIndexValue: document.getElementById('buttonZIndexValue'),
        animationSpeed: document.getElementById('animationSpeed'),
        animationSpeedValue: document.getElementById('animationSpeedValue'),
        
        extraButtonCheck: document.getElementById('extraButtonCheck'),
        extraButtonGroup: document.getElementById('extraButtonGroup'),
        extraButtonUploadArea: document.getElementById('extraButtonUploadArea'),
        extraButtonInput: document.getElementById('extraButtonInput'),
        extraButtonUrl: document.getElementById('extraButtonUrl'),
        extraButtonPosition: document.getElementById('extraButtonPosition'),
        extraPositionValue: document.getElementById('extraPositionValue'),
        extraButtonWidth: document.getElementById('extraButtonWidth'),
        extraWidthValue: document.getElementById('extraWidthValue'),
        extraButtonHorizontal: document.getElementById('extraButtonHorizontal'),
        extraHorizontalValue: document.getElementById('extraHorizontalValue'),
        extraButtonZIndex: document.getElementById('extraButtonZIndex'),
        extraButtonZIndexValue: document.getElementById('extraButtonZIndexValue'),
        extraAnimationSpeed: document.getElementById('extraAnimationSpeed'),
        extraAnimationSpeedValue: document.getElementById('extraAnimationSpeedValue'),
        extraButtonDisableAnimation: document.getElementById('extraButtonDisableAnimation'),
        
        thirdButtonCheck: document.getElementById('thirdButtonCheck'),
        thirdButtonGroup: document.getElementById('thirdButtonGroup'),
        thirdButtonUploadArea: document.getElementById('thirdButtonUploadArea'),
        thirdButtonInput: document.getElementById('thirdButtonInput'),
        thirdButtonUrl: document.getElementById('thirdButtonUrl'),
        thirdButtonPosition: document.getElementById('thirdButtonPosition'),
        thirdPositionValue: document.getElementById('thirdPositionValue'),
        thirdButtonWidth: document.getElementById('thirdButtonWidth'),
        thirdWidthValue: document.getElementById('thirdWidthValue'),
        thirdButtonHorizontal: document.getElementById('thirdButtonHorizontal'),
        thirdHorizontalValue: document.getElementById('thirdHorizontalValue'),
        thirdButtonZIndex: document.getElementById('thirdButtonZIndex'),
        thirdButtonZIndexValue: document.getElementById('thirdButtonZIndexValue'),
        thirdAnimationSpeed: document.getElementById('thirdAnimationSpeed'),
        thirdAnimationSpeedValue: document.getElementById('thirdAnimationSpeedValue'),
        thirdButtonDisableAnimation: document.getElementById('thirdButtonDisableAnimation'),
        
        fbPixelCheck: document.getElementById('fbPixelCheck'),
        fbPixelInputGroup: document.getElementById('fbPixelInputGroup'),
        fbPixelId: document.getElementById('fbPixelId'),
        zipFilename: document.getElementById('zipFilename'),
        generateBtn: document.getElementById('generateBtn'),
        clearAllBtn: document.getElementById('clearAllBtn')
    };

    // Debounced preview update
    const debouncedUpdatePreview = debounce(updatePreview, CONFIG.PREVIEW_DEBOUNCE_MS);

    // Setup click handlers for upload areas
    elements.uploadArea.addEventListener('click', () => elements.imageInput.click());
    elements.buttonUploadArea.addEventListener('click', () => elements.buttonInput.click());
    elements.zipUploadArea.addEventListener('click', () => elements.zipInput.click());
    elements.elementUploadArea.addEventListener('click', () => elements.elementInput.click());
    elements.extraButtonUploadArea.addEventListener('click', () => elements.extraButtonInput.click());
    elements.thirdButtonUploadArea.addEventListener('click', () => elements.thirdButtonInput.click());

    // Setup file input change handlers
    elements.imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleBackgroundFile(file);
    });
    
    elements.buttonInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleButtonFile(file);
    });
    
    elements.zipInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleZipFile(file);
    });
    
    elements.elementInput.addEventListener('change', (e) => {
        const files = e.target.files;
        if (files.length > 0) handleElementFiles(files);
    });
    
    elements.extraButtonInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleExtraButtonFile(file);
    });
    
    elements.thirdButtonInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleThirdButtonFile(file);
    });

    // Setup drag and drop
    setupDragAndDrop(elements.uploadArea, (files) => handleBackgroundFile(files[0]));
    setupDragAndDrop(elements.buttonUploadArea, (files) => handleButtonFile(files[0]));
    setupDragAndDrop(elements.extraButtonUploadArea, (files) => handleExtraButtonFile(files[0]));
    setupDragAndDrop(elements.thirdButtonUploadArea, (files) => handleThirdButtonFile(files[0]));
    setupDragAndDrop(elements.zipUploadArea, (files) => handleZipFile(files[0]), false);
    setupDragAndDrop(elements.elementUploadArea, handleElementFiles);

    // Button position slider
    elements.buttonPosition.addEventListener('input', function() {
        elements.positionValue.textContent = this.value;
        updateConfig('buttonPosition', this.value);
        debouncedUpdatePreview();
    });

    // Button width slider
    elements.buttonWidth.addEventListener('input', function() {
        elements.widthValue.textContent = this.value;
        updateConfig('buttonWidth', this.value);
        debouncedUpdatePreview();
    });

    // Button horizontal position slider
    elements.buttonHorizontal.addEventListener('input', function() {
        const value = parseInt(this.value);
        elements.horizontalValue.textContent = formatHorizontalLabel(value);
        updateConfig('buttonHorizontal', value);
        debouncedUpdatePreview();
    });

    // Button z-index slider
    elements.buttonZIndex.addEventListener('input', function() {
        elements.buttonZIndexValue.textContent = this.value;
        updateConfig('buttonZIndex', this.value);
        debouncedUpdatePreview();
    });

    // Animation speed slider
    elements.animationSpeed.addEventListener('input', function() {
        elements.animationSpeedValue.textContent = this.value;
        updateConfig('animationSpeed', this.value);
        debouncedUpdatePreview();
    });

    // Extra button checkbox
    elements.extraButtonCheck.addEventListener('change', function() {
        elements.extraButtonGroup.style.display = this.checked ? 'block' : 'none';
        updateConfig('extraButtonEnabled', this.checked);
        if (!this.checked) {
            state.files.extraButton = null;
            elements.extraButtonUrl.value = '';
        }
        debouncedUpdatePreview();
    });

    // Extra button position slider
    elements.extraButtonPosition.addEventListener('input', function() {
        elements.extraPositionValue.textContent = this.value;
        updateConfig('extraButtonPosition', this.value);
        debouncedUpdatePreview();
    });

    // Extra button width slider
    elements.extraButtonWidth.addEventListener('input', function() {
        elements.extraWidthValue.textContent = this.value;
        updateConfig('extraButtonWidth', this.value);
        debouncedUpdatePreview();
    });

    // Extra button horizontal position slider
    elements.extraButtonHorizontal.addEventListener('input', function() {
        const value = parseInt(this.value);
        elements.extraHorizontalValue.textContent = formatHorizontalLabel(value);
        updateConfig('extraButtonHorizontal', value);
        debouncedUpdatePreview();
    });

    // Extra button z-index slider
    elements.extraButtonZIndex.addEventListener('input', function() {
        elements.extraButtonZIndexValue.textContent = this.value;
        updateConfig('extraButtonZIndex', this.value);
        debouncedUpdatePreview();
    });

    // Extra button animation speed slider
    elements.extraAnimationSpeed.addEventListener('input', function() {
        elements.extraAnimationSpeedValue.textContent = this.value;
        updateConfig('extraAnimationSpeed', this.value);
        debouncedUpdatePreview();
    });

    // Extra button disable animation checkbox
    elements.extraButtonDisableAnimation.addEventListener('change', function() {
        updateConfig('extraButtonDisableAnimation', this.checked);
        debouncedUpdatePreview();
    });

    // Third button checkbox
    elements.thirdButtonCheck.addEventListener('change', function() {
        elements.thirdButtonGroup.style.display = this.checked ? 'block' : 'none';
        updateConfig('thirdButtonEnabled', this.checked);
        if (!this.checked) {
            state.files.thirdButton = null;
            elements.thirdButtonUrl.value = '';
        }
        debouncedUpdatePreview();
    });

    // Third button position slider
    elements.thirdButtonPosition.addEventListener('input', function() {
        elements.thirdPositionValue.textContent = this.value;
        updateConfig('thirdButtonPosition', this.value);
        debouncedUpdatePreview();
    });

    // Third button width slider
    elements.thirdButtonWidth.addEventListener('input', function() {
        elements.thirdWidthValue.textContent = this.value;
        updateConfig('thirdButtonWidth', this.value);
        debouncedUpdatePreview();
    });

    // Third button horizontal position slider
    elements.thirdButtonHorizontal.addEventListener('input', function() {
        const value = parseInt(this.value);
        elements.thirdHorizontalValue.textContent = formatHorizontalLabel(value);
        updateConfig('thirdButtonHorizontal', value);
        debouncedUpdatePreview();
    });

    // Third button z-index slider
    elements.thirdButtonZIndex.addEventListener('input', function() {
        elements.thirdButtonZIndexValue.textContent = this.value;
        updateConfig('thirdButtonZIndex', this.value);
        debouncedUpdatePreview();
    });

    // Third button animation speed slider
    elements.thirdAnimationSpeed.addEventListener('input', function() {
        elements.thirdAnimationSpeedValue.textContent = this.value;
        updateConfig('thirdAnimationSpeed', this.value);
        debouncedUpdatePreview();
    });

    // Third button disable animation checkbox
    elements.thirdButtonDisableAnimation.addEventListener('change', function() {
        updateConfig('thirdButtonDisableAnimation', this.checked);
        debouncedUpdatePreview();
    });

    // Facebook Pixel checkbox
    elements.fbPixelCheck.addEventListener('change', function() {
        elements.fbPixelInputGroup.style.display = this.checked ? 'block' : 'none';
        updateConfig('fbPixelEnabled', this.checked);
        if (!this.checked) {
            elements.fbPixelId.value = '';
        }
    });

    // Title and URL inputs
    elements.titleInput.addEventListener('input', function() {
        updateConfig('title', this.value);
    });

    elements.urlInput.addEventListener('input', function() {
        updateConfig('redirectUrl', this.value);
    });

    elements.extraButtonUrl.addEventListener('input', function() {
        updateConfig('extraButtonUrl', this.value);
    });

    elements.thirdButtonUrl.addEventListener('input', function() {
        updateConfig('thirdButtonUrl', this.value);
    });

    elements.fbPixelId.addEventListener('input', function() {
        updateConfig('fbPixelId', this.value);
    });

    // Clear All button
    elements.clearAllBtn.addEventListener('click', async function() {
        // Reset state
        state.files.background = null;
        state.files.button = null;
        state.files.extraButton = null;
        state.files.thirdButton = null;
        state.elements = [];
        state.ui.guideFiles = [];
            
            // Reset config to defaults
            state.config.buttonPosition = CONFIG.DEFAULT_BUTTON_POSITION;
            state.config.buttonWidth = CONFIG.DEFAULT_BUTTON_WIDTH;
            state.config.buttonHorizontal = 0;
            state.config.buttonZIndex = CONFIG.DEFAULT_BUTTON_Z_INDEX;
            state.config.animationSpeed = CONFIG.DEFAULT_ANIMATION_SPEED;
            state.config.extraButtonEnabled = false;
            state.config.extraButtonPosition = 70;
            state.config.extraButtonWidth = 60;
            state.config.extraButtonHorizontal = 0;
            state.config.extraButtonZIndex = CONFIG.DEFAULT_BUTTON_Z_INDEX;
            state.config.extraAnimationSpeed = CONFIG.DEFAULT_ANIMATION_SPEED;
            state.config.extraButtonUrl = '';
            state.config.extraButtonDisableAnimation = false;
            state.config.thirdButtonEnabled = false;
            state.config.thirdButtonPosition = 60;
            state.config.thirdButtonWidth = 60;
            state.config.thirdButtonHorizontal = 0;
            state.config.thirdButtonZIndex = CONFIG.DEFAULT_BUTTON_Z_INDEX;
            state.config.thirdAnimationSpeed = CONFIG.DEFAULT_ANIMATION_SPEED;
            state.config.thirdButtonUrl = '';
            state.config.thirdButtonDisableAnimation = false;
            state.config.title = 'HOME';
            state.config.redirectUrl = '';
            state.config.fbPixelEnabled = false;
            state.config.fbPixelId = '';
            
            // Reset all input fields
            elements.titleInput.value = '';
            elements.urlInput.value = '';
            elements.extraButtonUrl.value = '';
            elements.thirdButtonUrl.value = '';
            elements.fbPixelId.value = '';
            elements.zipFilename.value = CONFIG.DEFAULT_ZIP_FILENAME;
            
            // Reset sliders
            elements.buttonPosition.value = CONFIG.DEFAULT_BUTTON_POSITION;
            elements.positionValue.textContent = CONFIG.DEFAULT_BUTTON_POSITION;
            elements.buttonWidth.value = CONFIG.DEFAULT_BUTTON_WIDTH;
            elements.widthValue.textContent = CONFIG.DEFAULT_BUTTON_WIDTH;
            elements.buttonHorizontal.value = 0;
            elements.horizontalValue.textContent = 'Center';
            elements.buttonZIndex.value = CONFIG.DEFAULT_BUTTON_Z_INDEX;
            elements.buttonZIndexValue.textContent = CONFIG.DEFAULT_BUTTON_Z_INDEX;
            elements.animationSpeed.value = CONFIG.DEFAULT_ANIMATION_SPEED;
            elements.animationSpeedValue.textContent = CONFIG.DEFAULT_ANIMATION_SPEED;
            
            elements.extraButtonPosition.value = 70;
            elements.extraPositionValue.textContent = 70;
            elements.extraButtonWidth.value = 60;
            elements.extraWidthValue.textContent = 60;
            elements.extraButtonHorizontal.value = 0;
            elements.extraHorizontalValue.textContent = 'Center';
            elements.extraButtonZIndex.value = CONFIG.DEFAULT_BUTTON_Z_INDEX;
            elements.extraButtonZIndexValue.textContent = CONFIG.DEFAULT_BUTTON_Z_INDEX;
            elements.extraAnimationSpeed.value = CONFIG.DEFAULT_ANIMATION_SPEED;
            elements.extraAnimationSpeedValue.textContent = CONFIG.DEFAULT_ANIMATION_SPEED;
            
            elements.thirdButtonPosition.value = 60;
            elements.thirdPositionValue.textContent = 60;
            elements.thirdButtonWidth.value = 60;
            elements.thirdWidthValue.textContent = 60;
            elements.thirdButtonHorizontal.value = 0;
            elements.thirdHorizontalValue.textContent = 'Center';
            elements.thirdButtonZIndex.value = CONFIG.DEFAULT_BUTTON_Z_INDEX;
            elements.thirdButtonZIndexValue.textContent = CONFIG.DEFAULT_BUTTON_Z_INDEX;
            elements.thirdAnimationSpeed.value = CONFIG.DEFAULT_ANIMATION_SPEED;
            elements.thirdAnimationSpeedValue.textContent = CONFIG.DEFAULT_ANIMATION_SPEED;
            
            // Reset checkboxes
            elements.extraButtonCheck.checked = false;
            elements.extraButtonGroup.style.display = 'none';
            elements.extraButtonDisableAnimation.checked = false;
            elements.thirdButtonCheck.checked = false;
            elements.thirdButtonGroup.style.display = 'none';
            elements.thirdButtonDisableAnimation.checked = false;
            elements.fbPixelCheck.checked = false;
            elements.fbPixelInputGroup.style.display = 'none';
            
            // Reset file inputs
            elements.imageInput.value = '';
            elements.buttonInput.value = '';
            elements.zipInput.value = '';
            elements.elementInput.value = '';
            elements.extraButtonInput.value = '';
            elements.thirdButtonInput.value = '';
            
            // Reset upload areas
            elements.uploadArea.innerHTML = `
                <i class="fas fa-cloud-upload-alt fa-2x mb-2"></i>
                <p class="small mb-0">Drop background</p>
            `;
            elements.buttonUploadArea.innerHTML = `
                <i class="fas fa-hand-pointer fa-2x mb-2"></i>
                <p class="small mb-0">Drop button</p>
            `;
            elements.zipUploadArea.innerHTML = `
                <i class="fas fa-file-archive fa-3x mb-2 text-primary"></i>
                <p class="mb-1 fw-bold">Drop your ZIP file here</p>
                <small class="text-muted">Contains bg, btn, and optional guide folder</small>
            `;
            elements.extraButtonUploadArea.innerHTML = `
                <i class="fas fa-cloud-upload-alt fa-2x mb-1"></i>
                <p class="small mb-0">Drop extra button</p>
            `;
            elements.thirdButtonUploadArea.innerHTML = `
                <i class="fas fa-cloud-upload-alt fa-2x mb-1"></i>
                <p class="small mb-0">Drop third button</p>
            `;
            elements.elementUploadArea.innerHTML = `
                <i class="fas fa-images fa-2x mb-1"></i>
                <p class="small mb-0">Drop additional images (optional)</p>
            `;
            
            // Clear preview and guide areas
            const previewArea = document.getElementById('previewArea');
            previewArea.innerHTML = `
                <div class="py-4">
                    <i class="fas fa-desktop fa-3x text-muted mb-3"></i>
                    <p class="text-muted small">Preview appears here after uploading images</p>
                </div>
            `;
            
            const guidePreviewArea = document.getElementById('guidePreviewArea');
            guidePreviewArea.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-info-circle fa-2x text-muted mb-3"></i>
                    <p class="text-muted small">Upload ZIP with guide folder to see reference designs</p>
                </div>
            `;
            
            // Clear elements container
            document.getElementById('elementsContainer').innerHTML = '';
    });

    // Generate button - dynamically import generator module when needed
    elements.generateBtn.addEventListener('click', async () => {
        const { generateAndDownloadZip } = await import('./generator.js');
        generateAndDownloadZip();
    });

    console.log('LP → HTML Tool initialized (Modular version)');
});
