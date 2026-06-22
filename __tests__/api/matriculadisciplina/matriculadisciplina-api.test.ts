import { mockApi, resetApiMock } from "../../mocks/api";
import {
  createMatriculaDisciplina,
  deleteMatriculaDisciplina,
  getMatriculaDisciplinasByMatricula,
  getMatriculaDisciplinasByOferta,
} from "../../../src/api/matriculadisciplina";

jest.mock("../../../src/lib/axios", () => ({ api: mockApi }));

describe("matricula disciplina API", () => {
  beforeEach(resetApiMock);

  it("loads vinculos by matricula and by oferta", async () => {
    mockApi.get.mockResolvedValue({ data: { data: [] } });

    await getMatriculaDisciplinasByMatricula(10);
    await getMatriculaDisciplinasByOferta(20);

    expect(mockApi.get).toHaveBeenNthCalledWith(1, "/matricula-disciplinas/matricula/10");
    expect(mockApi.get).toHaveBeenNthCalledWith(2, "/matricula-disciplinas/oferta/20");
  });

  it("creates and deletes vinculos", async () => {
    const payload = { matricula_id: 10, oferta_disciplina_id: 20 };
    mockApi.post.mockResolvedValueOnce({ data: { status: true } });
    mockApi.delete.mockResolvedValueOnce({ data: null });

    await createMatriculaDisciplina(payload as any);
    await deleteMatriculaDisciplina(99);

    expect(mockApi.post).toHaveBeenCalledWith("/matricula-disciplinas", payload);
    expect(mockApi.delete).toHaveBeenCalledWith("/matricula-disciplinas/99");
  });
});
