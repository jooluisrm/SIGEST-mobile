import { useQuery, useMutation, useQueryClient, keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { api } from "../lib/axios";
import { 
  PeriodoLetivoPaginatedResponse, 
  PeriodoLetivoEmptyResponse,
  CreatePeriodoLetivoRequest,
  CreatePeriodoLetivoSuccessResponse,
  GetPeriodoLetivoResponse,
  UpdatePeriodoLetivoRequest,
  UpdatePeriodoLetivoSuccessResponse,
  DeletePeriodoLetivoResponse
} from "../types/periodoletivo";

export type PeriodoLetivoApiResponse = PeriodoLetivoPaginatedResponse | PeriodoLetivoEmptyResponse;

/**
 * Busca a lista geral de períodos letivos paginada.
 */
export async function getPeriodosLetivos(page = 1) {
  const { data } = await api.get<PeriodoLetivoApiResponse>(`/periodoletivo`, {
    params: { page },
  });
  return data;
}

/**
 * Busca períodos letivos por Nome (requer mínimo de 3 caracteres).
 */
export async function searchPeriodosLetivos(value: string, page = 1) {
  const { data } = await api.get<PeriodoLetivoApiResponse>(
    `/periodoletivo/value/${encodeURIComponent(value)}`,
    {
      params: { page },
    }
  );
  return data;
}

/**
 * Busca períodos letivos filtrados por um Curso específico.
 */
export async function getPeriodosLetivosByCourse(courseId: number | string, page = 1) {
  const { data } = await api.get<PeriodoLetivoApiResponse>(
    `/courses/${courseId}/periodos-letivos`,
    {
      params: { page },
    }
  );
  return data;
}

/**
 * Hook do TanStack Query para paginação infinita (rolagem infinita).
 * Chaveia entre a listagem geral e a rota de busca por nome.
 */
export function usePeriodosLetivosInfiniteQuery(searchTerm: string) {
  const normalizedSearch = searchTerm.trim();
  const isSearching = normalizedSearch.length >= 3;

  return useInfiniteQuery({
    queryKey: ["periodosLetivos", "infinite", normalizedSearch],
    queryFn: ({ pageParam = 1 }) => {
      if (isSearching) {
        return searchPeriodosLetivos(normalizedSearch, Number(pageParam));
      }
      return getPeriodosLetivos(Number(pageParam));
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
 * Hook do TanStack Query para buscar períodos letivos vinculados a um curso específico.
 */
export function usePeriodosLetivosByCourseQuery(courseId: number | string | undefined) {
  return useQuery({
    queryKey: ["periodosLetivos", "byCourse", String(courseId)],
    queryFn: () => getPeriodosLetivosByCourse(courseId!),
    enabled: !!courseId,
    staleTime: 1000 * 15,
  });
}

/**
 * Cria um novo período letivo no backend.
 */
export async function createPeriodoLetivo(payload: CreatePeriodoLetivoRequest) {
  const { data } = await api.post<CreatePeriodoLetivoSuccessResponse>("/periodoletivo", payload);
  return data;
}

/**
 * Hook para mutação de criação de período letivo.
 */
export function useCreatePeriodoLetivoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPeriodoLetivo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["periodosLetivos"] });
    },
  });
}

/**
 * Busca dados de um único período letivo pelo ID.
 */
export async function getPeriodoLetivoById(id: string | number) {
  const { data } = await api.get<GetPeriodoLetivoResponse>(`/periodoletivo/${id}`);
  return data;
}

/**
 * Hook do TanStack Query para buscar dados de um único período letivo pelo ID.
 */
export function usePeriodoLetivoQuery(id: string | number) {
  return useQuery({
    queryKey: ["periodoLetivo", String(id)],
    queryFn: () => getPeriodoLetivoById(id),
    enabled: !!id,
    staleTime: 1000 * 5,
  });
}

/**
 * Atualiza os dados de um período letivo no backend.
 */
export async function updatePeriodoLetivo(id: string | number, payload: UpdatePeriodoLetivoRequest) {
  const { data } = await api.put<UpdatePeriodoLetivoSuccessResponse>(`/periodoletivo/${id}`, payload);
  return data;
}

/**
 * Hook para mutação de atualização de período letivo.
 */
export function useUpdatePeriodoLetivoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: UpdatePeriodoLetivoRequest }) =>
      updatePeriodoLetivo(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["periodosLetivos"] });
      queryClient.invalidateQueries({ queryKey: ["periodoLetivo", String(variables.id)] });
    },
  });
}

/**
 * Exclui um período letivo do backend.
 */
export async function deletePeriodoLetivo(id: string | number) {
  const { data } = await api.delete<DeletePeriodoLetivoResponse>(`/periodoletivo/${id}`);
  return data;
}

/**
 * Hook para mutação de exclusão de período letivo.
 */
export function useDeletePeriodoLetivoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePeriodoLetivo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["periodosLetivos"] });
    },
  });
}
