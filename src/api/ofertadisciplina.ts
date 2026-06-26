import { useQuery, useMutation, useQueryClient, keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { api } from "../lib/axios";
import {
  OfertaDisciplinaPaginatedResponse,
  OfertaDisciplinaEmptyGeneralResponse,
  CreateOfertaDisciplinaRequest,
  CreateOfertaDisciplinaSuccessResponse,
  GetOfertaDisciplinaResponse,
  UpdateOfertaDisciplinaRequest,
  UpdateOfertaDisciplinaSuccessResponse,
  DeleteOfertaDisciplinaResponse
} from "../types/ofertadisciplina";

export type OfertaDisciplinaApiResponse = OfertaDisciplinaPaginatedResponse | OfertaDisciplinaEmptyGeneralResponse;

export async function getOfertaDisciplinas(page = 1) {
  const { data } = await api.get<OfertaDisciplinaApiResponse>(`/oferta-disciplinas`, {
    params: { page },
  });
  return data;
}

export async function getOfertasByDisciplina(disciplinaId: number, page = 1) {
  const { data } = await api.get<OfertaDisciplinaApiResponse>(`/oferta-disciplinas/disciplina/${disciplinaId}`, {
    params: { page },
  });
  return data;
}

export async function getOfertasByTurma(classroomId: number, page = 1) {
  const { data } = await api.get<OfertaDisciplinaApiResponse>(`/oferta-disciplinas/turma/${classroomId}`, {
    params: { page },
  });
  return data;
}

export function useOfertaDisciplinasInfiniteQuery() {
  return useInfiniteQuery({
    queryKey: ["ofertasDisciplinas", "infinite"],
    queryFn: ({ pageParam = 1 }) => getOfertaDisciplinas(Number(pageParam)),
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

export async function createOfertaDisciplina(payload: CreateOfertaDisciplinaRequest) {
  const { data } = await api.post<CreateOfertaDisciplinaSuccessResponse>("/oferta-disciplinas", payload);
  return data;
}

export function useCreateOfertaDisciplinaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOfertaDisciplina,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ofertasDisciplinas"] });
    },
  });
}

export async function getOfertaDisciplinaById(id: string | number) {
  const { data } = await api.get<GetOfertaDisciplinaResponse>(`/oferta-disciplinas/${id}`);
  return data;
}

export function useOfertaDisciplinaQuery(id: string | number) {
  return useQuery({
    queryKey: ["ofertaDisciplina", String(id)],
    queryFn: () => getOfertaDisciplinaById(id),
    enabled: !!id,
    staleTime: 1000 * 5,
  });
}

export async function updateOfertaDisciplina(id: string | number, payload: UpdateOfertaDisciplinaRequest) {
  const { data } = await api.put<UpdateOfertaDisciplinaSuccessResponse>(`/oferta-disciplinas/${id}`, payload);
  return data;
}

export function useUpdateOfertaDisciplinaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: UpdateOfertaDisciplinaRequest }) =>
      updateOfertaDisciplina(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["ofertasDisciplinas"] });
      queryClient.invalidateQueries({ queryKey: ["ofertaDisciplina", String(variables.id)] });
    },
  });
}

export async function deleteOfertaDisciplina(id: string | number) {
  const { data } = await api.delete<DeleteOfertaDisciplinaResponse>(`/oferta-disciplinas/${id}`);
  return data;
}

export function useDeleteOfertaDisciplinaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteOfertaDisciplina,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ofertasDisciplinas"] });
    },
  });
}

export async function getOfertasByProfessor(userId: number) {
  const { data: firstPageData } = await api.get<any>(`/oferta-disciplinas`, {
    params: { page: 1 },
  });

  let allOfertas: any[] = [];
  if (firstPageData && Array.isArray(firstPageData.data)) {
    allOfertas = [...firstPageData.data];
  } else if (firstPageData?.data && Array.isArray(firstPageData.data.data)) {
    allOfertas = [...firstPageData.data.data];
  }

  const meta = firstPageData?.meta || firstPageData?.data?.meta;
  const lastPage = meta?.last_page || 1;

  if (lastPage > 1) {
    const promises = [];
    for (let page = 2; page <= lastPage; page++) {
      promises.push(
        api.get<any>(`/oferta-disciplinas`, { params: { page } })
      );
    }

    const responses = await Promise.all(promises);
    responses.forEach(({ data: pageData }) => {
      if (pageData && Array.isArray(pageData.data)) {
        allOfertas.push(...pageData.data);
      } else if (pageData?.data && Array.isArray(pageData.data.data)) {
        allOfertas.push(...pageData.data.data);
      }
    });
  }

  const filtered = allOfertas.filter((offering: any) => offering.professor?.id_user === userId);

  return {
    status: true,
    code: 200,
    message: "Ofertas de disciplina do professor encontradas com sucesso",
    data: filtered,
  };
}

export function useProfessorOfertasQuery(userId: number | undefined) {
  return useQuery({
    queryKey: ["ofertasDisciplinas", "byProfessor", String(userId)],
    queryFn: () => getOfertasByProfessor(userId!),
    enabled: !!userId,
    staleTime: 1000 * 30,
  });
}

