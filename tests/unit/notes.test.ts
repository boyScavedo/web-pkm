import { describe, expect, test } from "vitest";
import { clampLimit, normalizeOffset } from "@/lib/pkm/notes";

describe("clampLimit", () => {
  test("defaults to 20", () => {
    expect(clampLimit()).toBe(20);
    expect(clampLimit(undefined)).toBe(20);
  });

  test("clamps low to 1", () => {
    expect(clampLimit(0)).toBe(1);
    expect(clampLimit(-5)).toBe(1);
  });

  test("clamps high to 100", () => {
    expect(clampLimit(999)).toBe(100);
  });

  test("floors decimals", () => {
    expect(clampLimit(7.9)).toBe(7);
  });

  test("passes through in range", () => {
    expect(clampLimit(50)).toBe(50);
  });
});

describe("normalizeOffset", () => {
  test("defaults to 0", () => {
    expect(normalizeOffset()).toBe(0);
    expect(normalizeOffset(undefined)).toBe(0);
  });

  test("floors negatives to 0", () => {
    expect(normalizeOffset(-3)).toBe(0);
  });

  test("floors decimals", () => {
    expect(normalizeOffset(1.7)).toBe(1);
  });
});