/**
 * Button position detection module
 * Uses AI-powered template matching to automatically detect button position
 * @module detection
 */

import { state, updateConfig } from './state.js';
import { CONFIG } from './constants.js';
import { updatePreview } from './previewRenderer.js';
import { formatHorizontalLabel } from './utils.js';

/**
 * Auto-detect button position from guide images using template matching
 * Analyzes guide images from ZIP upload to automatically position the button
 * Updates configuration and preview if detection is successful
 * @async
 * @returns {Promise<void>}
 * @throws {Error} If detection fails or guide image not found
 */
export async function autoDetectButtonPosition() {
    try {
        const guideFiles = state.ui.guideFiles;
        const guideImageFile = guideFiles.find(file => file.type === 'image');
        
        if (!guideImageFile) {
            console.log('No image guide file found, skipping auto-detection');
            return;
        }

        console.log('Auto-detecting button position from guide image:', guideImageFile.name);
        
        // Show analysis status
        const zipUploadArea = document.getElementById('zipUploadArea');
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

        // Perform analysis with button image for template matching
        const result = await analyzeButtonPositionBrowser(
            guideImageFile.url,
            state.files.background,
            state.files.button
        );
        
        console.log('Analysis result:', result);
        
        // Update sliders with detected values
        if (result.confidence > CONFIG.MIN_CONFIDENCE_THRESHOLD) {
            const buttonPosition = document.getElementById('buttonPosition');
            const positionValue = document.getElementById('positionValue');
            const buttonWidth = document.getElementById('buttonWidth');
            const widthValue = document.getElementById('widthValue');
            const buttonHorizontal = document.getElementById('buttonHorizontal');
            const horizontalValue = document.getElementById('horizontalValue');
            
            buttonPosition.value = result.top;
            positionValue.textContent = result.top;
            
            buttonWidth.value = result.width;
            widthValue.textContent = result.width;
            
            buttonHorizontal.value = result.horizontal;
            horizontalValue.textContent = formatHorizontalLabel(parseInt(result.horizontal));
            
            // Update state
            updateConfig('buttonPosition', result.top);
            updateConfig('buttonWidth', result.width);
            updateConfig('buttonHorizontal', result.horizontal);
            
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
    }
}
