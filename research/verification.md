# Vérification de livraison — 10 octobre 2026

## Révision courante — 11 octobre 2026, photographies réelles

Cette révision remplace les visuels synthétiques du site et de l’aperçu par de vraies photographies. Quatre portraits professionnels sont authentifiés et intégrés ; dix restent à obtenir. Le détail et les sources figurent dans `portraits-officiels.json`, `portraits-doctolib.json` et `real-sport-images.json`. Le JPEG social courant est `pole-sante-sport-preview-v3.jpg`.

Validation locale : 10 tests serveur/build réussis ; 158 contrôles navigateur sur 24 pages, avec 24 analyses Axe sans violation détectée ; 20 contrôles ciblés sur les portraits, les photos et l’introduction du logo ; 6 contrôles du formulaire de portraits dans le back-office. Les captures attendent le décodage des photographies avant inspection. Les photographies natives restent archivées sans reconstruction de visage.

L’aperçu v3 passe 12 contrôles supplémentaires. Déploiement public du commit `0d2e6df` confirmé : 24 pages, quatre portraits, huit ressources comparées au build et chemins historiques/privés contrôlés. Les 62 fichiers de l’export public ont été comparés octet par octet. Détails dans `real-publication.json`.

La signature sportive, le vrai logo et son animation de 1,5 seconde sont intégrés. L’animation est rejouable au clavier, interrompue par une interaction et désactivée avec la réduction des mouvements. Le site conserve sa notice de démonstration publique et noindex. La date de retrait reste à définir.

Les sections suivantes retracent les versions antérieures ; leurs images et résultats ne décrivent pas la version actuelle. Le bilan final de la révision se trouve dans `LIVRAISON.md`.

## Mise à jour du 11 octobre — aperçu social sportif

La vieille façade était encore référencée dans `og:image`. Les 24 pages de contenu déclarent maintenant le JPEG 1200 × 630 `assets/social/pole-sante-sport-preview-v2.jpg`, avec type/dimensions/alternative, nom du site et carte Twitter. Le front public `share-preview.html` ajoute une animation finie de 4,5 s et un mode réduit. Le JPEG et le master PNG 2400 × 1260 sont rendus depuis le même HTML/CSS.

Dix tests serveur/build et douze contrôles de preview réussis. Deux audits Axe (ordinateur/mobile) sans violation. Cadrage du visage, lisibilité, absence d’adresse/emoji/façade inspectés ; chargement, clavier, réduction de mouvement, dimensions et sous-chemin GitHub vérifiés. Les autres pages du site ne sont pas modifiées visuellement par cette mise à jour. Provenance, prompt et processus : [preview-sociale.md](preview-sociale.md).

## Révision artistique : soin et mouvement

Nouvelle identité visuelle bleu profond, pierre et sable, typographie Manrope auto-hébergée, photographies rectangulaires, cartes de disciplines illustrées et section mouvement sur l’accueil. Suppression des émojis décoratifs et des mentions publiques IA/retouche à la demande de l’utilisateur ; sources et provenance conservées dans le projet. Aucun contact, tarif, diplôme, avis ou résultat médical ajouté.

- Build de 24 pages réussi et dix tests serveur/build réussis.
- Suite navigateur : 158 contrôles, 155 réussis. Les trois échecs concernaient le même défaut de contraste sur les trois numéros `.care-steps li > span` de l’accueil.
- Couleur corrigée de `#536963` vers `#42594f`. Recontrôle ciblé : 12/12 réussis, sans défaut restant. Quatre audits Axe (accueil ordinateur/mobile, menu et popup), quatre largeurs sans débordement (320, 390, 768, 1440), quatre contrôles de chargement des images de cartes.
- Titres, descriptions, H1 et noindex, liens internes, appels, trois liens Doctolib, filtres, clavier, carte chargée à la demande et chemins GitHub Pages contrôlés lors de la suite complète. Les audits des autres pages ne signalaient aucune violation.
- Texte visible, alternatives et métadonnées des 24 pages : aucune mention IA/retouchée/générée et aucun emoji décoratif. Les flèches et repères fonctionnels sont des SVG.
- Neuf captures inspectées : accueil ordinateur/mobile/tablette, mouvement, cartes de spécialités ordinateur/mobile, fiche kinésithérapie, rendez-vous et footer. Nouvelle capture des cartes mobiles après attente du décodage des quatre images.

