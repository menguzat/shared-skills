import playwright from 'playwright';
import fs from 'fs';
import path from 'path';

/**
 * Run preflight checks on a given URL against a funnel contract JSON configuration.
 */
async function runPreflight(url, contractPath) {
  if (!url || !contractPath) {
    console.error('Usage: node funnel-preflight.mjs <url> <path-to-contract.json>');
    process.exit(1);
  }

  // Load and parse contract
  let contract;
  try {
    const rawContract = fs.readFileSync(path.resolve(contractPath), 'utf8');
    contract = JSON.parse(rawContract);
    console.log(`\n🔍 Loading contract: ${contract.funnelId} (${contract.brandPositioning} - ${contract.productModel})`);
  } catch (error) {
    console.error(`❌ Failed to read or parse contract at: ${contractPath}`);
    console.error(error.message);
    process.exit(1);
  }

  const { viewports, technicalThresholds, editorialRules } = contract;
  const browser = await playwright.chromium.launch();
  const results = {
    url,
    timestamp: new Date().toISOString(),
    pass: true,
    viewportChecks: [],
    failedNetworkRequests: [],
    consoleErrors: [],
    slopTermsFound: [],
    smallTapTargets: [],
    smallTextElements: []
  };

  try {
    for (const vp of viewports) {
      console.log(`\n📱 Auditing viewport: "${vp.name}" (${vp.width}x${vp.height}px)...`);
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height }
      });
      const page = await context.newPage();

      // Monitor console errors
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          results.consoleErrors.push({
            viewport: vp.name,
            text: msg.text(),
            location: msg.location()
          });
        }
      });

      // Monitor failed network requests
      page.on('requestfailed', (request) => {
        results.failedNetworkRequests.push({
          viewport: vp.name,
          url: request.url(),
          errorText: request.failure()?.errorText || 'Unknown error'
        });
      });

      // Navigate
      const response = await page.goto(url, { waitUntil: 'networkidle' });
      if (!response || response.status() !== 200) {
        throw new Error(`Failed to load page. Status: ${response?.status() || 'none'}`);
      }

      // Check Horizontal Overflow
      const overflowInfo = await page.evaluate(() => {
        const docWidth = document.documentElement.scrollWidth;
        const viewWidth = window.innerWidth;
        const bodyWidth = document.body.scrollWidth;
        return {
          hasOverflow: docWidth > viewWidth || bodyWidth > viewWidth,
          docWidth,
          viewWidth,
          bodyWidth
        };
      });

      // Check Tap Targets
      const tapTargets = await page.evaluate((minSize) => {
        const clickables = Array.from(document.querySelectorAll('a, button, input, select, textarea, [role="button"]'));
        const issues = [];
        clickables.forEach((el, index) => {
          const rect = el.getBoundingClientRect();
          // Skip elements that are completely hidden or off-screen
          if (rect.width === 0 && rect.height === 0) return;
          if (rect.width < minSize || rect.height < minSize) {
            // Get clean description
            let text = el.textContent?.trim().substring(0, 30) || el.getAttribute('placeholder') || el.value || '';
            text = text.replace(/\s+/g, ' ');
            issues.push({
              tagName: el.tagName.toLowerCase(),
              id: el.id || '',
              class: el.className || '',
              text,
              width: rect.width,
              height: rect.height,
              outerHTML: el.outerHTML.substring(0, 100)
            });
          }
        });
        return issues;
      }, technicalThresholds.minimumTapTargetPx);

      // Check Body Text Sizes (Ensure readable sizes)
      const textElements = await page.evaluate((minSize) => {
        // Collect text elements that have content
        const nodes = Array.from(document.querySelectorAll('p, span, li, a, td, label'));
        const smallElements = [];
        nodes.forEach((el) => {
          const text = el.textContent?.trim() || '';
          if (!text || text.length < 5) return; // skip very short words/icons
          
          const style = window.getComputedStyle(el);
          const fontSize = parseFloat(style.fontSize);
          const rect = el.getBoundingClientRect();
          
          if (rect.width === 0 && rect.height === 0) return; // ignore hidden
          
          if (fontSize < minSize) {
            smallElements.push({
              tagName: el.tagName.toLowerCase(),
              text: text.substring(0, 50),
              fontSize,
              classes: el.className || ''
            });
          }
        });
        return smallElements;
      }, technicalThresholds.minimumBodyFontSizePx);

      // Check Editorial AI-Slop & Banned Terms
      const pageText = await page.evaluate(() => document.body.innerText);
      const slopFound = [];
      editorialRules.forbiddenTerms.forEach((term) => {
        const regex = new RegExp(`\\b${term}\\b`, 'gi');
        if (regex.test(pageText)) {
          slopFound.push(term);
        }
      });

      results.viewportChecks.push({
        viewport: vp.name,
        overflow: overflowInfo,
        tapTargetsFound: tapTargets.length,
        textElementsFound: textElements.length
      });

      // Aggregate issues
      if (overflowInfo.hasOverflow) {
        console.log(`  ❌ FAIL: Horizontal scrollbar detected! ${overflowInfo.docWidth}px vs ${overflowInfo.viewWidth}px.`);
        results.pass = false;
      } else {
        console.log(`  ✅ PASS: Responsiveness checks ok.`);
      }

      tapTargets.forEach(t => {
        results.smallTapTargets.push({ viewport: vp.name, ...t });
      });

      textElements.forEach(te => {
        results.smallTextElements.push({ viewport: vp.name, ...te });
      });

      slopFound.forEach(term => {
        if (!results.slopTermsFound.includes(term)) {
          results.slopTermsFound.push(term);
        }
      });

      await context.close();
    }
  } catch (err) {
    console.error(`❌ Preflight crashed during execution: ${err.message}`);
    results.pass = false;
  } finally {
    await browser.close();
  }

  // Final evaluation of failure rules
  if (results.consoleErrors.length > 0) results.pass = false;
  if (results.failedNetworkRequests.length > 0) results.pass = false;
  if (results.slopTermsFound.length > 0) results.pass = false;
  if (results.smallTapTargets.length > 0) results.pass = false;
  if (results.smallTextElements.length > 0) results.pass = false;

  // Print gorgeously formatted terminal summary
  console.log('\n=========================================');
  console.log('🏁 PREFLIGHT COMPLETED');
  console.log('=========================================');
  console.log(`URL:        ${results.url}`);
  console.log(`Status:     ${results.pass ? '✅ PASSED' : '❌ FAILED'}`);
  console.log('-----------------------------------------');

  if (results.viewportChecks.length > 0) {
    console.log('📏 Viewport Responsive Summary:');
    results.viewportChecks.forEach(v => {
      const overStr = v.overflow.hasOverflow ? '❌ OVERFLOW' : '✅ Safe';
      console.log(`  - [${v.viewport}]: ${overStr} (Doc: ${v.overflow.docWidth}px | Win: ${v.overflow.viewWidth}px)`);
    });
  }

  if (results.consoleErrors.length > 0) {
    console.log(`\n🚫 Console Errors Detected (${results.consoleErrors.length}):`);
    results.consoleErrors.forEach(err => {
      console.log(`  - [${err.viewport}] ${err.text} at ${err.location.url}:${err.location.lineNumber}`);
    });
  }

  if (results.failedNetworkRequests.length > 0) {
    console.log(`\n📡 Failed Network Requests (${results.failedNetworkRequests.length}):`);
    results.failedNetworkRequests.forEach(req => {
      console.log(`  - [${req.viewport}] Failed to load: ${req.url} (Reason: ${req.errorText})`);
    });
  }

  if (results.slopTermsFound.length > 0) {
    console.log(`\n✍️  AI-Slop & Forbidden Content Violations (${results.slopTermsFound.length}):`);
    console.log(`  - Found restricted terms in page body: [${results.slopTermsFound.join(', ')}]`);
    console.log('    (These words violate the shared ethical/premium copywriting library)');
  }

  if (results.smallTapTargets.length > 0) {
    console.log(`\n👆 Tap Target Violations (${results.smallTapTargets.length}):`);
    console.log(`  - Target items are smaller than the WCAG standard ${technicalThresholds.minimumTapTargetPx}px:`);
    results.smallTapTargets.slice(0, 8).forEach(t => {
      console.log(`    * [${t.viewport}] <${t.tagName}> "${t.text}" is only ${Math.round(t.width)}x${Math.round(t.height)}px`);
    });
    if (results.smallTapTargets.length > 8) {
      console.log(`    * ...and ${results.smallTapTargets.length - 8} more small targets.`);
    }
  }

  if (results.smallTextElements.length > 0) {
    console.log(`\n🔍 Text Readability Violations (${results.smallTextElements.length}):`);
    console.log(`  - Text sizes are smaller than the required ${technicalThresholds.minimumBodyFontSizePx}px:`);
    results.smallTextElements.slice(0, 8).forEach(te => {
      console.log(`    * [${te.viewport}] <${te.tagName}> font-size: ${te.fontSize}px | Text: "${te.text}"`);
    });
    if (results.smallTextElements.length > 8) {
      console.log(`    * ...and ${results.smallTextElements.length - 8} more tiny text elements.`);
    }
  }

  console.log('\n=========================================');
  process.exit(results.pass ? 0 : 1);
}

// CLI args extraction
const args = process.argv.slice(2);
runPreflight(args[0], args[1]);
