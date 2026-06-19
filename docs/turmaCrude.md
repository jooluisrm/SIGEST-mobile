# CRUD de Turmas (Classroom)

Este documento descreve a especificação técnica, regras de negócio e o comportamento do CRUD de **Turmas (Classroom)** no aplicativo mobile `sigest-mobile`, integrando com o backend Laravel.

---

## 1. Endpoints Utilizados (Backend)

Todas as rotas de gerenciamento de turmas exigem autenticação do usuário via Sanctum (Bearer Token) e as roles `servidor` ou `admin`.

### A. Listar Todas as Turmas
* **Método:** `GET`
* **URL:** `/api/classrooms`
* **Query Params:**
  - `page` (número da página, opcional, padrão: `1`)
* **Particularidade de Envelopamento:**
  A listagem geral envelopa os dados paginados em um nó extra `data`. A estrutura retornada é:
  ```json
  {
    "status": true,
    "code": 200,
    "message": "Turmas encontradas com sucesso",
    "data": {
      "data": [
        {
          "id": 1,
          "period_id": 2,
          "name": "6ª ano - Turma A",
          "max_students": 30,
          "shift": "Matutino",
          "status": 1
        }
      ],
      "links": { ... },
      "meta": { ... }
    }
  }
  ```
  No frontend, os itens devem ser lidos de `response.data.data` em vez de `response.data`.

### B. Buscar Turmas por Nome
* **Método:** `GET`
* **URL:** `/api/classrooms/value/{value}`
  - `{value}`: Termo de busca (mínimo de 3 caracteres).

### C. Listar Turmas por Série (Period)
* **Método:** `GET`
* **URL:** `/api/classrooms/{serie_id}/turmas-por-serie`
* **Descrição:** Retorna a lista contendo as turmas associadas a uma série escolar. Útil para dropdowns em tempo real.

### D. Criar Turma
* **Método:** `POST`
* **URL:** `/api/classrooms`
* **Payload de Envio:** Ver a tipagem `CreateClassroomRequest`.

### E. Visualizar Turma por ID
* **Método:** `GET`
* **URL:** `/api/classrooms/{id}`

### F. Atualizar Turma por ID
* **Método:** `PUT`
* **URL:** `/api/classrooms/{id}`
* **Payload de Envio:** Ver a tipagem `UpdateClassroomRequest`.

### G. Excluir Turma por ID
* **Método:** `DELETE`
* **URL:** `/api/classrooms/{id}`

### H. Enturmação Automática (Gerar Turmas Automaticamente)
* **Método:** `GET`
* **URL:** `/api/periods/{period_id}/generate-classrooms`
* **Query Params (Obrigatórios):**
  - `max_students` (int): Limite máximo de alunos por turma (ex: `30`).
  - `shift` (string): Turno das turmas (`"Matutino"`, `"Vespertino"` ou `"Noturno"`).
* **Descrição:** Distribui automaticamente alunos da série que estão sem turma em novas turmas geradas de forma sequencial.

---

## 2. Validação de Formulário (Zod + React Hook Form)

Os inputs do formulário de criação/edição devem seguir as regras de validação client-side via **Zod** no arquivo `src/schema/cadastro-turma.ts`:

* **`period_id` (Série):** Inteiro positivo obrigatório.
* **`name` (Nome da Turma):** Obrigatório, string de 5 a 30 caracteres. Deve ser único (validado também no backend).
* **`max_students` (Capacidade Máxima):** Inteiro positivo, valor entre 5 e 60.
* **`shift` (Turno):** Obrigatório, com valores restritos a `"Matutino"`, `"Vespertino"` ou `"Noturno"`.
* **`status` (Situação):** Booleano (ativo/inativo).

---

## 3. Tratamento de Erros de Validação 422 (Backend)

O backend do Laravel valida e retorna falhas estruturadas sob a chave `mensagem` (exemplo):
```json
{
  "status": false,
  "code": 422,
  "mensagem": {
    "name": ["O nome informado já está em uso."],
    "max_students": ["A capacidade máxima de estudantes deve estar entre 5 e 60."]
  }
}
```
O frontend deve mapear estes retornos e exibi-los abaixo de cada input no formulário de cadastro/edição.

---

## 4. Estrutura de Arquivos Proposta

### A. Tipagem TypeScript
* **Arquivo:** `src/types/turma.ts`
* **Conteúdo:** Interfaces representando `Classroom`, payloads de request, respostas de sucesso paginadas e erros.

