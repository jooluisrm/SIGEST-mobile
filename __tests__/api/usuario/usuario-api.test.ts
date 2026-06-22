import { mockApi, resetApiMock } from "../../mocks/api";
import {
  createServidor,
  deleteUsuario,
  getUsuarioById,
  getUsuarios,
  searchUsuarios,
  updateUsuario,
} from "../../../src/api/usuario";

jest.mock("../../../src/lib/axios", () => ({ api: mockApi }));

describe("usuario API", () => {
  beforeEach(resetApiMock);

  it("uses the servidors backend routes for list and search", async () => {
    mockApi.get.mockResolvedValue({ data: { data: [] } });

    await getUsuarios(1);
    await searchUsuarios("Servidor Teste", 2);

    expect(mockApi.get).toHaveBeenNthCalledWith(1, "/servidors", { params: { page: 1 } });
    expect(mockApi.get).toHaveBeenNthCalledWith(2, "/servidors/value/Servidor%20Teste", {
      params: { page: 2 },
    });
  });

  it("creates, reads, updates and deletes servidores", async () => {
    const payload = { name: "Servidor Teste" };
    mockApi.post.mockResolvedValueOnce({ data: { status: true } });
    mockApi.get.mockResolvedValueOnce({ data: { data: { id_servidor: 3 } } });
    mockApi.put.mockResolvedValueOnce({ data: { status: true } });
    mockApi.delete.mockResolvedValueOnce({ data: null });

    await createServidor(payload as any);
    await getUsuarioById(3);
    await updateUsuario(3, payload as any);
    await deleteUsuario(3);

    expect(mockApi.post).toHaveBeenCalledWith("/servidors", payload);
    expect(mockApi.get).toHaveBeenLastCalledWith("/servidors/3");
    expect(mockApi.put).toHaveBeenCalledWith("/servidors/3", payload);
    expect(mockApi.delete).toHaveBeenCalledWith("/servidors/3");
  });
});
