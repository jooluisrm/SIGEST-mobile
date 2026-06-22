import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/axios";
import {
  MatriculaDisciplinaPaginatedResponse,
  MatriculaDisciplinaEmptyResponse,
  CreateMatriculaDisciplinaRequest,
  CreateMatriculaDisciplinaSuccessResponse,
  GetMatriculaDisciplinaResponse,
  DeleteMatriculaDisciplinaResponse
} from "../types/matriculadisciplina";

export type MatriculaDisciplinaApiResponse = MatriculaDisciplinaPaginatedResponse | MatriculaDisciplinaEmptyResponse;

export async function getMatriculaDisciplinasByMatricula(matriculaId: number | string) {
  const { data } = await api.get<MatriculaDisciplinaApiResponse>(
    `/matricula-disciplinas/matricula/${matriculaId}`
  );
  return data;
}

export async function getMatriculaDisciplinasByOferta(ofertaId: number | string) {
  const { data } = await api.get<MatriculaDisciplinaApiResponse>(
    `/matricula-disciplinas/oferta/${ofertaId}`
  );
  return data;
}

export function useMatriculaDisciplinasByMatriculaQuery(matriculaId: number | string | undefined) {
  return useQuery({
    queryKey: ["matriculaDisciplinas", "byMatricula", String(matriculaId)],
    queryFn: () => getMatriculaDisciplinasByMatricula(matriculaId!),
    enabled: !!matriculaId,
    staleTime: 1000 * 5,
  });
}

export function useMatriculaDisciplinasByOfertaQuery(ofertaId: number | string | undefined) {
  return useQuery({
    queryKey: ["matriculaDisciplinas", "byOferta", String(ofertaId)],
    queryFn: () => getMatriculaDisciplinasByOferta(ofertaId!),
    enabled: !!ofertaId,
    staleTime: 1000 * 5,
  });
}

export async function createMatriculaDisciplina(payload: CreateMatriculaDisciplinaRequest) {
  const { data } = await api.post<CreateMatriculaDisciplinaSuccessResponse>(
    "/matricula-disciplinas",
    payload
  );
  return data;
}

export function useCreateMatriculaDisciplinaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMatriculaDisciplina,
    onSuccess: (data) => {
      // Invalidate both lists of enrollments for safety
      queryClient.invalidateQueries({ queryKey: ["matriculaDisciplinas"] });
    },
  });
}

export async function deleteMatriculaDisciplina(id: string | number) {
  const { data } = await api.delete<DeleteMatriculaDisciplinaResponse>(
    `/matricula-disciplinas/${id}`
  );
  return data;
}

export function useDeleteMatriculaDisciplinaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMatriculaDisciplina,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matriculaDisciplinas"] });
    },
  });
}
