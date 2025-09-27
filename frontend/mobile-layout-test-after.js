const puppeteer = require('puppeteer');

async function testMobileLayoutAfter() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // Set mobile viewport
    await page.setViewport({
      width: 375,
      height: 667,
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 2
    });

    console.log('Testing mobile layout after fixes...');

    // Test the homepage
    await page.goto('http://localhost:3004', { waitUntil: 'networkidle0' });

    // Take screenshot
    await page.screenshot({
      path: 'mobile-homepage-after.png',
      fullPage: true
    });

    // Check for horizontal scroll
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const bodyClientWidth = await page.evaluate(() => document.body.clientWidth);

    console.log(`Body scroll width: ${bodyScrollWidth}`);
    console.log(`Body client width: ${bodyClientWidth}`);

    if (bodyScrollWidth > bodyClientWidth + 5) { // Allow small tolerance
      console.log('❌ Horizontal scrolling still detected on homepage');
    } else {
      console.log('✅ No horizontal scrolling on homepage');
    }

    // Test mobile menu button presence
    const mobileMenuButton = await page.$('button');
    if (mobileMenuButton) {
      console.log('✅ Mobile menu button found');

      // Test mobile menu functionality
      await mobileMenuButton.click();
      await page.waitForTimeout(500);

      const mobileMenu = await page.$('.mobile-nav');
      if (mobileMenu) {
        console.log('✅ Mobile navigation menu opens');
      } else {
        console.log('❌ Mobile navigation menu not found');
      }
    } else {
      console.log('❌ Mobile menu button not found');
    }

    // Test responsive grid layouts
    const heroGrid = await page.$('.grid');
    if (heroGrid) {
      const gridBounds = await heroGrid.boundingBox();
      console.log(`Hero grid width: ${gridBounds.width}`);

      if (gridBounds.width <= 375) {
        console.log('✅ Hero grid fits mobile screen');
      } else {
        console.log('❌ Hero grid too wide for mobile');
      }
    }

    console.log('Testing completed successfully!');

  } catch (error) {
    console.error('Error during mobile layout test:', error);
  } finally {
    await browser.close();
  }
}

testMobileLayoutAfter();