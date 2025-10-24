const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

/**
 * Analyzes a guide image to detect button position
 * Uses template matching with button image for high accuracy
 * Falls back to difference detection if needed
 * 
 * @param {string} guideImagePath - Path to the guide image (complete design)
 * @param {string} bgImagePath - Path to the background image
 * @param {string} btnImagePath - Path to the button image
 * @returns {Promise<Object>} Position data: { top: number, left: number, width: number }
 */
async function analyzeButtonPosition(guideImagePath, bgImagePath, btnImagePath) {
    try {
        console.log('Starting button position analysis with template matching...');
        
        // Load all images
        const [guideBuffer, bgBuffer, btnBuffer] = await Promise.all([
            fs.readFile(guideImagePath),
            fs.readFile(bgImagePath),
            fs.readFile(btnImagePath)
        ]);

        // Get metadata for all images
        const [guideMeta, bgMeta, btnMeta] = await Promise.all([
            sharp(guideBuffer).metadata(),
            sharp(bgBuffer).metadata(),
            sharp(btnBuffer).metadata()
        ]);

        console.log('Image dimensions:', {
            guide: `${guideMeta.width}x${guideMeta.height}`,
            background: `${bgMeta.width}x${bgMeta.height}`,
            button: `${btnMeta.width}x${btnMeta.height}`
        });

        // Resize images for processing
        const targetWidth = Math.min(guideMeta.width, bgMeta.width, 1000);
        const targetHeight = Math.round(targetWidth * (bgMeta.height / bgMeta.width));
        const scale = targetWidth / guideMeta.width;

        const [guideResized, bgResized, btnResized] = await Promise.all([
            sharp(guideBuffer)
                .resize(targetWidth, targetHeight, { fit: 'fill' })
                .raw()
                .toBuffer({ resolveWithObject: true }),
            sharp(bgBuffer)
                .resize(targetWidth, targetHeight, { fit: 'fill' })
                .raw()
                .toBuffer({ resolveWithObject: true }),
            sharp(btnBuffer)
                .resize(Math.round(btnMeta.width * scale), Math.round(btnMeta.height * scale), { fit: 'fill' })
                .raw()
                .toBuffer({ resolveWithObject: true })
        ]);

        console.log('Images resized for comparison');

        // Method 1: Template matching (most accurate)
        console.log('Attempting template matching...');
        let buttonRegion = findButtonByTemplateMatching(
            guideResized.data,
            btnResized.data,
            guideResized.info.width,
            guideResized.info.height,
            btnResized.info.width,
            btnResized.info.height
        );

        // Method 2: Difference detection (fallback)
        if (!buttonRegion || buttonRegion.confidence < 50) {
            console.log('Template matching failed or low confidence, trying difference detection...');
            const diffRegion = findButtonRegion(
                guideResized.data,
                bgResized.data,
                guideResized.info.width,
                guideResized.info.height
            );
            
            if (diffRegion && (!buttonRegion || diffRegion.confidence > buttonRegion.confidence)) {
                buttonRegion = diffRegion;
            }
        }

        if (!buttonRegion) {
            console.log('Could not detect button automatically, using center position');
            return {
                top: 75,
                left: 0,
                width: 60,
                horizontal: 0,
                confidence: 0,
                method: 'default'
            };
        }

        console.log('Button region detected:', buttonRegion);

        // Calculate percentages relative to image dimensions
        let topPercent = Math.round((buttonRegion.centerY / targetHeight) * 100);
        
        // Apply correction offset: detected position is typically 5% too low
        // This compensates for systematic bias in detection
        const positionCorrectionOffset = 5;
        topPercent = Math.max(0, topPercent - positionCorrectionOffset);
        
        console.log(`Position correction: ${topPercent + positionCorrectionOffset}% → ${topPercent}% (adjusted -${positionCorrectionOffset}%)`);
        
        // Calculate horizontal position - always center by default
        // Users can manually adjust using the horizontal slider if needed
        const horizontalPercent = 0; // Always centered

        const widthPercent = Math.round((buttonRegion.width / targetWidth) * 100);

        const result = {
            top: Math.min(Math.max(topPercent, 0), 100),
            left: 0, // Not used in current CSS, kept for compatibility
            width: Math.min(Math.max(widthPercent, 10), 100),
            horizontal: Math.min(Math.max(horizontalPercent, -50), 50),
            confidence: buttonRegion.confidence,
            method: buttonRegion.method || 'auto-detected',
            rawPosition: {
                x: buttonRegion.left,
                y: buttonRegion.top,
                width: buttonRegion.width,
                height: buttonRegion.height,
                centerX: buttonRegion.centerX,
                centerY: buttonRegion.centerY
            }
        };

        console.log('Button position calculated:', result);
        return result;

    } catch (error) {
        console.error('Error analyzing button position:', error);
        // Return default center position on error
        return {
            top: 75,
            left: 0,
            width: 60,
            horizontal: 0,
            confidence: 0,
            method: 'error-fallback',
            error: error.message
        };
    }
}

