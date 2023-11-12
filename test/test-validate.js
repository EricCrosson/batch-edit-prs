import { strict as assert } from "node:assert";
import test from "node:test";

import { validateCliArguments } from "../src/validate.js";

test.describe("validateCliArguments", () => {
  let originalEnv;

  test.beforeEach(() => {
    originalEnv = process.env;
    process.env = { ...originalEnv, GITHUB_TOKEN: "test_token" };
  });

  test.afterEach(() => {
    process.env = originalEnv;
  });

  test("valid arguments", () => {
    const args = ["pattern", "search"];
    const result = validateCliArguments(args);
    assert.deepEqual(result, {
      githubToken: "test_token",
      pattern: "pattern",
      action: "search",
    });
  });

  test("missing GITHUB_TOKEN", () => {
    delete process.env.GITHUB_TOKEN;
    const args = ["pattern", "search"];
    assert.throws(() => validateCliArguments(args), {
      message: "invalid arguments",
    });
  });

  test("missing action defaults to search", () => {
    const args = ["pattern"];
    const result = validateCliArguments(args);
    assert.deepEqual(result, {
      githubToken: "test_token",
      pattern: "pattern",
      action: "search",
    });
  });

  test("invalid action flag", () => {
    const args = ["pattern", "foo"];
    assert.throws(() => validateCliArguments(args), {
      message: "invalid arguments",
    });
  });
});
