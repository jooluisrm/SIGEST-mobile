# CRUD de Professores (Listagem, Busca e Cadastro)

Este documento descreve a especificação técnica e a implementação das rotas, paginação, regras de validação e o funcionamento do CRUD de Professores no aplicativo mobile.

---

## 1. Endpoints Utilizados (Backend)

Todas as rotas de gerenciamento de professores exigem autenticação do usuário via Sanctum (Bearer Token) e que o usuário possua as roles `servidor` ou `admin`.

### A. Listar Todos os Professores
* **Método:** `GET`
* **URL:** `/api/professors`
* **Query Params:**
  - `page` (número da página, opcional, padrão: `1`)

### B. Buscar Professores por Nome ou CPF
* **Método:** `GET`
* **URL:** `/api/professors/value/{value}`
  - `{value}`: Termo de busca (mínimo de 3 caracteres).
* **Query Params:**
  - `page` (número da página, opcional, padrão: `1`)

### C. Cadastrar Professor
* **Método:** `POST`
* **URL:** `/api/professors`
* **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
* **Payload de Envio:** Ver a tipagem `CreateProfessorRequest`.

---

## 2. Busca e Listagem no Frontend (React Query)

Para otimizar o carregamento e evitar erros desnecessários, a busca do frontend é reativa:

1. **Busca Vazia ou < 3 caracteres:** O hook `useProfessorsQuery` consome a **Listagem Geral** (`GET /api/professors?page=N`).
2. **Busca >= 3 caracteres:** O hook chaveia automaticamente para a **Rota de Busca** (`GET /api/professors/value/{value}?page=N`).
3. **Tratamento de Lista Vazia:** Se o backend retornar status `200` com `data: null`, convertemos para um array vazio `[]` no mapeamento dos dados da tela, garantindo que o componente `ListEmptyComponent` da `FlatList` seja renderizado.

---

## 3. Cadastro de Professor

### Regras de Validação Estritas do Laravel (StoreProfessorRequest)
* **`matricula_adpm`:** Única e obrigatória na tabela de professores.
* **`codigo_disciplina`:** Obrigatória.
* **Dados de Usuário (`users`):** Herdadas do `UserValidationRules`.

> [!WARNING]
> **Inconsistência Crítica Banco de Dados vs Validação (Tratativa no Front):**
> Os campos `nome_pai` e `telefone` estão marcados como `nullable` na validação do backend, porém na migration do banco de dados não aceitam valores nulos (gerando erro 500 no servidor).
> **Tratativa:** O frontend torna os campos `nomePai` e `telefone` obrigatórios em sua validação cliente no formulário, prevenindo falhas de banco de dados.

### Formato de Payload e Conversões
* **CPF:** O CPF é formatado automaticamente em tempo real no input com a máscara `999.999.999-99`. Antes de ser enviado ao servidor, ele é higienizado (`dados.cpf.replace(/\D/g, "")`) enviando apenas números puros.
* **RG:** O RG é formatado automaticamente em tempo real com a máscara `99.999.999-9` ou `99.999.999-X` (suportando dígito de verificação alfabético). É higienizado antes de ser postado.
* **Telefone e Celular:** Ambos recebem máscara dinâmica em tempo real no formato brasileiro `(99) 9999-9999` (para telefone fixo) e `(99) 99999-9999` (para celulares). Suas formatações são removidas (`replace(/\D/g, "")`) antes do envio à API.
* **Data de Nascimento:** O input aplica uma máscara em tempo real formatando para `DD/MM/AAAA`. O envio converte a string para o formato ISO `YYYY-MM-DD` esperado.
* **Deficiência:** Caso a opção "Possui alguma deficiência?" seja "Não", é enviado `"Nenhuma"`. Caso seja "Sim", envia-se a descrição digitada em `qualDeficiencia`.
* **Funções Utilitárias:** As funções de máscara residem em [masks.ts](file:///c:/Users/joaol/Documents/React%20Native/sigest-mobile/src/utils/masks.ts).

### Tratamento de Erro de Validação 422
Em vez do tradicional `errors` do Laravel, a API customizada retorna as mensagens sob a chave **`mensagem`** (singular, em português):
```json
{
  "status": false,
  "code": 422,
  "mensagem": {
    "cpf": ["O campo cpf é inválido."],
    "email": ["O campo email já está em uso."],
    "matricula_adpm": ["O campo matricula ADPM já está em uso."]
  }
}
```
**Mapeamento Inline:** O formulário mapeia o objeto `mensagem` do backend (que usa formato snake_case) para os campos equivalentes em camelCase no frontend, exibindo mensagens de erro vermelhas diretamente sob cada campo com problema e impedindo envios com dados duplicados ou inválidos.

---

## 4. Tipos TypeScript e APIs do Frontend

Os tipos TypeScript estão definidos em [professor.ts](file:///c:/Users/joaol/Documents/React%20Native/sigest-mobile/src/types/professor.ts):
* `CreateProfessorRequest`: Estrutura do payload de cadastro do professor.
* `CreateProfessorSuccessResponse`: Sucesso (201 Created) retornando dados unificados do usuário e do professor.
* `ValidationErrorResponse`: Resposta de validação (422) contendo o dicionário com a chave `mensagem`.

A integração está centralizada em [professor.ts (API)](file:///c:/Users/joaol/Documents/React%20Native/sigest-mobile/src/api/professor.ts):
```typescript
export async function createProfessor(payload: CreateProfessorRequest) {
  const { data } = await api.post<CreateProfessorSuccessResponse>("/professors", payload);
  return data;
}

export function useCreateProfessorMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProfessor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professors"] });
    },
  });
}
```
