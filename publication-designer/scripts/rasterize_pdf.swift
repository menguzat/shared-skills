#!/usr/bin/env swift
import AppKit
import Foundation
import PDFKit

guard CommandLine.arguments.count == 4 else {
  fputs("Usage: rasterize_pdf.swift INPUT.pdf OUTPUT_DIRECTORY DPI\n", stderr)
  exit(64)
}

let source = URL(fileURLWithPath: CommandLine.arguments[1])
let target = URL(fileURLWithPath: CommandLine.arguments[2], isDirectory: true)
guard let dpi = Double(CommandLine.arguments[3]), dpi > 0 else {
  fputs("DPI must be a positive number\n", stderr)
  exit(64)
}
let scale = CGFloat(dpi / 72)
let fileManager = FileManager.default

guard let document = PDFDocument(url: source) else {
  fputs("Unable to open PDF: \(source.path)\n", stderr)
  exit(1)
}
try fileManager.createDirectory(at: target, withIntermediateDirectories: true)
var pages: [[String: Any]] = []

for index in 0..<document.pageCount {
  guard let page = document.page(at: index) else { continue }
  let box = page.bounds(for: .mediaBox)
  let pixelSize = NSSize(
    width: (box.width * scale).rounded(),
    height: (box.height * scale).rounded()
  )
  guard let bitmap = NSBitmapImageRep(
    bitmapDataPlanes: nil,
    pixelsWide: Int(pixelSize.width),
    pixelsHigh: Int(pixelSize.height),
    bitsPerSample: 8,
    samplesPerPixel: 4,
    hasAlpha: true,
    isPlanar: false,
    colorSpaceName: .deviceRGB,
    bytesPerRow: 0,
    bitsPerPixel: 0
  ), let graphics = NSGraphicsContext(bitmapImageRep: bitmap) else {
    fputs("Could not create raster context for page \(index + 1)\n", stderr)
    exit(1)
  }
  NSGraphicsContext.saveGraphicsState()
  NSGraphicsContext.current = graphics
  NSColor.white.setFill()
  NSBezierPath(rect: NSRect(origin: .zero, size: pixelSize)).fill()
  let context = graphics.cgContext
  context.interpolationQuality = .high
  context.scaleBy(x: scale, y: scale)
  page.draw(with: .mediaBox, to: context)
  NSGraphicsContext.restoreGraphicsState()
  guard let png = bitmap.representation(using: .png, properties: [:]) else {
    fputs("Could not encode page \(index + 1)\n", stderr)
    exit(1)
  }
  let filename = String(format: "page-%02d.png", index + 1)
  try png.write(to: target.appendingPathComponent(filename))
  pages.append([
    "number": index + 1,
    "width": Int(pixelSize.width),
    "height": Int(pixelSize.height)
  ])
}

let manifest: [String: Any] = [
  "dpi": dpi,
  "pageCount": document.pageCount,
  "pages": pages
]
let data = try JSONSerialization.data(
  withJSONObject: manifest,
  options: [.prettyPrinted, .sortedKeys]
)
try data.write(to: target.appendingPathComponent("manifest.json"))
