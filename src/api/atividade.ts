import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/axios";
import { 
    AtividadeSingleResponse, 
    AtividadeListResponse, 
    CreateAtividadeRequest, 
    UpdateAtividadeRequest 
} from "../types/atividade";

export async function getAtividadeById(id: number | string) {
    const { data } = await api.get<AtividadeSingleResponse>(`/atividades/${id}`);
    return data;
}

export async function createAtividade(payload: CreateAtividadeRequest) {
    const { data } = await api.post<AtividadeSingleResponse>("/atividades", payload);
    return data;
}

export async function updateAtividade(id: number | string, payload: UpdateAtividadeRequest) {
    const { data } = await api.put<AtividadeSingleResponse>(`/atividades/${id}`, payload);
    return data;
}

export async function deleteAtividade(id: number | string) {
    await api.delete(`/atividades/${id}`);
    return null;
}

export async function getAtividadesByOferta(ofertaId: number) {
    const { data } = await api.get<AtividadeListResponse>(`/atividades/oferta/${ofertaId}`);
    return data;
}

export function useAtividadesQuery(ofertaId: number) {
    return useQuery({
        queryKey: ["atividades", "oferta", ofertaId],
        queryFn: () => getAtividadesByOferta(ofertaId),
        enabled: !!ofertaId,
        staleTime: 1000 * 15,
    });
}

export function useAtividadeQuery(id: number | string) {
    return useQuery({
        queryKey: ["atividade", String(id)],
        queryFn: () => getAtividadeById(id),
        enabled: !!id,
        staleTime: 1000 * 10,
    });
}

export function useCreateAtividadeMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createAtividade,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ 
                queryKey: ["atividades", "oferta", variables.oferta_disciplina_id] 
            });
        }
    });
}

export function useUpdateAtividadeMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: number | string; payload: UpdateAtividadeRequest }) => 
            updateAtividade(id, payload),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["atividade", String(variables.id)] });
            if (data?.data?.oferta_disciplina_id) {
                queryClient.invalidateQueries({ 
                    queryKey: ["atividades", "oferta", data.data.oferta_disciplina_id] 
                });
            } else {
                queryClient.invalidateQueries({ queryKey: ["atividades"] });
            }
        }
    });
}

export function useDeleteAtividadeMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteAtividade,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["atividades"] });
        }
    });
}
