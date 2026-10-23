const mod_le_Gemini = languageModel({ type: '@n8n/n8n-nodes-langchain.lmChatGoogleGemini', version: 1.2, config: { name: 'Modèle Gemini', parameters: { options: {} }, credentials: { googlePalmApi: newCredential('n8n-server (mfrappa@eugeniaschool.com)', 't5lNQJqsItLnF2sz') }, position: [736, 336] } });

const when_clicking_Execute_workflow = trigger({
  type: 'n8n-nodes-base.manualTrigger',
  version: 1,
  config: { name: 'When clicking \u2018Execute workflow\u2019', position: [-240, -80] }
});

const get_many_messages = node({
  type: 'n8n-nodes-base.gmail',
  version: 2.2,
  config: { name: 'Get many messages', parameters: { operation: 'getAll', limit: 250, simple: false, filters: { q: '-has:userlabels in:inbox -subject:"Récap boîte mail"' }, options: {} }, credentials: { gmailOAuth2: newCredential('Gmail account', 'ppjvByNGWAuQ16tX') }, position: [-16, -80], webhookId: '9266a9b0-7337-4abc-a1bc-3058cb067689' }
});

const pr_parer_le_mail = node({
  type: 'n8n-nodes-base.set',
  version: 3.5,
  config: { name: 'Préparer le mail', parameters: { assignments: { assignments: [{ id: '2f2bf057-6fee-499b-9b99-fa4dfedbf368', name: 'id', value: expr('{{ $json.id }}'), type: 'string' }, { id: '88250fd2-da60-4805-a5ad-4b11a7932645', name: 'expediteur', value: expr('{{ $json.from.text }}'), type: 'string' }, { id: '44d8f8f9-52b1-4fe8-bf89-da8c1d418891', name: 'objet', value: expr('{{ $json.subject }}'), type: 'string' }, { id: 'd0b2fea9-3750-4505-99b8-c9c52d91cb46', name: 'extrait', value: expr('{{ ($json.text || \'\').slice(0, 500) }}'), type: 'string' }] }, options: {} }, position: [208, 16] }
});

const classer_avec_Jev = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.5,
  config: { name: 'Classer avec Jev', parameters: { method: 'POST', url: 'https://openrouter.ai/api/alpha/decisions', authentication: 'predefinedCredentialType', nodeCredentialType: 'openRouterApi', sendBody: true, specifyBody: 'json', jsonBody: expr('{\n  "model": "typesafe/jev-1.14",\n  "state": {{ JSON.stringify({ expediteur: $json.expediteur, objet: $json.objet, extrait: $json.extrait }) }},\n  "questions": {\n    "categorie": {\n      "type": "choice",\n      "instructions": "Dans quelle catégorie ranger ce mail reçu dans une boîte mail personnelle ?",\n      "criteria": {\n        "Perso": "Mail écrit personnellement par un proche (famille, amis), même s\'il contient un document ou parle d\'administratif ou de santé.",\n        "Sante": "Santé : ordonnance, facture de médecin ou d\'ostéopathe, confirmation ou récap de rendez-vous médical (Doctolib, Qare).",\n        "Administratif": "Banque, impôts, CAF, Assurance Maladie, Ameli, CPAM, mutuelle, assurance, billets de voyage.",\n        "Abonnements-Achats": "Paiement d\'abonnement, commande, livraison, facture d\'achat.",\n        "Ecole": "École Eugenia : cours, rendus, informations de l\'école.",\n        "Alternance": "Contrat d\'alternance, OPCO, documents RH de l\'entreprise.",\n        "Connexion": "Code ou lien de connexion, vérification de compte, réinitialisation de mot de passe.",\n        "Pub": "Publicité, promotion, newsletter, offre commerciale, école qui fait sa promotion, alertes emploi (JobTeaser)."\n      }\n    }\n  }\n}'), options: {} }, credentials: { openRouterApi: newCredential('OpenRouter account', 'g9Ss12sfSbSTl3F0') }, position: [432, 16] }
});

const lire_r_ponse_Jev = node({
  type: 'n8n-nodes-base.set',
  version: 3.5,
  config: { name: 'Lire réponse Jev', parameters: { assignments: { assignments: [{ id: '34dc90e5-c419-4a46-9190-496ec6edf1fc', name: 'id', value: expr('{{ $(\'Préparer le mail\').item.json.id }}'), type: 'string' }, { id: '5b0a8552-73f5-4152-9391-5a4482b40dce', name: 'categorie', value: expr('{{ $json.answers.categorie.choice }}'), type: 'string' }, { id: 'b3dc37b3-b3f9-4546-8c12-9d90b4a1e9b7', name: 'confiance', value: expr('{{ $json.answers.categorie.confidence }}'), type: 'string' }] }, options: {} }, position: [1008, -112] }
});

