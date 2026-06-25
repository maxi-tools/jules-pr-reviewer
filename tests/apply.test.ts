import { describe, expect, it } from "vitest";
import { applyStructuredSuggestions } from "../src/apply.js";
import { ReviewComment } from "../src/types.js";

const baseComment = {
  file: "src/example.ts",
  line: 2,
  severity: "Warning",
  confidence: "High",
  message: "Use the safer value.",
  promptForAgents: "",
} satisfies ReviewComment;

describe("applyStructuredSuggestions", () => {
  it("applies explicit single-line structured replacements", () => {
    const result = applyStructuredSuggestions(
      new Map([["src/example.ts", "const a = 1;\nconst b = 2;\n"]]),
      [
        {
          ...baseComment,
          startLine: 2,
          endLine: 2,
          suggestedReplacement: "const b = 3;",
        },
      ]
    );

    expect(result.files.get("src/example.ts")).toBe(
      "const a = 1;\nconst b = 3;\n"
    );
    expect(result.applied).toEqual([
      { file: "src/example.ts", startLine: 2, endLine: 2 },
    ]);
    expect(result.skipped).toEqual([]);
  });

  it("applies explicit multi-line structured replacements", () => {
    const result = applyStructuredSuggestions(
      new Map([["src/example.ts", "one\ntwo\nthree\nfour\n"]]),
      [
        {
          ...baseComment,
          line: 2,
          startLine: 2,
          endLine: 3,
          suggestedReplacement: "dos\ntres",
        },
      ]
    );

    expect(result.files.get("src/example.ts")).toBe("one\ndos\ntres\nfour\n");
  });

  it("falls back to a GitHub suggestion fence on the comment line", () => {
    const result = applyStructuredSuggestions(
      new Map([["src/example.ts", "const a = 1;\nconst b = 2;\n"]]),
      [
        {
          ...baseComment,
          message: "Use the safer value.\n```suggestion\nconst b = 4;\n```",
        },
      ]
    );

    expect(result.files.get("src/example.ts")).toBe(
      "const a = 1;\nconst b = 4;\n"
    );
  });

  it("recognizes empty suggestion fences as deletion replacements", () => {
    const result = applyStructuredSuggestions(
      new Map([["src/example.ts", "one\ntwo\nthree\n"]]),
      [
        {
          ...baseComment,
          line: 2,
          message: "Delete this line.\n```suggestion\n```",
        },
      ]
    );

    expect(result.files.get("src/example.ts")).toBe("one\nthree\n");
    expect(result.applied).toEqual([
      { file: "src/example.ts", startLine: 2, endLine: 2 },
    ]);
  });

  it("applies multiple replacements bottom-up so line numbers do not shift", () => {
    const result = applyStructuredSuggestions(
      new Map([["src/example.ts", "one\ntwo\nthree\nfour\n"]]),
      [
        {
          ...baseComment,
          line: 1,
          startLine: 1,
          endLine: 1,
          suggestedReplacement: "ONE\nONE AGAIN",
        },
        {
          ...baseComment,
          line: 4,
          startLine: 4,
          endLine: 4,
          suggestedReplacement: "FOUR",
        },
      ]
    );

    expect(result.files.get("src/example.ts")).toBe(
      "ONE\nONE AGAIN\ntwo\nthree\nFOUR\n"
    );
    expect(result.applied).toEqual([
      { file: "src/example.ts", startLine: 4, endLine: 4 },
      { file: "src/example.ts", startLine: 1, endLine: 1 },
    ]);
  });

  it("skips missing files, invalid ranges, and unstructured comments", () => {
    const result = applyStructuredSuggestions(
      new Map([["src/example.ts", "const a = 1;\n"]]),
      [
        { ...baseComment, file: "missing.ts", suggestedReplacement: "x" },
        { ...baseComment, startLine: 2, endLine: 1, suggestedReplacement: "x" },
        { ...baseComment, message: "Needs a broader fix." },
      ]
    );

    expect(result.files.get("src/example.ts")).toBe("const a = 1;\n");
    expect(result.applied).toEqual([]);
    expect(result.skipped.map((skip) => skip.reason)).toEqual([
      "missing file",
      "invalid range",
      "no structured replacement",
    ]);
  });
});
