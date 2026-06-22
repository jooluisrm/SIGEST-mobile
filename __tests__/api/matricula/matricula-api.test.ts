import { mockApi, resetApiMock } from "../../mocks/api";
import {
  createMatricula,
  deleteMatricula,
  getMatriculaById,
  getMatriculas,
  searchMatriculas,
  updateMatricula,
} from "../../../src/api/matricula";

jest.mock("../../../src/lib/axios", () => ({ api: mockApi }));

describe("matricula API", () => {
  beforeEach(resetApiMock);

  it("lists and searches matriculas", async () => {
    mockApi.get.mockResolvedValue({ data: { data: [] } });

    await getMatriculas(2);
    await searchMatriculas("MAT-2026", 1);

    expect(mockApi.get).toHaveBeenNthCalledWith(1, "/matriculas", { params: { page: 2 } });
    expect(mockApi.get).toHaveBeenNthCalledWith(2, "/matriculas/value/MAT-2026", {
      params: { page: 1 },
    });
  });

  it("creates, reads, updates and deletes matriculas", async () => {
    const payload = { aluno_id: 1, serie_id: 2, codigo_matricula: "MAT-2026-001" };
    mockApi.post.mockResolvedValueOnce({ data: { status: true } });
    mockApi.get.mockResolvedValueOnce({ data: { data: { id: 4 } } });
    mockApi.put.mockResolvedValueOnce({ data: { status: true } });
    mockApi.delete.mockResolvedValueOnce({ data: null });

    await createMatricula(payload as any);
    await getMatriculaById(4);
    await updateMatricula(4, payload as any);
    await deleteMatricula(4);

    expect(mockApi.post).toHaveBeenCalledWith("/matriculas", payload);
    expect(mockApi.get).toHaveBeenLastCalledWith("/matriculas/4");
    expect(mockApi.put).toHaveBeenCalledWith("/matriculas/4", payload);
    expect(mockApi.delete).toHaveBeenCalledWith("/matriculas/4");
  });
});
