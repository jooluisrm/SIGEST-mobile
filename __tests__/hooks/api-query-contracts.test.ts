import { mockApi, resetApiMock } from "../mocks/api";
import { useAlunosQuery } from "../../src/api/aluno";
import { useCoursesQuery } from "../../src/api/curso";
import { useProfessorsQuery } from "../../src/api/professor";
import { useUsuariosQuery } from "../../src/api/usuario";
import { useMatriculasInfiniteQuery } from "../../src/api/matricula";
import { usePeriodosLetivosInfiniteQuery } from "../../src/api/periodoletivo";
import { useDisciplinasInfiniteQuery } from "../../src/api/disciplina";
import { useClassroomsInfiniteQuery } from "../../src/api/turma";

jest.mock("@tanstack/react-query", () => ({
  __esModule: true,
  keepPreviousData: "keepPreviousData",
  useQuery: jest.fn((options) => options),
  useInfiniteQuery: jest.fn((options) => options),
  useMutation: jest.fn((options) => options),
  useQueryClient: jest.fn(() => ({ invalidateQueries: jest.fn() })),
}));
jest.mock("../../src/lib/axios", () => ({ api: mockApi }));

describe("API query hook contracts", () => {
  beforeEach(() => {
    resetApiMock();
    jest.clearAllMocks();
  });

  it.each([
    ["alunos", useAlunosQuery, "/alunos", "/alunos/value/abc"],
    ["courses", useCoursesQuery, "/courses", "/courses/value/abc"],
    ["professors", useProfessorsQuery, "/professors", "/professors/value/abc"],
    ["usuarios", useUsuariosQuery, "/servidors", "/servidors/value/abc"],
  ])("%s uses list route for short searches and search route for 3+ chars", async (_, hook, listRoute, searchRoute) => {
    mockApi.get.mockResolvedValue({ data: { data: [] } });

    const shortSearchOptions = hook("ab", 1) as any;
    await shortSearchOptions.queryFn();

    const activeSearchOptions = hook(" abc ", 2) as any;
    await activeSearchOptions.queryFn();

    expect(mockApi.get).toHaveBeenNthCalledWith(1, listRoute, { params: { page: 1 } });
    expect(mockApi.get).toHaveBeenNthCalledWith(2, searchRoute, { params: { page: 2 } });
  });

  it.each([
    ["matriculas", useMatriculasInfiniteQuery, "/matriculas", "/matriculas/value/abc"],
    ["periodos letivos", usePeriodosLetivosInfiniteQuery, "/periodoletivo", "/periodoletivo/value/abc"],
    ["disciplinas", useDisciplinasInfiniteQuery, "/disciplinas", "/disciplinas/value/abc"],
    ["classrooms", useClassroomsInfiniteQuery, "/classrooms", "/classrooms/value/abc"],
  ])("%s infinite query switches between list and search routes", async (_, hook, listRoute, searchRoute) => {
    mockApi.get.mockResolvedValue({ data: { data: [] } });

    const shortSearchOptions = hook("ab") as any;
    await shortSearchOptions.queryFn({ pageParam: 1 });

    const activeSearchOptions = hook(" abc ") as any;
    await activeSearchOptions.queryFn({ pageParam: 3 });

    expect(mockApi.get).toHaveBeenNthCalledWith(1, listRoute, { params: { page: 1 } });
    expect(mockApi.get).toHaveBeenNthCalledWith(2, searchRoute, { params: { page: 3 } });
  });
});
