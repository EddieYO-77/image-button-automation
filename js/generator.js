/**
 * HTML, CSS, and ZIP generation module
 */

import { state } from './state.js';
import { CONFIG } from './constants.js';
import { calculateHorizontalStyle, dataURLtoBlob, convertToWebP, webpDataURLtoBlob, sanitizeFilename, showAlert } from './utils.js';

/**
 * Generate multi-image slider JavaScript code
 * @returns {string} JavaScript code for multi-image sliders
 */
function generateMultiImageScripts() {
    let scripts = '';
    
    state.elements.forEach(element => {
        if (element.multiImage && element.images.length > 1) {
            const animationClass = element.switchAnimation === 'pulse' ? 'imageSwitchPulse' : 'imageSwitchSlide';
            scripts += `
      // Slider for ${element.name}
      let currentIndex${element.id} = 0;
      const images${element.id} = [${element.images.map((_, idx) => `'./image/elements/${element.name}_${idx + 1}.jpg'`).join(', ')}];
      const imagesWebP${element.id} = [${element.images.map((_, idx) => `'./image/elements/${element.name}_${idx + 1}.webp'`).join(', ')}];
      
      setInterval(() => {
        const slider = $('#slider${element.id}');
        slider.addClass('exit-animation');
        
        setTimeout(() => {
          currentIndex${element.id} = (currentIndex${element.id} + 1) % images${element.id}.length;
          slider.attr('src', images${element.id}[currentIndex${element.id}]);
          slider.prev('source').attr('srcset', imagesWebP${element.id}[currentIndex${element.id}]);
          slider.removeClass('exit-animation').addClass('add-animation-zoom');
          setTimeout(() => slider.removeClass('add-animation-zoom'), 500);
        }, 500);
      }, 3000);
`;
        }
    });
    
    return scripts;
}

/**
 * Generate redirect-only HTML (no images)
 * @param {string} title - Page title
 * @param {string} loadPath - Path to load.html
 * @returns {string} Generated HTML
 */
export function generateRedirectOnlyHTML(title, loadPath) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta content="width=device-width,initial-scale=1" name="viewport">
  <meta name="description" content="">
  <title>${title}</title>
</head>
<body>
  <script>
    window.location.href = "${loadPath}";
  </script>
