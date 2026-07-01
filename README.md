# SIGEST - Sistema de Gestão Escolar (Mobile)

👋 Bem-vindo ao repositório do aplicativo mobile do SIGEST, o nosso Sistema de Gestão Escolar. Esta aplicação foi desenvolvida com o objetivo de fornecer uma interface moderna, rápida e intuitiva para administrar as operações de uma instituição de ensino diretamente do seu smartphone ou tablet.

Este projeto foi construído utilizando **[React Native](https://reactnative.dev/)** e **[Expo](https://expo.dev/)**, permitindo a criação de aplicativos nativos de alto desempenho a partir de uma única base de código.

## ✨ Funcionalidades Principais

* 📱 Design responsivo e otimizado para dispositivos móveis (Android e iOS).
* 🔐 **Autenticação:** Login e Recuperação de Senha.
* 👤 **Gestão de Usuários:** Cadastro e administração de usuários do sistema.
* 🧑‍🎓 **Gestão de Alunos:** Cadastro de alunos e controle de matrículas.
* 🧑‍🏫 **Gestão de Professores:** Cadastro de professores e módulo dedicado (acesso a turmas e diários).
* 🏫 **Estrutura Acadêmica:** Gerenciamento de Cursos, Séries, Turmas, Disciplinas e Ofertas de Disciplinas.
* 📅 **Períodos Letivos:** Controle e gestão dos períodos letivos da instituição.
* 📝 **Avaliações e Notas:** Lançamento e acompanhamento das notas dos alunos.
* 📋 **Frequência:** Controle de presença e registro de faltas.

## 🚀 Tecnologias Utilizadas

Este projeto foi desenvolvido com as seguintes tecnologias e ferramentas:

* **[React Native](https://reactnative.dev/)**: Framework para construção de aplicativos nativos usando React.
* **[Expo](https://expo.dev/)**: Plataforma universal de desenvolvimento.
* **[Expo Router](https://docs.expo.dev/router/introduction/)**: Roteamento baseado em arquivos para o aplicativo.
* **[TypeScript](https://www.typescriptlang.org/)**: Superset do JavaScript que adiciona tipagem estática.
* **[Axios](https://axios-http.com/)**: Cliente HTTP para as requisições à API.
* **[React Query](https://tanstack.com/query/latest/)**: Biblioteca para gerenciamento e sincronização de estados assíncronos.
* **[React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)**: Para validação e gerenciamento de formulários.

## ⚙️ Como Rodar o Projeto Localmente

Para executar este projeto em seu ambiente de desenvolvimento, siga os passos abaixo.

### ✅ **Pré-requisitos**

* Ter o **[Git](https://git-scm.com/)** instalado para clonar o repositório.
* Ter o **[Node.js](https://nodejs.org/en)** (versão 18.x ou superior) instalado.
* Instalar o aplicativo **[Expo Go](https://expo.dev/client)** no seu celular (Android ou iOS) para testar em um dispositivo físico **OU** ter um emulador Android/simulador iOS configurado no seu computador.
* Garanta que a **API backend do SIGEST** esteja rodando localmente (e acessível na mesma rede, caso teste no celular físico). As instruções de instalação dela estão em seu **[respectivo repositório](https://github.com/Pedro-g2/SIGEST-backend)**.

### 🔢 **Passo a Passo**

1.  **Clone o repositório**:
    ```bash
    git clone https://github.com/jooluisrm/sigest-mobile
    ```

2.  **Acesse o diretório do projeto:**
    ```bash
    cd sigest-mobile
    ```

3.  **Instale as dependências** (escolha seu gerenciador de pacotes preferido):
    ```bash
    npm install
    # ou
    yarn install
    # ou
    pnpm install
    ```

4.  🔑 **Configure as Variáveis de Ambiente**:
    * Na raiz do projeto, crie um arquivo chamado `.env` (você pode se basear em um `.env.example`, se houver).
    * Adicione a URL base da sua API. 
    * **IMPORTANTE**: Se for testar no celular físico (via Expo Go), o aplicativo rodando no celular não conseguirá acessar `localhost` do seu computador. Você deve colocar o **Endereço IP** do seu computador na rede Wi-Fi (ex: `192.168.1.X`) e rodar o backend permitindo conexões externas (ex: `php artisan serve --host=0.0.0.0`).
    ```env
    EXPO_PUBLIC_API_URL=http://<SEU_IP_LOCAL>:8000/api
    ```

5.  **Execute o servidor de desenvolvimento do Expo:**
    ```bash
    npm run start
    # ou
    npx expo start -c
    ```

6.  **Acesse a aplicação:**
    🎉 O Expo abrirá um menu interativo no seu terminal com um QRCode. Você pode:
    * **Escanear o QR Code** com a câmera do seu celular (iOS) ou com o aplicativo **Expo Go** (Android) para rodar o app no dispositivo físico.
    * Pressionar `a` no terminal para abrir em um Emulador Android.
    * Pressionar `i` no terminal para abrir em um Simulador iOS.
