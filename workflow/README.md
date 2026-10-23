# workflow/

`Projet_n8n-Margot.workflow.ts` : le workflow n8n au format TypeScript (`@n8n/workflow-sdk`), tel qu'il est récupéré par `n8ncli pull`.

## Ce que fait le workflow

Il trie automatiquement une boîte Gmail personnelle. Un seul workflow, trois zones :

| Zone | Déclencheur | Rôle |
|---|---|---|
| **Tri** | Gmail Trigger, toutes les 15 min | Classe chaque nouveau mail. |
| **Rattrapage** | Manuel (bouton Execute) | Classe les anciens mails sans libellé, par lots de 250. |
| **Récap du dimanche** | Schedule Trigger, dimanche 19 h | Envoie un récap par mail, puis met les pubs et les vieux codes de connexion à la corbeille. |

**Chaîne de classement** (zones Tri et Rattrapage) :
Préparer le mail → Classer avec Jev (OpenRouter) → si Jev échoue, Gemini prend le relais → Lire la réponse → If « Catégorie valide ? » (catégorie connue et confiance ≥ 0,7) → libellé Gmail, sinon `A-verifier`.

**Catégories** : Perso, Sante, Administratif, Abonnements-Achats, Ecole, Alternance, Connexion, Pub, A-verifier.

**Choix techniques** : aucun nœud Code (Set, If, Merge, Gmail, Basic LLM Chain, un seul HTTP Request pour Jev). Seuls l'expéditeur, l'objet et les 500 premiers caractères partent vers l'IA. Les mails Santé, Administratif et Alternance ne sont jamais supprimés.

La spec complète est dans la sticky note « Specs » du workflow.

## Utiliser ce fichier

```bash
n8ncli validate workflow/Projet_n8n-Margot.workflow.ts
```

Les credentials (Gmail, OpenRouter, Gemini) sont référencés par leur ID et ne sont pas inclus : il faut les reconnecter dans son instance n8n.