### B. Integração de API (React Query)
* **Arquivo:** `src/api/turma.ts`
* **Hooks a Implementar:**
  * `useClassroomsInfiniteQuery`: Carrega turmas gerais paginadas, suportando busca debounced.
  * `useClassroomsByPeriodQuery`: Carrega turmas filtradas por Série.
  * `useClassroomQuery`: Detalha uma turma por ID.
  * `useCreateClassroomMutation`: Cadastra nova turma.
  * `useUpdateClassroomMutation`: Atualiza turma existente.
  * `useDeleteClassroomMutation`: Exclui turma.
  * `useGenerateClassroomsMutation`: Realiza a enturmação automática.

### C. Componentes de UI
* **`turma-card.tsx`** (`src/components/gerenciar/turma/turma-card.tsx`): Exibe o nome da turma, turno, capacidade máxima de alunos e status.
* **`turma-form.tsx`** (`src/components/gerenciar/turma/turma-form.tsx`): Formulário controlado por React Hook Form contendo seletor de séries ativas, inputs de capacidade, turno e status.

### D. Telas de Rotas (Expo Router)
* **`turma/index.tsx`** (`app/(private)/gerenciar/turma/index.tsx`): Listagem das turmas com scroll infinito, busca por texto e atalho para o assistente de Enturmação Automática.
* **`turma/cadastro.tsx`** (`app/(private)/gerenciar/turma/cadastro.tsx`): Tela container para o formulário de cadastro e edição.
* **`turma/[id].tsx`** (`app/(private)/gerenciar/turma/[id].tsx`): Detalhes da turma (exibindo série vinculada, turno, status e botão de exclusão destrutiva).

---

## 5. ⚠️ Alertas de Integração do Backend (Para Correções Futuras)

Durante a integração do módulo de Turmas, identificamos as seguintes pendências/melhorias necessárias no backend Laravel:

### A. Paginação Incompleta na Rota de Index (Falta de links/meta)
* **Problema:** O método `index()` no `ClassroomController` retorna usando o helper `successJsonResponse()`, serializando o recurso como um array plano simples e omitindo as chaves `links` e `meta`. Com isso, o aplicativo móvel fica impossibilitado de ler a paginação e desabilita a rolagem infinita.
* **Correção no Backend:** Altere a linha de retorno do método `index()` no [ClassroomController.php](file:///c:/Users/joaol/Documents/SIGEST-backend/app/Http/Controllers/ClassroomController.php) para utilizar `successCollectionResponse`:
  ```php
  return $this->successCollectionResponse('Turmas encontradas com sucesso', $resource);
  ```

### B. Rota de Pesquisa Ausente (search)
* **Problema:** A rota `GET /api/classrooms/value/{value}` está registrada nas rotas, mas o método `search()` correspondente não está implementado em `ClassroomController`, fazendo com que a barra de busca no aplicativo lance um erro 500.
* **Correção no Backend:** Importe as classes `SearchRequest` e `SearchService` e as configure no [ClassroomController.php](file:///c:/Users/joaol/Documents/SIGEST-backend/app/Http/Controllers/ClassroomController.php):
  * **Imports:**
    ```php
    use App\Http\Requests\SearchRequest;
    use App\Services\SearchService;
    use Illuminate\Http\JsonResponse;
    ```
  * **Injeção no construtor:**
    ```php
    protected $classroomService;
    protected $searchService;

    public function __construct(ClassroomService $classroomService, SearchService $searchService)
    {
        $this->classroomService = $classroomService;
        $this->searchService = $searchService;
    }
    ```
  * **Método `search()`:**
    ```php
    public function search(SearchRequest $request): JsonResponse
    {
        try {
            $validatedValue = $request->validated();
            $resource = $this->searchService->searchName(Classroom::class, ClassroomResource::class, $validatedValue);
            return $this->successCollectionResponse('Turmas encontradas com sucesso', $resource);
        } catch (Throwable $e) {
            return $this->errorResponse('Não foi possível processar a solicitação', $e, 500);
        }
    }
    ```

### C. Validação de Unicidade na Edição (StoreClassroomRequest)
* **Problema:** O request `StoreClassroomRequest` valida a regra `'name' => 'unique:classrooms,name|...'` rigidamente. Se o usuário atualizar qualquer outro campo (como capacidade máxima) mantendo o mesmo nome, o backend rejeita a requisição alegando nome em uso.
* **Correção no Backend:** Exclua o ID do registro atual na validação ou implemente uma lógica separada para o `update` no request.

