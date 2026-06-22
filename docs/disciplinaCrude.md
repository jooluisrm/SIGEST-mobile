# CRUD de Disciplinas

Este documento descreve a especificação técnica, regras de negócio e o comportamento do CRUD de **Disciplinas (Disciplina)** no aplicativo mobile `sigest-mobile`, integrando com o backend Laravel.

---

## 1. Endpoints Utilizados (Backend)

Todas as rotas de gerenciamento de disciplinas exigem autenticação do usuário via Sanctum (Bearer Token) e as roles `servidor` ou `admin`.

### A. Listar Todas as Disciplinas
* **Método:** `GET`
* **URL:** `/api/disciplinas`
* **Query Params:**
  - `page` (número da página, opcional, padrão: `1`)
* **Retorno de Sucesso (HTTP 200):**
  Usa o helper `successCollectionResponse`, que expõe os itens e a paginação como chaves irmãs na raiz do JSON:
  ```json
  {
    "data": [
      {
        "id": 1,
        "name": "Matemática",
        "area_conhecimento": "Exatas",
        "carga_horaria": "120h",
        "ementa": "Ementa...",
        "status": 1
      }
    ],
    "links": { ... },
    "meta": { ... },
    "status": true,
    "code": 200,
    "message": "Disciplinas encontradas com sucesso"
  }
  ```
  No frontend, os itens devem ser acessados diretamente de `response.data` (onde o primeiro `.data` é do Axios e o segundo `.data` é do nó raiz da resposta).

### B. Buscar Disciplinas por Nome
* **Método:** `GET`
* **URL:** `/api/disciplinas/value/{value}`
  - `{value}`: Termo de busca (mínimo de 3 caracteres).

### C. Criar Disciplina
* **Método:** `POST`
* **URL:** `/api/disciplinas`
* **Payload de Envio:** Ver a tipagem `CreateDisciplinaRequest`.

### D. Visualizar Disciplina por ID
* **Método:** `GET`
* **URL:** `/api/disciplinas/{id}`

### E. Atualizar Disciplina por ID
* **Método:** `PUT` ou `PATCH`
* **URL:** `/api/disciplinas/{id}`
* **Payload de Envio:** Ver a tipagem `UpdateDisciplinaRequest`.

### F. Excluir Disciplina por ID
* **Método:** `DELETE`
* **URL:** `/api/disciplinas/{id}`

---

## 2. Validação de Formulário (Zod + React Hook Form)

Os inputs do formulário de criação/edição devem seguir as regras de validação client-side via **Zod** no arquivo `src/schema/cadastro-disciplina.ts`:

* **`name` (Nome):** Obrigatório, string de 3 a 35 caracteres.
* **`area_conhecimento` (Área de Conhecimento):** Obrigatório, string de até 35 caracteres.
* **`carga_horaria` (Carga Horária):** Obrigatório, string (ex: `"80h"`, `"120 horas"`).
* **`ementa` (Ementa):** Obrigatório, string de até 500 caracteres.
* **`status` (Situação):** Booleano (ativo/inativo).

---

## 3. Tratamento de Erros de Validação 422 (Backend)

O backend do Laravel valida e retorna falhas estruturadas sob a chave `mensagem`:
```json
{
  "status" : false,
  "code" : 422,
  "mensagem" : {
    "name" : ["O campo nome deve ter pelo menos 3 caracteres."]
  }
}
```
O frontend mapeia estes erros e exibe-os sob os respectivos inputs no formulário de cadastro/edição.

---

## 4. Estrutura de Arquivos Proposta

### A. Tipagem TypeScript
* **Arquivo:** `src/types/disciplina.ts`
* **Conteúdo:** Interfaces representando `Disciplina`, payloads de request, respostas de sucesso e erros.

### B. Integração de API (React Query)
* **Arquivo:** `src/api/disciplina.ts`
* **Hooks a Implementar:**
  * `useDisciplinasInfiniteQuery`: Carrega disciplinas gerais paginadas, suportando busca debounced.
  * `useDisciplinaQuery`: Detalha uma disciplina por ID.
  * `useCreateDisciplinaMutation`: Cadastra nova disciplina.
  * `useUpdateDisciplinaMutation`: Atualiza disciplina existente.
  * `useDeleteDisciplinaMutation`: Exclui disciplina.

### C. Componentes de UI
* **`disciplina-card.tsx`** (`src/components/gerenciar/disciplina/disciplina-card.tsx`): Exibe o nome da disciplina, área de conhecimento, carga horária, status, e opcionalmente professor/turma se fornecidos.
* **`disciplina-form.tsx`** (`src/components/gerenciar/disciplina/disciplina-form.tsx`): Formulário controlado por React Hook Form contendo inputs para carga horária, nome, ementa e status.

### D. Telas de Rotas (Expo Router)
* **`disciplina/index.tsx`** (`app/(private)/gerenciar/disciplina/index.tsx`): Listagem das disciplinas com scroll infinito e busca por texto.
* **`disciplina/cadastro.tsx`** (`app/(private)/gerenciar/disciplina/cadastro.tsx`): Tela container para o formulário de cadastro e edição.
* **`disciplina/[id].tsx`** (`app/(private)/gerenciar/disciplina/[id].tsx`): Detalhes da disciplina (exibindo ementa completa, carga horária, status e botões de editar e excluir).