const cat_gorie_valide = node({
  type: 'n8n-nodes-base.if',
  version: 2.4,
  config: { name: 'Catégorie valide ?', parameters: { conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 4 }, conditions: [{ id: 'd6ca004a-7275-4f67-b39b-57e6f084d436', leftValue: expr('{{ [\'Perso\',\'Sante\',\'Administratif\',\'Abonnements-Achats\',\'Ecole\',\'Alternance\',\'Connexion\',\'Pub\'].includes($json.categorie) }}'), rightValue: '', operator: { type: 'boolean', operation: 'true', singleValue: true } }, { id: 'ba25a407-6569-4fba-acef-4cf3f10855a6', leftValue: expr('{{ $json.confiance }}'), rightValue: 0.7, operator: { type: 'number', operation: 'gte' } }], combinator: 'and' }, looseTypeValidation: true, options: {} }, position: [1232, 16] }
});

const ajouter_le_libell = node({
  type: 'n8n-nodes-base.gmail',
  version: 2.2,
  config: { name: 'Ajouter le libellé', parameters: { operation: 'addLabels', messageId: expr('{{ $json.id }}'), labelIds: expr('{{ ({\n  "Perso": "Label_7608211392533718635",\n  "Sante": "Label_4465873117309527569",\n  "Administratif": "Label_7966674653170738862",\n  "Abonnements-Achats": "Label_1028769749919753753",\n  "Ecole": "Label_5247782185419227624",\n  "Alternance": "Label_5612279978427571918",\n  "Connexion": "Label_309303561687546891",\n  "Pub": "Label_92171380250459164",\n  "A-verifier": "Label_466087206804770809"\n})[$json.categorie] }}') }, credentials: { gmailOAuth2: newCredential('Gmail account', 'ppjvByNGWAuQ16tX') }, position: [1680, 16], webhookId: 'cdcb8275-3b49-41ad-ac8f-97616a96ec20' }
});

const mettre_A_verifier = node({
  type: 'n8n-nodes-base.set',
  version: 3.5,
  config: { name: 'Mettre A-verifier', parameters: { assignments: { assignments: [{ id: 'b6ddedde-ae98-4c46-bbec-edf27ffe62ee', name: 'id', value: expr('{{ $json.id }}'), type: 'string' }, { id: 'aa05f25d-1bab-4f63-80af-7433d4a2409f', name: 'categorie', value: 'A-verifier', type: 'string' }] }, options: {} }, position: [1456, 80] }
});

