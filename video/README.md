# video/

Vidéo de démo du projet (lien ou fichier à ajouter ici).

## Déroulé de la démo

### 1. Le workflow dans n8n (1 min)
- Ouvrir le workflow `Projet_n8n-Margot` dans n8n.
- Montrer les 3 zones (Tri, Rattrapage, Récap du dimanche) et la sticky note « Specs ».

### 2. n8ncli dans le terminal (3 min)

```bash
n8ncli env test                          # la connexion à n8n fonctionne
n8ncli pull                              # récupère les workflows en .workflow.ts
n8ncli status                            # rien à pousser : local = n8n
```

Montrer le fichier `.workflow.ts` dans l'éditeur, puis faire une petite modification visible (par exemple le texte d'une sticky note) :

```bash
n8ncli status                            # le fichier apparaît comme modifié
n8ncli diff "n8n/workflows/Sandbox/Projet_n8n-Margot.workflow.ts"
n8ncli validate "n8n/workflows/Sandbox/Projet_n8n-Margot.workflow.ts"
n8ncli push --dry-run                    # ce qui serait envoyé, sans rien changer
n8ncli push                              # envoi réel
```

Rafraîchir n8n dans le navigateur pour montrer que la modification est bien arrivée.

### 3. Les skills avec Claude Code (2-3 min)
- **interview** : « J'ai une idée de workflow… » → questions numérotées, simplifications, spec à valider.
- **doubt-driven-dev** : les lignes « 🔍 Hypothèse → Vérif → ✅ / ❌ » pendant la construction.
- **hostile-review** : « Relis mon workflow, il est prêt ? » → rapport Bloquant / Important / Mineur avec verdict.

### 4. Conclusion (30 s)
Le repo GitHub : `workflow/`, `skills/`, `video/`.
