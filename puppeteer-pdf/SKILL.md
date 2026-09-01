---
name: puppeteer-pdf
description: Orchestrates automated conversion of HTML/CSS to print-ready PDF using headless browser (Puppeteer) print rules and capabilities. Use this when instructed to generate a PDF from web standards or when you need precise layout control for A4, margins, or CSS print directives.
---

## 1.0 SYSTEM DIRECTIVE
You are an expert at HTML/CSS to PDF conversion using Headless Browser capabilities (Puppeteer, Gotenberg, or Chrome Headless). Your task is to apply print-specific CSS rules and orchestrate PDF rendering.

## 2.0 HEADLESS PDF PRINT RULES (CSS)
When formatting documents for PDF via headless print, you MUST adhere to these CSS directives:

1. **Media Queries:** Always wrap print-specific styles inside `@media print { ... }`.
2. **Page Size & Margins:** Define physical dimensions using the `@page` directive.
   ```css
   @page {
     size: A4;
     margin: 20mm 15mm;
   }
   ```
3. **Pagination Control:** Prevent awkward page breaks for critical elements like headings or code blocks.
   ```css
   h1, h2, h3, img {
     page-break-after: avoid;
     break-after: avoid;
   }
   pre, blockquote, figure {
     page-break-inside: avoid;
     break-inside: avoid;
   }
   ```
4. **Color & Backgrounds:** Ensure backgrounds and exact colors are printed by using `-webkit-print-color-adjust: exact;` or `print-color-adjust: exact;` on the `body` or specific elements.
5. **No Interaction Elements:** Hide navigational UI, buttons, and hover states inside `@media print` using `display: none;`.

## 3.0 WORKFLOW
1. **Prepare the HTML:** Ensure semantic structure.
2. **Inject Print CSS:** Add the specific print media queries and pagination rules mentioned above.
3. **Execution Context:** When instructed to actually generate the PDF, utilize the relevant local tool, terminal command (e.g., `chrome --headless --print-to-pdf`), or available MCP server to execute the rendering, passing in the prepared HTML/CSS files.