const secours_Gemini = node({
  type: '@n8n/n8n-nodes-langchain.chainLlm',
  version: 1.9,
  config: { name: 'Secours Gemini', parameters: { promptType: 'define', text: expr('<role>\nTu es un assistant qui trie les mails d\'une boîte Gmail personnelle. Tu prends le relais d\'un autre modèle de classement quand celui-ci ne répond pas.\n</role>\n\n<instructions>\n<goal>\nClasser le mail fourni dans UNE seule des 8 catégories suivantes : Perso, Sante, Administratif, Abonnements-Achats, Ecole, Alternance, Connexion, Pub.\n</goal>\n\n<context>\nLa catégorie choisie devient un libellé Gmail. Elle doit donc être écrite exactement comme dans la liste, sans accent ajouté ni espace.\nDéfinition des catégories :\n- Perso : mail écrit personnellement par un proche (famille, amis), même s\'il contient un document ou parle d\'administratif ou de santé.\n- Sante : ordonnance, facture de médecin ou d\'ostéopathe, confirmation ou récap de rendez-vous médical (Doctolib, Qare).\n- Administratif : banque, impôts, CAF, Assurance Maladie, Ameli, CPAM, mutuelle, assurance, billets de voyage.\n- Abonnements-Achats : paiement d\'abonnement, commande, livraison, facture d\'achat.\n- Ecole : École Eugenia : cours, rendus, informations de l\'école.\n- Alternance : contrat d\'alternance, OPCO, documents RH de l\'entreprise.\n- Connexion : code ou lien de connexion, vérification de compte, réinitialisation de mot de passe.\n- Pub : publicité, promotion, newsletter, offre commerciale, école qui fait sa promotion, alertes emploi (JobTeaser).\n</context>\n\n<examples>\n<example_1>\n<inputs>\n<expediteur>KFC France &lt;news@kfc.fr&gt;</expediteur>\n<objet>30 Nuggets pour 10 €, seulement ce soir</objet>\n<extrait>30 golden Nuggs for $10. Add Wicked Sauce for $2.50. Only until 10pm.</extrait>\n</inputs>\n<output>Pub</output>\n</example_1>\n\n<example_2>\n<inputs>\n<expediteur>JobTeaser &lt;notifications@jobteaser.com&gt;</expediteur>\n<objet>There are 4 jobs matching your criteria</objet>\n<extrait>4 jobs fit your criteria! Your alert Apprenticeship...</extrait>\n</inputs>\n<output>Pub</output>\n</example_2>\n\n<example_3>\n<inputs>\n<expediteur>Marie Dupont &lt;marie.dupont@exemple.fr&gt;</expediteur>\n<objet>ATTESTATION VIVINTER</objet>\n<extrait>Voici l\'attestation de mutuelle, je te l\'envoie en pièce jointe.</extrait>\n</inputs>\n<output>Perso</output>\n</example_3>\n\n<example_4>\n<inputs>\n<expediteur>Votre Assurance Maladie &lt;assurance-maladie@info.ameli.fr&gt;</expediteur>\n<objet>Information de paiement</objet>\n<extrait>L\'Assurance Maladie vous informe d\'un remboursement sur votre compte.</extrait>\n</inputs>\n<output>Administratif</output>\n</example_4>\n\n<example_5>\n<inputs>\n<expediteur>Doctolib &lt;no-reply@doctolib.fr&gt;</expediteur>\n<objet>Votre code de connexion</objet>\n<extrait>Voici votre code de vérification : 482913. Il expire dans 10 minutes.</extrait>\n</inputs>\n<output>Connexion</output>\n</example_5>\n</examples>\n\n<output_format>\nRéponds uniquement par le nom exact de la catégorie, sans aucun autre mot, sans ponctuation, sans guillemets et sans balise.\n</output_format>\n</instructions>\n\n<inputs>\n<expediteur>{{ $(\'Préparer le mail\').item.json.expediteur }}</expediteur>\n<objet>{{ $(\'Préparer le mail\').item.json.objet }}</objet>\n<extrait>{{ $(\'Préparer le mail\').item.json.extrait }}</extrait>\n</inputs>'), batching: {} }, position: [656, 144], subnodes: { model: mod_le_Gemini } }
});

const lire_r_ponse_Gemini = node({
  type: 'n8n-nodes-base.set',
  version: 3.5,
  config: { name: 'Lire réponse Gemini', parameters: { assignments: { assignments: [{ id: 'd8807bd4-3747-4bae-af9f-eca40785c069', name: 'id', value: expr('{{ $(\'Préparer le mail\').item.json.id }}'), type: 'string' }, { id: 'd0c665fd-b5d4-495f-8d8d-0c3434c73b10', name: 'categorie', value: expr('{{ $json.text.trim() }}'), type: 'string' }, { id: 'e893f97c-b7e0-4c91-ad49-5a6545ff409c', name: 'confiance', value: '1', type: 'string' }] }, options: {} }, position: [1008, 144] }
});

const schedule_Trigger = trigger({
  type: 'n8n-nodes-base.scheduleTrigger',
  version: 1.4,
  config: { name: 'Schedule Trigger', parameters: { rule: { interval: [{ field: 'weeks', triggerAtHour: 19 }] } }, position: [-240, 752] }
});

const mails_de_la_semaine = node({
  type: 'n8n-nodes-base.gmail',
  version: 2.2,
  config: { name: 'Mails de la semaine', parameters: { operation: 'getAll', returnAll: true, filters: { q: 'newer_than:7d' } }, credentials: { gmailOAuth2: newCredential('Gmail account', 'ppjvByNGWAuQ16tX') }, position: [208, 464], webhookId: 'a76cd664-85ac-42a6-aa98-470d7f811567', alwaysOutputData: true }
});

const regrouper_les_donn_es_du_r_cap = merge({
  version: 3.2,
  config: { name: 'Regrouper les données du récap', parameters: { numberInputs: 4 }, position: [432, 720] }
});

