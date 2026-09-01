import Foundation
import PDFKit

guard CommandLine.arguments.count == 2 else {
  fputs("Usage: swift inspect-pdf.swift input.pdf\n", stderr)
  exit(2)
}

let input = URL(fileURLWithPath: CommandLine.arguments[1])
guard let document = PDFDocument(url: input) else {
  fputs("Could not open PDF\n", stderr)
  exit(1)
}

var pages: [[String: Any]] = []
for index in 0..<document.pageCount {
  guard let page = document.page(at: index) else { continue }
  let media = page.bounds(for: .mediaBox)
  let crop = page.bounds(for: .cropBox)
  let links = page.annotations.compactMap { annotation -> [String: Any]? in
    guard let url = annotation.url else { return nil }
    let rect = annotation.bounds
    return [
      "url": url.absoluteString,
      "rect": [rect.origin.x, rect.origin.y, rect.size.width, rect.size.height]
    ]
  }
  pages.append([
    "number": index + 1,
    "mediaBox": [media.origin.x, media.origin.y, media.size.width, media.size.height],
    "cropBox": [crop.origin.x, crop.origin.y, crop.size.width, crop.size.height],
    "links": links
  ])
}

let result: [String: Any] = [
  "backend": "PDFKit",
  "pageCount": document.pageCount,
  "pages": pages
]
let data = try JSONSerialization.data(withJSONObject: result, options: [.prettyPrinted, .sortedKeys])
FileHandle.standardOutput.write(data)
FileHandle.standardOutput.write(Data("\n".utf8))
