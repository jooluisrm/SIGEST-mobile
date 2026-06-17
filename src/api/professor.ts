import { useQuery, useMutation, useQueryClient, keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { api } from "../lib/axios";
import { 
  ProfessorsPaginatedResponse, 
  ProfessorsEmptyResponse,
  CreateProfessorRequest,
  CreateProfessorSuccessResponse,
  GetProfessorResponse,
  UpdateProfessorRequest,
  UpdateProfessorSuccessResponse,
  DeleteProfessorResponse
} from "../types/professor";

export type ProfessorApiResponse = ProfessorsPaginatedResponse | ProfessorsEmptyResponse;

/**
 * Busca a lista geral de professores paginada.
 */
export async function getProfessors(page = 1) {
  const { data } = await api.get<ProfessorApiResponse>(`/professors`, {
    params: { page },
  });
  return data;
}

/**
 * Busca professores por Nome ou CPF (requer mínimo de 3 caracteres).
 */
export async function searchProfessors(value: string, page = 1) {
  const { data } = await api.get<ProfessorApiResponse>(
    `/professors/value/${encodeURIComponent(value)}`,
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
export function useProfessorsQuery(searchTerm: string, page: number) {
  const normalizedSearch = searchTerm.trim();
  const isSearching = normalizedSearch.length >= 3;

  return useQuery({
    queryKey: ["professors", normalizedSearch, page],
    queryFn: () => {
      if (isSearching) {
        return searchProfessors(normalizedSearch, page);
      }
      return getProfessors(page);
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 10, // Cache local por 10 segundos
  });
}

export function useProfessorsInfiniteQuery(searchTerm: string) {
  const normalizedSearch = searchTerm.trim();
  const isSearching = normalizedSearch.length >= 3;

  return useInfiniteQuery({
    queryKey: ["professors", "infinite", normalizedSearch],
    queryFn: ({ pageParam = 1 }) => {
      if (isSearching) {
        return searchProfessors(normalizedSearch, Number(pageParam));
      }
      return getProfessors(Number(pageParam));
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
 * Cria um novo professor no backend.
 */
export async function createProfessor(payload: CreateProfessorRequest) {
  const { data } = await api.post<CreateProfessorSuccessResponse>("/professors", payload);
  return data;
}

/**
 * Hook para mutação de criação de professor que invalida a listagem.
 */
export function useCreateProfessorMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProfessor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professors"] });
    },
  });
}

/**
 * Busca dados de um único professor pelo ID.
 */
export async function getProfessorById(id: string | number) {
  const { data } = await api.get<GetProfessorResponse>(`/professors/${id}`);
  return data;
}

/**
 * Hook do TanStack Query para buscar dados de um único professor pelo ID.
 */
export function useProfessorQuery(id: string | number) {
  return useQuery({
    queryKey: ["professor", String(id)],
    queryFn: () => getProfessorById(id),
    enabled: !!id,
    staleTime: 1000 * 5,
  });
}

/**
 * Atualiza os dados de um professor no backend.
 */
export async function updateProfessor(id: string | number, payload: UpdateProfessorRequest) {
  const { data } = await api.put<UpdateProfessorSuccessResponse>(`/professors/${id}`, payload);
  return data;
}

/**
 * Hook para mutação de atualização de professor.
 */
export function useUpdateProfessorMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: UpdateProfessorRequest }) =>
      updateProfessor(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["professors"] });
      queryClient.invalidateQueries({ queryKey: ["professor", String(variables.id)] });
    },
  });
}

/**
 * Exclui um professor do backend.
 */
export async function deleteProfessor(id: string | number) {
  const { data } = await api.delete<DeleteProfessorResponse>(`/professors/${id}`);
  return data;
}

/**
 * Hook para mutação de exclusão de professor.
 */
export function useDeleteProfessorMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProfessor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professors"] });
    },
  });
}
