# PIHOCO Menu Engineering Algorithm Pack

- `PIHOCO_Menu_Engineering_Algorithm_Specification.md`: logic tables, formulas, flowcharts, integration notes and acceptance tests.
- `engine.js`: framework-independent JavaScript calculation engine.
- `engine.smoke.test.js`: executable smoke test.

Run with Node.js:

```bash
node engine.smoke.test.js
```

The engine expects canonical, reconciled item records. CSV parsing, flexible column mapping, fuzzy-match approval, database persistence, PDF rendering and UI integration remain the responsibility of the workspace application.

Before production use, confirm the commission base and PIHOCO-approved overhead allocation methods in the specification.
