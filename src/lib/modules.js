export const modules=[
 {id:'clients',label:'Clientes',icon:'Users',statuses:['Ativo','Prospecto','Inativo'],hint:'Cadastre seus clientes e respectivos contatos.'},
 {id:'leads',label:'CRM e oportunidades',icon:'Handshake',statuses:['Novo contato','Atendimento','Proposta enviada','Negociação','Fechado','Perdido'],hint:'Acompanhe os potenciais compradores.'},
 {id:'proposals',label:'Propostas',icon:'FileText',statuses:['Rascunho','Enviada','Em negociação','Aprovada','Recusada'],money:true,hint:'Orçamentos comerciais que podem ser convertidos em projetos.'},
 {id:'projects',label:'Projetos',icon:'FolderKanban',statuses:['Planejamento','Em desenvolvimento','Em revisão','Em testes','Entregue','Pausado'],money:true,hint:'Gerencie entregas, clientes e valores.'},
 {id:'ideas',label:'Ideias',icon:'Lightbulb',statuses:['Nova','Em análise','Aprovada','Em desenvolvimento','Concluída'],hint:'Ideias compartilhadas para serviços e produtos.'},
 {id:'notes',label:'Rascunhos',icon:'NotebookPen',statuses:['Novo','Em desenvolvimento','Finalizado'],hint:'Guarde textos, esboços e planejamentos.'},
 {id:'prompts',label:'Biblioteca de prompts',icon:'Braces',statuses:['Ativo','Arquivado'],hint:'Seus prompts preferidos para Vibe Coding.'},
 {id:'tasks',label:'Tarefas',icon:'ListTodo',statuses:['Pendente','Em andamento','Concluída'],hint:'Organize atividades, prazos e responsáveis.'},
 {id:'events',label:'Agenda',icon:'CalendarDays',statuses:['Agendado','Realizado','Cancelado'],hint:'Reuniões, retornos e lembretes.'},
 {id:'services',label:'Serviços e preços',icon:'Package',statuses:['Ativo','Inativo'],money:true,hint:'Catálogo de serviços com preços sugeridos.'},
 {id:'contracts',label:'Contratos',icon:'ScrollText',statuses:['Rascunho','Ativo','Finalizado','Cancelado'],hint:'Controle de contratos e acordos.'},
 {id:'maintenance',label:'Manutenção',icon:'Wrench',statuses:['Ativo','Pausado','Cancelado'],money:true,hint:'Planos e serviços recorrentes.'},
 {id:'knowledge',label:'Base de conhecimento',icon:'BookOpen',statuses:['Publicado','Rascunho'],hint:'Erros e soluções técnicas aprendidas.'},
 {id:'goals',label:'Metas',icon:'Target',statuses:['Em andamento','Concluída','Cancelada'],money:true,hint:'Objetivos comerciais e financeiros.'},
 {id:'time_entries',label:'Controle de horas',icon:'Timer',statuses:['Registrado','Validado'],hint:'Apontamentos de tempo por projeto.'},
];
export const byId=Object.fromEntries(modules.map(m=>[m.id,m]));
