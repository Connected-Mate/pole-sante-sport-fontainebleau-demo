# Livraison — Pôle Santé Sport Fontainebleau

## Accès

- Démonstration publique prévue : https://connected-mate.github.io/pole-sante-sport-fontainebleau-demo/
- Dépôt : https://github.com/Connected-Mate/pole-sante-sport-fontainebleau-demo
- Site sur cet ordinateur : http://127.0.0.1:4174/
- Administration locale : http://127.0.0.1:4174/admin/
- Mot de passe : `.local/access.json`, à lire sur l’ordinateur uniquement.

## Périmètre livré

24 pages HTML, 10 spécialités détaillées, 14 interlocuteurs, 3 articles pratiques, FAQ, présentation, galerie, contact et accès, mentions de démonstration et confidentialité. Appels directs, 3 liens Doctolib, Google Maps chargé à la demande, liens Waze/Apple Plans et QR code vers le 143 rue Grande. Carte et itinéraires par adresse : aucun temps de trajet ni accès PMR inventé.

Direction visuelle issue des bleus et de la touche rouge du logo, composition typographique aérée, photographie des soins et vraie façade. La qualité et la définition des photographies restent celles des sources disponibles.

Administration locale authentifiée, brouillons validés, publication locale, historique, restauration et sauvegarde JSON. GitHub Pages héberge le HTML public. Publication distante par Git et action GitHub ; elle n’est pas déclenchée implicitement depuis l’administration.

## Points à valider

- Date de retrait de la démo non fournie : configuration préparée, aucun retrait daté actif.
- Numéro d’Isabelle Trohel contradictoire : lien Doctolib utilisé.
- Présence actuelle du yoga à confirmer.
- Aucun horaire collectif vérifiable, aucun standard collectif confirmé.
- Accessibilité, parking précis et transports à valider ; pas de reprise des anciens numéros de bus.
- Entité juridique, directeur de publication et mentions professionnelles non communiqués. Pages légales adaptées à la démo, à finaliser avant exploitation officielle.
- Fiche Google liée depuis le site retrouvée, mais contenu actuel non vérifié directement : aucun avis ou classement repris.
- Droits de réutilisation des images et logo confirmés dans la conversation ; conserver les justificatifs et crédits avant lancement.

Les sources, limites, benchmark concurrentiel et étapes du lancement officiel figurent dans `README.md` et `research/`.

## Validation

Les résultats détaillés et limites seront consignés dans `research/verification.md` après les contrôles finaux. Les captures et rapports techniques locaux sont dans `test-results/`.

## Export

`npm run export` crée `exports/site-public.zip` et `exports/sources-completes.zip`. Aucun mot de passe, aucune session, aucun historique local ni dépendance npm n’est inclus. Les sources incluent les instructions pour réinstaller et relancer le projet.
