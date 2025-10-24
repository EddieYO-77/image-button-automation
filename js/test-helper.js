#!/usr/bin/env node

/**
 * Test Helper Script
 * Quickly test the button position detection with sample images
 */

const fs = require('fs');
const path = require('path');
const { analyzeButtonPosition } = require('./analyze-button-position.js');

console.log('🎯 Button Position Detection - Test Helper\n');

// Check if sample images directory exists
const samplesDir = path.join(__dirname, 'samples');
if (!fs.existsSync(samplesDir)) {
    console.log('📁 Creating samples directory...');
    fs.mkdirSync(samplesDir);
    console.log('✅ Created: ./samples/\n');
    console.log('📝 Next steps:');
    console.log('1. Add your test images to ./samples/:');
    console.log('   - guide.jpg (complete design with button)');
    console.log('   - bg.jpg (background without button)');
    console.log('   - btn.png (button image)\n');
    console.log('2. Run this script again: node test-helper.js\n');
    process.exit(0);
}

// Check for test images
const guidePath = path.join(samplesDir, 'guide.jpg');
const bgPath = path.join(samplesDir, 'bg.jpg');
const btnPath = path.join(samplesDir, 'btn.png');

const guideExists = fs.existsSync(guidePath);
const bgExists = fs.existsSync(bgPath);
const btnExists = fs.existsSync(btnPath);

if (!guideExists || !bgExists || !btnExists) {
    console.log('❌ Missing test images in ./samples/:\n');
    if (!guideExists) console.log('   ❌ guide.jpg - Complete design with button');
    else console.log('   ✅ guide.jpg');
    
    if (!bgExists) console.log('   ❌ bg.jpg - Background without button');
    else console.log('   ✅ bg.jpg');
    
    if (!btnExists) console.log('   ❌ btn.png - Button image');
    else console.log('   ✅ btn.png');
    
    console.log('\n📝 Add the missing files and run again.\n');
    process.exit(1);
}

console.log('✅ Found all test images!\n');
console.log('🔍 Analyzing button position...\n');

// Run analysis
analyzeButtonPosition(guidePath, bgPath, btnPath)
    .then(result => {
        console.log('═══════════════════════════════════════');
        console.log('📊 DETECTION RESULTS');
        console.log('═══════════════════════════════════════\n');
        
        console.log('Position Settings:');
        console.log(`  📍 Top: ${result.top}%`);
        console.log(`  📏 Width: ${result.width}%`);
        console.log(`  ↔️  Horizontal: ${
            result.horizontal === 0 ? 'Center' :
            result.horizontal > 0 ? `${result.horizontal}% from Left` :
            `${Math.abs(result.horizontal)}% from Right`
        }`);
        
        console.log('\nQuality:');
        console.log(`  🎯 Confidence: ${result.confidence}% ${
            result.confidence >= 80 ? '(Excellent ✨)' :
            result.confidence >= 50 ? '(Good ✔️)' :
            result.confidence >= 30 ? '(Fair ⚠️)' : '(Poor ❌)'
        }`);
        console.log(`  🔧 Method: ${result.method}`);
        
        if (result.rawPosition) {
            console.log('\nRaw Detection Data:');
            console.log(`  X: ${result.rawPosition.x}px`);
            console.log(`  Y: ${result.rawPosition.y}px`);
            console.log(`  Width: ${result.rawPosition.width}px`);
            console.log(`  Height: ${result.rawPosition.height}px`);
            console.log(`  Center: (${Math.round(result.rawPosition.centerX)}, ${Math.round(result.rawPosition.centerY)})`);
        }
        
        console.log('\n═══════════════════════════════════════');
        console.log('✅ Analysis Complete!\n');
        
        // Recommendations
        if (result.confidence >= 80) {
            console.log('💡 Recommendation: Detection looks excellent! Use these values.');
        } else if (result.confidence >= 50) {
            console.log('💡 Recommendation: Good detection. Review and adjust if needed.');
        } else if (result.confidence >= 30) {
            console.log('💡 Recommendation: Fair detection. Manual adjustment recommended.');
        } else {
            console.log('💡 Recommendation: Low confidence. Use manual positioning.');
        }
        
        console.log('\n📋 Copy-Paste Values:');
        console.log(`   buttonPosition.value = ${result.top};`);
        console.log(`   buttonWidth.value = ${result.width};`);
        console.log(`   buttonHorizontal.value = ${result.horizontal};`);
        console.log('');
        
    })
    .catch(error => {
        console.error('❌ Error during analysis:', error.message);
        console.error('\nStack trace:');
        console.error(error.stack);
        process.exit(1);
    });
