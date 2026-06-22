import { mockApi, resetApiMock } from "../../mocks/api";
import {
  getPeriodById,
  getPeriodMatriz,
  getPeriods,
  getPeriodsByPeriodoLetivo,
} from "../../../src/api/periodo";

jest.mock("../../../src/lib/axios", () => ({ api: mockApi }));

describe("periodo/serie API", () => {
  beforeEach(resetApiMock);

  it("uses the series routes for list, detail, by periodo letivo and matriz", async () => {
    mockApi.get.mockResolvedValue({ data: { data: [] } });

    await getPeriods(2);
    await getPeriodsByPeriodoLetivo(4);
    await getPeriodById(9);
    await getPeriodMatriz(9);

    expect(mockApi.get).toHaveBeenNthCalledWith(1, "/series", { params: { page: 2 } });
    expect(mockApi.get).toHaveBeenNthCalledWith(2, "/series/4/series-por-periodo-letivo");
    expect(mockApi.get).toHaveBeenNthCalledWith(3, "/series/9");
    expect(mockApi.get).toHaveBeenNthCalledWith(4, "/series/9/matriz");
  });
});
