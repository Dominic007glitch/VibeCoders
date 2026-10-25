# Escopo entregue versus planejamento mestre

## Implementado nesta primeira entrega
- Base React/Vite com layout colorido, modo claro/escuro e navegação mobile.
- Login privado por usuário e senha, contas provisionadas administrativamente e rate limit progressivo básico usando Supabase.
- Tabelas com políticas RLS para organizações, usuários, cadastros e finanças.
- Tela inicial com cartões e gráfico financeiro de movimentações registradas.
- CRUD genérico de 15 módulos: clientes, CRM, propostas, projetos, ideias, rascunhos, prompts, tarefas, agenda, serviços, contratos, manutenção, conhecimento, metas e horas.
- Conversão manual de proposta aprovada em um novo projeto; referências ao cliente persistidas.
- Financeiro: receitas, despesas, status, pagamentos parciais, saldos, cancelamento, vinculação a cliente/projeto.
- Simulação visual de rateio 50/50 sobre recebimentos e pagamentos registrados, sem considerar distribuição real.
- Alteração de senha e nome, identidade da agência, RLS e bucket privado.

## Ainda NÃO implementado (não use para operação crítica antes de concluir)
- Rateio persistente por projeto, aprovação de distribuições e retiradas entre sócios (tabelas `project_shares` e `distributions` são apenas preparatórias).
- Rateio real de lucro com provisões, impostos e reservas; lançamentos financeiros não substituem contabilidade.
- Livro-razão financeiro, conciliação, parcelamento automático, recorrência, proteção transacional de dupla cobrança.
- Fluxos completos integrados do CRM até faturamento, aprovação de propostas com proteção contra duplicações.
- Editor rico e versionamento de anotações; votação, comentários e colaboração específica entre ideias.
- Kanban arrastável, tarefas com subtarefas e checklists, calendário mensal/semanal e cronômetro.
- Exportações PDF/CSV e importação de backups; modelos de propostas e contratos.
- Upload de anexos pela interface (bucket e políticas preparados).
- Notificações em tempo real, alertas automáticos e integrações externas.
- Cadastro e administração de funcionários via interface; auditoria extensa e aprovação conjunta.
- Dashboard rearranjável, personalização completa de marca e múltiplas organizações administradas.
- Paginação de longo alcance nos módulos; listagens têm limite de 250/300/500 registros.
- Testes E2E e testes de RLS em um projeto real; testes de carga.

## Limitações de segurança a corrigir antes de expandir equipe
- A política `records_update` atualmente permite a qualquer membro ativo editar registros gerais. É necessário criar regras por papel/módulo para novos funcionários.
- As políticas financeiras autorizam papéis `partner`, `manager`, `finance`; exigem granularidade adicional para aprovações e alterações monetárias.
- O rate limiter conta tentativas por combinação IP+usuário e não impede distribuição entre vários IPs. É necessário reforçar defesa anti-abuso no edge/provedor.
- `paid_cents` pode ser alterado por usuários financeiros com acesso direto à API; precisa de RPC transacional protegida e trilha de pagamentos separada para uso financeiro sério.
- Recuperação de conta exige administrador com acesso seguro ao Supabase Auth; não há fluxo de recuperação self-service sem e-mail.
- Usuários desativados podem ter sessões ativas até atualização/expiração; revogação administrativa e verificação contínua devem ser fortalecidas.
- Os IDs associados de cliente e projeto não têm garantia de pertencer à mesma organização por chave composta; fortalecer integridade na migração seguinte.

**Este projeto é um ponto de partida verificável, não um ERP financeiro pronto para produção.**
