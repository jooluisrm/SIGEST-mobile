import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api } from "../lib/axios";
import { 
  AlunosPaginatedResponse, 
  AlunosEmptyGeneralResponse,
  CreateAlunoRequest,
  CreateAlunoSuccessResponse
} from "../types/aluno";

export type AlunosApiResponse = AlunosPaginatedResponse | AlunosEmptyGeneralResponse;

/**
 * Busca a lista geral de alunos paginada.
 */
export async function getAlunos(page = 1) {
  const { data } = await api.get<AlunosApiResponse>(`/alunos`, {
    params: { page },
  });
  return data;
}

/**
 * Busca alunos por Nome (requer mínimo de 3 caracteres).
 */
export async function searchAlunos(value: string, page = 1) {
  const { data } = await api.get<AlunosApiResponse>(
    `/alunos/value/${encodeURIComponent(value)}`,
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
export function useAlunosQuery(searchTerm: string, page: number) {
  const normalizedSearch = searchTerm.trim();
  const isSearching = normalizedSearch.length >= 3;

  return useQuery({
    queryKey: ["alunos", normalizedSearch, page],
    queryFn: () => {
      if (isSearching) {
        return searchAlunos(normalizedSearch, page);
      }
      return getAlunos(page);
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 10, // Cache local por 10 segundos
  });
}

/**
 * Cria um novo aluno no backend.
 */
export async function createAluno(payload: CreateAlunoRequest) {
  const { data } = await api.post<CreateAlunoSuccessResponse>("/alunos", payload);
  return data;
}

/**
 * Hook para mutação de criação de aluno que invalida a listagem.
 */
export function useCreateAlunoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAluno,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alunos"] });
    },
  });
}
