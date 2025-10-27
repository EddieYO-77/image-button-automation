/**
 * Application state management module
 * Centralized state for all application data including files, elements, and configuration
 * @module state
 */

import { CONFIG } from './constants.js';

/**
 * @typedef {Object} ElementObject
 * @property {number} id - Unique identifier for the element
 * @property {string} name - Sanitized name of the element
 * @property {string} dataUrl - Data URL of the image
 * @property {number} width - Width percentage of the element
 * @property {number} top - Top position percentage
 * @property {number} left - Horizontal position (-50 to 50)
 * @property {number} zIndex - Z-index for layering
 * @property {string} animation - Animation type (from ANIMATION_TYPES)
 * @property {number} animationSpeed - Animation speed in seconds
 * @property {boolean} multiImage - Whether element uses multiple images
 * @property {Array<string>} images - Array of image data URLs (for multi-image)
 * @property {string} switchAnimation - Switch animation type (for multi-image)
 */

/**
 * Global application state object
 * @type {Object}
 * @property {Object} files - Uploaded file data URLs
 * @property {string|null} files.background - Background image data URL
 * @property {string} files.backgroundName - Background filename
 * @property {string|null} files.button - Button image data URL
 * @property {string} files.buttonName - Button filename
 * @property {string|null} files.extraButton - Extra button image data URL
 * @property {string} files.extraButtonName - Extra button filename
 * @property {Array<ElementObject>} elements - Array of additional elements
 * @property {Object} config - Application configuration
 * @property {number} config.buttonPosition - Main button vertical position (%)
 * @property {number} config.buttonWidth - Main button width (%)
 * @property {number} config.buttonHorizontal - Main button horizontal position (-50 to 50)
 * @property {number} config.buttonZIndex - Main button z-index
 * @property {number} config.animationSpeed - Main button animation speed (seconds)
 * @property {boolean} config.extraButtonEnabled - Extra button toggle
 * @property {number} config.extraButtonPosition - Extra button vertical position (%)
 * @property {number} config.extraButtonWidth - Extra button width (%)
 * @property {number} config.extraButtonHorizontal - Extra button horizontal position
 * @property {number} config.extraButtonZIndex - Extra button z-index
 * @property {number} config.extraAnimationSpeed - Extra button animation speed
 * @property {string} config.extraButtonUrl - Extra button redirect URL
 * @property {string} config.title - Page title
 * @property {string} config.redirectUrl - Main redirect URL
 * @property {string} config.zipFilename - Output ZIP filename
 * @property {boolean} config.fbPixelEnabled - Facebook Pixel toggle
 * @property {string} config.fbPixelId - Facebook Pixel ID
 * @property {Object} ui - UI-related state
 * @property {number|null} ui.previewInterval - Preview update interval ID
 * @property {Object} generated - Generated file content cache
 * @property {Array<File>} guideFiles - Guide image files from ZIP uploads
 */
export const state = {
    files: {
        background: null,
        backgroundName: CONFIG.BG_FILE_NAME,
        button: null,
        buttonName: CONFIG.BTN_FILE_NAME,
        extraButton: null,
        extraButtonName: CONFIG.BTN2_FILE_NAME,
        thirdButton: null,
        thirdButtonName: CONFIG.BTN3_FILE_NAME
    },
    
    elements: [], // Array of uploaded element objects
    
    config: {
        buttonPosition: CONFIG.DEFAULT_BUTTON_POSITION,
        buttonWidth: CONFIG.DEFAULT_BUTTON_WIDTH,
        buttonHorizontal: 0,
        buttonZIndex: CONFIG.DEFAULT_BUTTON_Z_INDEX,
        animationSpeed: CONFIG.DEFAULT_ANIMATION_SPEED,
        
        extraButtonEnabled: false,
        extraButtonPosition: 70,
        extraButtonWidth: 60,
        extraButtonHorizontal: 0,
        extraButtonZIndex: CONFIG.DEFAULT_BUTTON_Z_INDEX,
        extraAnimationSpeed: CONFIG.DEFAULT_ANIMATION_SPEED,
        extraButtonUrl: '',
        extraButtonDisableAnimation: false,
        
        thirdButtonEnabled: false,
        thirdButtonPosition: 60,
        thirdButtonWidth: 60,
        thirdButtonHorizontal: 0,
        thirdButtonZIndex: CONFIG.DEFAULT_BUTTON_Z_INDEX,
        thirdAnimationSpeed: CONFIG.DEFAULT_ANIMATION_SPEED,
        thirdButtonUrl: '',
        thirdButtonDisableAnimation: false,
        
        title: 'HOME',
        redirectUrl: '',
        zipFilename: CONFIG.DEFAULT_ZIP_FILENAME,
        
        fbPixelEnabled: false,
        fbPixelId: ''
    },
    
    ui: {
        previewIntervals: [], // Store intervals for multi-image sliders
        guideFiles: [] // Store guide folder files (images/videos)
    },
    
    generated: {}
};

/**
 * Get current state snapshot
 * @returns {Object} Current application state
 */
export function getState() {
    return state;
}

/**
 * Update file state with new image data
 * @param {string} type - File type ('background', 'button', or 'extraButton')
 * @param {string} dataUrl - Data URL of the image
 * @param {string} fileName - Original filename
 */
export function updateFile(type, dataUrl, fileName) {
    switch(type) {
        case 'background':
            state.files.background = dataUrl;
            state.files.backgroundName = fileName;
            break;
        case 'button':
            state.files.button = dataUrl;
            state.files.buttonName = fileName;
            break;
        case 'extraButton':
            state.files.extraButton = dataUrl;
            state.files.extraButtonName = fileName;
            break;
        case 'thirdButton':
            state.files.thirdButton = dataUrl;
            state.files.thirdButtonName = fileName;
            break;
    }
}

/**
 * Add element to state
 * @param {ElementObject} element - Element object to add
 */
export function addElement(element) {
    state.elements.push(element);
}

/**
 * Remove element from state and renumber remaining elements
 * @param {number} index - Index of element to remove
 */
export function removeElement(index) {
    state.elements.splice(index, 1);
    // Renumber remaining elements
    state.elements.forEach((el, idx) => {
        el.id = idx + 1;
        el.name = `element${idx + 1}`;
    });
}

/**
 * Update a specific property of an element
 * @param {number} index - Index of the element to update
 * @param {string} property - Property name to update
 * @param {*} value - New value for the property
 */
export function updateElementProperty(index, property, value) {
    if (state.elements[index]) {
        state.elements[index][property] = value;
    }
}

/**
 * Update configuration value
 * @param {string} key - Configuration key to update
 * @param {*} value - New value for the configuration
 */
export function updateConfig(key, value) {
    state.config[key] = value;
}

/**
 * Clear all preview interval timers
 * Used when preview needs to be refreshed completely
 */
export function clearPreviewIntervals() {
    state.ui.previewIntervals.forEach(interval => clearInterval(interval));
    state.ui.previewIntervals = [];
}

/**
 * Add a preview interval timer to state
 * @param {number} interval - setInterval return value
 */
export function addPreviewInterval(interval) {
    state.ui.previewIntervals.push(interval);
}

/**
 * Set guide files from ZIP upload
 * @param {Array<File>} files - Array of guide files (images/videos)
 */
export function setGuideFiles(files) {
    state.ui.guideFiles = files;
}

/**
 * Get current guide files
 * @returns {Array<File>} Array of guide files
 */
export function getGuideFiles() {
    return state.ui.guideFiles;
}
