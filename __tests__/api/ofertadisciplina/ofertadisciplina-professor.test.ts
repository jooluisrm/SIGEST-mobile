import { mockApi, resetApiMock } from "../../mocks/api";
import { getOfertasByProfessor } from "../../../src/api/ofertadisciplina";

jest.mock("../../../src/lib/axios", () => ({ api: mockApi }));

describe("ofertadisciplina professor API", () => {
  beforeEach(resetApiMock);

  it("fetches, paginates, and filters offerings by professor user ID", async () => {
    mockApi.get.mockResolvedValueOnce({
      data: {
        data: [
          { id: 1, professor: { id_user: 10 } },
          { id: 2, professor: { id_user: 20 } },
        ],
        meta: {
          current_page: 1,
          last_page: 2,
        }
      }
    });

    mockApi.get.mockResolvedValueOnce({
      data: {
        data: [
          { id: 3, professor: { id_user: 10 } },
          { id: 4, professor: { id_user: 30 } },
        ],
        meta: {
          current_page: 2,
          last_page: 2,
        }
      }
    });

    const result = await getOfertasByProfessor(10);

    expect(mockApi.get).toHaveBeenCalledTimes(2);
    expect(mockApi.get).toHaveBeenNthCalledWith(1, "/oferta-disciplinas", { params: { page: 1 } });
    expect(mockApi.get).toHaveBeenNthCalledWith(2, "/oferta-disciplinas", { params: { page: 2 } });

    expect(result.status).toBe(true);
    expect(result.data).toHaveLength(2);
    expect(result.data[0].id).toBe(1);
    expect(result.data[1].id).toBe(3);
  });
});
