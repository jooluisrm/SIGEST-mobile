import { useQuery, useMutation, useQueryClient, keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { api } from "../lib/axios";
import { 
  UsuariosPaginatedResponse, 
  UsuariosEmptyResponse,
  CreateServidorRequest,
  CreateServidorSuccessResponse,
  GetServidorResponse,
  UpdateServidorRequest,
  UpdateServidorSuccessResponse,
  DeleteServidorResponse
} from "../types/usuario";

export type UsuariosApiResponse = UsuariosPaginatedResponse | UsuariosEmptyResponse;

/**
 * Busca a lista geral de servidores/usuários paginada.
 */
export async function getUsuarios(page = 1) {
  const { data } = await api.get<UsuariosApiResponse>(`/servidors`, {
    params: { page },
  });
  return data;
}

/**
 * Busca servidores/usuários por Nome ou CPF (requer mínimo de 3 caracteres).
 */
export async function searchUsuarios(value: string, page = 1) {
  const { data } = await api.get<UsuariosApiResponse>(
    `/servidors/value/${encodeURIComponent(value)}`,
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
export function useUsuariosQuery(searchTerm: string, page: number) {
  const normalizedSearch = searchTerm.trim();
  const isSearching = normalizedSearch.length >= 3;

  return useQuery({
    queryKey: ["usuarios", normalizedSearch, page],
    queryFn: () => {
      if (isSearching) {
        return searchUsuarios(normalizedSearch, page);
      }
      return getUsuarios(page);
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 10, // Cache local por 10 segundos
  });
}

export function useUsuariosInfiniteQuery(searchTerm: string) {
  const normalizedSearch = searchTerm.trim();
  const isSearching = normalizedSearch.length >= 3;

  return useInfiniteQuery({
    queryKey: ["usuarios", "infinite", normalizedSearch],
    queryFn: ({ pageParam = 1 }) => {
      if (isSearching) {
        return searchUsuarios(normalizedSearch, Number(pageParam));
      }
      return getUsuarios(Number(pageParam));
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
 * Cria um novo servidor (usuário) no backend.
 */
export async function createServidor(payload: CreateServidorRequest) {
  const { data } = await api.post<CreateServidorSuccessResponse>("/servidors", payload);
  return data;
}

/**
 * Hook para mutação de criação de servidor que invalida a listagem.
 */
export function useCreateServidorMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createServidor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
    },
  });
}

/**
 * Busca dados de um único servidor pelo ID.
 */
export async function getUsuarioById(id: string | number) {
  const { data } = await api.get<GetServidorResponse>(`/servidors/${id}`);
  return data;
}

/**
 * Hook do TanStack Query para buscar dados de um único servidor pelo ID.
 */
export function useUsuarioQuery(id: string | number) {
  return useQuery({
    queryKey: ["usuario", String(id)],
    queryFn: () => getUsuarioById(id),
    enabled: !!id,
    staleTime: 1000 * 5,
  });
}

/**
 * Atualiza os dados de um servidor no backend.
 */
export async function updateUsuario(id: string | number, payload: UpdateServidorRequest) {
  const { data } = await api.put<UpdateServidorSuccessResponse>(`/servidors/${id}`, payload);
  return data;
}

/**
 * Hook para mutação de atualização de servidor.
 */
export function useUpdateUsuarioMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: UpdateServidorRequest }) =>
      updateUsuario(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      queryClient.invalidateQueries({ queryKey: ["usuario", String(variables.id)] });
    },
  });
}

/**
 * Exclui um servidor do backend.
 */
export async function deleteUsuario(id: string | number) {
  const { data } = await api.delete<DeleteServidorResponse>(`/servidors/${id}`);
  return data;
}

/**
 * Hook para mutação de exclusão de servidor.
 */
export function useDeleteUsuarioMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUsuario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
    },
  });
}
