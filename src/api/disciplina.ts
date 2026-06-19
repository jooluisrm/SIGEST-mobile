import { useQuery, keepPreviousData, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/axios";
import { 
  DisciplinaPaginatedResponse,
  DisciplinaEmptyResponse,
  GetDisciplinaResponse,
  CreateDisciplinaRequest,
  CreateDisciplinaSuccessResponse,
  UpdateDisciplinaRequest,
  UpdateDisciplinaSuccessResponse
} from "../types/disciplina";

export type DisciplinaApiResponse = DisciplinaPaginatedResponse | DisciplinaEmptyResponse;

/**
 * Busca a lista geral de disciplinas paginada.
 */
export async function getDisciplinas(page = 1) {
  const { data } = await api.get<DisciplinaApiResponse>(`/disciplinas`, {
    params: { page },
  });
  return data;
}

/**
 * Busca disciplinas filtrando pelo nome (busca debounced).
 */
export async function getDisciplinasByName(name: string, page = 1) {
  const { data } = await api.get<DisciplinaApiResponse>(
    `/disciplinas/value/${encodeURIComponent(name)}`,
    { params: { page } }
  );
  return data;
}

/**
 * Busca os detalhes de uma disciplina específica pelo ID.
 */
export async function getDisciplinaById(id: string | number) {
  const { data } = await api.get<GetDisciplinaResponse>(`/disciplinas/${id}`);
  return data;
}

/**
 * Cadastra uma nova disciplina.
 */
export async function createDisciplina(payload: CreateDisciplinaRequest) {
  const { data } = await api.post<CreateDisciplinaSuccessResponse>(`/disciplinas`, payload);
  return data;
}

/**
 * Atualiza os dados de uma disciplina existente.
 */
export async function updateDisciplina(id: string | number, payload: UpdateDisciplinaRequest) {
  const { data } = await api.put<UpdateDisciplinaSuccessResponse>(`/disciplinas/${id}`, payload);
  return data;
}

/**
 * Remove uma disciplina pelo ID.
 */
export async function deleteDisciplina(id: string | number) {
  await api.delete(`/disciplinas/${id}`);
  return null;
}

/**
 * Hook para rolagem infinita de disciplinas, chaveando automaticamente para a busca
 * por termo caso o comprimento da busca seja maior ou igual a 3 caracteres.
 */
export function useDisciplinasInfiniteQuery(searchTerm = "") {
  const isSearchActive = searchTerm.trim().length >= 3;

  return useInfiniteQuery({
    queryKey: ["disciplinas", "infinite", searchTerm],
    queryFn: ({ pageParam = 1 }) => {
      if (isSearchActive) {
        return getDisciplinasByName(searchTerm.trim(), Number(pageParam));
      }
      return getDisciplinas(Number(pageParam));
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (
        lastPage &&
        "meta" in lastPage &&
        lastPage.meta &&
        lastPage.meta.current_page < lastPage.meta.last_page
      ) {
        return lastPage.meta.current_page + 1;
      }
      return undefined;
    },
    staleTime: 1000 * 30, // Cache de 30 segundos
  });
}

/**
 * Hook para carregar os detalhes de uma única disciplina pelo ID.
 */
export function useDisciplinaQuery(id: string | number) {
  return useQuery({
    queryKey: ["disciplina", String(id)],
    queryFn: () => getDisciplinaById(id),
    enabled: !!id,
    staleTime: 1000 * 10,
  });
}

/**
 * Hook Mutation para criar uma disciplina.
 */
export function useCreateDisciplinaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDisciplina,
    onSuccess: () => {
      // Invalida o cache das listagens
      queryClient.invalidateQueries({ queryKey: ["disciplinas"] });
    },
  });
}

/**
 * Hook Mutation para atualizar uma disciplina.
 */
export function useUpdateDisciplinaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: UpdateDisciplinaRequest }) =>
      updateDisciplina(id, payload),
    onSuccess: (_, variables) => {
      // Invalida a disciplina específica e as listagens gerais
      queryClient.invalidateQueries({ queryKey: ["disciplina", String(variables.id)] });
      queryClient.invalidateQueries({ queryKey: ["disciplinas"] });
    },
  });
}

/**
 * Hook Mutation para excluir uma disciplina.
 */
export function useDeleteDisciplinaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDisciplina,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disciplinas"] });
    },
  });
}
