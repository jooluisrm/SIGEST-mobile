import { mockApi, resetApiMock } from "../../mocks/api";
import {
  createProfessor,
  deleteProfessor,
  getProfessorById,
  getProfessors,
  searchProfessors,
  updateProfessor,
} from "../../../src/api/professor";

jest.mock("../../../src/lib/axios", () => ({ api: mockApi }));

describe("professor API", () => {
  beforeEach(resetApiMock);

  it("lists and searches professors", async () => {
    mockApi.get.mockResolvedValue({ data: { data: [] } });

    await getProfessors(1);
    await searchProfessors("Maria Souza", 2);

    expect(mockApi.get).toHaveBeenNthCalledWith(1, "/professors", { params: { page: 1 } });
    expect(mockApi.get).toHaveBeenNthCalledWith(2, "/professors/value/Maria%20Souza", {
      params: { page: 2 },
    });
  });

  it("creates, reads, updates and deletes professors", async () => {
    const payload = { name: "Maria Souza" };
    mockApi.post.mockResolvedValueOnce({ data: { status: true } });
    mockApi.get.mockResolvedValueOnce({ data: { data: { id_professor: 9 } } });
    mockApi.put.mockResolvedValueOnce({ data: { status: true } });
    mockApi.delete.mockResolvedValueOnce({ data: null });

    await createProfessor(payload as any);
    await getProfessorById(9);
    await updateProfessor(9, payload as any);
    await deleteProfessor(9);

    expect(mockApi.post).toHaveBeenCalledWith("/professors", payload);
    expect(mockApi.get).toHaveBeenLastCalledWith("/professors/9");
    expect(mockApi.put).toHaveBeenCalledWith("/professors/9", payload);
    expect(mockApi.delete).toHaveBeenCalledWith("/professors/9");
  });
});
