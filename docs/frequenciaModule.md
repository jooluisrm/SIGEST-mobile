# Documentação de Implementação: Módulo de Frequência

Este documento especifica a arquitetura, as interfaces de API, os schemas de validação e o fluxo de telas para a integração do módulo de **Frequências (Chamadas diárias / Presenças)** no aplicativo `sigest-mobile`, conforme as diretrizes do [ImplementationWorkflow.md](file:///c:/Users/joaol/Documents/React%20Native/sigest-mobile/docs/ImplementationWorkflow.md).

---

## 1. Regras de Negócio e Acesso (RBAC)

* **Perfil Autorizado:** Apenas usuários com a role `professor` ou `admin` podem acessar e fazer chamadas.
* **Modelo de Relação:** A frequência é registrada individualmente por dia letivo para cada enturmação de aluno (`matricula_disciplina_id`).
* **Validação Backend:** O backend exige que não haja duplicidade de frequências para a mesma data e a mesma matrícula-disciplina.

---

## 2. Modelagem de Tipos (`src/types/frequencia.ts`)

```typescript
import { MatriculaDisciplina } from "./matriculadisciplina";

export interface Frequencia {
    id: number;
    matricula_disciplina_id: number;
    data: string; // ISO date string (YYYY-MM-DD)
    situacao: boolean; // true = Presente, false = Faltoso
    justificativa?: string | null;
    created_at?: string;
    updated_at?: string;
    matricula_disciplina?: MatriculaDisciplina;
}

export interface CreateFrequenciaRequest {
    matricula_disciplina_id: number;
    data: string; // YYYY-MM-DD
    situacao: boolean;
    justificativa?: string | null;
}

export interface UpdateFrequenciaRequest {
    situacao: boolean;
    justificativa?: string | null;
}

// Responses
export interface FrequenciaSingleResponse {
    mensagem: string;
    dado: Frequencia;
}

export interface FrequenciaListResponse {
    mensagem: string;
    dado: {
        data: Frequencia[];
        meta?: {
            current_page: number;
            last_page: number;
            total: number;
        };
    };
}
```

---

## 3. Chamadas de API e Hooks (`src/api/frequencia.ts`)

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/axios";
import { 
    FrequenciaSingleResponse, 
    FrequenciaListResponse, 
    CreateFrequenciaRequest, 
    UpdateFrequenciaRequest 
} from "../types/frequencia";

// Registrar nova frequência
export async function createFrequencia(payload: CreateFrequenciaRequest) {
    const { data } = await api.post<FrequenciaSingleResponse>("/frequencias", payload);
    return data;
}

// Atualizar frequência existente
export async function updateFrequencia(id: number, payload: UpdateFrequenciaRequest) {
    const { data } = await api.put<FrequenciaSingleResponse>(`/frequencias/${id}`, payload);
    return data;
}

// Excluir registro de frequência
export async function deleteFrequencia(id: number) {
    await api.delete(`/frequencias/${id}`);
    return null;
}

// Buscar frequências de um aluno em uma disciplina
export async function getFrequenciasByMatriculaDisciplina(matriculaDisciplinaId: number) {
    const { data } = await api.get<FrequenciaListResponse>(
        `/frequencias/matricula-disciplina/${matriculaDisciplinaId}`
    );
    return data;
}

// Hooks do TanStack Query
export function useFrequenciasQuery(matriculaDisciplinaId: number) {
    return useQuery({
        queryKey: ["frequencias", "matricula-disciplina", matriculaDisciplinaId],
        queryFn: () => getFrequenciasByMatriculaDisciplina(matriculaDisciplinaId),
        enabled: !!matriculaDisciplinaId,
        staleTime: 1000 * 30,
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
```

---

## 4. Schema de Validação (`src/schema/frequencia.ts`)

Para chamadas avulsas ou formulário de justificativa:

```typescript
import { z } from "zod";

export const lancarFrequenciaSchema = z.object({
    matricula_disciplina_id: z.number().min(1, "Matrícula na disciplina inválida"),
    data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato AAAA-MM-DD"),
    situacao: z.boolean(),
    justificativa: z.string().max(500, "A justificativa deve ter no máximo 500 caracteres").nullable().optional(),
});

export type LancarFrequenciaFormData = z.infer<typeof lancarFrequenciaSchema>;
```

---

## 5. Fluxo de Telas (UI/UX)

1. **Seleção de Turma & Data (`app/(private)/frequencia/index.tsx`)**:
   * O professor escolhe a **Oferta de Disciplina** correspondente a partir de uma lista ou dropdown.
   * Seleciona a **Data letiva** (com valor inicial definido como a data de hoje).
   * Clica em "Iniciar Chamada" para carregar a listagem.
2. **Tela de Lançamento de Frequência (`app/(private)/frequencia/chamada.tsx`)**:
   * Carrega todos os alunos vinculados a essa oferta (via `/api/matricula-disciplinas/oferta/{id}`).
   * Renderiza os cards de alunos com:
     * Nome do Aluno e código da matrícula.
     * Um **Switch** ou **Checkbox** estilizado de Presença (`true` / `false`).
     * Caso o switch esteja desativado (Falta), exibe um ícone para adicionar justificativa (abre um pequeno modal de texto).
   * Botão "Salvar Chamada" no rodapé, que envia múltiplos payloads via requisição ou executa as mutações de criação/edição.

---

## 6. Cobertura de Testes Recomendada

Devem ser criados testes unitários e de integração em `__tests__/` cobrindo:
1. Validação local do schema Zod de frequência.
2. Comportamento do fluxo de chamada: bloqueio de múltiplos submits e desativação de botões durante o carregamento de envio.
3. Tratamento de erro 422 de duplicidade de frequência no mesmo dia.