const importants_non_lus = node({
  type: 'n8n-nodes-base.gmail',
  version: 2.2,
  config: { name: 'Importants non lus', parameters: { operation: 'getAll', limit: 30, filters: { q: 'is:unread {label:Sante label:Administratif label:Alternance label:Ecole label:Perso}' } }, credentials: { gmailOAuth2: newCredential('Gmail account', 'ppjvByNGWAuQ16tX') }, position: [208, 656], webhookId: 'c26f0724-95c3-479c-9ac6-08e2d2a6d787', alwaysOutputData: true }
});

const v_rifier = node({
  type: 'n8n-nodes-base.gmail',
  version: 2.2,
  config: { name: 'À vérifier', parameters: { operation: 'getAll', limit: 30, filters: { q: 'label:A-verifier' } }, credentials: { gmailOAuth2: newCredential('Gmail account', 'ppjvByNGWAuQ16tX') }, position: [208, 848], webhookId: '15a3b05c-b5b0-4703-9345-5bacb728d2fc', alwaysOutputData: true }
});

const liens_d_sabo = node({
  type: 'n8n-nodes-base.set',
  version: 3.5,
  config: { name: 'Liens désabo', parameters: { assignments: { assignments: [{ id: '8f299853-2531-4796-accb-7e44e963e2a4', name: 'expediteur', value: expr('{{ $json.from?.text }}'), type: 'string' }, { id: '11f85412-7d0d-4d41-af3a-a841316db40d', name: 'lien', value: expr('{{ ($json.headers?.[\'list-unsubscribe\'] || \'\').match(/<(https?:[^>]+)>/)?.[1] || \'pas de lien\' }}'), type: 'string' }] }, options: {} }, position: [208, 1040] }
});

const pubs = node({
  type: 'n8n-nodes-base.gmail',
  version: 2.2,
  config: { name: 'Pubs', parameters: { operation: 'getAll', returnAll: true, simple: false, filters: { q: 'label:Pub newer_than:7d' }, options: {} }, credentials: { gmailOAuth2: newCredential('Gmail account', 'ppjvByNGWAuQ16tX') }, position: [-16, 1040], webhookId: 'e4ed0acc-99db-42cd-b3f9-3a1cb091ee04', alwaysOutputData: true }
});

const nouveaux_mails = trigger({
  type: 'n8n-nodes-base.gmailTrigger',
  version: 1.4,
  config: { name: 'Nouveaux mails', parameters: { pollTimes: { item: [{ mode: 'everyX', value: 15, unit: 'minutes' }] }, simple: false, filters: { labelIds: ['INBOX'], q: '-subject:"Récap boîte mail"' }, options: {} }, credentials: { gmailOAuth2: newCredential('Gmail account', 'ppjvByNGWAuQ16tX') }, position: [-16, 208] }
});

const construire_le_r_cap = node({
  type: 'n8n-nodes-base.set',
  version: 3.5,
  config: { name: 'Construire le récap', parameters: { assignments: { assignments: [{ id: 'd8b31455-0a8d-4244-8b3e-de76bad0cbd8', name: 'sujet', value: expr('Récap boîte mail du {{ $now.minus({ days: 7 }).toFormat(\'dd/MM\') }} au {{ $now.toFormat(\'dd/MM\') }}'), type: 'string' }, { id: 'b11ddc43-e370-4cb3-85f2-401b8b310729', name: 'nbMails', value: expr('{{ $(\'Mails de la semaine\').all().filter(i => i.json.id).length }}'), type: 'string' }, { id: '61ecdd6b-2bb8-4bca-8553-54ed6dd3a92b', name: 'repartition', value: expr('{{ (() => { const cats = [\'Perso\',\'Sante\',\'Administratif\',\'Abonnements-Achats\',\'Ecole\',\'Alternance\',\'Connexion\',\'Pub\',\'A-verifier\']; const compte = {}; $(\'Mails de la semaine\').all().forEach(i => (i.json.labels || []).forEach(l => { if (cats.includes(l.name)) compte[l.name] = (compte[l.name] || 0) + 1; })); return Object.entries(compte).map(([k, v]) => \'- \' + k + \' : \' + v).join(\'\\n\') || \'Aucun\'; })() }}'), type: 'string' }, { id: '99d11cbc-dc17-4e28-b0fd-201c2b04bef5', name: 'importants', value: expr('{{ $(\'Importants non lus\').all().filter(i => i.json.id).map(i => \'- \' + i.json.From + \' : \' + i.json.Subject).join(\'\\n\') || \'Aucun\' }}'), type: 'string' }, { id: 'a3b71861-a3ac-4587-a8d0-b826abfa22db', name: 'aVerifier', value: expr('{{ $(\'À vérifier\').all().filter(i => i.json.id).map(i => \'- \' + i.json.From + \' : \' + i.json.Subject).join(\'\\n\') || \'Aucun\' }}'), type: 'string' }, { id: '1459e03a-0c89-481f-a7fd-751ee85e8238', name: 'desabo', value: expr('{{ $(\'Liens désabo\').all().filter(i => i.json.expediteur).map(i => \'- \' + i.json.expediteur + \' : \' + i.json.lien).join(\'\\n\') || \'Aucune\' }}'), type: 'string' }] }, options: {} }, position: [656, 752], executeOnce: true }
});

