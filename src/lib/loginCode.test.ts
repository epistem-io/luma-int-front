import { afterEach, describe, expect, it, vi } from "vitest";
import {
  exchangeLoginCode,
  extractLoginCode,
  stripLoginCode,
} from "./loginCode";

describe("extractLoginCode", () => {
  it("reads the code", () => {
    expect(extractLoginCode("?login_code=abc123")).toBe("abc123");
    expect(extractLoginCode("?x=1&login_code=abc123&y=2")).toBe("abc123");
  });

  it("returns null when absent or blank", () => {
    expect(extractLoginCode("")).toBeNull();
    expect(extractLoginCode("?x=1")).toBeNull();
    expect(extractLoginCode("?login_code=")).toBeNull();
  });
});

describe("stripLoginCode", () => {
  it("removes only the code and keeps path, other params and hash", () => {
    expect(
      stripLoginCode("https://luma.test/id?x=1&login_code=abc&y=2#map"),
    ).toBe("/id?x=1&y=2#map");
  });

  it("leaves no dangling question mark", () => {
    expect(stripLoginCode("https://luma.test/en?login_code=abc")).toBe("/en");
  });
});

describe("exchangeLoginCode", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("POSTs the code and returns the login payload", async () => {
    const payload = { api_key: "EPISTEM k", user: { email: "a@b.c" } };
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => payload });
    vi.stubGlobal("fetch", fetchMock);

    await expect(exchangeLoginCode("abc")).resolves.toEqual(payload);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/api/v1/users/account/login-code");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({ code: "abc" });
  });

  it("returns null on a rejected code or a network error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    await expect(exchangeLoginCode("abc")).resolves.toBeNull();

    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    await expect(exchangeLoginCode("abc")).resolves.toBeNull();
  });
});
