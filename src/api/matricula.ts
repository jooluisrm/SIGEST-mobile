import { useQuery, useMutation, useQueryClient, keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { api } from "../lib/axios";
import {
  MatriculaPaginatedResponse,
  MatriculaEmptyResponse,
  CreateMatriculaRequest,
  CreateMatriculaSuccessResponse,
  GetMatriculaResponse,
  UpdateMatriculaRequest,
  UpdateMatriculaSuccessResponse,
  DeleteMatriculaResponse
} from "../types/matricula";

export type MatriculaApiResponse = MatriculaPaginatedResponse | MatriculaEmptyResponse;

export async function getMatriculas(page = 1) {
  const { data } = await api.get<MatriculaApiResponse>(`/matriculas`, {
    params: { page },
  });
  return data;
}

export async function searchMatriculas(value: string, page = 1) {
  const { data } = await api.get<MatriculaApiResponse>(
    `/matriculas/value/${encodeURIComponent(value)}`,
    {
      params: { page },
    }
  );
  return data;
}

export function useMatriculasInfiniteQuery(searchTerm: string) {
  const normalizedSearch = searchTerm.trim();
  const isSearching = normalizedSearch.length >= 3;

  return useInfiniteQuery({
    queryKey: ["matriculas", "infinite", normalizedSearch],
    queryFn: ({ pageParam = 1 }) => {
      if (isSearching) {
        return searchMatriculas(normalizedSearch, Number(pageParam));
      }
      return getMatriculas(Number(pageParam));
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage && "meta" in lastPage && lastPage.meta) {
        const meta = lastPage.meta;
        if (meta.current_page < meta.last_page) {
          return meta.current_page + 1;
        }
      }
      // Handle when meta is directly in the paginated envelope or in data
      if (lastPage && "data" in lastPage && typeof lastPage.data === "object" && lastPage.data !== null && "meta" in lastPage.data) {
        const meta = (lastPage.data as any).meta;
        if (meta && meta.current_page < meta.last_page) {
          return meta.current_page + 1;
        }
      }
      return undefined;
    },
    staleTime: 1000 * 10,
  });
}

export async function createMatricula(payload: CreateMatriculaRequest) {
  const { data } = await api.post<CreateMatriculaSuccessResponse>("/matriculas", payload);
  return data;
}

export function useCreateMatriculaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMatricula,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matriculas"] });
      // Also invalidate students since enrollment status might affect them
      queryClient.invalidateQueries({ queryKey: ["alunos"] });
    },
  });
}

export async function getMatriculaById(id: string | number) {
  const { data } = await api.get<GetMatriculaResponse>(`/matriculas/${id}`);
  return data;
}

export function useMatriculaQuery(id: string | number) {
  return useQuery({
    queryKey: ["matricula", String(id)],
    queryFn: () => getMatriculaById(id),
    enabled: !!id,
    staleTime: 1000 * 5,
  });
}

export async function updateMatricula(id: string | number, payload: UpdateMatriculaRequest) {
  const { data } = await api.put<UpdateMatriculaSuccessResponse>(`/matriculas/${id}`, payload);
  return data;
}

export function useUpdateMatriculaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: UpdateMatriculaRequest }) =>
      updateMatricula(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["matriculas"] });
      queryClient.invalidateQueries({ queryKey: ["matricula", String(variables.id)] });
    },
  });
}

export async function deleteMatricula(id: string | number) {
  const { data } = await api.delete<DeleteMatriculaResponse>(`/matriculas/${id}`);
  return data;
}

export function useDeleteMatriculaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMatricula,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matriculas"] });
    },
  });
}
