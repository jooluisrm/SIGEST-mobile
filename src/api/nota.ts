import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/axios";
import { 
    NotaSingleResponse, 
    NotaListResponse, 
    CreateNotaRequest, 
    UpdateNotaRequest 
} from "../types/nota";

export async function createNotaAtividade(payload: CreateNotaRequest) {
    const { data } = await api.post<NotaSingleResponse>("/nota-atividades", payload);
    return data;
}

export async function updateNotaAtividade(id: number | string, payload: UpdateNotaRequest) {
    const { data } = await api.put<NotaSingleResponse>(`/nota-atividades/${id}`, payload);
    return data;
}

export async function deleteNotaAtividade(id: number | string) {
    await api.delete(`/nota-atividades/${id}`);
    return null;
}

export async function getNotasByAtividade(atividadeId: number) {
    // 1. Fetch first page
    const { data: firstPageData } = await api.get<any>(`/nota-atividades/atividade/${atividadeId}?page=1`);
    
    let allNotas: any[] = [];
    if (firstPageData && Array.isArray(firstPageData.data)) {
        allNotas = [...firstPageData.data];
    } else if (firstPageData?.data && Array.isArray(firstPageData.data.data)) {
        allNotas = [...firstPageData.data.data];
    }
    
    const meta = firstPageData?.meta || firstPageData?.data?.meta;
    const lastPage = meta?.last_page || 1;
    
    // 2. Fetch subsequent pages if any
    if (lastPage > 1) {
        const promises = [];
        for (let page = 2; page <= lastPage; page++) {
            promises.push(api.get<any>(`/nota-atividades/atividade/${atividadeId}?page=${page}`));
        }
        
        const responses = await Promise.all(promises);
        responses.forEach(({ data: pageData }) => {
            if (pageData && Array.isArray(pageData.data)) {
                allNotas.push(...pageData.data);
            } else if (pageData?.data && Array.isArray(pageData.data.data)) {
                allNotas.push(...pageData.data.data);
            }
        });
    }
    
    // Return unified response
    return {
        ...firstPageData,
        data: allNotas
    };
}

export async function getNotasByMatriculaDisciplina(matriculaDisciplinaId: number) {
    const { data } = await api.get<NotaListResponse>(
        `/nota-atividades/matricula-disciplina/${matriculaDisciplinaId}`
    );
    return data;
}

export function useNotasAtividadeQuery(atividadeId: number) {
    return useQuery({
        queryKey: ["notas", "atividade", atividadeId],
        queryFn: () => getNotasByAtividade(atividadeId),
        enabled: !!atividadeId,
        staleTime: 1000 * 10,
    });
}

export function useNotasMatriculaDisciplinaQuery(matriculaDisciplinaId: number) {
    return useQuery({
        queryKey: ["notas", "matricula-disciplina", matriculaDisciplinaId],
        queryFn: () => getNotasByMatriculaDisciplina(matriculaDisciplinaId),
        enabled: !!matriculaDisciplinaId,
        staleTime: 1000 * 10,
    });
}

export function useCreateNotaAtividadeMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createNotaAtividade,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["notas", "atividade", variables.atividade_id] });
            queryClient.invalidateQueries({ 
                queryKey: ["notas", "matricula-disciplina", variables.matricula_disciplina_id] 
            });
        }
    });
}

export function useUpdateNotaAtividadeMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: number | string; payload: UpdateNotaRequest }) => 
            updateNotaAtividade(id, payload),
        onSuccess: (data) => {
            if (data?.data) {
                queryClient.invalidateQueries({ 
                    queryKey: ["notas", "atividade", data.data.atividade_id] 
                });
                queryClient.invalidateQueries({ 
                    queryKey: ["notas", "matricula-disciplina", data.data.matricula_disciplina_id] 
                });
            } else {
                queryClient.invalidateQueries({ queryKey: ["notas"] });
            }
        }
    });
}