</body>
</html>`;
}

/**
 * Generate main landing page HTML
 * @param {string} title - Page title
 * @param {number} position - Button vertical position
 * @param {number} width - Button width
 * @param {number} horizontal - Button horizontal position
 * @param {string} loadPath - Redirect URL path
 * @param {string} fbPixelId - Facebook Pixel ID
 * @param {boolean} extraButtonEnabled - Whether extra button is enabled
 * @param {number} extraPosition - Extra button position
 * @param {number} extraWidth - Extra button width
 * @param {number} extraHorizontal - Extra button horizontal position
 * @param {string} extraLoadPath - Extra button redirect path
 * @param {boolean} thirdButtonEnabled - Whether third button is enabled
 * @param {number} thirdPosition - Third button position
 * @param {number} thirdWidth - Third button width
 * @param {number} thirdHorizontal - Third button horizontal position
 * @param {string} thirdLoadPath - Third button redirect path
 * @param {number} animSpeed - Button animation speed
 * @param {number} extraAnimSpeed - Extra button animation speed
 * @param {number} thirdAnimSpeed - Third button animation speed
 * @param {number} btnZIndex - Button z-index
 * @param {number} extraBtnZIndex - Extra button z-index
 * @param {number} thirdBtnZIndex - Third button z-index
 * @param {boolean} extraDisableAnim - Disable extra button animation
 * @param {boolean} thirdDisableAnim - Disable third button animation
 * @returns {string} Generated HTML
 */
export function generateMainHTML(title, position, width, horizontal, loadPath, fbPixelId = '', extraButtonEnabled = false, extraPosition = 70, extraWidth = 60, extraHorizontal = 0, extraLoadPath = '', thirdButtonEnabled = false, thirdPosition = 60, thirdWidth = 60, thirdHorizontal = 0, thirdLoadPath = '', animSpeed = 0.9, extraAnimSpeed = 0.9, thirdAnimSpeed = 0.9, btnZIndex = 10, extraBtnZIndex = 10, thirdBtnZIndex = 10, extraDisableAnim = false, thirdDisableAnim = false) {
    const fbPixelCode = fbPixelId ? `
  <!-- Facebook Pixel Code -->
  <script>
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${fbPixelId}'); 
    fbq('track', 'PageView');
  </script>
  <noscript><img height="1" width="1" style="display:none"
    src="https://www.facebook.com/tr?id=${fbPixelId}&ev=PageView&noscript=1"
  /></noscript>
  <!-- End Facebook Pixel Code -->` : '';

    // Generate elements HTML
    let elementsHTML = '';
    state.elements.forEach(element => {
        const positionStyle = calculateHorizontalStyle(element.left);
        
        if (element.multiImage && element.images.length > 1) {
            elementsHTML += `
      <div class="position-absolute w-100 text-center element-slider-${element.id}" style="top: ${element.top}%; ${positionStyle} z-index: ${element.zIndex};">
        <picture>
          <source type="image/webp" srcset="./image/elements/${element.name}_1.webp">
          <img src="./image/elements/${element.name}_1.jpg" id="slider${element.id}" class="element-slider-img" style="width: ${element.width}%;" alt="${element.name}">
        </picture>
      </div>`;
        } else {
            const animationClass = element.animation !== 'none' ? ` element-anim-${element.animation}` : '';
            
            elementsHTML += `
      <div class="position-absolute w-100 text-center element-${element.name}" style="top: ${element.top}%; ${positionStyle} z-index: ${element.zIndex};">
        <picture>
          <source type="image/webp" srcset="./image/elements/${element.name}.webp">
          <img src="./image/elements/${element.name}.jpg" class="element-img${animationClass}" style="width: ${element.width}%; animation-duration: ${element.animationSpeed}s;" alt="${element.name}">
        </picture>
      </div>`;
        }
    });

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta content="width=device-width,initial-scale=1" name="viewport">
  <meta name="description" content="">
  <title>${title}</title>
  <link rel="stylesheet" href="./css/style.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.3/css/bootstrap.min.css"
    integrity="sha512-jnSuA4Ss2PkkikSOLtYs8BlYIeeIK1h99ty4YfvRPAlzr377vr3CXDb7sb7eEEBYjDtcYj+AjBH3FLv5uSJuXg=="
    crossorigin="anonymous" referrerpolicy="no-referrer" />${fbPixelCode}
</head>
<body>
  <main class="d-lg-flex">
    <section class="position-relative d-lg-inline-block mx-lg-auto overflow-hidden">
      <picture>
        <source type="image/webp" srcset="./image/bg.webp">
        <img src="./image/bg.jpg" id="bg" alt="bg">
      </picture>
${elementsHTML}
      <div class="position-absolute w-100 text-center redirect-btn">
        <a id="redirectLink" href="${loadPath}">
          <picture>
            <source type="image/webp" srcset="./image/tombol/btn.webp">
            <img src="./image/tombol/btn.jpg" id="tekan" alt="button">
          </picture>
        </a>
      </div>${extraButtonEnabled ? `
      <div class="position-absolute w-100 text-center extra-redirect-btn">
        <a id="extraRedirectLink" href="${extraLoadPath}">
          <picture>
            <source type="image/webp" srcset="./image/tombol/btn2.webp">
            <img src="./image/tombol/btn2.jpg" id="tekan2" alt="extra button">
          </picture>
        </a>
      </div>` : ''}${thirdButtonEnabled ? `
      <div class="position-absolute w-100 text-center third-redirect-btn">
        <a id="thirdRedirectLink" href="${thirdLoadPath}">
          <picture>
            <source type="image/webp" srcset="./image/tombol/btn3.webp">
            <img src="./image/tombol/btn3.jpg" id="tekan3" alt="third button">
          </picture>
        </a>
      </div>` : ''}
    </section>
  </main>

  <script src="https://code.jquery.com/jquery-3.6.4.min.js"></script>
  <script>
    $(document).ready(function () {
      // Get current URL
      let currentURL = window.location.href;

      // Check if URL contains parameters
      if (currentURL.includes('?')) {
        // Append all parameters to the redirect link
        let redirectURL = "${loadPath}?" + currentURL.split('?')[1];
        $('#redirectLink').attr('href', redirectURL);${extraButtonEnabled ? `
        
        // Append parameters to extra button redirect link
        let extraRedirectURL = "${extraLoadPath}?" + currentURL.split('?')[1];
        $('#extraRedirectLink').attr('href', extraRedirectURL);` : ''}${thirdButtonEnabled ? `
        
        // Append parameters to third button redirect link
        let thirdRedirectURL = "${thirdLoadPath}?" + currentURL.split('?')[1];
        $('#thirdRedirectLink').attr('href', thirdRedirectURL);` : ''}
      }

      // Multi-image slider functionality
${generateMultiImageScripts()}
    });
  </script>
</body>
</html>`;
}

