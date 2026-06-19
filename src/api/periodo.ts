import { useQuery, keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { api } from "../lib/axios";
import { 
  PeriodPaginatedResponse, 
  PeriodEmptyResponse,
  GetPeriodResponse,
  PeriodMatrizResponse
} from "../types/periodo";

export type PeriodApiResponse = PeriodPaginatedResponse | PeriodEmptyResponse;

/**
 * Busca a lista geral de períodos/séries paginada.
 */
export async function getPeriods(page = 1) {
  const { data } = await api.get<PeriodApiResponse>(`/periods`, {
    params: { page },
  });
  return data;
}

/**
 * Busca as séries/períodos escolares associados a um Período Letivo específico.
 */
export async function getPeriodsByPeriodoLetivo(periodoLetivoId: number | string) {
  const { data } = await api.get<PeriodApiResponse>(
    `/periods/${periodoLetivoId}/series-por-periodo-letivo`
  );
  return data;
}

/**
 * Busca dados de uma única série pelo ID.
 */
export async function getPeriodById(id: string | number) {
  const { data } = await api.get<GetPeriodResponse>(`/periods/${id}`);
  return data;
}

/**
 * Busca a matriz curricular (disciplinas) de uma série específica pelo ID.
 */
export async function getPeriodMatriz(id: string | number) {
  const { data } = await api.get<PeriodMatrizResponse>(`/periods/${id}/matriz`);
  return data;
}

/**
 * Hook do TanStack Query para paginação infinita (rolagem infinita) de todas as séries.
 */
export function usePeriodsInfiniteQuery() {
  return useInfiniteQuery({
    queryKey: ["periods", "infinite"],
    queryFn: ({ pageParam = 1 }) => getPeriods(Number(pageParam)),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage && "meta" in lastPage && lastPage.meta.current_page < lastPage.meta.last_page) {
        return lastPage.meta.current_page + 1;
      }
      return undefined;
    },
    staleTime: 1000 * 30,
  });
}

/**
 * Hook do TanStack Query para carregar as séries vinculadas a um Período Letivo.
 * Útil para dropdowns em tempo real.
 */
export function usePeriodsByPeriodoLetivoQuery(periodoLetivoId: number | string | undefined) {
  return useQuery({
    queryKey: ["periods", "byPeriodoLetivo", String(periodoLetivoId)],
    queryFn: () => getPeriodsByPeriodoLetivo(periodoLetivoId!),
    enabled: !!periodoLetivoId,
    staleTime: 1000 * 30, // Cache de 30 segundos
  });
}

/**
 * Hook do TanStack Query para buscar os detalhes de uma série específica pelo ID.
 */
export function usePeriodQuery(id: string | number) {
  return useQuery({
    queryKey: ["period", String(id)],
    queryFn: () => getPeriodById(id),
    enabled: !!id,
    staleTime: 1000 * 10,
  });
}

/**
 * Hook do TanStack Query para buscar a matriz curricular (disciplinas vinculadas) da série.
 */
export function usePeriodMatrizQuery(id: string | number) {
  return useQuery({
    queryKey: ["period", String(id), "matriz"],
    queryFn: () => getPeriodMatriz(id),
    enabled: !!id,
    staleTime: 1000 * 15,
  });
}
