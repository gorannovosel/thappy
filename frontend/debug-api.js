const puppeteer = require('puppeteer');

async function debugAPI() {
  console.log('Starting browser for API debugging...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // Intercept network requests to see what the frontend is actually fetching
    page.on('response', response => {
      if (response.url().includes('/api/therapies')) {
        console.log(`API Response: ${response.status()} - ${response.url()}`);
      }
    });

    await page.goto('http://localhost:3004/therapies/psychological-testing', {
      waitUntil: 'networkidle0',
      timeout: 10000
    });

    // Get the actual therapy data that React is using
    const therapyData = await page.evaluate(() => {
      // Try to find the therapy data in the React component state
      // This might be in window or accessible through React DevTools
      return {
        title: document.querySelector('h1')?.textContent,
        url: window.location.href,
        hasH1: !!document.querySelector('h1')
      };
    });

    console.log('Frontend data:', therapyData);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

debugAPI();