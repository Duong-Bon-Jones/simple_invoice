import { describe, expect, it } from "vitest";
import { formatAddress, formatCurrency, formatDate } from "./format";

describe("formatCurrency", () => {
  it("formats a normal amount with the given currency", () => {
    expect(formatCurrency(1090, "GBP")).toBe("£1,090.00");
  });

  it("returns an em dash when amount is undefined", () => {
    expect(formatCurrency(undefined, "GBP")).toBe("—");
  });

  it("falls back to USD when currency is missing", () => {
    expect(formatCurrency(10, undefined)).toBe("$10.00");
  });
});

describe("formatDate", () => {
  it("formats a normal date string", () => {
    expect(formatDate("2024-03-05")).toBe("Mar 5, 2024");
  });

  it("returns an em dash when value is undefined", () => {
    expect(formatDate(undefined)).toBe("—");
  });

  it("returns the original string when unparseable", () => {
    expect(formatDate("not-a-date")).toBe("not-a-date");
  });
});

describe("formatAddress", () => {
  it("joins present fields with commas", () => {
    expect(formatAddress({ premise: "1 High St", city: "London" })).toBe(
      "1 High St, London",
    );
  });

  it("returns undefined when address is undefined", () => {
    expect(formatAddress(undefined)).toBeUndefined();
  });

  it("returns undefined when address has no known fields", () => {
    expect(formatAddress({})).toBeUndefined();
  });
});
