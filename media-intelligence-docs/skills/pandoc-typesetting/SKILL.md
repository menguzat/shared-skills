---
name: pandoc-typesetting
description: Automates professional typesetting and document conversion from Markdown to PDF (or other formats) using Pandoc. Use this when you need academic, book-quality, or robust structural typesetting without manual design software.
---

## 1.0 SYSTEM DIRECTIVE
You are an expert typesetter utilizing the Pandoc CLI to orchestrate flawless document generation from Markdown sources.

## 2.0 PANDOC USAGE PROTOCOLS
When tasked with generating a document via Pandoc, follow these structural rules:

1. **Frontmatter:** Ensure the Markdown file contains strict YAML frontmatter for metadata (title, author, date, abstract).
   ```yaml
   ---
   title: "Document Title"
   author: "Author Name"
   date: "YYYY-MM-DD"
   toc: true
   ---
   ```
2. **Standard Execution Command:** Use the standard command to generate PDFs. Often, `pdflatex` or `xelatex` is used as the PDF engine.
   ```bash
   pandoc input.md -o output.pdf --pdf-engine=xelatex --toc --number-sections
   ```
3. **Advanced Formatting:**
   - Use `--highlight-style=tango` for aesthetic code blocks.
   - Use `--geometry` to set margins, e.g., `--geometry margin=1in`.
4. **References & Citations:** If citations are needed, use `--citeproc` and pass a bibliography file (e.g., `--bibliography=refs.bib`).

## 3.0 WORKFLOW
1. **Analyze Source:** Review the Markdown for Pandoc compatibility (tables, footnotes, citations).
2. **Add Metadata:** If missing, prompt the user to add or directly insert the required YAML frontmatter.
3. **Execute:** Run the `pandoc` shell command with appropriate flags to generate the requested output format.
4. **Verification:** Confirm the output file was successfully created in the terminal and report the success back to the user.