const envoyer_le_r_cap = node({
  type: 'n8n-nodes-base.gmail',
  version: 2.2,
  config: { name: 'Envoyer le récap', parameters: { sendTo: 'margotfrappa1@gmail.com', subject: expr('{{ $json.sujet }}'), emailType: 'text', message: expr('Bonjour Margot,\n\nMails reçus cette semaine : {{ $json.nbMails }}\n{{ $json.repartition }}\n\nMails importants non lus :\n{{ $json.importants }}\n\nMails à vérifier :\n{{ $json.aVerifier }}\n\nDésabonnements possibles :\n{{ $json.desabo }}'), options: { appendAttribution: false } }, credentials: { gmailOAuth2: newCredential('Gmail account', 'ppjvByNGWAuQ16tX') }, position: [880, 752], webhookId: '4827beb9-0016-4328-bc60-0af45de98434' }
});

const trouver_connexions_et_pubs = node({
  type: 'n8n-nodes-base.gmail',
  version: 2.2,
  config: { name: 'Trouver connexions et pubs', parameters: { operation: 'getAll', returnAll: true, filters: { q: 'label:Pub OR (label:Connexion older_than:1d)' } }, credentials: { gmailOAuth2: newCredential('Gmail account', 'ppjvByNGWAuQ16tX') }, position: [1104, 752], webhookId: '3ba5779d-4f49-4b69-b278-8dca8aac9e09' }
});

const mettre_la_corbeille = node({
  type: 'n8n-nodes-base.gmail',
  version: 2.2,
  config: { name: 'Mettre à la corbeille', parameters: { operation: 'addLabels', messageId: expr('{{ $json.id }}'), labelIds: ['TRASH'] }, credentials: { gmailOAuth2: newCredential('Gmail account', 'ppjvByNGWAuQ16tX') }, position: [1328, 752], webhookId: 'a4496b36-eda2-4db8-8b31-6a5f4f0c48ee' }
});

const wf = workflow('epmrh7ugw6vr8lw5', 'Projet_n8n-Margot', { executionOrder: 'v1', binaryMode: 'separate', availableInMCP: true });

