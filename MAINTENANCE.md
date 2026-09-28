# Publishing and maintenance

`skills/jevify/SKILL.md` in this repository is the only editable method. Run `node scripts/export-lovable.mjs` to update the generated mirror in `../lovable-skills/skills/jevify/`. The catalog's existing workflow continues syncing that mirror to `lucioamor/lovable-skill-jevify`.

Before release, run `node scripts/check.mjs`, compare the canonical and mirror hashes, and review the generated catalog diff. Publishing, pushing, and changes to the service repository are separate actions.
