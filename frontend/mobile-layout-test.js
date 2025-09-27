const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testMobileLayout() {
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

    // Wait for the dev server to be ready
    console.log('Waiting for dev server...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Test the homepage
    console.log('Testing homepage mobile layout...');
    await page.goto('http://localhost:3004', { waitUntil: 'networkidle0' });

    // Take screenshot
    await page.screenshot({
      path: 'mobile-homepage-before.png',
      fullPage: true
    });

    // Check for horizontal scroll
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const bodyClientWidth = await page.evaluate(() => document.body.clientWidth);

    console.log(`Body scroll width: ${bodyScrollWidth}`);
    console.log(`Body client width: ${bodyClientWidth}`);

    if (bodyScrollWidth > bodyClientWidth) {
      console.log('❌ Horizontal scrolling detected on homepage');
    } else {
      console.log('✅ No horizontal scrolling on homepage');
    }

    // Check header navigation visibility
    const headerNav = await page.$('header nav');
    if (headerNav) {
      const navBounds = await headerNav.boundingBox();
      console.log(`Header nav width: ${navBounds.width}`);

      if (navBounds.width > 375) {
        console.log('❌ Header navigation too wide for mobile');
      } else {
        console.log('✅ Header navigation fits mobile screen');
      }
    }

    // Test therapies page
    console.log('Testing therapies page mobile layout...');
    await page.goto('http://localhost:3004/therapies', { waitUntil: 'networkidle0' });
    await page.screenshot({
      path: 'mobile-therapies-before.png',
      fullPage: true
    });

    // Test articles page
    console.log('Testing articles page mobile layout...');
    await page.goto('http://localhost:3004/articles', { waitUntil: 'networkidle0' });
    await page.screenshot({
      path: 'mobile-articles-before.png',
      fullPage: true
    });

    console.log('Mobile layout test completed. Screenshots saved.');

  } catch (error) {
    console.error('Error during mobile layout test:', error);
  } finally {
    await browser.close();
  }
}

testMobileLayout();