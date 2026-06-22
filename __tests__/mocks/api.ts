export const mockApi = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

export function resetApiMock() {
  mockApi.get.mockReset();
  mockApi.post.mockReset();
  mockApi.put.mockReset();
  mockApi.delete.mockReset();
}
