# Livraison — Pôle Santé Sport Fontainebleau

## Accès

- Démonstration publique en ligne : https://connected-mate.github.io/pole-sante-sport-fontainebleau-demo/
- Dépôt : https://github.com/Connected-Mate/pole-sante-sport-fontainebleau-demo
- Site sur cet ordinateur : http://127.0.0.1:4174/
- Administration locale : http://127.0.0.1:4174/admin/
- Mot de passe : `.local/access.json`, à lire sur l’ordinateur uniquement.

## Périmètre livré

24 pages HTML, 10 spécialités détaillées, 14 interlocuteurs, 3 articles pratiques, FAQ, présentation, galerie, contact et accès, mentions de démonstration et confidentialité. Appels directs, 3 liens Doctolib, Google Maps chargé à la demande, liens Waze/Apple Plans et QR code vers le 143 rue Grande. Carte et itinéraires par adresse : aucun temps de trajet ni accès PMR inventé.

Direction visuelle révisée à la demande de l’utilisateur : bleu profond, pierre et sable, typographie Manrope, photographie rectangulaire et repères numérotés. Le ton associe soin, mouvement et accompagnement, avec le titre « Le soin. Le mouvement. Votre rythme. ». Les émojis décoratifs et les mentions de génération/retouche ont été retirés des pages publiques. La provenance documentaire des six visuels reste conservée ici : cinq illustrations et une retouche de la façade. Les scènes de kinésithérapie, podologie, nutrition, ostéopathie et yoga sont fictives ; elles ne représentent pas les praticiens, patients ou locaux réels. La façade retouchée s’appuie sur la photographie historique du 143 ; certains détails fins sont reconstruits par le modèle. Ce n’est ni une nouvelle prise de vue réelle ni une reproduction documentaire exacte. La source originale est conservée dans `public/assets/facade.png` et consultable depuis la galerie. Le logo historique est inchangé.

Les sorties PNG du modèle sont conservées dans `output/imagegen/` et diffusées en WebP qualité 90 dans `public/assets/generated/`, sans recadrage, redimensionnement ni retouche supplémentaire lors de la conversion ; l’encodage WebP est avec perte. Dimensions natives : 1402 × 1122 px pour l’image d’accueil, 1536 × 1024 px pour les quatre autres illustrations, 1373 × 1145 px pour la façade retouchée. Le rendu est photoréaliste et détaillé, sans revendication de 8K natif. Voir [la provenance et les prompts](research/photographies-ia.md).

Administration locale authentifiée, brouillons validés, publication locale, historique, restauration et sauvegarde JSON. GitHub Pages héberge le HTML public. Publication distante par Git et action GitHub ; elle n’est pas déclenchée implicitement depuis l’administration.

## Points à valider

- Date de retrait de la démo non fournie : configuration préparée, aucun retrait daté actif.
- Numéro d’Isabelle Trohel contradictoire : lien Doctolib utilisé.
- Présence actuelle du yoga à confirmer.
- Aucun horaire collectif vérifiable, aucun standard collectif confirmé.
- Accessibilité, parking précis et transports à valider ; pas de reprise des anciens numéros de bus.
- Entité juridique, directeur de publication et mentions professionnelles non communiqués. Pages légales adaptées à la démo, à finaliser avant exploitation officielle.
- Fiche Google liée depuis le site retrouvée, mais contenu actuel non vérifié directement : aucun avis ou classement repris.
- Droits de réutilisation des images historiques et du logo confirmés dans la conversation ; conserver les justificatifs et crédits avant lancement. La refonte des photographies avec le modèle d’image a été demandée explicitement au deuxième tour ; faire valider l’utilisation et le signalement des cinq illustrations et de la façade retouchée avant lancement officiel.

Les sources, limites, benchmark concurrentiel et étapes du lancement officiel figurent dans `README.md` et `research/`.

## Validation

La dernière révision visuelle a passé les dix tests serveur/build. La suite navigateur a exécuté 158 contrôles : 155 réussis et trois signalements correspondant à un même contraste insuffisant sur les repères numérotés de la section mouvement. Après correction, 12 contrôles ciblés ont réussi : quatre audits Axe de l’accueil (ordinateur, mobile, menu et popup), quatre vérifications de débordement et quatre vérifications de chargement des photographies de cartes.

Les parcours d’appel et de réservation, filtres, liens locaux, clavier, métadonnées et export sous le chemin GitHub Pages ont été vérifiés. Captures inspectées à 390, 768 et 1440 px ; débordements contrôlés également à 320 px. Aucun défaut connu restant à l’issue de ces contrôles. Les téléphones et réservations n’ont pas été réellement déclenchés ; aucun test sur appareil physique ni certification d’accessibilité.

Le rapport [design-qa.json](research/design-qa.json) distingue l’exécution complète initiale du recontrôle après correction. Le détail visuel figure dans [direction-artistique.md](research/direction-artistique.md).

## Export

`npm run export` crée `exports/site-public.zip` et `exports/sources-completes.zip`. Aucun mot de passe, aucune session, aucun historique local ni dépendance npm n’est inclus. Les sources incluent les instructions pour réinstaller et relancer le projet.

Originaux des six visuels : `exports/visuels-generes-originaux.zip` ; prompts : `research/photographies-ia.md`.

## Mise à jour du 11 octobre — aperçu sportif

L’ancienne façade de l’aperçu de lien est remplacée par une composition sportive : photographie de course douce, Manrope, bleu profond et sable, sans adresse. La typographie et l’habillage sont codés en HTML/CSS. Carte fixe JPEG 1200 × 630 déclarée sur les 24 pages du site ; version animée publique : `share-preview.html`. Animation limitée à 4,5 secondes, rejouable au clavier, désactivée avec la préférence de réduction du mouvement.

Douze contrôles spécifiques réussis et dix tests serveur/build réussis. Deux audits Axe supplémentaires de la page animée (ordinateur et mobile) n’ont relevé aucune violation. Ces contrôles ne constituent pas une certification. Les services de partage peuvent conserver temporairement l’ancienne vignette en cache ; les messages déjà envoyés ne sont pas modifiés par la publication.

Fichiers : `public/assets/social/pole-sante-sport-preview-v2.jpg`, `output/social/preview-master.png`, `public/share-preview.html`, `public/share-preview.css`. Archive dédiée : `exports/apercu-social.zip`. Photo créée via l’outil intégré, provenance et prompt conservés dans `research/generated-preview-sport.json`. Instructions : `research/preview-sociale.md`.
