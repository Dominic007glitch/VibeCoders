# Segurança e implantação

- Nunca inclua `.env` no ZIP de compartilhamento, em commit ou em mensagens. `.env.example` contém somente placeholders.
- Chaves service role ficam exclusivamente em `api/login.js`/servidor e script CLI. Nenhum componente React importa essas chaves.
- O login usa Supabase Auth, não compara senhas no navegador. Os identificadores de e-mail internos são criados administrativamente.
- RLS: confirme no Supabase que todas as tabelas privadas estão com RLS ligada e não têm políticas indiscriminadas.
- `login_attempts` e `audit_log` não têm INSERT/UPDATE via clientes autenticados, apenas via service role e triggers.
- Senhas fortes de no mínimo 12 caracteres na criação de sócios. Geração de credenciais sem e-mail válido requer recuperação administrativa.
- Para arquivos, use caminhos `org_id/nome_arquivo` no bucket `agency-files`; a interface de upload não está implementada.
- Revise autenticação e permissões de funcionários antes de criar novas contas, pois RBAC ainda é inicial.
- Se serviço de login retornar 503, verifique migração 001, env server e logs do servidor.
- Um atacante com a service role consegue ignorar RLS. Rotacione imediatamente chave comprometida.
