const puppeteer = require('puppeteer');

async function takeScreenshot() {
  console.log('Starting browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security'
    ]
  });

  try {
    console.log('Creating new page...');
    const page = await browser.newPage();

    // Set viewport size
    await page.setViewport({ width: 1200, height: 800 });

    console.log('Navigating to page...');
    // Wait for both domcontentloaded and networkidle0 to ensure all API calls are done
    await page.goto('http://localhost:3004/therapies/psychological-testing', {
      waitUntil: ['domcontentloaded', 'networkidle0'],
      timeout: 10000
    });

    // Wait for the therapy title to be loaded (indicating API call completed)
    console.log('Waiting for content to load...');
    await page.waitForSelector('h1', { timeout: 5000 });

    // Give a bit more time for any animations or final renders
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Taking screenshot...');
    await page.screenshot({
      path: '/home/goran/thappy/therapy-detail-screenshot.png',
      fullPage: true
    });

    // Get the title text to verify content
    const titleText = await page.$eval('h1', el => el.textContent);
    console.log('Page title found:', titleText);

    // Check if the page shows loading or error states
    const hasLoadingSpinner = await page.$('.loading-spinner, [data-testid="loading"]') !== null;
    const hasErrorMessage = await page.$('.error-message, [data-testid="error"]') !== null;

    console.log('Loading spinner present:', hasLoadingSpinner);
    console.log('Error message present:', hasErrorMessage);

    console.log('Screenshot saved to: /home/goran/thappy/therapy-detail-screenshot.png');

  } catch (error) {
    console.error('Error taking screenshot:', error);
  } finally {
    await browser.close();
  }
}

takeScreenshot();