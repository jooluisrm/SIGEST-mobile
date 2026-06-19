import { useQuery, keepPreviousData, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/axios";
import { 
  ClassroomPaginatedResponse, 
  ClassroomEmptyResponse,
  GetClassroomResponse,
  CreateClassroomRequest,
  CreateClassroomSuccessResponse,
  UpdateClassroomRequest,
  UpdateClassroomSuccessResponse,
  GenerateClassroomsSuccessResponse
} from "../types/turma";

export type ClassroomApiResponse = ClassroomPaginatedResponse | ClassroomEmptyResponse;

/**
 * Busca a lista geral de turmas paginada.
 */
export async function getClassrooms(page = 1) {
  const { data } = await api.get<ClassroomApiResponse>(`/classrooms`, {
    params: { page },
  });
  return data;
}

/**
 * Busca turmas filtrando pelo nome (busca debounced).
 */
export async function getClassroomsByName(name: string, page = 1) {
  const { data } = await api.get<ClassroomApiResponse>(
    `/classrooms/value/${encodeURIComponent(name)}`,
    { params: { page } }
  );
  return data;
}

/**
 * Busca as turmas associadas a uma série (Period) específica.
 */
export async function getClassroomsByPeriod(periodId: number | string) {
  const { data } = await api.get<ClassroomApiResponse>(
    `/classrooms/${periodId}/turmas-por-serie`
  );
  return data;
}

/**
 * Busca os detalhes de uma turma específica pelo ID.
 */
export async function getClassroomById(id: string | number) {
  const { data } = await api.get<GetClassroomResponse>(`/classrooms/${id}`);
  return data;
}

/**
 * Cadastra uma nova turma de forma manual.
 */
export async function createClassroom(payload: CreateClassroomRequest) {
  const { data } = await api.post<CreateClassroomSuccessResponse>(`/classrooms`, payload);
  return data;
}

/**
 * Atualiza os dados de uma turma existente.
 */
export async function updateClassroom(id: string | number, payload: UpdateClassroomRequest) {
  const { data } = await api.put<UpdateClassroomSuccessResponse>(`/classrooms/${id}`, payload);
  return data;
}

/**
 * Remove uma turma pelo ID.
 */
export async function deleteClassroom(id: string | number) {
  await api.delete(`/classrooms/${id}`);
  return null;
}

/**
 * Executa a enturmação automática para uma série (Period) específica.
 */
export async function generateClassrooms(
  periodId: number | string,
  maxStudents: number,
  shift: string
) {
  const { data } = await api.get<GenerateClassroomsSuccessResponse>(
    `/periods/${periodId}/generate-classrooms`,
    {
      params: {
        max_students: maxStudents,
        shift: shift,
      },
    }
  );
  return data;
}

/**
 * Hook para rolagem infinita de turmas, chaveando automaticamente para a busca
 * por termo caso o comprimento da busca seja maior ou igual a 3 caracteres.
 */
export function useClassroomsInfiniteQuery(searchTerm = "") {
  const isSearchActive = searchTerm.trim().length >= 3;

  return useInfiniteQuery({
    queryKey: ["classrooms", "infinite", searchTerm],
    queryFn: ({ pageParam = 1 }) => {
      if (isSearchActive) {
        return getClassroomsByName(searchTerm.trim(), Number(pageParam));
      }
      return getClassrooms(Number(pageParam));
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (
        lastPage &&
        "data" in lastPage &&
        lastPage.data &&
        "meta" in lastPage.data &&
        lastPage.data.meta.current_page < lastPage.data.meta.last_page
      ) {
        return lastPage.data.meta.current_page + 1;
      }
      return undefined;
    },
    staleTime: 1000 * 30, // Cache de 30 segundos
  });
}

/**
 * Hook para buscar as turmas de uma série específica (útil para dropdowns encadeados).
 */
export function useClassroomsByPeriodQuery(periodId: number | string | undefined) {
  return useQuery({
    queryKey: ["classrooms", "byPeriod", String(periodId)],
    queryFn: () => getClassroomsByPeriod(periodId!),
    enabled: !!periodId,
    staleTime: 1000 * 30,
  });
}

/**
 * Hook para carregar os detalhes de uma única turma pelo ID.
 */
export function useClassroomQuery(id: string | number) {
  return useQuery({
    queryKey: ["classroom", String(id)],
    queryFn: () => getClassroomById(id),
    enabled: !!id,
    staleTime: 1000 * 10,
  });
}

/**
 * Hook Mutation para criar uma turma.
 */
export function useCreateClassroomMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createClassroom,
    onSuccess: () => {
      // Invalida o cache das listagens
      queryClient.invalidateQueries({ queryKey: ["classrooms"] });
    },
  });
}

/**
 * Hook Mutation para atualizar uma turma.
 */
export function useUpdateClassroomMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: UpdateClassroomRequest }) =>
      updateClassroom(id, payload),
    onSuccess: (_, variables) => {
      // Invalida a turma específica e as listagens gerais
      queryClient.invalidateQueries({ queryKey: ["classroom", String(variables.id)] });
      queryClient.invalidateQueries({ queryKey: ["classrooms"] });
    },
  });
}

/**
 * Hook Mutation para excluir uma turma.
 */
export function useDeleteClassroomMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteClassroom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classrooms"] });
    },
  });
}

/**
 * Hook Mutation para gerar turmas automaticamente (Enturmação).
 */
export function useGenerateClassroomsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      periodId,
      maxStudents,
      shift,
    }: {
      periodId: number | string;
      maxStudents: number;
      shift: string;
    }) => generateClassrooms(periodId, maxStudents, shift),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classrooms"] });
    },
  });
}
