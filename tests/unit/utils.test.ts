import { expect, test } from "vitest";
import { cn } from "@/lib/utils";

test("cn merges conflicting tailwind classes, last wins", () => {
  expect(cn("px-2 py-2", "px-4")).toBe("py-2 px-4");
});

test("cn filters falsy values", () => {
  expect(cn("a", false, undefined, null, "b")).toBe("a b");
});

test("cn concatenates simple strings", () => {
  expect(cn("flex", "items-center")).toBe("flex items-center");
});