# Checklist SEO, contenu et publication

Audit du 10 octobre 2026, effectué pendant l’intégration. Lecture de `scripts/build.mjs`, `content/site.json`, `content/editorial.json` et du validateur de `server.mjs`. Le générateur et le contenu n’ont pas été modifiés pendant cet audit. Les observations ci-dessous doivent être rapprochées du dernier build avant livraison ; elles ne valent pas rapport de déploiement.

## Démonstration publique

- [x] Le générateur prévoit `noindex, nofollow, noarchive` sur chaque page lorsque `site.demo.enabled` vaut `true`.
- [x] La popup, le bandeau et les mentions signalent une démonstration publique et non officielle.
- [x] Le `robots.txt` de démonstration laisse explorer les pages afin que les moteurs puissent lire leur balise `noindex`.
- [x] Le code canonique et Open Graph est construit à partir de `site.publicBaseUrl`, et non d’une adresse localhost.
- [ ] Vérifier le HTML réellement publié sur GitHub Pages, y compris une spécialité, un article, la FAQ et la page 404 : présence effective de `noindex`, adresse canonique correcte et réponse attendue.
- [ ] Conserver le statut public de la démo dans le compte rendu : `noindex` ne protège pas l’accès et n’impose rien aux moteurs qui ne le respectent pas.
- [ ] Employer « Demande de non-indexation » dans la popup plutôt que « Indexation désactivée », qui suggère un contrôle absolu.
- [ ] Laisser la date de retrait vide tant qu’elle n’est pas fournie. Retirer une popup à une date ne doit pas retirer automatiquement `noindex`, modifier le domaine ou transformer la démo en site officiel.
- [ ] Ne pas soumettre le sitemap de démonstration pour demander son indexation.