Rapport : [design-qa.json](design-qa.json). Les contrôles historiques ci-dessous restent datés et distincts de cette révision. Les tests dans Chrome redimensionné ne constituent pas des essais sur un téléphone/tablette physique ni une certification d’accessibilité.

## Mise à jour des illustrations IA

Au deuxième tour, l’utilisateur a explicitement demandé de refaire les photographies avec le modèle d’image, avec un rendu photoréaliste haut de gamme. Cette demande élargit l’autorisation initiale de réutilisation des médias historiques. Six visuels ont été travaillés avec `image_gen` intégré : cinq illustrations nouvelles (kinésithérapie, podologie, nutrition, ostéopathie et yoga) et une retouche de la photographie historique de la façade du 143. Le logo historique est inchangé. La source de la façade est conservée dans `public/assets/facade.png` et consultable depuis la galerie.

Les cinq nouvelles illustrations représentent des personnes et des décors fictifs, sans attribution à l’équipe, aux patients ou aux locaux réels. Leurs sorties PNG ont été inspectées visuellement : cadrage, cohérence anatomique, textures, lumière et absence de marque ou de texte lisible. La façade retouchée est issue d’une photographie réelle mais ses détails fins sont reconstruits par le modèle ; ce n’est pas une nouvelle prise de vue ni une garantie d’exactitude documentaire. Sorties PNG conservées dans `output/imagegen/`, variantes de diffusion dans `public/assets/generated/` en WebP qualité 90. Aucun recadrage, redimensionnement ni retouche supplémentaire n’est appliqué lors de la conversion WebP, qui utilise une compression avec perte. Dimensions réelles : 1402 × 1122 px pour la kinésithérapie, 1536 × 1024 px pour les quatre autres illustrations et 1373 × 1145 px pour la façade retouchée. Aucune résolution 8K native n’est revendiquée.

Provenance et prompts : [photographies-ia.md](photographies-ia.md). Le contrôle ciblé [photos-qa.json](photos-qa.json), terminé le 10 octobre 2026 à 18:18 UTC, couvre neuf vues locales avant l’ajout de la façade retouchée : cinq WebP chargés et signalés comme illustrations IA, aucun débordement, aucune erreur JavaScript ou échec de requête et aucun défaut relevé. La lecture du cadrage a été contrôlée sur les captures desktop et mobile. La vérification complémentaire de la façade, le build, les exports et la publication actualisée restent à consigner après leur exécution. Les résultats ci-dessous sont l’historique de la livraison initiale et ne sont pas reconduits implicitement.

## Historique des contrôles de la livraison initiale

## Site et contenus

- 24 pages HTML construites : accueil, spécialités, 10 fiches, équipe, rendez-vous, FAQ, contact/accès, galerie, journal, 3 articles, mentions, confidentialité et 404.
- 10 disciplines et 14 intervenants rapprochés des pages publiques ; 3 liens Doctolib.
- Titres et descriptions uniques, un H1 par page, JSON-LD lisible, liens internes et ressources contrôlés.
- Sources, contradiction du numéro d’Isabelle Trohel et limites des informations d’accès documentées. Aucune promesse médicale, aucun avis, diplôme ou tarif inventé.
- Autorisation de réutiliser les images et le logo confirmée par le demandeur. À la livraison initiale, la photo du 143 était distinguée des images d’illustration et aucune image générée n’était utilisée. Cinq illustrations IA ont ensuite été créées sur demande explicite, comme décrit ci-dessus ; elles ne sont pas des portraits réels de l’équipe.

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

### Contrôle final après la retouche de façade

Le parcours navigateur complet a été relancé après intégration des six visuels : **158 contrôles réussis, zéro échec, 24 pages et 24 audits Axe sans violation détectée**. Les dix tests serveur/build passent également. Les six images de la galerie chargent correctement ; captures de l’accueil et des vues intermédiaires de galerie inspectées à l’écran. Synthèse : [photos-final-qa.json](photos-final-qa.json). Les anciennes captures pleine page peuvent omettre le rendu des images hors écran ; les vérifications visuelles finales ont été faites après défilement.
