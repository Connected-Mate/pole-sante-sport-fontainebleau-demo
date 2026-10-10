# Livraison — Pôle Santé Sport Fontainebleau

## Accès

- Démonstration publique en ligne : https://connected-mate.github.io/pole-sante-sport-fontainebleau-demo/
- Dépôt : https://github.com/Connected-Mate/pole-sante-sport-fontainebleau-demo
- Site sur cet ordinateur : http://127.0.0.1:4174/
- Administration locale : http://127.0.0.1:4174/admin/
- Mot de passe : `.local/access.json`, à lire sur l’ordinateur uniquement.

## Périmètre livré

24 pages HTML, 10 spécialités détaillées, 14 interlocuteurs, 3 articles pratiques, FAQ, présentation, galerie, contact et accès, mentions de démonstration et confidentialité. Appels directs, 3 liens Doctolib, Google Maps chargé à la demande, liens Waze/Apple Plans et QR code vers le 143 rue Grande. Carte et itinéraires par adresse : aucun temps de trajet ni accès PMR inventé.

La révision du 11 octobre renforce la place du sport pour tous les niveaux : « Votre corps. Votre sport. Votre rythme. ». La palette bleu profond, pierre et sable, la typographie Manrope et les compositions HTML/CSS accompagnent de vraies photographies de Pilates et de soins. Aucun nouveau visage n’a été généré ou reconstruit. Les anciens visuels synthétiques ont été retirés des médias publics ; leurs originaux et prompts historiques restent archivés dans les sources.

Quatre portraits authentifiés sont intégrés : Jean-Luc Tutakowski, Raj, Frédérique Marty et Didier Lapôtre. Dix fiches conservent leurs initiales : trois portraits identifiés sur Doctolib sont inaccessibles au téléchargement (Carine Marie, Isabelle Trohel, Jonathan Herjean ; HTTP 403), sept autres n’ont pas de portrait public fiable retrouvé. Aucun avatar ou homonyme ne les remplace. Voir [les portraits récupérés](research/portraits-officiels.json), [la recherche Doctolib](research/portraits-doctolib.json) et [les photos réelles](research/real-sport-images.json).

Le logo historique apparaît dans une introduction animée de 1,5 seconde sur l’accueil, après la notice de démonstration. Elle se rejoue depuis le pied de page, s’interrompt dès une interaction et respecte la préférence de réduction du mouvement. La navigation reste utilisable.

Administration locale authentifiée, brouillons validés, publication locale, historique, restauration et sauvegarde JSON. GitHub Pages héberge le HTML public. Publication distante par Git et action GitHub ; elle n’est pas déclenchée implicitement depuis l’administration.

## Points à valider

- Date de retrait de la démo non fournie : configuration préparée, aucun retrait daté actif.
- Numéro d’Isabelle Trohel contradictoire : lien Doctolib utilisé.
- Présence actuelle du yoga à confirmer.
- Aucun horaire collectif vérifiable, aucun standard collectif confirmé.
- Accessibilité, parking précis et transports à valider ; pas de reprise des anciens numéros de bus.
- Entité juridique, directeur de publication et mentions professionnelles non communiqués. Pages légales adaptées à la démo, à finaliser avant exploitation officielle.
- Fiche Google liée depuis le site retrouvée, mais contenu actuel non vérifié directement : aucun avis ou classement repris.
- Droits de réutilisation des images historiques et du logo confirmés dans la conversation du 10 octobre ; récupération des photographies professionnelles réelles explicitement demandée le 11 octobre. Conserver les autorisations et crédits du cabinet et des professionnels avant lancement. La disponibilité publique des nouvelles sources ne constitue pas une licence tierce.
- Obtenir les dix portraits manquants directement auprès des professionnels pour compléter les fiches.

Les sources, limites, benchmark concurrentiel et étapes du lancement officiel figurent dans `README.md` et `research/`.

## Validation de cette révision