/**
 * Generate load.html redirect file
 * @param {string} redirectUrl - Final redirect URL
 * @returns {string} Generated HTML
 */
export function generateLoadHTML(redirectUrl) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title></title>
</head>
<body>
  <script type="text/javascript">
    // Function to get current time in milliseconds since epoch
    function getCurrentTime() {
      return new Date().getTime();
    }

    setTimeout(function () {
      // Malaysia time offset from GMT (in milliseconds)
      var malaysiaOffset = 8 * 60 * 60 * 1000;

      // Function to calculate Malaysia time in milliseconds since epoch
      function getMalaysiaTime() {
        return getCurrentTime() + malaysiaOffset;
      }

      var originalUrl = window.location.href;
      var redirectData = [
        "${redirectUrl}",
        // Add more URLs if needed
      ];

      // Calculate loadIndex based on Malaysia time
      var loadIndex = Math.floor((getMalaysiaTime() / 1000 / 60 / 5) % redirectData.length);
      var redirectUrl = redirectData[loadIndex];

      // Extract parameters from the original URL
      var paramsStart = originalUrl.indexOf('?');
      if (paramsStart !== -1) {
        var paramsString = originalUrl.substring(paramsStart + 1);
        // Append parameters to the redirect URL
        redirectUrl += (redirectUrl.includes('?') ? '&' : '?') + paramsString;
      }

      window.location.href = redirectUrl;
    }, 10);
  </script>
</body>
</html>`;
}

/**
 * Generate style.css file
 * @param {number} position - Button position
 * @param {number} width - Button width
 * @param {number} horizontal - Button horizontal position
 * @param {boolean} extraButtonEnabled - Extra button enabled
 * @param {number} extraPosition - Extra button position
 * @param {number} extraWidth - Extra button width
 * @param {number} extraHorizontal - Extra button horizontal position
 * @param {boolean} thirdButtonEnabled - Third button enabled
 * @param {number} thirdPosition - Third button position
 * @param {number} thirdWidth - Third button width
 * @param {number} thirdHorizontal - Third button horizontal position
 * @param {number} animSpeed - Animation speed
 * @param {number} extraAnimSpeed - Extra animation speed
 * @param {number} thirdAnimSpeed - Third animation speed
 * @param {number} btnZIndex - Button z-index
 * @param {number} extraBtnZIndex - Extra button z-index
 * @param {number} thirdBtnZIndex - Third button z-index
 * @param {boolean} extraDisableAnim - Disable extra button animation
 * @param {boolean} thirdDisableAnim - Disable third button animation
 * @returns {string} Generated CSS
 */
export function generateStyleCSS(position, width, horizontal, extraButtonEnabled = false, extraPosition = 70, extraWidth = 60, extraHorizontal = 0, thirdButtonEnabled = false, thirdPosition = 60, thirdWidth = 60, thirdHorizontal = 0, animSpeed = 0.9, extraAnimSpeed = 0.9, thirdAnimSpeed = 0.9, btnZIndex = 10, extraBtnZIndex = 10, thirdBtnZIndex = 10, extraDisableAnim = false, thirdDisableAnim = false) {
    const horizontalCSS = calculateHorizontalStyle(horizontal);
    const extraHorizontalCSS = calculateHorizontalStyle(extraHorizontal);
    const thirdHorizontalCSS = calculateHorizontalStyle(thirdHorizontal);
    
    return `/* filepath: css/style.css */
