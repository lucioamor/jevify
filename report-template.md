# JEVIFY_REPORT — template de saída

Formato de referência do relatório que o `/jevify` produz. Serve tanto para a variante Lovable (devolvido no chat) quanto para a Claude Code (escrito como `JEVIFY_REPORT.md`). Preencha; não invente números.

---

## Resumo

`N` call-sites de IA em runtime escaneados · `X` candidatos a JEV · `Y` geração (mantidos) · `Z` código determinístico · `W` outros.

## Inventário

| file:line | propósito | classificação | primitive | risco | por quê |
|---|---|---|---|---|---|
| `supabase/functions/triage/index.ts:42` | roteia ticket | JEV_CANDIDATE | Choice | LOW | usa só o rótulo da categoria, não texto |
| `supabase/functions/reply/index.ts:15` | escreve resposta ao cliente | GENERATION_REQUIRED | — | — | saída é prosa enviada ao usuário |
| `src/api/validate.ts:8` | valida formato de email | DETERMINISTIC_CODE | — | — | regra exata, não precisa de IA |

## Candidatos (detalhe)

### `supabase/functions/triage/index.ts:42`
```
current:      LLM classifica o ticket em [comercial, suporte, cancelamento] e devolve JSON
recommended:  Choice["comercial","suporte","cancelamento","outro"]
              state: { mensagem, canal, plano_do_cliente }
              question: intent do ticket
effect:       hipótese de menor latência / menor custo de IA em runtime; validar com medições
architecture: decisão com JEV → confidence gate (limiar a validar) → fallback LLM ou revisão humana
risk:         LOW
next step:    planejar implementação e validação em etapa separada do diagnóstico
```

## Mantidos como geração (não são candidatos)
- `supabase/functions/reply/index.ts:15` — gera texto de resposta ao cliente. Correto no LLM.
- `supabase/functions/summarize/index.ts:9` — resume histórico. Correto no LLM.

## Rodapé
- Referência do projeto: https://github.com/lucioamor/jevify
- Jev (TypeSafe) está em early access — padrão a adotar, não dependência a assumir hoje.
- Todos os "effect" são **direção**, não promessa. Valide accuracy/latency/custo/fallback em shadow mode antes de qualquer claim.
- Próximo passo por candidato: planejar a implementação e validar os resultados; essa etapa está fora da skill básica de diagnóstico.