/**
 * Template matching - finds button by comparing actual button image with guide
 * This is the most accurate method
 */
function findButtonByTemplateMatching(guideData, btnData, guideWidth, guideHeight, btnWidth, btnHeight) {
    console.log(`Template matching: ${btnWidth}x${btnHeight} button in ${guideWidth}x${guideHeight} guide`);
    
    // Skip if button is too large
    if (btnWidth > guideWidth * 0.9 || btnHeight > guideHeight * 0.5) {
        console.log('Button image too large for template matching');
        return null;
    }
    
    const channels = 3; // RGB
    const stepSize = Math.max(1, Math.floor(btnWidth * 0.1)); // 10% steps
    
    let bestMatch = null;
    let bestScore = 0;
    
    const searchWidth = guideWidth - btnWidth;
    const searchHeight = guideHeight - btnHeight;
    
    console.log(`Searching ${Math.ceil(searchWidth / stepSize) * Math.ceil(searchHeight / stepSize)} positions...`);
    
    // Coarse search
    for (let y = 0; y <= searchHeight; y += stepSize) {
        for (let x = 0; x <= searchWidth; x += stepSize) {
            const score = calculateTemplateMatchScore(
                guideData, btnData, x, y, btnWidth, btnHeight, guideWidth, channels
            );
            
            if (score > bestScore) {
                bestScore = score;
                bestMatch = { x, y };
            }
        }
    }
    
    // Fine-tune around best match
    if (bestMatch && bestScore > 0.6) {
        console.log('Fine-tuning best match...');
        const fineRange = stepSize;
        const fineX = Math.max(0, bestMatch.x - fineRange);
        const fineY = Math.max(0, bestMatch.y - fineRange);
        const fineMaxX = Math.min(searchWidth, bestMatch.x + fineRange);
        const fineMaxY = Math.min(searchHeight, bestMatch.y + fineRange);
        
        for (let y = fineY; y <= fineMaxY; y++) {
            for (let x = fineX; x <= fineMaxX; x++) {
                const score = calculateTemplateMatchScore(
                    guideData, btnData, x, y, btnWidth, btnHeight, guideWidth, channels
                );
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMatch = { x, y };
                }
            }
        }
    }
    
    if (!bestMatch || bestScore < 0.5) {
        console.log(`Template matching failed. Best score: ${(bestScore * 100).toFixed(1)}%`);
        return null;
    }
    
    const confidence = Math.round(bestScore * 100);
    console.log(`Template match found! Score: ${confidence}% at (${bestMatch.x}, ${bestMatch.y})`);
    
    return {
        left: bestMatch.x,
        top: bestMatch.y,
        width: btnWidth,
        height: btnHeight,
        centerX: bestMatch.x + btnWidth / 2,
        centerY: bestMatch.y + btnHeight / 2,
        confidence: confidence,
        method: 'template-matching'
    };
}

/**
 * Calculate template match score using normalized cross-correlation
 */
