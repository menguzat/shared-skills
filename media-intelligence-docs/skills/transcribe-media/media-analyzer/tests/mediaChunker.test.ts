import test from "node:test";
import assert from "node:assert/strict";
import { offsetTimecode, offsetTranscriptSegments } from "../mediaChunker.js";

test("maps chunk-relative transcript ranges onto the absolute media timeline", () => {
  assert.equal(offsetTimecode("00:00:09.500", 120), "00:02:09.500");
  const [segment] = offsetTranscriptSegments([{
    timecode: "00:00:00",
    endTimecode: "00:02:00.033",
    speaker: "Speaker 1",
    content: "Chunk content"
  }], 120);
  assert.equal(segment.timecode, "00:02:00");
  assert.equal(segment.endTimecode, "00:04:00.033");
});
