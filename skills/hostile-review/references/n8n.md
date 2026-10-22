# Pièges de relecture d'un workflow n8n

À lire en plus de SKILL.md quand le livrable relu est un workflow n8n, surtout dans un repo géré avec `n8ncli`.

## Vérifications propres à n8n

- **Sortie des nœuds à 0 élément** : un nœud qui sort 0 élément ne signale pas d'erreur. Comparer le nombre d'éléments en entrée et en sortie de chaque nœud sur une exécution réelle : un écart signifie qu'un filtre a mangé des données (perte silencieuse).
- **Version réellement deployée** : faire un `pull` du workflow dans un dossier temporaire et relire **cette version-là** ; l'écart local / déployé est un angle de relecture à part entière. Un `[CONFLICT] ... Skipping` dans un ancien push peut expliquer un drift.
- **Credentials** : vérifier qu'ils sont toujours présents après un push, et que le bot du credential utilisé est bien invité dans les canaux privés Slack.
- **Workflow d'erreur** : qu'il existe, qu'il se déclenche, qu'il prévient une personne réelle, et qu'il ne pointe pas vers le workflow principal (risque de boucle infinie).

## Pièges à rejouer système par système

À transformer en cas de test tant qu'ils n'ont pas été revus sur une donnée réelle :

- **Nœud IA de type chaîne (LLM Chain)** : il ne renvoie que la réponse du modèle. Vérifier que les champs d'origine sont récupérés depuis un nœud précédent (`$('<nœud>').all()[i].json`).
- **Champ `from` du déclencheur IMAP** : c'est un objet. Chercher tout `{{ $json.from }}` qui afficherait `[object Object]` ; le correctif est `from.text`.
- **Slack, canaux privés** : le canal est visé par son **ID** (commence par `C`) et le bot est invité ? Sinon `channel_not_found`.
- **Réponses dans un fil de mails** : la détection passe par l'en-tête `in-reply-to`, pas par un mot du corps. Rejouer avec un vrai « Répondre ».
- **Réponse d'IA inexploitable** : simuler un JSON invalide ou incomplet en sortie de modèle ; un classement de repli doit exister, jamais de perte silencieuse.
- **Rejeu sur période déjà traitée** : des doublons apparaissent-ils ? Le comportement sur une deuxième exécution est-il celui de la spec ?

## Rapport

Appliquer le format de SKILL.md (Bloquant / Important / Mineur / Soupçons non démontrés / Écarté du jugement). Un défaut n'est « corrigé » que si le scénario qui cassait a été rejoué avec une vraie donnée et ne casse plus.
