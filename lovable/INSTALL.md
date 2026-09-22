# Instalar e usar `/jevify` no Lovable

Skill **read-only** de workspace que audita um projeto Lovable e propõe onde uma System One model (Jev) substitui chamadas de LLM generativo em runtime. Produz um relatório; não altera o app.

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
2. Classificar cada uma (candidata a System One vs. geração vs. código vs. humano).
3. Propor o primitive (Choice/Score/Noul), o state e o risco por candidato.
4. Devolver o relatório no chat.

## Escopo (o que ela NÃO faz)
- Não reduz créditos de **build** (as mensagens que você troca para construir o app) — só custo de IA em **runtime** do app publicado.
- Não altera o app. Só audita e propõe.

## Depois do relatório

Para **implementar** — gerar a Edge Function com decision layer, secrets, telemetria e fallback — use a skill `/system-one` se ela estiver instalada no mesmo workspace. O playbook complementar `lovable-system-one` ainda não está disponível no endereço GitHub fornecido. Sem ele, trate a migração como uma implementação separada.

```
/jevify      → audita e propõe (read-only)
/system-one  → modela e migra (gera a Edge Function)
```

## Notas
- A chave da API do provider vai em Cloud → Secrets, nunca no frontend (a `/system-one` cuida disso na migração).
- Efeito reportado como direção, não número prometido — valide em shadow mode.
- Jev está em early access.
