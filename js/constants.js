/**
 * Configuration constants and default values module
 * Contains all application configuration, default values, and enums
 * @module constants
 */

/**
 * Application configuration object containing all default values and settings
 * @type {Object}
 * @property {number} WEBP_QUALITY - Quality for WebP image conversion (0-1)
 * @property {number} MAX_MULTI_IMAGES - Maximum number of images in multi-image sliders
 * @property {number} PREVIEW_DEBOUNCE_MS - Debounce delay for preview updates in milliseconds
 * @property {number} SLIDER_INTERVAL_MS - Interval for multi-image slider transitions
 * @property {number} DEFAULT_ELEMENT_WIDTH - Default width percentage for additional elements
 * @property {number} DEFAULT_ELEMENT_TOP - Default top position percentage for elements
 * @property {number} DEFAULT_ELEMENT_LEFT - Default horizontal position for elements (-50 to 50)
 * @property {number} DEFAULT_ELEMENT_ANIMATION_SPEED - Default animation speed for elements in seconds
 * @property {number} DEFAULT_ELEMENT_Z_INDEX - Default z-index for additional elements
 * @property {number} DEFAULT_BUTTON_POSITION - Default vertical position percentage for main button
 * @property {number} DEFAULT_BUTTON_WIDTH - Default width percentage for main button
 * @property {number} DEFAULT_BUTTON_Z_INDEX - Default z-index for main button
 * @property {number} DEFAULT_ANIMATION_SPEED - Default animation speed for buttons in seconds
 * @property {string} DEFAULT_ZIP_FILENAME - Default name for generated ZIP packages
 * @property {string} BG_FILE_NAME - Filename for background image
 * @property {string} BTN_FILE_NAME - Filename for main button image
 * @property {string} BTN2_FILE_NAME - Filename for extra button image
 * @property {number} MIN_CONFIDENCE_THRESHOLD - Minimum confidence for AI detection (0-100)
 */
export const CONFIG = {
    // Image processing
    WEBP_QUALITY: 0.8,
    MAX_MULTI_IMAGES: 4,
    
    // Debounce timing
    PREVIEW_DEBOUNCE_MS: 50,
    
    // Multi-image slider timing
    SLIDER_INTERVAL_MS: 3000,
    
    // Default values
    DEFAULT_ELEMENT_WIDTH: 30,
    DEFAULT_ELEMENT_TOP: 50,
    DEFAULT_ELEMENT_LEFT: 0,
    DEFAULT_ELEMENT_ANIMATION_SPEED: 0.9,
    DEFAULT_ELEMENT_Z_INDEX: 1,
    
    DEFAULT_BUTTON_POSITION: 83,
    DEFAULT_BUTTON_WIDTH: 60,
    DEFAULT_BUTTON_Z_INDEX: 10,
    DEFAULT_ANIMATION_SPEED: 0.9,
    
    DEFAULT_ZIP_FILENAME: 'landing-page-package',
    
    // File names
    BG_FILE_NAME: 'bg.jpg',
    BTN_FILE_NAME: 'btn.jpg',
    BTN2_FILE_NAME: 'btn2.jpg',
    BTN3_FILE_NAME: 'btn3.jpg',
    
    // Detection confidence threshold
    MIN_CONFIDENCE_THRESHOLD: 30
};

/**
 * Animation types available for elements
 * @type {Object}
 * @property {string} NONE - No animation
 * @property {string} PULSE - Pulse/scale animation
 * @property {string} PULSE2 - Alternative pulse animation
 * @property {string} RANDOM_MOVE - Random movement animation
 * @property {string} MOVE_NORTH_WEST - Move towards northwest
 * @property {string} MOVE_NORTH_EAST - Move towards northeast
 * @property {string} MOVE_SOUTH_EAST - Move towards southeast
 * @property {string} MOVE_SOUTH_WEST - Move towards southwest
 */
export const ANIMATION_TYPES = {
    NONE: 'none',
    PULSE: 'pulse',
    PULSE2: 'pulse2',
    RANDOM_MOVE: 'randomMove',
    MOVE_NORTH_WEST: 'moveNorthWest',
    MOVE_NORTH_EAST: 'moveNorthEast',
    MOVE_SOUTH_EAST: 'moveSouthEast',
    MOVE_SOUTH_WEST: 'moveSouthWest'
};

/**
 * Animation types for multi-image switching transitions
 * @type {Object}
 * @property {string} PULSE - Pulse fade transition
 * @property {string} SLIDE - Slide transition
 */
export const SWITCH_ANIMATION_TYPES = {
    PULSE: 'pulse',
    SLIDE: 'slide'
};

/**
 * File type identifiers for upload handling
 * @type {Object}
 * @property {string} IMAGE - Image file type
 * @property {string} VIDEO - Video file type
 */
export const FILE_TYPES = {
    IMAGE: 'image',
    VIDEO: 'video'
};
