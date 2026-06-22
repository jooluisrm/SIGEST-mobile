import { mockApi, resetApiMock } from "../../mocks/api";
import { loginRequest } from "../../../src/api/auth";

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
});
