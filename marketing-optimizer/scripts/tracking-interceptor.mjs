import playwright from 'playwright';
import fs from 'fs';
import path from 'path';

/**
 * Run program journeys and intercept telemetry network requests to ensure required analytics events are fired.
 */
async function runTrackingInterceptor(url, contractPath, clickTargets = []) {
  if (!url || !contractPath) {
    console.error('Usage: node tracking-interceptor.mjs <url> <path-to-contract.json> [comma-separated-click-text-targets]');
    process.exit(1);
  }

  // Load contract
  let contract;
  try {
    const rawContract = fs.readFileSync(path.resolve(contractPath), 'utf8');
    contract = JSON.parse(rawContract);
    console.log(`\n📡 Running Tracking Interceptor for: ${contract.funnelId}`);
  } catch (error) {
    console.error(`❌ Failed to read/parse contract at: ${contractPath}`);
    console.error(error.message);
    process.exit(1);
  }

  const requiredEvents = contract.analytics?.requiredEvents || [];
  if (requiredEvents.length === 0) {
    console.log('ℹ️ No requiredEvents declared in contract. Verification skipped.');
    process.exit(0);
  }

  const parsedClickTargets = clickTargets.length > 0 
    ? clickTargets.split(',') 
    : ['Book', 'Purchase', 'Add', 'Inquire', 'Submit', 'Confirm', 'Select'];

  const browser = await playwright.chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const capturedNetworkRequests = [];
  const matchedEvents = new Set();

  // Intercept telemetry vendors and custom tracking urls
  page.on('request', (request) => {
    const reqUrl = request.url();
    // Match common metrics engines
    const isTelemetry = 
      reqUrl.includes('google-analytics') || 
      reqUrl.includes('/collect') || 
      reqUrl.includes('facebook.com/tr') || 
      reqUrl.includes('tiktok.com/q') || 
      reqUrl.includes('track') || 
      reqUrl.includes('analytics') || 
      reqUrl.includes('telemetry');

    if (isTelemetry) {
      capturedNetworkRequests.push(reqUrl);
      
      // Attempt to identify required event keys in request URL query params or post body
      requiredEvents.forEach(evt => {
        if (reqUrl.includes(evt) || (request.postData() && request.postData().includes(evt))) {
          matchedEvents.add(evt);
        }
      });
    }
  });

  try {
    console.log(`🚀 Navigating to: ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle' });

    console.log('👆 Simulating user interactions to trigger telemetry...');
    // Look for common CTA targets
    for (const target of parsedClickTargets) {
      const cleanTarget = target.trim();
      const selector = `text="${cleanTarget}"`;
      try {
        const handle = page.locator(selector).first();
        if (await handle.isVisible()) {
          console.log(`  - Clicking button/link matching text: "${cleanTarget}"`);
          await handle.click();
          await page.waitForTimeout(1000); // Wait for tracking scripts to fire
        }
      } catch (err) {
        // Silently skip if button is not clickable or not found
      }
    }

    // Try a forms submission if there is any form
    try {
      const inputs = await page.locator('input[type="email"], input[type="text"]').all();
      if (inputs.length > 0) {
        console.log(`📝 Detected ${inputs.length} form inputs. Filling with mock details...`);
        for (const input of inputs) {
          if (await input.isVisible()) {
            await input.fill('test.user@lyflab.com');
          }
        }
        const submitBtn = page.locator('button[type="submit"], input[type="submit"]').first();
        if (await submitBtn.isVisible()) {
          console.log('📤 Submitting mock form...');
          await submitBtn.click();
          await page.waitForTimeout(1500);
        }
      }
    } catch (formErr) {
      // Form interaction optional
    }

  } catch (err) {
    console.error(`❌ Interceptor execution crashed: ${err.message}`);
  } finally {
    await browser.close();
  }

  // Print results
  const missingEvents = requiredEvents.filter(evt => !matchedEvents.has(evt));
  const pass = missingEvents.length === 0;

  console.log('\n================================================================');
  console.log('📡 TELEMETRY & TRACKING AUDIT REPORT');
  console.log('================================================================');
  console.log(`Status:           ${pass ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Captured Requests: ${capturedNetworkRequests.length} telemetry URLs matched.`);
  console.log('----------------------------------------------------------------');
  console.log('🎯 Required Event Coverage:');
  
  requiredEvents.forEach(evt => {
    const fired = matchedEvents.has(evt);
    console.log(`  - [${evt}]: ${fired ? '✅ FIRED' : '❌ MISSING / NOT DETECTED'}`);
  });

  if (capturedNetworkRequests.length > 0) {
    console.log('\n🌐 Sample Captured Telemetry Request URLs (up to 3):');
    capturedNetworkRequests.slice(0, 3).forEach((req, idx) => {
      console.log(`  ${idx + 1}. ${req.substring(0, 100)}...`);
    });
  }

  console.log('================================================================');
  process.exit(pass ? 0 : 1);
}

// CLI args extraction
const args = process.argv.slice(2);
runTrackingInterceptor(args[0], args[1], args[2]);
