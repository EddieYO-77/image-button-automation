/**
 * Utility functions module
 * Pure helper functions for common operations
 * @module utils
 */

/**
 * Show inline alert message in Bootstrap style
 * @param {string} message - Alert message to display
 * @param {string} [type='danger'] - Alert type (success, danger, warning, info)
 * @param {number} [duration=5000] - Auto-dismiss duration in ms (0 = no auto-dismiss)
 */
export function showAlert(message, type = 'danger', duration = 5000) {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.inline-alert');
    existingAlerts.forEach(alert => alert.remove());
    
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show inline-alert`;
    alertDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
    alertDiv.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas fa-${type === 'danger' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
            <div>${message}</div>
            <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto-dismiss after duration
    if (duration > 0) {
        setTimeout(() => {
            alertDiv.classList.remove('show');
            setTimeout(() => alertDiv.remove(), 150);
        }, duration);
    }
}

/**
 * Debounce function for performance optimization
 * Delays function execution until after a specified wait time has elapsed since the last call
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 * @example
 * const debouncedUpdate = debounce(updatePreview, 300);
 * debouncedUpdate(); // Will only execute after 300ms of no calls
 */
export function debounce(func, wait) {
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

/**
 * Calculate CSS positioning style based on horizontal offset
 * Converts a numerical position (-50 to 50) to CSS left/right positioning
 * @param {number} horizontal - Horizontal position (-50 = far right, 0 = center, 50 = far left)
 * @returns {string} CSS position string (e.g., 'left: 30%;' or 'right: 20%;')
 * @example
 * calculateHorizontalStyle(-30) // Returns 'right: 30%;'
 * calculateHorizontalStyle(0)   // Returns ''
 * calculateHorizontalStyle(25)  // Returns 'left: 25%;'
 */
export function calculateHorizontalStyle(horizontal) {
    const offset = Math.abs(horizontal);
    if (horizontal < 0) {
        return `right: ${offset}%;`;
    } else if (horizontal > 0) {
        return `left: ${offset}%;`;
    }
    return '';
}

/**
 * Format horizontal position value into human-readable label
 * @param {number} value - Horizontal position value (-50 to 50)
 * @returns {string} Formatted label (e.g., 'Center', '30% from Left', '20% from Right')
 */
export function formatHorizontalLabel(value) {
    if (value === 0) return 'Center';
    if (value < 0) return `${Math.abs(value)}% from Right`;
    return `${value}% from Left`;
}

/**
 * Convert Blob to data URL
 * @param {Blob} blob - Blob object to convert
 * @returns {Promise<string>} Promise resolving to data URL string
 */
export function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

/**
 * Convert data URL to Blob object
 * @param {string} dataURL - Data URL string (e.g., 'data:image/png;base64,...')
 * @returns {Promise<Blob>} Promise resolving to Blob object
 */
export function dataURLtoBlob(dataURL) {
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

/**
 * Convert image to WebP format with specified quality
 * @param {string} imageDataURL - Image data URL to convert
 * @param {number} [quality=0.8] - WebP quality (0-1)
 * @returns {Promise<string>} Promise resolving to WebP data URL
 */
export function convertToWebP(imageDataURL, quality = 0.8) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const webpDataURL = canvas.toDataURL('image/webp', quality);
            resolve(webpDataURL);
        };
        img.src = imageDataURL;
    });
}

/**
 * Convert WebP data URL to Blob object
 * @param {string} webpDataURL - WebP data URL string
 * @returns {Promise<Blob>} Promise resolving to WebP Blob
 */
export function webpDataURLtoBlob(webpDataURL) {
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

/**
 * Sanitize filename by removing .zip extension and invalid characters
 * @param {string} filename - Original filename
 * @returns {string} Sanitized filename safe for file systems
 */
export function sanitizeFilename(filename) {
    return filename
        .replace(/\.zip$/i, '')
        .replace(/[^a-z0-9_-]/gi, '-');
}

/**
 * Create a default button SVG as data URL
 * @returns {string} SVG data URL for default button image
 */
export function createDefaultButtonSVG() {
    const svg = `
        <svg width="200" height="60" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="200" height="60" rx="30" fill="#FF6B35"/>
            <text x="100" y="38" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle" fill="white">CLICK HERE</text>
        </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
}
