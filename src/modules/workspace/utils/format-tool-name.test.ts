import { describe, it, expect } from "vite-plus/test";
import { formatToolName } from "./format-tool-name";

describe("formatToolName", () => {
  it("should convert snake_case to title-cased words", () => {
    expect(formatToolName("get_user_info")).toBe("Get User Info");
  });

  it("should split camelCase at uppercase boundaries", () => {
    expect(formatToolName("getUserInfo")).toBe("Get User Info");
  });

  it("should split PascalCase at uppercase boundaries", () => {
    expect(formatToolName("GetUserInfo")).toBe("Get User Info");
  });

  it("should handle mixed snake_case and camelCase", () => {
    expect(formatToolName("search_UserProfile")).toBe("Search User Profile");
  });

  it("should capitalise a single lowercase word", () => {
    expect(formatToolName("search")).toBe("Search");
  });

  it("should return an empty string when given an empty string", () => {
    expect(formatToolName("")).toBe("");
  });
});
