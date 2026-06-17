import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api } from "../lib/axios";
import { 
  ProfessorsPaginatedResponse, 
  ProfessorsEmptyResponse,
  CreateProfessorRequest,
  CreateProfessorSuccessResponse
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
