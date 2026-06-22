import { mockApi, resetApiMock } from "../../mocks/api";
import {
  createPeriodoLetivo,
  deletePeriodoLetivo,
  getPeriodoLetivoById,
  getPeriodosLetivos,
  getPeriodosLetivosByCourse,
  searchPeriodosLetivos,
  updatePeriodoLetivo,
} from "../../../src/api/periodoletivo";

jest.mock("../../../src/lib/axios", () => ({ api: mockApi }));

describe("periodo letivo API", () => {
  beforeEach(resetApiMock);

  it("lists, searches and filters periodos letivos by course", async () => {
    mockApi.get.mockResolvedValue({ data: { data: [] } });

    await getPeriodosLetivos(1);
    await searchPeriodosLetivos("Ano Letivo 2026", 3);
    await getPeriodosLetivosByCourse(7, 2);

    expect(mockApi.get).toHaveBeenNthCalledWith(1, "/periodoletivo", { params: { page: 1 } });
    expect(mockApi.get).toHaveBeenNthCalledWith(2, "/periodoletivo/value/Ano%20Letivo%202026", {
      params: { page: 3 },
    });
    expect(mockApi.get).toHaveBeenNthCalledWith(3, "/courses/7/periodos-letivos", {
      params: { page: 2 },
    });
  });

  it("creates, reads, updates and deletes periodos letivos", async () => {
    const payload = { name: "Ano Letivo 2026", course_id: 7 };
    mockApi.post.mockResolvedValueOnce({ data: { status: true } });
    mockApi.get.mockResolvedValueOnce({ data: { data: { id: 12 } } });
    mockApi.put.mockResolvedValueOnce({ data: { status: true } });
    mockApi.delete.mockResolvedValueOnce({ data: null });

    await createPeriodoLetivo(payload as any);
    await getPeriodoLetivoById(12);
    await updatePeriodoLetivo(12, payload as any);
    await deletePeriodoLetivo(12);

    expect(mockApi.post).toHaveBeenCalledWith("/periodoletivo", payload);
    expect(mockApi.get).toHaveBeenLastCalledWith("/periodoletivo/12");
    expect(mockApi.put).toHaveBeenCalledWith("/periodoletivo/12", payload);
    expect(mockApi.delete).toHaveBeenCalledWith("/periodoletivo/12");
  });
});