/*-------------------------------------------General Styles---------------------------------------------*/
body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f4f4f4;
}

/*-------------------------------------------Background Image---------------------------------------------*/
#bg {
    width: 100%;
    height: auto;
}

/*-------------------------------------------Redirect Button---------------------------------------------*/
.redirect-btn {
    position: absolute;
    top: ${position}%;
    ${horizontalCSS}
    z-index: ${btnZIndex};
}

.redirect-btn img {
    width: ${width}%;
    animation: pulse ${animSpeed}s infinite linear;
}
${extraButtonEnabled ? `
/*-------------------------------------------Extra Redirect Button---------------------------------------------*/
.extra-redirect-btn {
    position: absolute;
    top: ${extraPosition}%;
    ${extraHorizontalCSS}
    z-index: ${extraBtnZIndex};
}

.extra-redirect-btn img {
    width: ${extraWidth}%;${extraDisableAnim ? '' : `
    animation: pulse2 ${extraAnimSpeed}s infinite linear;`}
}
` : ''}${thirdButtonEnabled ? `
/*-------------------------------------------Third Redirect Button---------------------------------------------*/
.third-redirect-btn {
    position: absolute;
    top: ${thirdPosition}%;
    ${thirdHorizontalCSS}
    z-index: ${thirdBtnZIndex};
}

.third-redirect-btn img {
    width: ${thirdWidth}%;${thirdDisableAnim ? '' : `
    animation: pulse ${thirdAnimSpeed}s infinite linear;`}
}
` : ''}
/*-------------------------------------------Keyframe Animation---------------------------------------------*/
@keyframes pulse {
    0% { transform: scale(0.9); }
    50% { transform: scale(1.1); }
    100% { transform: scale(0.9); }
}

@keyframes pulse2 {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
}

@keyframes moveNorthWest {
    0% { transform: translate(0, 0); }
    50% { transform: translate(-30px, -30px); }
    100% { transform: translate(0, 0); }
}

@keyframes moveNorthEast {
    0% { transform: translate(0, 0); }
    50% { transform: translate(30px, -30px); }
    100% { transform: translate(0, 0); }
}

@keyframes moveSouthEast {
    0% { transform: translate(0, 0); }
    50% { transform: translate(30px, 30px); }
    100% { transform: translate(0, 0); }
}

@keyframes moveSouthWest {
    0% { transform: translate(0, 0); }
    50% { transform: translate(-30px, 30px); }
    100% { transform: translate(0, 0); }
}

@keyframes imageSwitchPulse {
    0%, 24% { opacity: 1; transform: scale(1); }
    25%, 49% { opacity: 0; transform: scale(0.8); }
    50%, 74% { opacity: 1; transform: scale(1); }
    75%, 99% { opacity: 0; transform: scale(0.8); }
    100% { opacity: 1; transform: scale(1); }
}

@keyframes imageSwitchSlide {
    0%, 24% { opacity: 1; transform: translateX(0); }
    25%, 49% { opacity: 0; transform: translateX(50px); }
    50%, 74% { opacity: 1; transform: translateX(0); }
    75%, 99% { opacity: 0; transform: translateX(-50px); }
    100% { opacity: 1; transform: translateX(0); }
}

@keyframes zoomOut {
    from { opacity: 1; transform: scale(1); }
    to { opacity: 0; transform: scale(0.8); }
}

