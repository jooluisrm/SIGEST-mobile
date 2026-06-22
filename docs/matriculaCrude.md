# CRUD de Matrículas & Enturmação

Este documento descreve a especificação técnica, regras de negócio e o comportamento de **Matrículas (Matricula)** e **Enturmação (MatriculaDisciplina)** no aplicativo mobile `sigest-mobile`, integrado com o backend Laravel.

---

## 1. Endpoints Utilizados (Backend)

Todas as rotas exigem autenticação Sanctum (Bearer Token) e as roles `servidor` ou `admin`.

### A. Matrículas (Geral)
* **Listar Matrículas:** `GET /api/matriculas` (suporta paginação)
* **Buscar Matrículas por Código:** `GET /api/matriculas/value/{value}` (busca por código da matrícula, mínimo 3 caracteres)
* **Criar Matrícula:** `POST /api/matriculas`
* **Visualizar Matrícula por ID:** `GET /api/matriculas/{id}`
* **Atualizar Matrícula por ID:** `PUT /api/matriculas/{id}`
* **Excluir Matrícula por ID:** `DELETE /api/matriculas/{id}`

### B. Enturmação (Matrículas em Disciplinas)
* **Vincular Aluno a Oferta (Enturmação):** `POST /api/matricula-disciplinas`
* **Desvincular Aluno da Oferta:** `DELETE /api/matricula-disciplinas/{id}`
* **Listar Disciplinas de uma Matrícula:** `GET /api/matricula-disciplinas/matricula/{matriculaId}`
* **Listar Alunos de uma Oferta:** `GET /api/matricula-disciplinas/oferta/{ofertaDisciplinaId}`

---

## 2. Validação de Formulário (Zod + React Hook Form)

As regras de validação client-side para matrículas residem no arquivo `src/schema/cadastro-matricula.ts`:

* **`aluno_id` (Aluno):** Obrigatório, id inteiro válido.
* **`serie_id` (Série):** Obrigatório, id inteiro válido.
* **`codigo_matricula` (Código):** Obrigatório, string de 3 a 50 caracteres (ex: `"MAT-2026-001"`).
* **`data_matricula` (Data Matrícula):** Obrigatório, formato de data BR válida (será convertido para ISO `YYYY-MM-DD` antes do envio).
* **`data_cancelamento` (Data Cancelamento):** Opcional, deve ser posterior ou igual à data de matrícula se fornecida.
* **`status` (Situação):** Booleano (Ativo = true, Inativo/Cancelado = false).

---

## 3. UI Flow e Resolução de Entidades no Cliente

Como o endpoint padrão do backend retorna chaves estrangeiras planas (`aluno_id` e `serie_id`) sem realizar eager-loading por padrão, o frontend foi modelado para **resolver as entidades dinamicamente em cache no cliente**:

* **Lista de Matrículas:** Cada item renderiza um sub-componente wrapper `<MatriculaRow>` que invoca `useAlunoQuery` e `usePeriodQuery` utilizando React Query. A resposta de cada requisição é armazenada em cache global, evitando requisições duplicadas.
* **Tela de Detalhes:** A tela de detalhes da matrícula (`app/(private)/gerenciar/matricula/[id].tsx`) realiza as resoluções e exibe uma seção dedicada de **Disciplinas Vinculadas**.
  - O usuário pode visualizar a grade de matérias do aluno.
  - O usuário pode remover o vínculo de uma disciplina (desenturmação).
  - O usuário pode adicionar novos vínculos abrindo um modal de busca de ofertas ativas (`OfertaDisciplina`).

---

## 4. Estrutura de Arquivos

### A. Tipagem TypeScript
* **Arquivos:** `src/types/matricula.ts` e `src/types/matriculadisciplina.ts`

### B. API e Cache (TanStack Query)
* **Arquivos:** `src/api/matricula.ts` e `src/api/matriculadisciplina.ts`
* **Hooks Principais:**
  * `useMatriculasInfiniteQuery`: Busca paginada de matrículas.
  * `useMatriculaQuery`: Detalhe da matrícula.
  * `useMatriculaDisciplinasByMatriculaQuery`: Carrega as disciplinas nas quais o aluno está inscrito.
  * `useCreateMatriculaDisciplinaMutation`: Cria o vínculo de enturmação.
  * `useDeleteMatriculaDisciplinaMutation`: Remove o vínculo de enturmação.

### C. Componentes de UI
* **`matricula-card.tsx`** (`src/components/gerenciar/matricula/matricula-card.tsx`): Card de exibição do aluno, matrícula, série e data.
* **`matricula-form.tsx`** (`src/components/gerenciar/matricula/matricula-form.tsx`): Formulário controlado contendo seletores modais.

### D. Telas de Rotas
* **`matricula/index.tsx`**: Listagem de matrículas com busca.
* **`matricula/cadastro.tsx`**: Form controller para criar e editar matrículas.
* **`matricula/[id].tsx`**: Detalhes da matrícula e painel de gerenciamento de Enturmação.