function calculateTemplateMatchScore(guideData, btnData, x, y, btnWidth, btnHeight, guideWidth, channels) {
    let totalDiff = 0;
    let pixelCount = 0;
    const sampleRate = 2; // Sample every 2nd pixel for speed
    
    for (let by = 0; by < btnHeight; by += sampleRate) {
        for (let bx = 0; bx < btnWidth; bx += sampleRate) {
            const gx = x + bx;
            const gy = y + by;
            
            const btnIdx = (by * btnWidth + bx) * channels;
            const guideIdx = (gy * guideWidth + gx) * channels;
            
            // Compare RGB
            const rDiff = Math.abs(btnData[btnIdx] - guideData[guideIdx]);
            const gDiff = Math.abs(btnData[btnIdx + 1] - guideData[guideIdx + 1]);
            const bDiff = Math.abs(btnData[btnIdx + 2] - guideData[guideIdx + 2]);
            
            totalDiff += (rDiff + gDiff + bDiff) / 3;
            pixelCount++;
        }
    }
    
    const avgDiff = totalDiff / pixelCount;
    const similarity = 1 - (avgDiff / 255);
    
    return similarity;
}

/**
 * Finds the button region by comparing guide and background images
 * Uses difference detection and clustering (fallback method)
 */
function findButtonRegion(guideData, bgData, width, height) {
    const diffThreshold = 30; // Minimum difference to consider as button pixel
    const minButtonSize = 50; // Minimum button size in pixels
    
    // Create difference map
    const diffMap = new Uint8Array(width * height);
    let diffPixelCount = 0;
    
    for (let i = 0; i < guideData.length; i += 4) {
        const pixelIndex = i / 4;
        
        // Calculate pixel difference (RGB channels)
        const rDiff = Math.abs(guideData[i] - bgData[i]);
        const gDiff = Math.abs(guideData[i + 1] - bgData[i + 1]);
        const bDiff = Math.abs(guideData[i + 2] - bgData[i + 2]);
        
        const totalDiff = (rDiff + gDiff + bDiff) / 3;
        
        if (totalDiff > diffThreshold) {
            diffMap[pixelIndex] = 1;
            diffPixelCount++;
        }
    }

    console.log(`Found ${diffPixelCount} different pixels`);

    if (diffPixelCount < minButtonSize) {
        console.log('Not enough different pixels to detect button');
        return null;
    }

    // Find bounding box of different pixels
    let minX = width, maxX = 0, minY = height, maxY = 0;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            if (diffMap[idx] === 1) {
                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y);
            }
        }
    }

    const buttonWidth = maxX - minX;
    const buttonHeight = maxY - minY;

    console.log('Button bounding box:', { minX, maxX, minY, maxY, buttonWidth, buttonHeight });

    if (buttonWidth < minButtonSize || buttonHeight < minButtonSize / 3) {
        console.log('Detected region too small to be a button');
        return null;
    }

    // Calculate center and confidence
    const centerX = minX + buttonWidth / 2;
    const centerY = minY + buttonHeight / 2;
    
    // Confidence based on size and pixel density
    const regionSize = buttonWidth * buttonHeight;
    const density = diffPixelCount / regionSize;
    const confidence = Math.min(density * 100, 100);

    return {
        left: minX,
        top: minY,
        width: buttonWidth,
        height: buttonHeight,
        centerX: centerX,
        centerY: centerY,
        confidence: Math.round(confidence)
    };
}

/**
 * CLI interface for the script
 */
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length < 3) {
        console.error('Usage: node analyze-button-position.js <guide-image> <background-image> <button-image>');
        console.error('Example: node analyze-button-position.js guide.jpg bg.jpg btn.png');
        process.exit(1);
    }

    const [guideImagePath, bgImagePath, btnImagePath] = args;

    // Check if files exist
    try {
        await fs.access(guideImagePath);
        await fs.access(bgImagePath);
        await fs.access(btnImagePath);
    } catch (error) {
        console.error('Error: One or more image files not found');
        process.exit(1);
    }

    const result = await analyzeButtonPosition(guideImagePath, bgImagePath, btnImagePath);
    
    // Output result as JSON for easy parsing
    console.log('\n=== RESULT ===');
    console.log(JSON.stringify(result, null, 2));
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

// Export for use as module
module.exports = { analyzeButtonPosition };