@keyframes zoomIn {
    from { opacity: 0; transform: scale(0.8); }
    to { opacity: 1; transform: scale(1); }
}

@keyframes slideOut {
    from { opacity: 1; transform: translateX(0); }
    to { opacity: 0; transform: translateX(-100px); }
}

@keyframes slideIn {
    from { opacity: 0; transform: translateX(100px); }
    to { opacity: 1; transform: translateX(0); }
}

.exit-animation {
    animation: zoomOut 0.5s ease-out forwards;
}

.add-animation-zoom {
    animation: zoomIn 0.5s ease-in forwards;
}

.add-animation {
    animation: slideIn 0.5s ease-in forwards;
}

.multi-image-container {
    position: relative;
    display: inline-block;
}

.multi-image-container img {
    width: 100%;
    height: auto;
}

.multi-image-container img:first-child {
    position: relative;
    display: block;
}

.multi-image-container img:not(:first-child) {
    position: absolute;
    top: 0;
    left: 0;
}

.multi-image-container img:nth-child(1) { animation-delay: 0s; }
.multi-image-container img:nth-child(2) { animation-delay: 2s; }
.multi-image-container img:nth-child(3) { animation-delay: 4s; }
.multi-image-container img:nth-child(4) { animation-delay: 6s; }

/*-------------------------------------------Element Animations---------------------------------------------*/
.element-img {
    display: inline-block;
}

.element-anim-pulse { animation: pulse infinite linear; }
.element-anim-pulse2 { animation: pulse2 infinite linear; }
.element-anim-randomMove { animation: randomMove infinite linear; }
.element-anim-moveNorthWest { animation: moveNorthWest infinite linear; }
.element-anim-moveNorthEast { animation: moveNorthEast infinite linear; }
.element-anim-moveSouthEast { animation: moveSouthEast infinite linear; }
.element-anim-moveSouthWest { animation: moveSouthWest infinite linear; }

@keyframes randomMove {
    0% { transform: translate(0px, 0px); }
    10% { transform: translate(8px, -5px); }
    20% { transform: translate(-3px, 12px); }
    30% { transform: translate(15px, 3px); }
    40% { transform: translate(-8px, -10px); }
    50% { transform: translate(5px, 8px); }
    60% { transform: translate(-12px, 2px); }
    70% { transform: translate(10px, -8px); }
    80% { transform: translate(-5px, 15px); }
    90% { transform: translate(3px, -3px); }
    100% { transform: translate(0px, 0px); }
}

