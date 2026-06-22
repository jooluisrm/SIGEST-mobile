import { mockApi, resetApiMock } from "../../mocks/api";
import {
  createDisciplina,
  deleteDisciplina,
  getDisciplinaById,
  getDisciplinas,
  getDisciplinasByName,
  updateDisciplina,
} from "../../../src/api/disciplina";

jest.mock("../../../src/lib/axios", () => ({ api: mockApi }));

describe("disciplina API", () => {
  beforeEach(resetApiMock);

  it("lists and searches disciplinas", async () => {
    mockApi.get.mockResolvedValue({ data: { data: [] } });

    await getDisciplinas(5);
    await getDisciplinasByName("Matematica Basica", 2);

    expect(mockApi.get).toHaveBeenNthCalledWith(1, "/disciplinas", { params: { page: 5 } });
    expect(mockApi.get).toHaveBeenNthCalledWith(2, "/disciplinas/value/Matematica%20Basica", {
      params: { page: 2 },
    });
  });

  it("creates, reads, updates and deletes disciplinas", async () => {
    const payload = { name: "Matematica", status: true };
    mockApi.post.mockResolvedValueOnce({ data: { status: true } });
    mockApi.get.mockResolvedValueOnce({ data: { data: { id: 11 } } });
    mockApi.put.mockResolvedValueOnce({ data: { status: true } });
    mockApi.delete.mockResolvedValueOnce({ data: null });

    await createDisciplina(payload as any);
    await getDisciplinaById(11);
    await updateDisciplina(11, payload as any);
    await deleteDisciplina(11);

    expect(mockApi.post).toHaveBeenCalledWith("/disciplinas", payload);
    expect(mockApi.get).toHaveBeenLastCalledWith("/disciplinas/11");
    expect(mockApi.put).toHaveBeenCalledWith("/disciplinas/11", payload);
    expect(mockApi.delete).toHaveBeenCalledWith("/disciplinas/11");
  });
});
