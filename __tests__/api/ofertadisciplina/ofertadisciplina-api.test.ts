import { mockApi, resetApiMock } from "../../mocks/api";
import {
  createOfertaDisciplina,
  deleteOfertaDisciplina,
  getOfertaDisciplinaById,
  getOfertaDisciplinas,
  getOfertasByDisciplina,
  getOfertasByTurma,
  updateOfertaDisciplina,
} from "../../../src/api/ofertadisciplina";

jest.mock("../../../src/lib/axios", () => ({ api: mockApi }));

describe("oferta disciplina API", () => {
  beforeEach(resetApiMock);

  it("lists and filters ofertas by disciplina and turma", async () => {
    mockApi.get.mockResolvedValue({ data: { data: [] } });

    await getOfertaDisciplinas(1);
    await getOfertasByDisciplina(3, 2);
    await getOfertasByTurma(5, 4);

    expect(mockApi.get).toHaveBeenNthCalledWith(1, "/oferta-disciplinas", { params: { page: 1 } });
    expect(mockApi.get).toHaveBeenNthCalledWith(2, "/oferta-disciplinas/disciplina/3", {
      params: { page: 2 },
    });
    expect(mockApi.get).toHaveBeenNthCalledWith(3, "/oferta-disciplinas/turma/5", {
      params: { page: 4 },
    });
  });

  it("creates, reads, updates and deletes ofertas", async () => {
    const payload = { disciplina_id: 3, classroom_id: 5, professor_id: 2, periodo_letivo_id: 1 };
    mockApi.post.mockResolvedValueOnce({ data: { status: true } });
    mockApi.get.mockResolvedValueOnce({ data: { data: { id: 6 } } });
    mockApi.put.mockResolvedValueOnce({ data: { status: true } });
    mockApi.delete.mockResolvedValueOnce({ data: null });

    await createOfertaDisciplina(payload as any);
    await getOfertaDisciplinaById(6);
    await updateOfertaDisciplina(6, payload as any);
    await deleteOfertaDisciplina(6);

    expect(mockApi.post).toHaveBeenCalledWith("/oferta-disciplinas", payload);
    expect(mockApi.get).toHaveBeenLastCalledWith("/oferta-disciplinas/6");
    expect(mockApi.put).toHaveBeenCalledWith("/oferta-disciplinas/6", payload);
    expect(mockApi.delete).toHaveBeenCalledWith("/oferta-disciplinas/6");
  });
});
