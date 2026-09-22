# jevify

> **Read-only AI runtime audit.** Aponta onde um app paga por inteligência *generativa* quando precisa apenas de uma *decisão semântica estruturada* — e propõe o primitive System One (Choice/Score/Noul) que resolve. Produz um relatório; **não** altera código.
>
> `/jevify` audita e propõe. `/system-one` migra. Motor vendor-neutral por baixo; nome memorável por cima.

O `/jevify` é a **porta de entrada read-only**: baixo compromisso, não pede acesso de escrita, mantém você no papel de advisor. O playbook complementar `lovable-system-one`, com a skill de migração `/system-one`, ainda não está disponível no endereço GitHub fornecido. A auditoria funciona de forma independente; a migração exige esse material ou uma implementação separada.

## Duas variantes, mesmo comportamento

| | Onde roda | Audita | Saída |
|---|---|---|---|
| **Lovable** (`lovable/SKILL.md`) | dentro do builder Lovable | as chamadas de IA em runtime do projeto (Edge Functions, AI gateway) | relatório no chat |
| **Claude Code** (`claude-code/.claude/skills/jevify/SKILL.md`) | terminal, contra qualquer repo | o codebase inteiro (grep por SDKs de LLM) | `JEVIFY_REPORT.md` |

## Estrutura

```
jevify/
├── README.md                                   ← este arquivo
├── report-template.md                          ← formato do relatório (compartilhado)
├── lovable/
│   ├── SKILL.md                                ← a skill /jevify para Lovable
│   └── INSTALL.md                              ← como adicionar ao workspace Lovable
└── claude-code/
    ├── INSTALL.md                              ← como instalar num repo / global
    └── .claude/skills/jevify/SKILL.md          ← a skill /jevify para Claude Code
```

## Início rápido

- **Claude Code:** copie `claude-code/.claude/skills/jevify/` para o `.claude/skills/` do seu repo (ou `~/.claude/skills/` para global). Rode `/jevify`. Ver `claude-code/INSTALL.md`.
- **Lovable:** importe [lovable-skill-jevify](https://github.com/lucioamor/lovable-skill-jevify) como skill de workspace. Rode `/jevify` dentro de um projeto. Ver `lovable/INSTALL.md`.

## Publicação e manutenção

- Projeto completo: [lucioamor/jevify](https://github.com/lucioamor/jevify).
- Fonte canônica da variante Lovable: [lovable-skills/skills/jevify](https://github.com/lucioamor/lovable-skills/tree/main/skills/jevify).
- Pacote para importação: [lucioamor/lovable-skill-jevify](https://github.com/lucioamor/lovable-skill-jevify), com `SKILL.md` na raiz.

Edite a variante Lovable no catálogo e mantenha `lovable/SKILL.md` deste projeto sincronizado. A variante Claude Code e o template de relatório são mantidos neste repositório.

## Princípio
**Use LLMs for language. Use code for rules. Use System One for judgment.**

## Limites (herdados do playbook)
- Read-only: nunca edita código-fonte (a variante Claude Code escreve só o relatório).
- Efeito reportado como direção, nunca número prometido — valide em shadow mode.
- Não reduz créditos de *build* do Lovable; ataca custo de IA em *runtime*.
- Jev está em early access.

## Authorship and maintenance

This project was created by [Lucio Amorim](https://linkedin.com/in/lucioamorim), Lovable Ambassador.

When reusing, redistributing, or citing this work, keep the attribution credits and include a link to this repository.

## License

The skills, instructions, and report template are licensed under [Creative Commons Attribution 4.0 International](./LICENSE) (`CC BY 4.0`).
