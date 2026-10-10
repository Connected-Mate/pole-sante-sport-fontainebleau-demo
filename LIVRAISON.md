# Livraison — Pôle Santé Sport Fontainebleau

## Accès

- Démonstration publique en ligne : https://connected-mate.github.io/pole-sante-sport-fontainebleau-demo/
- Dépôt : https://github.com/Connected-Mate/pole-sante-sport-fontainebleau-demo
- Site sur cet ordinateur : http://127.0.0.1:4174/
- Administration locale : http://127.0.0.1:4174/admin/
- Mot de passe : `.local/access.json`, à lire sur l’ordinateur uniquement.

## Périmètre livré

24 pages HTML, 10 spécialités détaillées, 14 interlocuteurs, 3 articles pratiques, FAQ, présentation, galerie, contact et accès, mentions de démonstration et confidentialité. Appels directs, 3 liens Doctolib, Google Maps chargé à la demande, liens Waze/Apple Plans et QR code vers le 143 rue Grande. Carte et itinéraires par adresse : aucun temps de trajet ni accès PMR inventé.

Direction visuelle issue des bleus et de la touche rouge du logo, composition typographique aérée et six visuels travaillés avec l’IA à la demande explicite de l’utilisateur au deuxième tour : cinq nouvelles illustrations et une retouche de la façade. Les scènes de kinésithérapie, podologie, nutrition, ostéopathie et yoga sont fictives ; elles ne représentent pas les praticiens, patients ou locaux réels. La façade retouchée s’appuie sur la photographie historique du 143 ; certains détails fins sont reconstruits par le modèle. Ce n’est ni une nouvelle prise de vue réelle ni une reproduction documentaire exacte. La source originale est conservée dans `public/assets/facade.png` et consultable depuis la galerie. Le logo historique est inchangé.

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

La livraison initiale, avant le remplacement des photographies, a passé 10 tests serveur/build et 158 contrôles navigateur : aucun débordement à 320, 390, 768 et 1440 px, et 24 audits Axe sans violation détectée. Ces contrôles ne constituent pas une certification.

Les cinq illustrations ont été inspectées visuellement et leur intégration a été contrôlée sur neuf vues locales : images chargées, légendes IA présentes, aucun débordement ni erreur navigateur détecté. Ce contrôle ciblé, consigné dans `research/photos-qa.json`, précède la retouche de la façade. La vérification complémentaire de la façade, le build, les exports et la publication actualisée restent à consigner dans `research/verification.md` après leur exécution ; les résultats initiaux ci-dessus ne valent pas validation de cette mise à jour.

Les résultats détaillés et limites sont consignés dans `research/verification.md` avec les contrôles de livraison. Les captures et rapports techniques locaux sont dans `test-results/`.

## Export

`npm run export` crée `exports/site-public.zip` et `exports/sources-completes.zip`. Aucun mot de passe, aucune session, aucun historique local ni dépendance npm n’est inclus. Les sources incluent les instructions pour réinstaller et relancer le projet.

Après remplacement des images : six visuels IA (cinq scènes originales et une retouche de façade), 158 contrôles navigateur et dix tests serveur/build réussis. Originaux : `exports/visuels-generes-originaux.zip` ; prompts : `research/photographies-ia.md`.