/*-------------------------------------------Multi Device Screen Size---------------------------------------------*/
@media (min-width: 992px) {
    #bg {
        height: 100vh;
    }
}`;
}

/**
 * Generate and download ZIP package
 * @returns {Promise<void>}
 */
export async function generateAndDownloadZip() {
    const redirectOnlyMode = !state.files.background && !state.files.button;
    
    // Validation
    if (!state.config.redirectUrl) {
        showAlert('Please enter a redirect URL', 'warning');
        return;
    }

    if (!redirectOnlyMode) {
        if (!state.files.background) {
            showAlert('Please upload a background image first', 'warning');
            return;
        }
        if (!state.files.button) {
            showAlert('Please upload a button image first', 'warning');
            return;
        }
        if (state.config.extraButtonEnabled) {
            if (!state.files.extraButton) {
                showAlert('Please upload an extra button image or uncheck the extra button option', 'warning');
                return;
            }
            if (!state.config.extraButtonUrl) {
                showAlert('Please enter a redirect URL for the extra button', 'warning');
                return;
            }
        }
        if (state.config.thirdButtonEnabled) {
            if (!state.files.thirdButton) {
                showAlert('Please upload a third button image or uncheck the third button option', 'warning');
                return;
            }
            if (!state.config.thirdButtonUrl) {
                showAlert('Please enter a redirect URL for the third button', 'warning');
                return;
            }
        }
    }

    if (state.config.fbPixelEnabled && !state.config.fbPixelId) {
        showAlert('Please enter a Facebook Pixel ID or uncheck the Facebook Pixel option', 'warning');
        return;
    }

    // Show loading state
    const generateBtn = document.getElementById('generateBtn');
    const originalText = generateBtn.innerHTML;
    generateBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Generating ZIP...';
    generateBtn.disabled = true;

    try {
        const { config, files } = state;
        let generatedFiles = {};
        
        if (redirectOnlyMode) {
            // Redirect-only mode
            generatedFiles = {
                'Lindex.html': generateRedirectOnlyHTML(config.title || 'HOME', './assets/load.html'),
                'L1.html': generateRedirectOnlyHTML(config.title || 'HOME', './assets/load1.html'),
                'L2.html': generateRedirectOnlyHTML(config.title || 'HOME', './assets/load2.html'),
                'L3.html': generateRedirectOnlyHTML(config.title || 'HOME', './assets/load3.html'),
                'L4.html': generateRedirectOnlyHTML(config.title || 'HOME', './assets/load4.html'),
                'assets/load.html': generateLoadHTML(config.redirectUrl),
                'assets/load1.html': generateLoadHTML(config.redirectUrl),
                'assets/load2.html': generateLoadHTML(config.redirectUrl),
                'assets/load3.html': generateLoadHTML(config.redirectUrl),
                'assets/load4.html': generateLoadHTML(config.redirectUrl),
            };
        } else {
            // Normal mode
            generatedFiles = {
                'Lindex.html': generateMainHTML(config.title || 'HOME', config.buttonPosition, config.buttonWidth, config.buttonHorizontal, './assets/load.html', config.fbPixelId, config.extraButtonEnabled, config.extraButtonPosition, config.extraButtonWidth, config.extraButtonHorizontal, './assets/loadExtra.html', config.thirdButtonEnabled, config.thirdButtonPosition, config.thirdButtonWidth, config.thirdButtonHorizontal, './assets/loadThird.html', config.animationSpeed, config.extraAnimationSpeed, config.thirdAnimationSpeed, config.buttonZIndex, config.extraButtonZIndex, config.thirdButtonZIndex, config.extraButtonDisableAnimation, config.thirdButtonDisableAnimation),
                'L1.html': generateMainHTML(config.title || 'HOME', config.buttonPosition, config.buttonWidth, config.buttonHorizontal, './assets/load1.html', config.fbPixelId, config.extraButtonEnabled, config.extraButtonPosition, config.extraButtonWidth, config.extraButtonHorizontal, './assets/loadExtra1.html', config.thirdButtonEnabled, config.thirdButtonPosition, config.thirdButtonWidth, config.thirdButtonHorizontal, './assets/loadThird1.html', config.animationSpeed, config.extraAnimationSpeed, config.thirdAnimationSpeed, config.buttonZIndex, config.extraButtonZIndex, config.thirdButtonZIndex, config.extraButtonDisableAnimation, config.thirdButtonDisableAnimation),
                'L2.html': generateMainHTML(config.title || 'HOME', config.buttonPosition, config.buttonWidth, config.buttonHorizontal, './assets/load2.html', config.fbPixelId, config.extraButtonEnabled, config.extraButtonPosition, config.extraButtonWidth, config.extraButtonHorizontal, './assets/loadExtra2.html', config.thirdButtonEnabled, config.thirdButtonPosition, config.thirdButtonWidth, config.thirdButtonHorizontal, './assets/loadThird2.html', config.animationSpeed, config.extraAnimationSpeed, config.thirdAnimationSpeed, config.buttonZIndex, config.extraButtonZIndex, config.thirdButtonZIndex, config.extraButtonDisableAnimation, config.thirdButtonDisableAnimation),
                'L3.html': generateMainHTML(config.title || 'HOME', config.buttonPosition, config.buttonWidth, config.buttonHorizontal, './assets/load3.html', config.fbPixelId, config.extraButtonEnabled, config.extraButtonPosition, config.extraButtonWidth, config.extraButtonHorizontal, './assets/loadExtra3.html', config.thirdButtonEnabled, config.thirdButtonPosition, config.thirdButtonWidth, config.thirdButtonHorizontal, './assets/loadThird3.html', config.animationSpeed, config.extraAnimationSpeed, config.thirdAnimationSpeed, config.buttonZIndex, config.extraButtonZIndex, config.thirdButtonZIndex, config.extraButtonDisableAnimation, config.thirdButtonDisableAnimation),
                'L4.html': generateMainHTML(config.title || 'HOME', config.buttonPosition, config.buttonWidth, config.buttonHorizontal, './assets/load4.html', config.fbPixelId, config.extraButtonEnabled, config.extraButtonPosition, config.extraButtonWidth, config.extraButtonHorizontal, './assets/loadExtra4.html', config.thirdButtonEnabled, config.thirdButtonPosition, config.thirdButtonWidth, config.thirdButtonHorizontal, './assets/loadThird4.html', config.animationSpeed, config.extraAnimationSpeed, config.thirdAnimationSpeed, config.buttonZIndex, config.extraButtonZIndex, config.thirdButtonZIndex, config.extraButtonDisableAnimation, config.thirdButtonDisableAnimation),
                'assets/load.html': generateLoadHTML(config.redirectUrl),
                'assets/load1.html': generateLoadHTML(config.redirectUrl),
                'assets/load2.html': generateLoadHTML(config.redirectUrl),
                'assets/load3.html': generateLoadHTML(config.redirectUrl),
                'assets/load4.html': generateLoadHTML(config.redirectUrl),
                'css/style.css': generateStyleCSS(config.buttonPosition, config.buttonWidth, config.buttonHorizontal, config.extraButtonEnabled, config.extraButtonPosition, config.extraButtonWidth, config.extraButtonHorizontal, config.thirdButtonEnabled, config.thirdButtonPosition, config.thirdButtonWidth, config.thirdButtonHorizontal, config.animationSpeed, config.extraAnimationSpeed, config.thirdAnimationSpeed, config.buttonZIndex, config.extraButtonZIndex, config.thirdButtonZIndex, config.extraButtonDisableAnimation, config.thirdButtonDisableAnimation),
            };

            // Add extra button load files
            if (config.extraButtonEnabled) {
                generatedFiles['assets/loadExtra.html'] = generateLoadHTML(config.extraButtonUrl);
                generatedFiles['assets/loadExtra1.html'] = generateLoadHTML(config.extraButtonUrl);
                generatedFiles['assets/loadExtra2.html'] = generateLoadHTML(config.extraButtonUrl);
                generatedFiles['assets/loadExtra3.html'] = generateLoadHTML(config.extraButtonUrl);
                generatedFiles['assets/loadExtra4.html'] = generateLoadHTML(config.extraButtonUrl);
            }

            // Add third button load files
            if (config.thirdButtonEnabled) {
                generatedFiles['assets/loadThird.html'] = generateLoadHTML(config.thirdButtonUrl);
                generatedFiles['assets/loadThird1.html'] = generateLoadHTML(config.thirdButtonUrl);
                generatedFiles['assets/loadThird2.html'] = generateLoadHTML(config.thirdButtonUrl);
                generatedFiles['assets/loadThird3.html'] = generateLoadHTML(config.thirdButtonUrl);
                generatedFiles['assets/loadThird4.html'] = generateLoadHTML(config.thirdButtonUrl);
            }
        }

        // Create ZIP
        const zip = new JSZip();

        // Add HTML files
        Object.keys(generatedFiles).forEach(filename => {
            if (filename.includes('/')) {
                const parts = filename.split('/');
                const folder = zip.folder(parts[0]);
                folder.file(parts[1], generatedFiles[filename]);
            } else {
                zip.file(filename, generatedFiles[filename]);
            }
        });

        // Add images and CSS only in normal mode
        if (!redirectOnlyMode) {
            const imageFolder = zip.folder('image');
            
            // Add background images
            if (files.background) {
                const bgBlob = await dataURLtoBlob(files.background);
                imageFolder.file('bg.jpg', bgBlob);
                
                const bgWebP = await convertToWebP(files.background, CONFIG.WEBP_QUALITY);
                const bgWebPBlob = await webpDataURLtoBlob(bgWebP);
                imageFolder.file('bg.webp', bgWebPBlob);
            }
            
            // Add button images
            if (files.button) {
                const tombolFolder = imageFolder.folder('tombol');
                
                const btnBlob = await dataURLtoBlob(files.button);
                tombolFolder.file('btn.jpg', btnBlob);
                
                const btnWebP = await convertToWebP(files.button, CONFIG.WEBP_QUALITY);
                const btnWebPBlob = await webpDataURLtoBlob(btnWebP);
                tombolFolder.file('btn.webp', btnWebPBlob);

                // Add extra button
                if (files.extraButton) {
                    const btn2Blob = await dataURLtoBlob(files.extraButton);
                    tombolFolder.file('btn2.jpg', btn2Blob);
                    
                    const btn2WebP = await convertToWebP(files.extraButton, CONFIG.WEBP_QUALITY);
                    const btn2WebPBlob = await webpDataURLtoBlob(btn2WebP);
                    tombolFolder.file('btn2.webp', btn2WebPBlob);
                }

                // Add third button
                if (files.thirdButton) {
                    const btn3Blob = await dataURLtoBlob(files.thirdButton);
                    tombolFolder.file('btn3.jpg', btn3Blob);
                    
                    const btn3WebP = await convertToWebP(files.thirdButton, CONFIG.WEBP_QUALITY);
                    const btn3WebPBlob = await webpDataURLtoBlob(btn3WebP);
                    tombolFolder.file('btn3.webp', btn3WebPBlob);
                }
            }

            // Add element images
            if (state.elements.length > 0) {
                const elementsFolder = imageFolder.folder('elements');
                
                for (const element of state.elements) {
                    if (element.multiImage && element.images.length > 1) {
                        // Multi-image element
                        for (let i = 0; i < element.images.length; i++) {
                            const imgBlob = await dataURLtoBlob(element.images[i]);
                            elementsFolder.file(`${element.name}_${i + 1}.jpg`, imgBlob);
                            
                            const imgWebP = await convertToWebP(element.images[i], CONFIG.WEBP_QUALITY);
                            const imgWebPBlob = await webpDataURLtoBlob(imgWebP);
                            elementsFolder.file(`${element.name}_${i + 1}.webp`, imgWebPBlob);
                        }
                    } else {
                        // Single image element
                        const elemBlob = await dataURLtoBlob(element.dataUrl);
                        elementsFolder.file(`${element.name}.jpg`, elemBlob);
                        
                        const elemWebP = await convertToWebP(element.dataUrl, CONFIG.WEBP_QUALITY);
                        const elemWebPBlob = await webpDataURLtoBlob(elemWebP);
                        elementsFolder.file(`${element.name}.webp`, elemWebPBlob);
                    }
                }
            }
        }

        // Generate and download
        const content = await zip.generateAsync({ type: 'blob' });
        const url = window.URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        
        const zipFilename = document.getElementById('zipFilename');
        let customFilename = sanitizeFilename(zipFilename.value.trim() || CONFIG.DEFAULT_ZIP_FILENAME);
        a.download = customFilename + '.zip';
        
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        // Show success
        generateBtn.innerHTML = '<i class="fas fa-check"></i> ZIP Downloaded Successfully!';
        setTimeout(() => {
            generateBtn.innerHTML = originalText;
            generateBtn.disabled = false;
        }, 2000);

    } catch (error) {
        console.error('Error generating zip:', error);
        showAlert('Error generating zip file. Please try again.', 'danger');
        generateBtn.innerHTML = originalText;
        generateBtn.disabled = false;
    }
}
