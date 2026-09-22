# JEVify Diagnóstico no Claude Code

`/jevify` é a skill básica **read-only** do projeto JEVify. Audita os call-sites de IA em runtime e identifica candidatos a decisões estruturadas com JEV. Escreve um único arquivo de relatório (`JEVIFY_REPORT.md`); não toca no código.

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
2. Classificar cada call-site (`JEV_CANDIDATE`, `GENERATION_REQUIRED`, etc.).
3. Propor o primitive (Choice/Score/Noul) + state + risco por candidato.
4. Escrever `JEVIFY_REPORT.md` na raiz e imprimir o resumo.

## Depois do relatório

`/jevify` só diagnostica e recomenda. Use o relatório para planejar a implementação e sua validação em uma etapa separada. O [repositório JEVify](https://github.com/lucioamor/jevify) reúne as variantes da skill, as instruções e o template. Ele ainda não oferece uma skill de migração ou integração executável com JEV.

```
/jevify       → diagnostica e recomenda (read-only)
etapa seguinte → implementar e validar as recomendações
```

## Notas
- A skill nunca edita código-fonte; só escreve o relatório.
- Efeito é sempre reportado como direção (menor latência/custo), nunca como número prometido — valide em shadow mode.
- Jev está em early access; trate como padrão a adotar, não dependência a assumir hoje.
