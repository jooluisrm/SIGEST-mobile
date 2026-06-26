# Módulo do Professor (Dashboard e Detalhes da Turma)

Este documento descreve a arquitetura, estrutura de navegação, fluxos de dados e testes do **Módulo do Professor**, implementado de forma 100% isolada no frontend (sem alterações de código no repositório do backend).

---

## 1. Visão Geral

O módulo do professor visa segmentar a experiência do usuário quando a conta autenticada possui o papel `professor` (e não tem permissões administrativas de `admin` ou `servidor`).

* **Home Screen:** Identifica dinamicamente a role `professor`. Em vez de renderizar as opções gerais de gerenciamento, renderiza o dashboard "Minhas Turmas e Disciplinas".
* **Visualização da Turma:** Ao selecionar uma turma/disciplina, o professor é direcionado para uma navegação em abas (Tab Navigator) própria da turma, com abas para Informações Gerais, Lançamento de Atividades/Notas e Lançamento de Frequência.

---

## 2. Estrutura de Navegação (Expo Router)

As rotas são aninhadas no grupo privado `(private)` utilizando o roteador dinâmico do Expo Router:

```text
app/(private)/
  ├── home.tsx                    # Home Screen (diferencia telas por Role)
  ├── _layout.tsx                 # Layout geral ocultando a aba turma/[id]
  └── turma/
        └── [id]/
              ├── _layout.tsx     # Tab Navigator com estilo verde (#52B28B) e Header com botão voltar
              ├── index.tsx       # Aba 1: Detalhes da Disciplina e Relação de Alunos
              ├── atividades.tsx  # Aba 2: CRUD de Atividades (Zod) e Quadro de Notas (GradeStudentRow)
              └── frequencia.tsx  # Aba 3: Registro de Frequência Diária (StudentAttendanceRow)
```

---

## 3. Fluxo de Dados e Integração de APIs

### A. Consolidação e Filtro de Ofertas do Professor
Como o backend não possui um endpoint exclusivo e aberto para professores listarem suas disciplinas ofertadas (`OfertaDisciplina`), o frontend resolve essa listagem da seguinte forma:
1. O hook `useProfessorOfertasQuery` dispara a função `getOfertasByProfessor`.
2. Essa função faz uma requisição inicial para a rota paginada `/api/oferta-disciplinas` para ler a página 1 e descobrir o total de páginas (`last_page`) nos metadados.
3. Se houver mais páginas, faz requisições paralelas (concorrentes) via `Promise.all` para obter o restante das ofertas.
4. Consolida todas as ofertas de disciplinas e filtra localmente onde `offering.professor.id_user === loggedInUserId`.
5. Retorna o resultado unificado para a tela Home.

### B. Listagem de Alunos
Consome o endpoint `/api/matricula-disciplinas/oferta/{ofertaId}` que retorna todos os alunos matriculados na oferta de disciplina correspondente.

### C. Gestão de Atividades e Notas
* **Listagem:** Obtida da rota `/api/atividades/oferta/{ofertaId}`.
* **Cadastro:** Utiliza um formulário com **React Hook Form** e validações robustas do **Zod** (`cadastroAtividadeSchema`). Os dados são enviados para `POST /api/atividades`.
* **Grades (Notas):** Ao acessar o lançamento de notas de uma atividade, a tela lê os dados de notas prévios da rota `/api/nota-atividades/atividade/{atividadeId}` e cruza-os com a lista de alunos da turma. O professor insere notas de 0 a 10 no componente `GradeStudentRow`. Ao salvar, o app faz requisições individuais de criação (`POST`) ou edição (`PUT`) conforme o estado prévio no banco de dados.

### D. Registro de Chamada (Frequência)
Pre-selecionada para a oferta, a tela permite selecionar qualquer data. Exibe cada aluno com a sua respectiva situação de chamada (P para presente, F para falta) e suporta justificativa de ausência em modal dedicada. A gravação é realizada chamando sequencialmente os endpoints de frequência com um progresso de barra visual.

---

## 4. Validação Local de Formulários (Zod)

O formulário de criação de atividades é estritamente validado com o esquema `src/schema/cadastro-atividade.ts`:
* **titulo:** String obrigatória de 3 a 100 caracteres.
* **tipo:** String obrigatória contendo o tipo (ex: "Prova", "Trabalho").
* **data_inicio / data_fim:** Validadas como datas no formato AAAA-MM-DD.
* **descricao:** String obrigatória de 5 a 500 caracteres.
* **Refinement:** Valida se a data de encerramento (`data_fim`) é igual ou posterior à data de início (`data_inicio`).

---

## 5. Testes Unitários

Testes implementados em `__tests__/`:
1. **API de Oferta:** `__tests__/api/ofertadisciplina/ofertadisciplina-professor.test.ts` valida a busca de ofertas, consolidação de páginas e filtragem pelo ID do professor.
2. **Abas do Roteamento:** `__tests__/screens/turma/turma-tabs.test.tsx` valida a renderização correta das três abas e seus estados de carregamento (skeletons e spinners).
