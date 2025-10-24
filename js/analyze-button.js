/**
 * Browser-compatible button position analyzer
 * Uses Canvas API to analyze images without Node.js dependencies
 */

/**
 * Analyzes a guide image to detect button position
 * Uses template matching with the actual button image for high accuracy
 * 
 * @param {string} guideImageDataURL - Data URL of the guide image
 * @param {string} bgImageDataURL - Data URL of the background image (optional, for fallback)
 * @param {string} btnImageDataURL - Data URL of the button image (optional, for template matching)
 * @returns {Promise<Object>} Position data: { top: number, horizontal: number, width: number }
 */
async function analyzeButtonPositionBrowser(guideImageDataURL, bgImageDataURL, btnImageDataURL = null) {
    return new Promise((resolve, reject) => {
        try {
            console.log('Starting browser-based button position analysis...');
            
            const guideImg = new Image();
            const bgImg = new Image();
            const btnImg = btnImageDataURL ? new Image() : null;
            
            let guideLoaded = false;
            let bgLoaded = false;
            let btnLoaded = !btnImageDataURL; // If no button image, consider it "loaded"
            
            const checkAllLoaded = () => {
                if (guideLoaded && bgLoaded && btnLoaded) {
                    performAnalysis();
                }
            };
            
            guideImg.onload = () => {
                guideLoaded = true;
                checkAllLoaded();
            };
            
            bgImg.onload = () => {
                bgLoaded = true;
                checkAllLoaded();
            };
            
            if (btnImg) {
                btnImg.onload = () => {
                    btnLoaded = true;
                    checkAllLoaded();
                };
            }
            
            guideImg.onerror = () => reject(new Error('Failed to load guide image'));
            bgImg.onerror = () => reject(new Error('Failed to load background image'));
            if (btnImg) {
                btnImg.onerror = () => reject(new Error('Failed to load button image'));
            }
            
            const performAnalysis = () => {
                try {
                    // Use smaller size for performance (max 1000px width)
                    const maxWidth = 1000;
                    const scale = Math.min(1, maxWidth / Math.max(guideImg.width, bgImg.width));
                    const targetWidth = Math.round(guideImg.width * scale);
                    const targetHeight = Math.round(guideImg.height * scale);
                    
                    console.log(`Analyzing at ${targetWidth}x${targetHeight}`);
                    
                    let buttonRegion = null;
                    
                    // Method 1: Template matching with actual button image (most accurate)
                    if (btnImg) {
                        console.log('Using template matching with button image...');
                        buttonRegion = findButtonByTemplateMatching(
                            guideImg,
                            btnImg,
                            targetWidth,
                            targetHeight,
                            scale
                        );
                    }
                    
                    // Method 2: Difference detection (fallback)
                    if (!buttonRegion || buttonRegion.confidence < 50) {
                        console.log('Using difference detection method...');
                        const guideCanvas = document.createElement('canvas');
                        const bgCanvas = document.createElement('canvas');
                        const guideCtx = guideCanvas.getContext('2d', { willReadFrequently: true });
                        const bgCtx = bgCanvas.getContext('2d', { willReadFrequently: true });
                        
                        guideCanvas.width = targetWidth;
                        guideCanvas.height = targetHeight;
                        bgCanvas.width = targetWidth;
                        bgCanvas.height = targetHeight;
                        
                        // Draw both images
                        guideCtx.drawImage(guideImg, 0, 0, targetWidth, targetHeight);
                        bgCtx.drawImage(bgImg, 0, 0, targetWidth, targetHeight);
                        
                        // Get image data
                        const guideData = guideCtx.getImageData(0, 0, targetWidth, targetHeight);
                        const bgData = bgCtx.getImageData(0, 0, targetWidth, targetHeight);
                        
                        // Find button region by difference
                        const diffRegion = findButtonRegionBrowser(
                            guideData.data,
                            bgData.data,
                            targetWidth,
                            targetHeight
                        );
                        
                        // Use the better result
                        if (diffRegion && (!buttonRegion || diffRegion.confidence > buttonRegion.confidence)) {
                            buttonRegion = diffRegion;
                        }
                    }
                    
                    if (!buttonRegion) {
                        console.log('Could not detect button automatically, using center position');
                        resolve({
                            top: 75,
                            left: 0,
                            width: 60,
                            horizontal: 0,
                            confidence: 0,
                            method: 'default'
                        });
                        return;
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
                        left: 0,
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
                    resolve(result);
                    
                } catch (error) {
                    console.error('Error in analysis:', error);
                    resolve({
                        top: 75,
                        left: 0,
                        width: 60,
                        horizontal: 0,
                        confidence: 0,
                        method: 'error-fallback',
                        error: error.message
                    });
                }
            };
            
            guideImg.src = guideImageDataURL;
            bgImg.src = bgImageDataURL;
            if (btnImg) {
                btnImg.src = btnImageDataURL;
            }
            
        } catch (error) {
            console.error('Error analyzing button position:', error);
            resolve({
                top: 75,
                left: 0,
                width: 60,
                horizontal: 0,
                confidence: 0,
                method: 'error-fallback',
                error: error.message
            });
        }
    });
}

/**
 * Template matching - finds button by comparing actual button image with guide
 * This is the most accurate method when button image is available
 */
function findButtonByTemplateMatching(guideImg, btnImg, targetWidth, targetHeight, scale) {
    console.log('Template matching: comparing button with guide image...');
    
    try {
        // Create canvases
        const guideCanvas = document.createElement('canvas');
        const btnCanvas = document.createElement('canvas');
        const guideCtx = guideCanvas.getContext('2d', { willReadFrequently: true });
        const btnCtx = btnCanvas.getContext('2d', { willReadFrequently: true });
        
        // Set guide canvas size
        guideCanvas.width = targetWidth;
        guideCanvas.height = targetHeight;
        guideCtx.drawImage(guideImg, 0, 0, targetWidth, targetHeight);
        const guideData = guideCtx.getImageData(0, 0, targetWidth, targetHeight);
        
        // Scale button proportionally
        const btnScaledWidth = Math.round(btnImg.width * scale);
        const btnScaledHeight = Math.round(btnImg.height * scale);
        
        // Skip if button is too large
        if (btnScaledWidth > targetWidth * 0.9 || btnScaledHeight > targetHeight * 0.5) {
            console.log('Button image too large for template matching');
            return null;
        }
        
        btnCanvas.width = btnScaledWidth;
        btnCanvas.height = btnScaledHeight;
        btnCtx.drawImage(btnImg, 0, 0, btnScaledWidth, btnScaledHeight);
        const btnData = btnCtx.getImageData(0, 0, btnScaledWidth, btnScaledHeight);
        
        console.log(`Template size: ${btnScaledWidth}x${btnScaledHeight}`);
        
        // Search parameters
        const stepSize = Math.max(1, Math.floor(btnScaledWidth * 0.1)); // 10% steps for speed
        let bestMatch = null;
        let bestScore = 0;
        
        // Search through the guide image
        const searchWidth = targetWidth - btnScaledWidth;
        const searchHeight = targetHeight - btnScaledHeight;
        
        console.log(`Searching ${Math.ceil(searchWidth / stepSize) * Math.ceil(searchHeight / stepSize)} positions...`);
        
        for (let y = 0; y <= searchHeight; y += stepSize) {
            for (let x = 0; x <= searchWidth; x += stepSize) {
                const score = calculateMatchScore(
                    guideData.data,
                    btnData.data,
                    x, y,
                    btnScaledWidth,
                    btnScaledHeight,
                    targetWidth
                );
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMatch = { x, y, width: btnScaledWidth, height: btnScaledHeight };
                }
            }
        }
        
        // Fine-tune around best match
        if (bestMatch && bestScore > 0.6) {
            console.log('Fine-tuning best match position...');
            const fineSearchRange = stepSize;
            const fineStepSize = 1;
            
            const fineX = Math.max(0, bestMatch.x - fineSearchRange);
            const fineY = Math.max(0, bestMatch.y - fineSearchRange);
            const fineMaxX = Math.min(searchWidth, bestMatch.x + fineSearchRange);
            const fineMaxY = Math.min(searchHeight, bestMatch.y + fineSearchRange);
            
            for (let y = fineY; y <= fineMaxY; y += fineStepSize) {
                for (let x = fineX; x <= fineMaxX; x += fineStepSize) {
                    const score = calculateMatchScore(
                        guideData.data,
                        btnData.data,
                        x, y,
                        btnScaledWidth,
                        btnScaledHeight,
                        targetWidth
                    );
                    
                    if (score > bestScore) {
                        bestScore = score;
                        bestMatch = { x, y, width: btnScaledWidth, height: btnScaledHeight };
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
            width: bestMatch.width,
            height: bestMatch.height,
            centerX: bestMatch.x + bestMatch.width / 2,
            centerY: bestMatch.y + bestMatch.height / 2,
            confidence: confidence,
            method: 'template-matching'
        };
        
    } catch (error) {
        console.error('Error in template matching:', error);
        return null;
    }
}

/**
 * Calculate match score between template and region in guide image
 * Uses normalized cross-correlation
 */
function calculateMatchScore(guideData, btnData, x, y, btnWidth, btnHeight, guideWidth) {
    let totalDiff = 0;
    let maxDiff = 0;
    let pixelCount = 0;
    
    // Sample every few pixels for speed (full comparison is too slow)
    const sampleRate = 2;
    
    for (let by = 0; by < btnHeight; by += sampleRate) {
        for (let bx = 0; bx < btnWidth; bx += sampleRate) {
            const gx = x + bx;
            const gy = y + by;
            
            const btnIdx = (by * btnWidth + bx) * 4;
            const guideIdx = (gy * guideWidth + gx) * 4;
            
            // Compare RGB channels
            const rDiff = Math.abs(btnData[btnIdx] - guideData[guideIdx]);
            const gDiff = Math.abs(btnData[btnIdx + 1] - guideData[guideIdx + 1]);
            const bDiff = Math.abs(btnData[btnIdx + 2] - guideData[guideIdx + 2]);
            
            const diff = (rDiff + gDiff + bDiff) / 3;
            totalDiff += diff;
            maxDiff += 255;
            pixelCount++;
        }
    }
    
    // Normalize score (0 = no match, 1 = perfect match)
    const avgDiff = totalDiff / pixelCount;
    const similarity = 1 - (avgDiff / 255);
    
    return similarity;
}

/**
 * Finds the button region by comparing guide and background images
 * This is the fallback method when template matching is not available or fails
 */
function findButtonRegionBrowser(guideData, bgData, width, height) {
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
