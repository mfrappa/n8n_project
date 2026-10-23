# Projet n8n : tri automatique de ma boîte Gmail

Un workflow n8n qui classe mes mails avec une IA, géré comme du code avec `n8ncli`, et trois skills pour Claude Code / OpenCode qui encadrent la façon de le construire.

## Contenu du repo

| Dossier | Contenu |
|---|---|
| [`workflow/`](workflow/) | Le workflow n8n au format TypeScript (`.workflow.ts`) et sa description. |
| [`skills/`](skills/) | Les 3 skills : `interview`, `doubt-driven-dev`, `hostile-review`. |
| [`video/`](video/) | La vidéo de démo et son déroulé. |

## Le workflow

Il trie automatiquement ma boîte Gmail personnelle :
- **toutes les 15 min**, chaque nouveau mail reçoit un libellé (Perso, Santé, Administratif, Abonnements & achats, École, Alternance, Connexion, Pub, ou À vérifier si l'IA n'est pas sûre) ;
- **à la main**, un rattrapage classe les anciens mails par lots de 250 ;
- **chaque dimanche à 19 h**, je reçois un récap par mail (nombre de mails par libellé, importants non lus, mails à vérifier, liens de désabonnement), puis les pubs et les vieux codes de connexion partent à la corbeille.

IA principale : Jev 1.14 via OpenRouter. IA de secours : Gemini. Coût estimé : environ 0,02 $ par mois.

Détails dans [`workflow/README.md`](workflow/README.md).

## Les 3 skills

Ensemble, elles couvrent tout le cycle de construction d'un workflow :

| Skill | Phase | Rôle |
|---|---|---|
| [`interview`](skills/interview/SKILL.md) | Avant (10 %) | Interroge sur l'idée, challenge le besoin, propose des simplifications et rédige une spec à valider. Rien n'est construit sans validation. |
| [`doubt-driven-dev`](skills/doubt-driven-dev/SKILL.md) | Pendant (80 %) | Construit en doutant de chaque hypothèse : tests écrits avant le code, seule une exécution vaut preuve, vérification dosée selon le risque. |
| [`hostile-review`](skills/hostile-review/SKILL.md) | Après (10 %) | Relit le travail en adversaire, en lecture seule, et rend un verdict avec des défauts démontrés. |

Chaque skill a un fichier `references/n8n.md` avec les questions, sondes et pièges propres à n8n.

### Installer les skills

Copier les dossiers de `skills/` dans le dossier de skills de son projet :

```bash
cp -R skills/* .claude/skills/      # Claude Code
cp -R skills/* .agents/skills/      # OpenCode
```

## Gérer le workflow avec n8ncli

[`n8ncli`](https://www.npmjs.com/package/n8ncli) synchronise les workflows n8n avec des fichiers TypeScript locaux. Il fournit aussi sa propre skill pour l'agent (`n8ncli import-skill`).

| Commande | Rôle |
|---|---|
| `n8ncli env test` | Vérifie la connexion à l'instance n8n. |
| `n8ncli pull` | Récupère les workflows en `.workflow.ts`. |
| `n8ncli status` | Montre ce qui a changé en local. |
| `n8ncli diff <fichier>` | Compare le fichier local à la version dans n8n. |
| `n8ncli validate <fichier>` | Valide le fichier contre les schémas n8n. |
| `n8ncli push --dry-run` | Montre ce qui serait envoyé, sans rien changer. |
| `n8ncli push` | Envoie les modifications vers n8n. |

## Auteure

Margot Frappa, École Eugenia.
