# AgencyOS V1.0 — Entrega técnica inicial

> **Status honesto:** esta entrega é uma **versão inicial utilizável**, e **não** a implementação integral dos 34 capítulos do prompt. Inclui login administrativo (usuário + senha), painel, 15 módulos de registros, financeiro básico, isolamento por organização, layout responsivo e esquema SQL. Algumas funcionalidades avançadas ainda são pendências registradas em `docs/PENDENCIAS.md`.

## 1. Requisitos

- Instale Node.js 20+ em https://nodejs.org/ e VS Code em https://code.visualstudio.com/.
- Crie um projeto novo em https://supabase.com/dashboard (plano adequado ao volume de uso).
- Tenha um computador com terminal e, para publicar, uma conta Vercel.

## 2. Criar banco de dados

No Supabase > **SQL Editor**, cole integralmente `supabase/migrations/001_initial.sql` e execute. **Não rode novamente uma migração já aplicada**: triggers e políticas poderão dar erro de já existir.

Confira no Table Editor as tabelas `organizations`, `profiles`, `memberships`, `records`, `transactions` e outras. Confirme que RLS está habilitado.

## 3. Configurar autenticação

Em Supabase > Authentication > Providers > Email, mantenha autenticação por senha disponível. Não é necessário confirmação de e-mail para os usuários gerados administrativamente com `email_confirm:true`. Em **Authentication > URL Configuration**, configure a URL local e de produção quando necessário.

O login da interface solicita apenas nome de usuário e senha. Por trás, o servidor resolve o nome do usuário, autentica via Supabase Auth e valida associação ativa com a agência. **Nunca** disponibilize cadastro público.

## 4. Variáveis de ambiente

Copie `.env.example` para `.env` na raiz do projeto e preencha:

```ini
VITE_SUPABASE_URL=https://SEU-PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=...chave-secreta-do-servidor...
LOGIN_RATE_LIMIT_SECRET=UMA_FRASE_ALEATORIA_DE_NO_MINIMO_32_CARACTERES
PORT=3001
```

**A URL NÃO é `https://supabase.com/dashboard/project/...`**. Ela precisa ser a URL da API do projeto. Encontre em Supabase > Project Settings > API.

`VITE_` significa que a variável é visível no código do navegador: **jamais use `VITE_` na service role**. Use a publishable key pública **apenas com RLS configurada**.

## 5. Criar os dois sócios

Execute no terminal da pasta do projeto:

```bash
npm install
npm run setup:partners
```

Informe nome de usuário, nome para exibição e uma senha forte para cada sócio. A senha é visível durante a digitação nesse script de configuração inicial; execute em um local privado. Não salve nem compartilhe essas senhas.

O script cria uma organização, se não houver nenhuma, e associa os dois sócios a ela. **Não o execute novamente se já tiver criado as contas.** Se houver múltiplas organizações no mesmo banco, o script escolhe a primeira: use um banco dedicado inicialmente.

## 6. Executar localmente

```bash
npm run dev
```

Abra `http://localhost:5173`. O comando inicia o Vite na porta 5173 e a API local na porta 3001.

Login: use exatamente o nome de usuário e a senha criados na etapa 5. Os dois sócios compartilham os registros da mesma organização.

Para parar: `Ctrl + C`. Para gerar o build de produção:

```bash
npm run build
npm test
```

## 7. Publicar na Vercel

Suba o repositório sem `.env` e sem `node_modules`. Na Vercel, importe o projeto, framework Vite, `npm run build`, saída `dist`.

Na Vercel > Project Settings > Environment Variables, configure **as quatro variáveis**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `LOGIN_RATE_LIMIT_SECRET`. Não adicione `PORT` na Vercel.

A rota `/api/login` é executada como função serverless. Nunca coloque segredos em arquivos públicos ou no GitHub. Após definir variáveis, faça novo deployment. Em Supabase, configure os endereços de aplicação permitidos, quando necessário.

## 8. Teste básico após implantação

1. Entre com cada uma das duas contas.
2. Crie um cliente e um projeto.
3. Lance uma receita e uma despesa, registre pagamentos e confira totais.
4. Faça logout e login novamente; dados devem persistir.
5. Em outro navegador, confira se ambos veem os mesmos registros.
6. Tente abrir a área financeira usando uma conta futura sem autorização.
7. Verifique no Supabase os registros e políticas RLS.

## 9. Atualizações e backups

Antes de modificar o banco em produção, exporte os dados e teste migrações em um projeto de homologação. Não execute `DROP` em produção sem entender o impacto. Dados financeiros devem passar por revisão humana.

Leia também `docs/PENDENCIAS.md`, `docs/SEGURANCA.md` e `docs/TESTES.md`.
