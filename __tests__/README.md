# Testes

Pasta raiz dos testes automatizados do `sigest-mobile`.

Organização padrão:

- `api/`: chamadas de backend, hooks de query e mutation
- `screens/`: telas do Expo Router
- `components/`: componentes reutilizaveis e formularios
- `hooks/`: hooks puros ou de contexto
- `utils/`: funcoes auxiliares
- `mocks/`: mocks compartilhados de API, query client e dados

Convenção de nome:

- `index.test.tsx` para telas de rota
- `cadastro.test.tsx` para fluxos de formulário
- `nome-da-funcao.test.ts` para API, hooks e utils
- `nome-do-componente.test.tsx` para componentes visuais
