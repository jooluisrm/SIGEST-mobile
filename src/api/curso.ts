import { useQuery, useMutation, useQueryClient, keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { api } from "../lib/axios";
import { 
  CoursesPaginatedResponse, 
  CoursesEmptyResponse,
  CreateCourseRequest,
  CreateCourseSuccessResponse,
  GetCourseResponse,
  UpdateCourseRequest,
  UpdateCourseSuccessResponse,
  DeleteCourseResponse
} from "../types/curso";

export type CourseApiResponse = CoursesPaginatedResponse | CoursesEmptyResponse;

/**
 * Busca a lista geral de cursos paginada.
 */
export async function getCourses(page = 1) {
  const { data } = await api.get<CourseApiResponse>(`/courses`, {
    params: { page },
  });
  return data;
}

/**
 * Busca cursos por Nome (requer mínimo de 3 caracteres).
 */
export async function searchCourses(value: string, page = 1) {
  const { data } = await api.get<CourseApiResponse>(
    `/courses/value/${encodeURIComponent(value)}`,
    {
      params: { page },
    }
  );
  return data;
}

/**
 * Hook do TanStack Query que gerencia o estado da consulta (geral vs busca)
 * e implementa cache e preservação da página anterior durante o carregamento.
 */
export function useCoursesQuery(searchTerm: string, page: number) {
  const normalizedSearch = searchTerm.trim();
  const isSearching = normalizedSearch.length >= 3;

  return useQuery({
    queryKey: ["courses", normalizedSearch, page],
    queryFn: () => {
      if (isSearching) {
        return searchCourses(normalizedSearch, page);
      }
      return getCourses(page);
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 10, // Cache local por 10 segundos
  });
}

/**
 * Hook do TanStack Query para paginação infinita (rolagem infinita).
 */
export function useCoursesInfiniteQuery(searchTerm: string) {
  const normalizedSearch = searchTerm.trim();
  const isSearching = normalizedSearch.length >= 3;

  return useInfiniteQuery({
    queryKey: ["courses", "infinite", normalizedSearch],
    queryFn: ({ pageParam = 1 }) => {
      if (isSearching) {
        return searchCourses(normalizedSearch, Number(pageParam));
      }
      return getCourses(Number(pageParam));
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage && "meta" in lastPage && lastPage.meta.current_page < lastPage.meta.last_page) {
        return lastPage.meta.current_page + 1;
      }
      return undefined;
    },
    staleTime: 1000 * 10,
  });
}

/**
 * Cria um novo curso no backend.
 */
export async function createCourse(payload: CreateCourseRequest) {
  const { data } = await api.post<CreateCourseSuccessResponse>("/courses", payload);
  return data;
}

/**
 * Hook para mutação de criação de curso.
 */
export function useCreateCourseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

/**
 * Busca dados de um único curso pelo ID.
 */
export async function getCourseById(id: string | number) {
  const { data } = await api.get<GetCourseResponse>(`/courses/${id}`);
  return data;
}

/**
 * Hook do TanStack Query para buscar dados de um único curso pelo ID.
 */
export function useCourseQuery(id: string | number) {
  return useQuery({
    queryKey: ["course", String(id)],
    queryFn: () => getCourseById(id),
    enabled: !!id,
    staleTime: 1000 * 5,
  });
}

/**
 * Atualiza os dados de um curso no backend.
 */
export async function updateCourse(id: string | number, payload: UpdateCourseRequest) {
  const { data } = await api.put<UpdateCourseSuccessResponse>(`/courses/${id}`, payload);
  return data;
}

/**
 * Hook para mutação de atualização de curso.
 */
export function useUpdateCourseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: UpdateCourseRequest }) =>
      updateCourse(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["course", String(variables.id)] });
    },
  });
}

/**
 * Exclui um curso do backend.
 */
export async function deleteCourse(id: string | number) {
  const { data } = await api.delete<DeleteCourseResponse>(`/courses/${id}`);
  return data;
}

/**
 * Hook para mutação de exclusão de curso.
 */
export function useDeleteCourseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}