La documentation Google confirme qu’une page doit rester explorable pour que sa consigne `noindex` soit lue ; une interdiction d’exploration n’est donc pas une protection supplémentaire équivalente. [Source Google](https://developers.google.com/search/docs/crawling-indexing/block-indexing).

## Résultats de la revue du générateur

| Observation | Conséquence | Action / état au moment de la revue |
|---|---|---|
| Titres, descriptions, paragraphes et JSON-LD sont échappés ; les liens externes ont `noopener noreferrer`. | Bonne base contre l’interprétation de contenu comme HTML. | Conserver les fonctions d’échappement. |
| Les slugs étaient interpolés dans les attributs HTML et les chemins de sortie sans contrainte. | Un contenu importé via le back-office pouvait produire une injection d’attribut ou un fichier hors du dossier de génération. | Signalé au parent et au développeur du back-office. Le validateur a été corrigé et revérifié ; appliquer aussi cette validation au début du build. |
| Les tableaux `sourceUrls` acceptaient initialement un protocole `javascript:`. | Un lien dangereux pouvait être publié depuis du contenu administrateur. | Corrigé dans le validateur et revérifié. Le helper de liens du build doit également limiter les URL externes à HTTP(S). |
| Les liens du fichier 404 sont relatifs. | Sur une URL inconnue imbriquée telle que `/specialites/inconnue`, le navigateur peut chercher les assets et l’accueil au mauvais endroit. | Employer le préfixe de déploiement pour la page 404 et tester ce cas sur GitHub Pages. |
| Le snapshot de `site.team` lu au début de la revue ne contenait que les quatre kinésithérapeutes. | Les neuf autres spécialités n’avaient pas encore de contact associé. | Finaliser l’intégration des quatorze interlocuteurs publiés, puis tester chaque filtre de rendez-vous. |
| Les pages de mentions sont écrites pour une démonstration, même si le drapeau `demo` passe à `false`. | Un simple changement de drapeau ne produit pas un site officiel finalisé. | Réviser mentions, footer, popup et texte de confidentialité pour le lancement. |
| Les sources juridiques figurent dans `editorial.legal.sourceUrls`, mais le générateur de mentions ne les reprend pas dans sa liste finale. | Les références CNIL et Service Public ne sont pas accessibles depuis cette page. | Inclure les sources légales du contenu dans le bloc de sources. |

Les tests de sécurité ont été réalisés en mémoire, sans modifier les contenus ni écrire de fichier de démonstration d’attaque. Après correction du validateur, les trois entrées suivantes sont refusées : slug `../../audit-canary`, slug contenant une injection d’attribut, et source de protocole `javascript:`. Les JSON réels sont acceptés. Le lancement du build, l’échappement de sortie et le contrôle du dossier de destination restent à vérifier sur la version finale.

## Exactitude du contenu

- [x] Les dix activités correspondent à celles du site historique ; aucun service concurrent n’a été attribué au pôle.
- [x] Aucun avis, note, prix, diplôme, certificat ou taux de réussite n’est ajouté dans le contenu éditorial.
- [x] Les affirmations médicales fortes de l’ancien site ont été écartées. Les trois articles portent sur l’organisation du rendez-vous et l’accès.
- [x] Les horaires particuliers du Pilates ne sont pas utilisés comme horaires généraux.
- [x] Les informations de stationnement, accessibilité et transport insuffisamment vérifiées sont présentées comme restant à confirmer.
- [x] Les coordonnées des deux adresses ne sont pas fusionnées en un numéro de rue fictif.
- [ ] Pour Isabelle Trohel, conserver le lien Doctolib en attendant confirmation du téléphone contradictoire.
- [ ] Pour Jonathan Herjean, rappeler au besoin de sélectionner le cabinet de Fontainebleau sur le profil de réservation qui présente plusieurs lieux.
- [ ] Harmoniser le yoga dans tous les fichiers : `yoga1.html` récupéré pendant la recherche indique Raj au **143 rue Grande**. Cette adresse est publiée par le pôle ; l’offre actuelle et la présence de l’intervenante restent à confirmer. Une première version de l’audit local indiquait à tort qu’aucun numéro de rue n’était attribué.
- [ ] Les droits médias et l’objectif appels/Doctolib ont été confirmés au parent au cours de la tâche. Les rapports initiaux écrits avant cette confirmation doivent être lus avec cette mise à jour ; ne pas demander à nouveau ces autorisations.
- [ ] Documenter les crédits et les sources de chaque image. Les photos de discipline sont des illustrations et ne prouvent ni le lieu d’exercice représenté ni l’identité d’un praticien.

Les URL Doctolib des trois professionnels et les références CNIL/Service Public ont répondu 200 lors du contrôle HTTP. Les pages du site historique avaient été récupérées intégralement pour la rédaction ; une série de contrôles ultérieurs a reçu des erreurs 406 puis 500. Cette réponse temporaire ne démontre pas leur suppression et ne justifie pas de retirer leurs sources. Aucun lien source n’a été arbitrairement remplacé.

## Données structurées

- [x] Le générateur contient `WebSite`, `WebPage`, `Organization` et un objet `FAQPage` pour la FAQ.
- [x] Les réponses structurées de la FAQ sont tirées des mêmes réponses que celles affichées à l’écran.
- [x] Aucune `aggregateRating`, aucun avis, prix, horaire collectif, diplôme ou géolocalisation non confirmé n’est généré.
- [ ] Vérifier que chaque JSON-LD se parse et décrit précisément le contenu visible. Ajouter des identifiants `@id` stables aux entités si elles sont reliées entre plusieurs pages.
- [ ] Dans la démo, ne pas présenter le site GitHub Pages comme le site officiel ou comme la preuve de propriété de l’organisation. Le lien de l’organisation doit rester celui du site actuel.
- [ ] Au lancement, conserver `Organization` tant que le statut exact du regroupement n’est pas confirmé. Ne pas attribuer arbitrairement le type `MedicalClinic` ou une profession réglementée à l’ensemble des intervenants.
- [ ] Pour une éventuelle structure `LocalBusiness`, vérifier les champs attendus et représenter correctement chacun des deux lieux ; ne pas attribuer au 160 les coordonnées géographiques historiques du 143.
- [ ] Pour `Person`, `Service`, `Article` ou `BreadcrumbList`, n’ajouter que des faits visibles et confirmés. Les fonctions ou qualifications ne doivent pas être déduites du nom d’une activité.
- [ ] Ne pas promettre de résultat enrichi, de position dans Google, de reprise dans une réponse d’IA ou de citation.

Google exige des données structurées représentatives, exactes, visibles et non trompeuses, et ne garantit pas leur affichage. [Règles des données structurées](https://developers.google.com/search/docs/appearance/structured-data/sd-policies).

Le balisage `FAQPage` peut rester utile comme description sémantique, mais il ne faut plus présenter les résultats enrichis FAQ comme une fonctionnalité Google attendue : la documentation Google annonce leur suppression à compter du 7 mai 2026. [Journal officiel des modifications](https://developers.google.com/search/updates).

## Avant le lancement officiel

1. Faire valider par l’exploitant la liste des intervenants, les adresses, les contacts, les prestations et les conditions pratiques. Confirmer la fiche Google et la cohérence des coordonnées.
2. Compléter l’identité juridique de l’éditeur et ses coordonnées, la publication, l’hébergement et les informations professionnelles applicables. Les champs manquants signalés dans la démo ne constituent pas des mentions finales.
3. Adapter la politique de confidentialité aux outils réellement actifs. Le back-office fonctionne localement ; GitHub Pages héberge des fichiers statiques. Ne pas laisser penser que l’administration ou les sauvegardes sont hébergées sur Pages.
4. Renseigner l’URL officielle de production, régénérer les canonical, Open Graph, sitemap et identifiants structurés. Vérifier HTTPS et le comportement entre les variantes avec et sans `www`.
5. Préparer les redirections des anciennes URLs : `index0.html`, `kine2.html`, `kinesitherapie.html` et les anciennes pages métier vers leur nouvelle page correspondante. Les règles doivent être mises en place sur l’hébergement qui recevra le domaine officiel.
6. Après validation du contenu et de l’hébergement officiels, retirer `noindex` uniquement du site officiel. Garder la démo publique identifiée comme telle et non indexable, ou la retirer selon la décision du propriétaire.
7. Soumettre le sitemap du domaine officiel et vérifier l’exploration avec l’outil adapté au compte du propriétaire. Aucun compte ni droit de gestion n’a été présumé dans cette démo.

L’identité de l’hébergeur GitHub et son adresse figurant dans le générateur ont été rapprochées de sa [déclaration officielle de confidentialité](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement). Cette vérification ne complète pas l’identité encore manquante de l’éditeur du site. Les mentions finales dépendent du statut juridique réel : [Service Public — société](https://entreprendre.service-public.gouv.fr/vosdroits/F37351), [Service Public — entrepreneur individuel](https://entreprendre.service-public.gouv.fr/vosdroits/F31228). Les mentions de collecte doivent correspondre au traitement concret, selon les [exemples de la CNIL](https://www.cnil.fr/fr/exemples-de-formulaire-de-collecte-de-donnees-caractere-personnel).

## Contrôles du build final et de l’export

- [ ] Une balise title, une description et un H1 propres à chaque page ; canonical absolue et correcte.
- [ ] Liens internes résolus depuis toutes les profondeurs ; aucun asset absent ni lien de rendez-vous sans interlocuteur.
- [ ] Présence des sources dans les pages métier, articles et mentions ; date de vérification conservée sans inventer une nouvelle relecture.
- [ ] Parcours clavier : menu, fermeture/réouverture de la popup, accordéons, filtres et chargement facultatif de la carte.
- [ ] Écrans mobile, tablette et bureau : texte lisible, absence de débordement, CTA atteignables et titres non masqués.
- [ ] Carte sans connexion à Google avant action ; lien Google Maps, Waze, Apple Plans et QR code pointant au bon numéro de rue.
- [ ] Ouverture d’une URL erronée imbriquée : vraie page 404, assets et retour accueil fonctionnels.
- [ ] Export limité au site public attendu ; aucun mot de passe, fichier `.local`, brouillon, historique, sauvegarde privée ou code d’authentification publié.
- [ ] Distinguer le résultat des tests locaux de la vérification HTTP de la preview publiée. Ne pas annoncer comme validé un contrôle encore en attente.