La version du 11 octobre a passé les **10 tests serveur/build**, incluant la validation des nouveaux champs de portrait. La suite navigateur a réussi **158 contrôles sur 158**, avec 24 pages vérifiées et 24 analyses Axe sans défaut détecté.

Les contrôles ciblés réussissent également : **20/20** pour l’introduction et les photos réelles, **12/12** pour l’aperçu v3, **6/6** pour les champs portrait du back-office. Rapports : `research/real-photos-intro-qa.json`, `research/preview-sociale-qa.json` et `research/admin-portraits-qa.json`. Les cinq archives ont été produites et contrôlées ; les **62 fichiers du ZIP public** sont identiques au build, aucun accès local n’est exporté. Les 14 photographies originales correspondent aux empreintes des audits.

Publication confirmée par [GitHub Actions](https://github.com/Connected-Mate/pole-sante-sport-fontainebleau-demo/actions/runs/38094061079). Les 24 pages publiques répondent 200 avec noindex et la carte v3. Les quatre portraits et les fichiers du logo animé sont identiques au build local. Animation, photo d’accueil et aperçu contrôlés dans Chrome sur l’URL publique, sans erreur JavaScript. Les anciens médias générés et les chemins privés contrôlés répondent 404. Rapport : `research/real-publication.json`.

Les appels et les réservations ne sont pas réellement déclenchés pendant les contrôles. Les audits automatisés ne constituent pas une certification d’accessibilité ni un test sur appareil physique.

## Administration des portraits

Dans le back-office local, rubrique **Équipe & coordonnées**, sélectionner la personne et renseigner **Portrait (fichier du projet)** (`portrait`) et **Source du portrait** (`portraitSourceUrl`). Le fichier doit d’abord être déposé dans `public/assets/team/` ; saisir ensuite son chemin relatif, par exemple `team/jean-luc-tutakowski.webp`, ainsi que l’URL HTTPS de la page professionnelle nominative. Le champ vide conserve les initiales. La construction refuse un portrait dont le fichier est absent et conserve la version publiée précédente.

Enregistrer le brouillon, valider, publier localement, puis vérifier les pages. Pour mettre la version publique à jour, commiter les contenus et les fichiers image et pousser vers `main` ; l’action GitHub construit et publie `dist/`. Le back-office ne publie pas directement sur GitHub Pages. Les sauvegardes JSON contiennent les références des médias, pas leurs fichiers : sauvegarder aussi les images et les originaux. Instructions complètes dans [README.md](README.md).

## Export

- `exports/site-public.zip` : site statique à servir en HTTP.
- `exports/sources-completes.zip` : sources, administration et documentation ; dépendances à réinstaller avec `npm ci`.
- `exports/photos-reelles-originaux.zip` : originaux des photographies réelles récupérées.
- `exports/apercu-social.zip` : composition et rendus de l’aperçu v3.

`npm run export` régénère les exports du site après construction. Aucun mot de passe, aucune session, aucun historique local ni dépendance npm ne doit être inclus. L’ancienne archive `exports/archives-visuels-ia-historiques.zip` contient des visuels historiques retirés du site, pas les photos de cette livraison.

## Aperçu sportif v3

L’aperçu public emploie une vraie photographie de Pilates, le logo du pôle et un habillage HTML/CSS, sans adresse. JPEG 1200 × 630 : `public/assets/social/pole-sante-sport-preview-v3.jpg`. Master : `output/social/preview-master-v3.png`. Carte animée publique : https://connected-mate.github.io/pole-sante-sport-fontainebleau-demo/share-preview.html.

La carte de partage est rejouable au clavier et respecte la réduction des animations. Elle est distincte de l’introduction du logo sur l’accueil. Recréer son rendu avec `npm run render:preview`, puis `npm run build`. Les services de partage peuvent conserver une ancienne vignette en cache ; les messages déjà envoyés ne sont pas modifiés par la publication.
