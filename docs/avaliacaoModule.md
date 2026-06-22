# Documentação de Implementação: Módulo de Avaliações e Notas

Este documento especifica a arquitetura, as interfaces de API, os schemas de validação e o fluxo de telas para a integração do módulo de **Avaliações (Atividades & Notas)** no aplicativo `sigest-mobile`, conforme as diretrizes do [ImplementationWorkflow.md](file:///c:/Users/joaol/Documents/React%20Native/sigest-mobile/docs/ImplementationWorkflow.md).

---

## 1. Regras de Negócio e Acesso (RBAC)

* **Perfil Autorizado:** Apenas usuários com a role `professor` ou `admin` podem criar atividades e atribuir notas.
* **Modelo de Relação:**
  * Uma `Atividade` (Avaliação) está ligada a uma `OfertaDisciplina`.
  * Uma `NotaAtividade` registra a pontuação de um aluno enturmado (`matricula_disciplina_id`) para uma determinada `atividade_id`.
* **Validação Backend:** A nota deve ser numérica e estar estritamente entre `0` e `10`. Não pode haver mais de uma nota para o mesmo aluno na mesma atividade.

---

## 2. Modelagem de Tipos

### A. Atividades (`src/types/atividade.ts`)
```typescript
import { OfertaDisciplina } from "./ofertadisciplina";

export interface Atividade {
    id: number;
    oferta_disciplina_id: number;
    titulo: string;
    tipo: string; // Prova, Trabalho, Seminário, etc.
    data_inicio: string;
    data_fim?: string | null;
    descricao?: string | null;
    created_at?: string;
    updated_at?: string;
    oferta_disciplina?: OfertaDisciplina;
}

export interface CreateAtividadeRequest {
    oferta_disciplina_id: number;
    titulo: string;
    tipo: string;
    data_inicio: string;
    data_fim?: string | null;
    descricao?: string | null;
}

export interface UpdateAtividadeRequest {
    titulo: string;
    tipo: string;
    data_inicio: string;
    data_fim?: string | null;
    descricao?: string | null;
}

export interface AtividadeSingleResponse {
    mensagem: string;
    dado: Atividade;
}

export interface AtividadeListResponse {
    mensagem: string;
    dado: {
        data: Atividade[];
        meta?: {
            current_page: number;
            last_page: number;
            total: number;
        };
    };
}
```

### B. Notas (`src/types/nota.ts`)
```typescript
import { Atividade } from "./atividade";
import { MatriculaDisciplina } from "./matriculadisciplina";

export interface NotaAtividade {
    id: number;
    matricula_disciplina_id: number;
    atividade_id: number;
    nota: number; // 0.0 to 10.0
    created_at?: string;
    updated_at?: string;
    atividade?: Atividade;
    matricula_disciplina?: MatriculaDisciplina;
}

export interface CreateNotaRequest {
    matricula_disciplina_id: number;
    atividade_id: number;
    nota: number;
}

export interface UpdateNotaRequest {
    nota: number;
}

export interface NotaSingleResponse {
    mensagem: string;
    dado: NotaAtividade;
}

export interface NotaListResponse {
    mensagem: string;
    dado: {
        data: NotaAtividade[];
        meta?: {
            current_page: number;
            last_page: number;
            total: number;
        };
    };
}
```

---

## 3. Chamadas de API e Hooks

### A. Atividades (`src/api/atividade.ts`)
```typescript
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { api } from "../lib/axios";
import { AtividadeSingleResponse, AtividadeListResponse, CreateAtividadeRequest, UpdateAtividadeRequest } from "../types/atividade";

export async function createAtividade(payload: CreateAtividadeRequest) {
    const { data } = await api.post<AtividadeSingleResponse>("/atividades", payload);
    return data;
}

export async function updateAtividade(id: number, payload: UpdateAtividadeRequest) {
    const { data } = await api.put<AtividadeSingleResponse>(`/atividades/${id}`, payload);
    return data;
}

export async function deleteAtividade(id: number) {
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
        staleTime: 1000 * 20,
    });
}
```

### B. Notas (`src/api/nota.ts`)
```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/axios";
import { NotaSingleResponse, NotaListResponse, CreateNotaRequest, UpdateNotaRequest } from "../types/nota";

export async function saveNota(payload: CreateNotaRequest) {
    const { data } = await api.post<NotaSingleResponse>("/nota-atividades", payload);
    return data;
}

export async function updateNota(id: number, payload: UpdateNotaRequest) {
    const { data } = await api.put<NotaSingleResponse>(`/nota-atividades/${id}`, payload);
    return data;
}

export async function getNotasByAtividade(atividadeId: number) {
    const { data } = await api.get<NotaListResponse>(`/nota-atividades/atividade/${atividadeId}`);
    return data;
}

export function useNotasAtividadeQuery(atividadeId: number) {
    return useQuery({
        queryKey: ["notas", "atividade", atividadeId],
        queryFn: () => getNotasByAtividade(atividadeId),
        enabled: !!atividadeId,
        staleTime: 1000 * 15,
    });
}
```

---

## 4. Schemas de Validação (`src/schema/atividade.ts`)

```typescript
import { z } from "zod";

export const cadastroAtividadeSchema = z.object({
    titulo: z.string().min(3, "O título deve ter no mínimo 3 caracteres").max(255),
    tipo: z.string().min(2, "Selecione o tipo de avaliação"),
    data_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data de início deve ser AAAA-MM-DD"),
    data_fim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data final deve ser AAAA-MM-DD").nullable().optional(),
    descricao: z.string().max(1000, "Descrição muito longa").nullable().optional(),
});

export const cadastroNotaSchema = z.object({
    nota: z.coerce.number().min(0, "A nota mínima é 0").max(10, "A nota máxima é 10"),
});
```

---

## 5. Fluxo de Telas (UI/UX)

1. **Painel de Avaliações da Turma (`app/(private)/gerenciar/avaliacao/index.tsx`)**:
   * O professor escolhe a **Oferta de Disciplina**.
   * Exibe uma lista das avaliações cadastradas (Título, Tipo, Data e Média da Turma).
   * Botão de Criar Avaliação (`+`).
2. **Formulário de Cadastro/Edição de Avaliação (`app/(private)/gerenciar/avaliacao/cadastro.tsx`)**:
   * Form do react-hook-form integrado com o `cadastroAtividadeSchema`.
   * Campos: Título, Tipo (Dropdown), Data Início, Data Fim, Descrição.
3. **Tela de Lançamento de Notas (`app/(private)/gerenciar/avaliacao/[id].tsx`)**:
   * Mostra os detalhes da avaliação e a listagem de todos os alunos enturmados.
   * Ao lado de cada aluno, uma caixa de entrada numérica (`TextInput` de nota).
   * Ao sair do foco (onBlur) ou pressionar salvar, envia a nota para a API.
   * Feedback de sucesso (cor verde) e de erro de validação (cor vermelha caso nota > 10).

---

## 6. Cobertura de Testes Recomendada

Devem ser criados testes unitários e de integração em `__tests__/` cobrindo:
1. Validação local do schema Zod de atividades e nota mínima/máxima.
2. Tratamento de mensagens de erros de digitação (ex: nota superior a 10).
3. Testar a atualização e persistência local da nota lançada após o fechamento da chamada.