export default wf
  .add(when_clicking_Execute_workflow)
  .to(get_many_messages)
  .to(pr_parer_le_mail)
  .to(classer_avec_Jev)
  .add(classer_avec_Jev.output(0).to(lire_r_ponse_Jev
  .to(cat_gorie_valide.onTrue(ajouter_le_libell).onFalse(mettre_A_verifier
    .to(ajouter_le_libell)))))
  .add(classer_avec_Jev.output(1).to(secours_Gemini
  .to(lire_r_ponse_Gemini)
  .to(cat_gorie_valide)))
  .add(sticky('## Specs\n### Déclencheurs\nUn seul workflow avec 3 déclencheurs, chacun lance sa propre zone :\n- Zone Tri : Nouveaux mails, vérification toutes les 15 min.\n- Zone Rattrapage : Manual Trigger, pour classer les 2 461 non lus par lots de 250.\n- Zone Récap du dimanche : Schedule Trigger, le dimanche à 19 h.\nLes zones Tri et Rattrapage passent par la même chaîne de classement : Préparer le mail → Classer avec Jev (Gemini en secours) → Lire réponse (Set) → If « Catégorie valide ? » → libellé (ou A-verifier).\n\n### Outils\n- n8n Cloud (essai gratuit).\n- Gmail perso, connecté en OAuth2.\n- Jev 1.14 via OpenRouter : IA principale, appelée avec un HTTP Request (seul nœud HTTP, validé avec le prof).\n- Gemini, gratuit : IA de secours (Basic LLM Chain, prompt structuré en XML avec exemples).\n- Nœuds : Set, If, Merge, Basic LLM Chain, Gmail, 1 HTTP Request (Jev). Aucun nœud Code.\n\n### Résultats\n- Chaque mail reçoit un libellé : Perso, Santé, Administratif, Abonnements & achats, École, Alternance, Connexion, Pub ou À vérifier.\n- Le dimanche, les codes de connexion et les pubs partent à la corbeille.\n- Je reçois un récap par mail avec : le nombre de mails par libellé, les mails importants non lus, les mails « À vérifier » et les liens de désabonnement.\n\n### Contraintes\n- Coût IA : environ 0,00003 $ par exécution avec Jev, soit environ 0,02 $ par mois pour ~600 mails. Rattrapage : environ 0,07 $ une seule fois. Budget maximum : 1 € par mois.\n- La fin de l\'essai n8n Cloud est la vraie contrainte de coût.\n- Appeler la version exacte « jev-1.14.0 ».\n- Seuls l\'expéditeur, l\'objet et les 500 premiers caractères sont envoyés à l\'IA, y compris pour les mails de santé.\n- Seule la corbeille est utilisée. Santé, Administratif et Alternance ne sont jamais supprimés.', [], { name: 'Sticky Note', color: 5, width: 1408, height: 592, position: [-416, -960] }))
  .add(schedule_Trigger
  .to([
    mails_de_la_semaine,
    importants_non_lus,
    v_rifier,
    pubs
    .to(liens_d_sabo)]))
  .add(sticky('## Zone Tri\nSe lance toute seule toutes les 15 min.\nRécupère chaque nouveau mail (sauf mes mails récap) et l\'envoie dans la chaîne de classement.', [nouveaux_mails], { name: 'Sticky Note1', color: '#EEEDED', width: 480, height: 249, position: [-368, 112] }))
  .add(sticky('## Zone Rattrapage\nSe lance à la main (bouton Execute).\nRécupère les anciens mails sans libellé (sauf mes mails récap), par lots de 250, et les envoie dans la chaîne de classement.', [when_clicking_Execute_workflow, get_many_messages], { name: 'Sticky Note2', color: '#EEEDED', width: 444, height: 233, position: [-352, -240] }))
  .add(sticky('## Chaîne de classement\nPréparer le mail → Classer avec Jev (si Jev plante : Gemini prend le relais) → Lire réponse récupère la catégorie → If « Catégorie valide ? » :\n- oui : ajout du libellé\n- non : Mettre A-verifier, puis ajout du libellé A-verifier', [ajouter_le_libell, secours_Gemini, lire_r_ponse_Jev, lire_r_ponse_Gemini, cat_gorie_valide, mettre_A_verifier, pr_parer_le_mail, classer_avec_Jev], { name: 'Sticky Note3', color: '#EEEDED', width: 1704, height: 554, position: [176, -224] }))
  .add(sticky('## Zone Récap du dimanche\nSe lance tous les dimanches à 19 h.\n1. Récupère les mails de la semaine, les importants non lus, les À vérifier et les pubs.\n2. M\'envoie le récap par mail.\n3. Met les codes de connexion et les pubs à la corbeille.', [schedule_Trigger, mails_de_la_semaine, importants_non_lus, v_rifier, pubs, envoyer_le_r_cap, trouver_connexions_et_pubs, mettre_la_corbeille, liens_d_sabo, construire_le_r_cap, regrouper_les_donn_es_du_r_cap], { name: 'Sticky Note4', color: '#EEEDED', width: 2024, height: 836, position: [-496, 448] }))
  .add(nouveaux_mails)
  .to(pr_parer_le_mail)
  .add(mails_de_la_semaine.to(regrouper_les_donn_es_du_r_cap.input(0)))
  .add(importants_non_lus.to(regrouper_les_donn_es_du_r_cap.input(1)))
  .add(v_rifier.to(regrouper_les_donn_es_du_r_cap.input(2)))
  .add(liens_d_sabo.to(regrouper_les_donn_es_du_r_cap.input(3)))
  .add(regrouper_les_donn_es_du_r_cap)
  .to(construire_le_r_cap
  .to(envoyer_le_r_cap)
  .to(trouver_connexions_et_pubs)
  .to(mettre_la_corbeille))