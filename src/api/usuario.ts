import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api } from "../lib/axios";
import { 
  UsuariosPaginatedResponse, 
  UsuariosEmptyResponse,
  CreateServidorRequest,
  CreateServidorSuccessResponse
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
