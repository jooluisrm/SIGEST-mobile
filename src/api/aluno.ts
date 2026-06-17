import { useQuery, useMutation, useQueryClient, keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { api } from "../lib/axios";
import { 
  AlunosPaginatedResponse, 
  AlunosEmptyGeneralResponse,
  CreateAlunoRequest,
  CreateAlunoSuccessResponse,
  GetAlunoResponse,
  UpdateAlunoRequest,
  UpdateAlunoSuccessResponse,
  DeleteAlunoResponse
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

export function useAlunosInfiniteQuery(searchTerm: string) {
  const normalizedSearch = searchTerm.trim();
  const isSearching = normalizedSearch.length >= 3;

  return useInfiniteQuery({
    queryKey: ["alunos", "infinite", normalizedSearch],
    queryFn: ({ pageParam = 1 }) => {
      if (isSearching) {
        return searchAlunos(normalizedSearch, Number(pageParam));
      }
      return getAlunos(Number(pageParam));
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

/**
 * Busca dados de um único aluno pelo ID.
 */
export async function getAlunoById(id: string | number) {
  const { data } = await api.get<GetAlunoResponse>(`/alunos/${id}`);
  return data;
}

/**
 * Hook do TanStack Query para buscar dados de um único aluno pelo ID.
 */
export function useAlunoQuery(id: string | number) {
  return useQuery({
    queryKey: ["aluno", String(id)],
    queryFn: () => getAlunoById(id),
    enabled: !!id,
    staleTime: 1000 * 5,
  });
}

/**
 * Atualiza os dados de um aluno no backend.
 */
export async function updateAluno(id: string | number, payload: UpdateAlunoRequest) {
  const { data } = await api.put<UpdateAlunoSuccessResponse>(`/alunos/${id}`, payload);
  return data;
}

/**
 * Hook para mutação de atualização de aluno.
 */
export function useUpdateAlunoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: UpdateAlunoRequest }) =>
      updateAluno(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["alunos"] });
      queryClient.invalidateQueries({ queryKey: ["aluno", String(variables.id)] });
    },
  });
}

/**
 * Exclui um aluno do backend.
 */
export async function deleteAluno(id: string | number) {
  const { data } = await api.delete<DeleteAlunoResponse>(`/alunos/${id}`);
  return data;
}

/**
 * Hook para mutação de exclusão de aluno.
 */
export function useDeleteAlunoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAluno,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alunos"] });
    },
  });
}
