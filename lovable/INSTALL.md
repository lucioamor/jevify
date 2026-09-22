# JEVify Diagnóstico no Lovable

`/jevify` é a skill básica **read-only** do projeto JEVify. Audita um projeto Lovable e identifica chamadas de LLM generativo em runtime que podem ser candidatas a decisões estruturadas com JEV. Produz um relatório; não altera o app.

## Instalação (workspace Lovable)

Importe o repositório público em **Settings → Skills → Add → Import from GitHub**:

```text
https://github.com/lucioamor/lovable-skill-jevify
```

Use o repositório individual acima, que contém `SKILL.md` na raiz. Alternativas:

1. **Upload do SKILL.md** — em *Workspace → Skills → Add skill → Upload*, envie `jevify/lovable/SKILL.md`.
2. **Colar o conteúdo** — *Add skill → Create*, cole o conteúdo do `SKILL.md` (frontmatter + corpo).
3. **Pedir ao Lovable para gerar** — cole o corpo e peça "crie uma skill a partir disto"; confira se o frontmatter (`name: jevify`, `description`) ficou intacto.

Uma vez adicionada, fica disponível para todo o workspace via `/jevify`.

## Uso

Dentro de um projeto Lovable, no chat do builder:
```
/jevify
```
ou: *"audite este app para custo de IA em runtime"*, *"onde estou gastando crédito de IA à toa?"*.

O agente vai:
1. Localizar as chamadas de IA em runtime (Edge Functions, chamadas ao AI gateway).
2. Classificar cada uma (candidata a JEV vs. geração vs. código vs. humano).
3. Propor o primitive (Choice/Score/Noul), o state e o risco por candidato.
4. Devolver o relatório no chat.

## Escopo (o que ela NÃO faz)
- Não reduz créditos de **build** (as mensagens que você troca para construir o app) — só custo de IA em **runtime** do app publicado.
- Não altera o app. Só audita e propõe.

## Depois do relatório

Use o relatório para planejar a implementação e sua validação em uma etapa separada. O [repositório JEVify](https://github.com/lucioamor/jevify) reúne as variantes da skill, as instruções e o template. Ele ainda não oferece uma skill de migração ou integração executável com JEV.

```
/jevify       → diagnostica e recomenda (read-only)
etapa seguinte → implementar e validar as recomendações
```

## Notas
- O diagnóstico não exige chave da API do JEV. Uma futura integração deve manter as credenciais no backend, nunca no frontend.
- Efeito reportado como direção, não número prometido — valide em shadow mode.
- Jev está em early access.
