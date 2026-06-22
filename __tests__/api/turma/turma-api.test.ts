import { mockApi, resetApiMock } from "../../mocks/api";
import {
  createClassroom,
  deleteClassroom,
  generateClassrooms,
  getClassroomById,
  getClassrooms,
  getClassroomsByName,
  getClassroomsBySerie,
  updateClassroom,
} from "../../../src/api/turma";

jest.mock("../../../src/lib/axios", () => ({ api: mockApi }));

describe("turma API", () => {
  beforeEach(resetApiMock);

  it("lists, searches and filters classrooms by serie", async () => {
    mockApi.get.mockResolvedValue({ data: { data: [] } });

    await getClassrooms(1);
    await getClassroomsByName("Turma A", 2);
    await getClassroomsBySerie(8);

    expect(mockApi.get).toHaveBeenNthCalledWith(1, "/classrooms", { params: { page: 1 } });
    expect(mockApi.get).toHaveBeenNthCalledWith(2, "/classrooms/value/Turma%20A", {
      params: { page: 2 },
    });
    expect(mockApi.get).toHaveBeenNthCalledWith(3, "/classrooms/8/turmas-por-serie");
  });

  it("creates, reads, updates and deletes classrooms", async () => {
    const payload = { name: "Turma A", serie_id: 8 };
    mockApi.post.mockResolvedValueOnce({ data: { status: true } });
    mockApi.get.mockResolvedValueOnce({ data: { data: { id: 5 } } });
    mockApi.put.mockResolvedValueOnce({ data: { status: true } });
    mockApi.delete.mockResolvedValueOnce({ data: null });

    await createClassroom(payload as any);
    await getClassroomById(5);
    await updateClassroom(5, payload as any);
    await deleteClassroom(5);

    expect(mockApi.post).toHaveBeenCalledWith("/classrooms", payload);
    expect(mockApi.get).toHaveBeenLastCalledWith("/classrooms/5");
    expect(mockApi.put).toHaveBeenCalledWith("/classrooms/5", payload);
    expect(mockApi.delete).toHaveBeenCalledWith("/classrooms/5");
  });

  it("generates classrooms using series route and params", async () => {
    const response = { status: true };
    mockApi.get.mockResolvedValueOnce({ data: response });

    await expect(generateClassrooms(8, 30, "Matutino")).resolves.toBe(response);

    expect(mockApi.get).toHaveBeenCalledWith("/series/8/generate-classrooms", {
      params: { max_students: 30, shift: "Matutino" },
    });
  });
});
