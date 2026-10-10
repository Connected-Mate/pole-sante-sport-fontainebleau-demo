# Vérification de livraison — 10 octobre 2026

## Site et contenus

- 24 pages HTML construites : accueil, spécialités, 10 fiches, équipe, rendez-vous, FAQ, contact/accès, galerie, journal, 3 articles, mentions, confidentialité et 404.
- 10 disciplines et 14 intervenants rapprochés des pages publiques ; 3 liens Doctolib.
- Titres et descriptions uniques, un H1 par page, JSON-LD lisible, liens internes et ressources contrôlés.
- Sources, contradiction du numéro d’Isabelle Trohel et limites des informations d’accès documentées. Aucune promesse médicale, aucun avis, diplôme ou tarif inventé.
- Autorisation de réutiliser les images et le logo confirmée par le demandeur. Photo du 143 distinguée des images d’illustration. Pas de faux portraits ni d’images générées.

## Serveur et administration

`npm test` : **10 tests réussis**, zéro échec. Contrôles : authentification, refus d’origine distante, CSRF, chemins et fichiers privés, brouillons, validation, publication, historique, restauration, limitation des tentatives, rollback d’un build défaillant, refus des slugs dangereux et retrait daté de la démo dans une fixture isolée.

Administration testée dans Chrome réel en mode headless : connexion clavier, édition guidée, conservation des champs supplémentaires, sauvegarde/validation sur fixture et synchronisation avec le mode JSON. Zéro erreur JavaScript, zéro violation Axe et aucun débordement à 390, 768 et 1440 px. Aucun appel, rendez-vous ni message envoyé pendant les tests.

## Navigateur et responsive

Script reproductible : `tests/browser.mjs`, exécuté contre http://127.0.0.1:4174/ avec Chrome installé sur l’ordinateur. Rapport : `test-results/browser-report.json`.

Le parcours vérifie toutes les pages, les liens locaux, les largeurs 320/390/768/1440, les filtres de disciplines et de praticiens, les liens d’appel/Doctolib, la popup, le menu et les FAQ au clavier, la carte chargée uniquement à la demande, et l’export sous le sous-chemin GitHub Pages (404 imbriquée incluse). **158 contrôles réussis, zéro échec. 24 audits Axe sur les pages représentatives desktop/mobile, zéro violation détectée.**

Un débordement du titre à 320 px a été corrigé par une taille de titre adaptative. La légende de l’image d’accueil a été remontée pour rester lisible au-dessus du cartouche. Les captures sont des captures viewport, les captures Chrome pleine page mobile ayant présenté un artefact de répétition de tuiles ; cet artefact ne se reproduit pas en navigation.

## Publication réellement vérifiée

Premier déploiement GitHub Actions : [exécution réussie](https://github.com/Connected-Mate/pole-sante-sport-fontainebleau-demo/actions/runs/38074747527).

URL : https://connected-mate.github.io/pole-sante-sport-fontainebleau-demo/

- Les 24 pages ont répondu HTTP 200 sur la publication initiale, avec `noindex,nofollow,noarchive`.
- Popup affichée, annuaire de 14 personnes chargé, filtre ostéopathie dirigé vers le bon lien Doctolib.
- Aucune erreur JavaScript sur ce parcours public.
- `/admin/`, `/.local/access.json` et `/server.mjs` répondent 404 sur GitHub Pages.
- L’URL et le dépôt sont **publics**. Le noindex n’est ni une protection d’accès ni une garantie absolue de non-indexation.

## Exports

`npm run export` crée deux archives ZIP. Les 39 fichiers du site public ont été comparés octet par octet au build. Administration, identifiants et historique local sont absents de l’export public. `.local/`, `auth.json`, `access.json` et les dépendances sont absents de l’export sources. Le site statique est à ouvrir via un serveur HTTP (ou Pages).

## Limites explicites

- Ces contrôles automatisés ne constituent pas une certification d’accessibilité. Aucun lecteur d’écran réel ni iPhone/iPad physique n’a été testé ; mobile et tablette sont des vues Chrome redimensionnées.
- Les contacts téléphoniques ont été vérifiés dans les sources, sans appel réel. Aucun créneau n’a été réservé. Les services tiers peuvent changer leurs liens et conditions.
- Le retrait daté a été testé sur copie isolée ; la date réelle n’est pas fournie et `demo.retireAt` reste à `null`. L’action quotidienne est préparée, sans date de retrait active. Les sources et l’historique Git publics ne disparaissent pas avec le retrait des pages.
- Les mentions exploitant, l’accessibilité physique, le numéro téléphonique contradictoire et la présence actuelle du yoga restent à confirmer. La fiche Google actuelle n’a pas été lue directement.
- Sauvegardes et administration restent sur cet ordinateur ; aucune sauvegarde hors site automatique n’a été configurée.
