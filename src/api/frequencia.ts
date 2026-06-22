import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/axios";
import { 
    FrequenciaSingleResponse, 
    FrequenciaListResponse, 
    CreateFrequenciaRequest, 
    UpdateFrequenciaRequest 
} from "../types/frequencia";

export async function createFrequencia(payload: CreateFrequenciaRequest) {
    const { data } = await api.post<FrequenciaSingleResponse>("/frequencias", payload);
    return data;
}

export async function updateFrequencia(id: number, payload: UpdateFrequenciaRequest) {
    const { data } = await api.put<FrequenciaSingleResponse>(`/frequencias/${id}`, payload);
    return data;
}

export async function deleteFrequencia(id: number) {
    await api.delete(`/frequencias/${id}`);
    return null;
}

export async function getFrequenciasByMatriculaDisciplina(matriculaDisciplinaId: number) {
    // 1. Fetch first page
    const { data: firstPageData } = await api.get<any>(
        `/frequencias/matricula-disciplina/${matriculaDisciplinaId}?page=1`
    );
    
    let allFrequencias: any[] = [];
    if (firstPageData && Array.isArray(firstPageData.data)) {
        allFrequencias = [...firstPageData.data];
    } else if (firstPageData?.data && Array.isArray(firstPageData.data.data)) {
        allFrequencias = [...firstPageData.data.data];
    }
    
    const meta = firstPageData?.meta || firstPageData?.data?.meta;
    const lastPage = meta?.last_page || 1;
    
    // 2. Fetch subsequent pages if any
    if (lastPage > 1) {
        const promises = [];
        for (let page = 2; page <= lastPage; page++) {
            promises.push(
                api.get<any>(`/frequencias/matricula-disciplina/${matriculaDisciplinaId}?page=${page}`)
            );
        }
        
        const responses = await Promise.all(promises);
        responses.forEach(({ data: pageData }) => {
            if (pageData && Array.isArray(pageData.data)) {
                allFrequencias.push(...pageData.data);
            } else if (pageData?.data && Array.isArray(pageData.data.data)) {
                allFrequencias.push(...pageData.data.data);
            }
        });
    }
    
    // Return unified response
    return {
        ...firstPageData,
        data: allFrequencias
    };
}

export function useFrequenciasQuery(matriculaDisciplinaId: number) {
    return useQuery({
        queryKey: ["frequencias", "matricula-disciplina", matriculaDisciplinaId],
        queryFn: () => getFrequenciasByMatriculaDisciplina(matriculaDisciplinaId),
        enabled: !!matriculaDisciplinaId,
        staleTime: 1000 * 10,
    });
}

export function useCreateFrequenciaMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createFrequencia,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ 
                queryKey: ["frequencias", "matricula-disciplina", variables.matricula_disciplina_id] 
            });
        }
    });
}

export function useUpdateFrequenciaMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: UpdateFrequenciaRequest }) => 
            updateFrequencia(id, payload),
        onSuccess: (data) => {
            if (data?.data?.matricula_disciplina_id) {
                queryClient.invalidateQueries({ 
                    queryKey: ["frequencias", "matricula-disciplina", data.data.matricula_disciplina_id] 
                });
            } else {
                queryClient.invalidateQueries({ queryKey: ["frequencias"] });
            }
        }
    });
}
