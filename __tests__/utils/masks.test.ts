import { formatCPF, formatDateBR, formatPhoneBR, formatRG } from "../../src/utils/masks";

describe("masks", () => {
  it("formats CPF progressively and strips non-digits", () => {
    expect(formatCPF("")).toBe("");
    expect(formatCPF("123")).toBe("123");
    expect(formatCPF("123456")).toBe("123.456");
    expect(formatCPF("123456789")).toBe("123.456.789");
    expect(formatCPF("123.456.789-00")).toBe("123.456.789-00");
  });

  it("formats Brazilian date progressively", () => {
    expect(formatDateBR("1")).toBe("1");
    expect(formatDateBR("2206")).toBe("22/06");
    expect(formatDateBR("22062026")).toBe("22/06/2026");
  });

  it("formats landline and mobile phone numbers", () => {
    expect(formatPhoneBR("69")).toBe("(69");
    expect(formatPhoneBR("699999")).toBe("(69) 9999");
    expect(formatPhoneBR("6933334444")).toBe("(69) 3333-4444");
    expect(formatPhoneBR("69999994444")).toBe("(69) 99999-4444");
  });

  it("formats RG and keeps X as uppercase verifier", () => {
    expect(formatRG("12")).toBe("12");
    expect(formatRG("12345")).toBe("12.345");
    expect(formatRG("12345678")).toBe("12.345.678");
    expect(formatRG("12345678x")).toBe("12.345.678-X");
  });
});
