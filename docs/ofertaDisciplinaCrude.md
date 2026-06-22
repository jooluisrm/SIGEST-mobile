# CRUD de Ofertas de Disciplinas

Este documento descreve a especificação técnica, regras de negócio e o comportamento do CRUD de **Ofertas de Disciplinas (OfertaDisciplina)** no aplicativo mobile `sigest-mobile`, integrado com o backend Laravel.

---

## 1. Endpoints Utilizados (Backend)

Todas as rotas de gerenciamento de ofertas exigem autenticação Sanctum (Bearer Token) e as roles `servidor` ou `admin`.

### A. Listar Todas as Ofertas
* **Método:** `GET`
* **URL:** `/api/oferta-disciplinas`
* **Query Params:**
  - `page` (opcional, padrão: `1`)

### B. Listar Ofertas por Disciplina
* **Método:** `GET`
* **URL:** `/api/oferta-disciplinas/disciplina/{disciplinaId}`

### C. Listar Ofertas por Turma
* **Método:** `GET`
* **URL:** `/api/oferta-disciplinas/turma/{classroomId}`

### D. Criar Oferta
* **Método:** `POST`
* **URL:** `/api/oferta-disciplinas`

### E. Visualizar Oferta por ID
* **Método:** `GET`
* **URL:** `/api/oferta-disciplinas/{id}`

### F. Atualizar Oferta por ID
* **Método:** `PUT`
* **URL:** `/api/oferta-disciplinas/{id}`

### G. Excluir Oferta por ID
* **Método:** `DELETE`
* **URL:** `/api/oferta-disciplinas/{id}`

---

## 2. Validação de Formulário (Zod + React Hook Form)

As regras de validação client-side residem no arquivo `src/schema/cadastro-ofertadisciplina.ts`:

* **`disciplina_id` (Disciplina):** Obrigatório, id inteiro válido.
* **`classroom_id` (Turma):** Obrigatório, id inteiro válido.
* **`professor_id` (Professor):** Obrigatório, id inteiro válido.
* **`periodo_letivo_id` (Período Letivo):** Obrigatório, id inteiro válido.
* **`status` (Situação):** Booleano (ativo/inativo).

---

## 3. Estrutura de Arquivos

### A. Tipagem TypeScript
* **Arquivo:** `src/types/ofertadisciplina.ts`
* **Conteúdo:** Interface `OfertaDisciplina`, payloads de requisição e respostas.

### B. API e Cache (TanStack Query)
* **Arquivo:** `src/api/ofertadisciplina.ts`
* **Hooks:**
  * `useOfertaDisciplinasInfiniteQuery`: Carrega lista paginada geral de ofertas.
  * `useOfertaDisciplinaQuery`: Obtém os detalhes de uma oferta específica.
  * `useCreateOfertaDisciplinaMutation`: Mutação para criar oferta.
  * `useUpdateOfertaDisciplinaMutation`: Mutação para atualizar oferta.
  * `useDeleteOfertaDisciplinaMutation`: Mutação para remover oferta.

### C. Componentes de UI
* **`ofertadisciplina-card.tsx`** (`src/components/gerenciar/ofertadisciplina/ofertadisciplina-card.tsx`): Renderiza a disciplina, turma, professor, período letivo e indicador de status.
* **`ofertadisciplina-form.tsx`** (`src/components/gerenciar/ofertadisciplina/ofertadisciplina-form.tsx`): Formulário com seletores modais com suporte a busca debounced para as entidades associadas.

### D. Telas de Rotas
* **`ofertadisciplina/index.tsx`** (`app/(private)/gerenciar/ofertadisciplina/index.tsx`): Listagem geral de ofertas de disciplinas.
* **`ofertadisciplina/cadastro.tsx`** (`app/(private)/gerenciar/ofertadisciplina/cadastro.tsx`): Form router para criação e edição de ofertas.
* **`ofertadisciplina/[id].tsx`** (`app/(private)/gerenciar/ofertadisciplina/[id].tsx`): Exibição dos relacionamentos de uma oferta específica com botões de edição e exclusão.
