/**
 * Preview rendering module
 * Handles live preview updates and multi-image slider rendering
 * @module previewRenderer
 */

import { state, clearPreviewIntervals, addPreviewInterval } from './state.js';
import { CONFIG } from './constants.js';
import { calculateHorizontalStyle, createDefaultButtonSVG } from './utils.js';

/**
 * Update preview display with current state
 * Renders background, button, extra button, and all elements with their animations
 * Handles multi-image sliders with automatic switching
 * @returns {void}
 */
export function updatePreview() {
    if (!state.files.background) return;

    const previewArea = document.getElementById('previewArea');
    const { config, files, elements } = state;
    
    const horizontalStyle = calculateHorizontalStyle(config.buttonHorizontal);
    
    let buttonDisplay = '';
    const buttonSrc = files.button || createDefaultButtonSVG();
    
    buttonDisplay = `
        <div class="position-absolute w-100 text-center redirect-btn" style="top: ${config.buttonPosition}%; ${horizontalStyle} z-index: ${config.buttonZIndex};">
            <img src="${buttonSrc}" style="width: ${config.buttonWidth}%; animation: pulse ${config.animationSpeed}s infinite linear;" alt="Button Preview">
        </div>`;
    
    // Extra button display
    let extraButtonDisplay = '';
    if (config.extraButtonEnabled && files.extraButton) {
        const extraHorizontalStyle = calculateHorizontalStyle(config.extraButtonHorizontal);
        const extraAnimation = config.extraButtonDisableAnimation ? 'none' : `pulse2 ${config.extraAnimationSpeed}s infinite linear`;
        
        extraButtonDisplay = `
            <div class="position-absolute w-100 text-center extra-redirect-btn" style="top: ${config.extraButtonPosition}%; ${extraHorizontalStyle} z-index: ${config.extraButtonZIndex};">
                <img src="${files.extraButton}" style="width: ${config.extraButtonWidth}%; animation: ${extraAnimation};" alt="Extra Button Preview">
            </div>`;
    }

    // Third button display
    let thirdButtonDisplay = '';
    if (config.thirdButtonEnabled && files.thirdButton) {
        const thirdHorizontalStyle = calculateHorizontalStyle(config.thirdButtonHorizontal);
        const thirdAnimation = config.thirdButtonDisableAnimation ? 'none' : `pulse ${config.thirdAnimationSpeed}s infinite linear`;
        
        thirdButtonDisplay = `
            <div class="position-absolute w-100 text-center third-redirect-btn" style="top: ${config.thirdButtonPosition}%; ${thirdHorizontalStyle} z-index: ${config.thirdButtonZIndex};">
                <img src="${files.thirdButton}" style="width: ${config.thirdButtonWidth}%; animation: ${thirdAnimation};" alt="Third Button Preview">
            </div>`;
    }

    // Generate elements display
    let elementsDisplay = '';
    elements.forEach(element => {
        const positionStyle = calculateHorizontalStyle(element.left);
        
        if (element.multiImage && element.images.length > 1) {
            elementsDisplay += `
            <div class="position-absolute w-100 text-center element-preview-slider-${element.id}" style="top: ${element.top}%; ${positionStyle} z-index: ${element.zIndex};">
                <img src="${element.images[0]}" id="previewSlider${element.id}" class="element-slider-img" style="width: ${element.width}%;" alt="${element.name}">
            </div>`;
        } else {
            const animationStyle = element.animation !== 'none' ? `animation: ${element.animation} ${element.animationSpeed}s infinite linear;` : '';
            
            elementsDisplay += `
            <div class="position-absolute w-100 text-center" style="top: ${element.top}%; ${positionStyle} z-index: ${element.zIndex};">
                <img src="${element.dataUrl}" style="width: ${element.width}%; height: auto; ${animationStyle}" alt="${element.name}">
            </div>`;
        }
    });

    previewArea.innerHTML = `
        <div class="preview-container-generated position-relative d-inline-block">
            <img src="${files.background}" style="width: 100%; height: auto; display: block;" id="bg" alt="bg">
            ${elementsDisplay}
            ${buttonDisplay}
            ${extraButtonDisplay}
            ${thirdButtonDisplay}
        </div>
    `;

    // Clear existing intervals
    clearPreviewIntervals();

    // Initialize sliders for multi-image elements
    elements.forEach(element => {
        if (element.multiImage && element.images.length > 1) {
            const animClass = element.switchAnimation === 'pulse' ? 'add-animation-zoom' : 'add-animation';
            const exitClass = 'exit-animation';
            let currentIndex = 0;
            const images = element.images;

            const interval = setInterval(() => {
                const slider = document.getElementById(`previewSlider${element.id}`);
                if (!slider) return;
                
                slider.classList.add(exitClass);
                setTimeout(() => {
                    currentIndex = (currentIndex + 1) % images.length;
                    slider.src = images[currentIndex];
                    slider.classList.remove(exitClass);
                    slider.classList.add(animClass);
                    setTimeout(() => slider.classList.remove(animClass), 500);
                }, 500);
            }, CONFIG.SLIDER_INTERVAL_MS);

            addPreviewInterval(interval);
        }
    });
}
