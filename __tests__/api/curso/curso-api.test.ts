import { mockApi, resetApiMock } from "../../mocks/api";
import {
  createCourse,
  deleteCourse,
  getCourseById,
  getCourses,
  searchCourses,
  updateCourse,
} from "../../../src/api/curso";

jest.mock("../../../src/lib/axios", () => ({ api: mockApi }));

describe("curso API", () => {
  beforeEach(resetApiMock);

  it("lists and searches courses using the documented routes", async () => {
    mockApi.get.mockResolvedValue({ data: { data: [] } });

    await getCourses(4);
    await searchCourses("Ensino Medio", 2);

    expect(mockApi.get).toHaveBeenNthCalledWith(1, "/courses", { params: { page: 4 } });
    expect(mockApi.get).toHaveBeenNthCalledWith(2, "/courses/value/Ensino%20Medio", {
      params: { page: 2 },
    });
  });

  it("creates, reads, updates and deletes courses", async () => {
    const payload = { name: "Curso Teste", number_periods: 4 };
    mockApi.post.mockResolvedValueOnce({ data: { status: true } });
    mockApi.get.mockResolvedValueOnce({ data: { data: { id: 7 } } });
    mockApi.put.mockResolvedValueOnce({ data: { status: true } });
    mockApi.delete.mockResolvedValueOnce({ data: null });

    await createCourse(payload as any);
    await getCourseById(7);
    await updateCourse(7, payload as any);
    await deleteCourse(7);

    expect(mockApi.post).toHaveBeenCalledWith("/courses", payload);
    expect(mockApi.get).toHaveBeenLastCalledWith("/courses/7");
    expect(mockApi.put).toHaveBeenCalledWith("/courses/7", payload);
    expect(mockApi.delete).toHaveBeenCalledWith("/courses/7");
  });
});
