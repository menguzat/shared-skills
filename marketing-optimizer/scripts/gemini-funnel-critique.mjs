import { GoogleGenAI } from '@google/genai';
import playwright from 'playwright';
import fs from 'fs';
import path from 'path';

/**
 * Perform a visual and narrative critique of a page using the multimodal Gemini model.
 */
async function runCritique(url, contractPath, outputDir) {
  if (!url || !contractPath) {
    console.error('Usage: node gemini-funnel-critique.mjs <url> <path-to-contract.json> [output-dir]');
    process.exit(1);
  }

  // Load contract
  let contract;
  try {
    const rawContract = fs.readFileSync(path.resolve(contractPath), 'utf8');
    contract = JSON.parse(rawContract);
    console.log(`\n🎨 Running Gemini Visual & Copy Critique for: ${contract.funnelId}`);
  } catch (error) {
    console.error(`❌ Failed to read/parse contract at: ${contractPath}`);
    console.error(error.message);
    process.exit(1);
  }

  const outPath = outputDir ? path.resolve(outputDir) : path.join(process.cwd(), 'runs', 'latest');
  fs.mkdirSync(outPath, { recursive: true });

  const browser = await playwright.chromium.launch();
  let mobileImgBase64 = '';
  let desktopImgBase64 = '';
  let pageHTML = '';

  // Helper to trigger scroll and override animation classes
  async function triggerScrollAndAnimations(page) {
    // Scroll down the page to trigger Intersection Observers and lazy loaders
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 200;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            window.scrollTo(0, 0);
            resolve();
          }
        }, 20);
      });
    });
    // Inject CSS to override opacity-0, translate-y-8, etc., to guarantee visibility
    await page.addStyleTag({
      content: `
        .opacity-0 { opacity: 1 !important; }
        .translate-y-8 { transform: none !important; }
        .transition-all { transition: none !important; }
      `
    });
    await page.waitForTimeout(1000);
  }

  try {
    console.log(`📸 Taking screenshots of: ${url}...`);
    // Capture mobile
    const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(url, { waitUntil: 'networkidle' });
    await triggerScrollAndAnimations(mobilePage);
    const mobileBuffer = await mobilePage.screenshot({ fullPage: true });
    mobileImgBase64 = mobileBuffer.toString('base64');
    await mobileContext.close();

    // Capture desktop & HTML
    const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const desktopPage = await desktopContext.newPage();
    await desktopPage.goto(url, { waitUntil: 'networkidle' });
    await triggerScrollAndAnimations(desktopPage);
    const desktopBuffer = await desktopPage.screenshot({ fullPage: true });
    desktopImgBase64 = desktopBuffer.toString('base64');
    pageHTML = await desktopPage.content();
    await desktopContext.close();
  } catch (err) {
    console.error(`❌ Playwright capture failed: ${err.message}`);
    await browser.close();
    process.exit(1);
  } finally {
    await browser.close();
  }

  // Set up GenAI
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ Error: GEMINI_API_KEY environment variable is not set.');
    process.exit(1);
  }

  console.log('🧠 Submitting screenshots and HTML to Gemini (gemini-flash-latest) for critique...');
  const ai = new GoogleGenAI({ apiKey });

  const promptText = `
You are an expert Conversion Rate Optimization (CRO) auditor, copywriter, and premium art director.
You are evaluating a web page designed for an premium/luxury fashion brand.

Our contract configuration defines the brand parameters as follows:
- Brand Positioning: ${contract.brandPositioning}
- Product Model: ${contract.productModel}
- Copywriting Mode: ${contract.editorialRules.editorialMode}

Analyze the provided mobile and desktop screenshots and the source HTML code to evaluate the page against these criteria:

1. PREMIUM VISUAL ALIGNMENT:
- Does the styling, use of typography, color palette, and white space project a premium/luxury feel, or does it feel cluttered or like a standard discount storefront?
- Rate the visual identity (1-10).

2. CRAFTSMANSHIP & TRUST PROOF:
- Is craftsmanship, material quality, or pattern-making expertise visually or textually highlighted?
- Are return, alteration, or delivery policies communicated transparently to mitigate luxury buyer hesitation?

3. COPYWRITING & TEXT CRITIQUE:
- Is the messaging distinct, clear, and authentic, or does it use generic AI jargon (e.g., 'unlock your style', 'dive into elegance', 'seamless tapestry of design')?
- Identify any weak, vague, or manipulative hooks and suggest elegant alternatives in line with the copywriting mode: "${contract.editorialRules.editorialMode}".

4. USER COGNITIVE LOAD & CALL TO ACTION:
- Is the layout intuitive? Is the primary action (e.g., booked consultation, customizing product, checkout) visually distinct and obvious?
- Do any adjacent blocks or banners cause unnecessary distraction?

Deliver your final response in EXACTLY the following JSON format. Return only valid JSON. Do not wrap the JSON in markdown blocks (like \`\`\`json).

{
  "scores": {
    "visualPremium": 8,
    "copywritingAuthenticity": 7,
    "trustReduction": 6,
    "conversionArchitecture": 7
  },
  "overallSummary": "A concise, high-signal, professional evaluation summary.",
  "findings": [
    {
      "category": "Visual Alignment" | "Trust & Proof" | "Copywriting" | "Conversion UI",
      "severity": "High" | "Medium" | "Low",
      "issue": "Specific description of the issue found.",
      "evidence": "Mention text fragment, section name, or mobile/desktop screenshot visual aspect.",
      "recommendation": "A precise, elegant, and ready-to-implement copy or UI adjustment."
    }
  ]
}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: [
        {
          role: 'user',
          parts: [
            { text: promptText },
            { inlineData: { mimeType: 'image/png', data: mobileImgBase64 } },
            { inlineData: { mimeType: 'image/png', data: desktopImgBase64 } },
            { text: `\nHTML Content Reference:\n${pageHTML.substring(0, 10000)}` } // Pass a subset of HTML to keep token use safe
          ]
        }
      ]
    });

    // Strip out markdown code fences if Gemini accidentally added them
    let rawText = response.text.trim();
    if (rawText.startsWith('```')) {
      rawText = rawText.replace(/^```json\s*/, '').replace(/```$/, '').trim();
    }

    // Try to parse JSON to validate structure
    let critiqueData;
    try {
      critiqueData = JSON.parse(rawText);
    } catch (parseErr) {
      console.error('⚠️ Could not parse response as raw JSON. Saving raw response instead.');
      fs.writeFileSync(path.join(outPath, 'gemini-critique-raw.txt'), rawText);
      console.log(rawText);
      process.exit(0);
    }

    // Write structured JSON report
    const finalReportPath = path.join(outPath, 'gemini-critique-report.json');
    fs.writeFileSync(finalReportPath, JSON.stringify(critiqueData, null, 2));
    console.log(`\n✅ Gemini Critique saved to: ${finalReportPath}`);

    // Print to CLI
    console.log('\n================================================================');
    console.log('🎨 GEMINI MULTIMODAL CRO & COPY CRITIQUE');
    console.log('================================================================');
    console.log(`Summary: ${critiqueData.overallSummary}`);
    console.log('----------------------------------------------------------------');
    console.log('📊 Quality Scores (out of 10):');
    console.log(`  - Visual Premium:          ${critiqueData.scores.visualPremium}`);
    console.log(`  - Copywriting Authenticity: ${critiqueData.scores.copywritingAuthenticity}`);
    console.log(`  - Trust & Risk Reduction:  ${critiqueData.scores.trustReduction}`);
    console.log(`  - Conversion Architecture: ${critiqueData.scores.conversionArchitecture}`);
    console.log('----------------------------------------------------------------');
    console.log('🔍 Key Findings & Recommendations:');
    
    critiqueData.findings.forEach((f, idx) => {
      const icon = f.severity === 'High' ? '🔴' : f.severity === 'Medium' ? '🟡' : '🟢';
      console.log(`\n  ${idx + 1}. [${f.category}] ${icon} Severity: ${f.severity}`);
      console.log(`     Issue:  ${f.issue}`);
      console.log(`     Evidence: ${f.evidence}`);
      console.log(`     Fix:    ${f.recommendation}`);
    });
    console.log('\n================================================================');

  } catch (err) {
    console.error(`❌ Failed to run Gemini GenAI API query: ${err.message}`);
    process.exit(1);
  }
}

// CLI args extraction
const args = process.argv.slice(2);
runCritique(args[0], args[1], args[2]);
