import { mockApi, resetApiMock } from "../../mocks/api";
import {
  createAluno,
  deleteAluno,
  getAlunoById,
  getAlunos,
  searchAlunos,
  updateAluno,
} from "../../../src/api/aluno";

jest.mock("../../../src/lib/axios", () => ({ api: mockApi }));

describe("aluno API", () => {
  beforeEach(resetApiMock);

  it("lists alunos with pagination", async () => {
    const response = { data: [], meta: { current_page: 2, last_page: 3 } };
    mockApi.get.mockResolvedValueOnce({ data: response });

    await expect(getAlunos(2)).resolves.toBe(response);

    expect(mockApi.get).toHaveBeenCalledWith("/alunos", { params: { page: 2 } });
  });

  it("searches alunos using an encoded value", async () => {
    const response = { data: [] };
    mockApi.get.mockResolvedValueOnce({ data: response });

    await expect(searchAlunos("Joao Silva", 3)).resolves.toBe(response);

    expect(mockApi.get).toHaveBeenCalledWith("/alunos/value/Joao%20Silva", {
      params: { page: 3 },
    });
  });

  it("creates, reads, updates and deletes aluno records", async () => {
    const payload = { name: "Aluno Teste" };
    mockApi.post.mockResolvedValueOnce({ data: { status: true } });
    mockApi.get.mockResolvedValueOnce({ data: { data: { id: 10 } } });
    mockApi.put.mockResolvedValueOnce({ data: { status: true } });
    mockApi.delete.mockResolvedValueOnce({ data: null });

    await createAluno(payload as any);
    await getAlunoById(10);
    await updateAluno(10, payload as any);
    await deleteAluno(10);

    expect(mockApi.post).toHaveBeenCalledWith("/alunos", payload);
    expect(mockApi.get).toHaveBeenLastCalledWith("/alunos/10");
    expect(mockApi.put).toHaveBeenCalledWith("/alunos/10", payload);
    expect(mockApi.delete).toHaveBeenCalledWith("/alunos/10");
  });
});
