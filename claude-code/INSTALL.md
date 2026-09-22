# Instalar e usar `/jevify` no Claude Code

Skill **read-only** que audita os call-sites de IA em runtime de um repositório e propõe onde uma System One model (Jev) substitui um LLM generativo. Escreve um único arquivo de relatório (`JEVIFY_REPORT.md`); não toca no código.

## Instalação (por repositório)

Copie a pasta da skill para o repo que você quer auditar:

```
seu-repo/
└── .claude/
    └── skills/
        └── jevify/
            └── SKILL.md
```

Comandos:
```bash
mkdir -p .claude/skills/jevify
cp caminho/para/jevify/claude-code/.claude/skills/jevify/SKILL.md .claude/skills/jevify/
```

Comite no repo para o time inteiro ter o comando:
```bash
git add .claude/skills/jevify/SKILL.md
git commit -m "chore: add /jevify AI runtime audit skill"
```

## Instalação (global, para todos os seus repos)

Coloque em `~/.claude/skills/jevify/SKILL.md`. Fica disponível em qualquer sessão do Claude Code, sem comitar em cada repo.
```bash
mkdir -p ~/.claude/skills/jevify
cp caminho/para/jevify/claude-code/.claude/skills/jevify/SKILL.md ~/.claude/skills/jevify/
```

## Uso

Na raiz do repo, dentro do Claude Code:
```
/jevify
```
ou em linguagem natural: *"jevify this repo"*, *"onde estou pagando IA demais neste app?"*.

A skill vai:
1. Varrer o repo por chamadas a OpenAI/Anthropic/Gemini/etc. (Edge Functions, API routes, server files).
2. Classificar cada call-site (`SYSTEM_ONE_CANDIDATE`, `GENERATION_REQUIRED`, etc.).
3. Propor o primitive (Choice/Score/Noul) + state + risco por candidato.
4. Escrever `JEVIFY_REPORT.md` na raiz e imprimir o resumo.

## Depois do relatório

`/jevify` só propõe. Para **implementar** uma migração (gerar a Edge Function, telemetria, fallback), use a skill `/system-one` se já estiver instalada. O playbook complementar `lovable-system-one` ainda não está disponível no endereço GitHub fornecido; sem ele, a migração é uma implementação separada. Divisão de papéis:

```
/jevify      → audita e propõe (read-only)
/system-one  → modela e migra (escreve código)
```

## Notas
- A skill nunca edita código-fonte; só escreve o relatório.
- Efeito é sempre reportado como direção (menor latência/custo), nunca como número prometido — valide em shadow mode.
- Jev está em early access; trate como padrão a adotar, não dependência a assumir hoje.
