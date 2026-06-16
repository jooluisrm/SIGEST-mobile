import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "../lib/axios";
import { AlunosPaginatedResponse, AlunosEmptyGeneralResponse } from "../types/aluno";

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
