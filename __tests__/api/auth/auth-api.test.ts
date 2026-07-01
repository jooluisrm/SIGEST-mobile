import { mockApi, resetApiMock } from "../../mocks/api";
import { 
  loginRequest,
  forgotPasswordCodeRequest,
  resetPasswordValidateCodeRequest,
  resetPasswordCodeRequest
} from "../../../src/api/auth";

jest.mock("../../../src/lib/axios", () => ({ api: mockApi }));

describe("auth API", () => {
  beforeEach(resetApiMock);

  it("posts login credentials to /login", async () => {
    const response = { status: true, data: { access_token: "token" } };
    const credentials = { email: "admin@sigest.com", password: "secret" };
    mockApi.post.mockResolvedValueOnce({ data: response });

    await expect(loginRequest(credentials as any)).resolves.toBe(response);

    expect(mockApi.post).toHaveBeenCalledWith("/login", credentials);
  });

  it("posts to /forgot-password-code", async () => {
    const response = { status: true, message: "Code sent" };
    const payload = { email: "user@sigest.com" };
    mockApi.post.mockResolvedValueOnce({ data: response });

    await expect(forgotPasswordCodeRequest(payload)).resolves.toBe(response);

    expect(mockApi.post).toHaveBeenCalledWith("/forgot-password-code", payload);
  });

  it("posts to /reset-password-validate-code", async () => {
    const response = { status: true, message: "Valid code" };
    const payload = { email: "user@sigest.com", code: "123456" };
    mockApi.post.mockResolvedValueOnce({ data: response });

    await expect(resetPasswordValidateCodeRequest(payload)).resolves.toBe(response);

    expect(mockApi.post).toHaveBeenCalledWith("/reset-password-validate-code", payload);
  });

  it("posts to /reset-password-code", async () => {
    const response = { status: true, message: "Password updated" };
    const payload = { email: "user@sigest.com", code: "123456", password: "newpassword" };
    mockApi.post.mockResolvedValueOnce({ data: response });

    await expect(resetPasswordCodeRequest(payload)).resolves.toBe(response);

    expect(mockApi.post).toHaveBeenCalledWith("/reset-password-code", payload);
  });
});
