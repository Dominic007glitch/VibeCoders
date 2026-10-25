# Checklist de testes

## Testes executáveis localmente

```bash
npm test
npm run build
```

## Testes manuais obrigatórios com Supabase configurado

- [ ] Executar SQL 001 em projeto limpo.
- [ ] Criar contas de sócios e autenticar ambas.
- [ ] Tentar senha incorreta 7 vezes e confirmar rate limit.
- [ ] Sair, abrir nova guia e voltar com senha correta.
- [ ] Criar e editar cliente e projeto; validar persistência.
- [ ] Aprovar proposta e converter em projeto; testar relação.
- [ ] Criar despesa parcial, registrar restante e validar saldos.
- [ ] Cancelar registro financeiro e validar que não soma nos cartões.
- [ ] Comparar visibilidade de registros para os dois sócios.
- [ ] Verificar que uma identidade fora da organização não consegue listar dados.
- [ ] Confirmar que o bucket é privado e não aceita uploads anônimos.
- [ ] Verificar tema claro/escuro e usabilidade no celular.
- [ ] Inspecionar requisições; evitar repetição excessiva e erros silenciosos.

Testes manuais marcados acima **não foram executados nesta entrega** sem projeto Supabase e credenciais reais.
