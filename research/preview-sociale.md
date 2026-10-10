# Aperçu de partage — 11 octobre 2026

## Résultat

Remplacement de la façade historique dans les métadonnées sociales par une carte originale centrée sur le sport et le mouvement. Aucun numéro de rue ni adresse dans la composition. Le titre reste « Le soin. Le mouvement. Votre rythme. », avec la marque Pôle Santé Sport, bleu profond et sable, typographie Manrope locale.

La photo d’illustration a été créée avec l’outil intégré `image_gen` : coureuse fictive adulte en forêt, lumière matinale, tenue ardoise. Elle n’est présentée ni comme une patiente ni comme une professionnelle du pôle. Photo native 1122 × 1402 px, copie PNG conservée dans `output/imagegen/sport-preview-photo.png`, WebP qualité 90 pour le navigateur. Prompt exact et provenance : [generated-preview-sport.json](generated-preview-sport.json). Aucun texte ou habillage n’est généré dans la photo : la composition et la typographie sont écrites en HTML/CSS.

## Fichiers et utilisation

- Page animée : `public/share-preview.html`, consultable localement ou sur Pages via `/share-preview.html`.
- Design et animation : `public/share-preview.css`.
- Aperçu fixe destiné au partage : `public/assets/social/pole-sante-sport-preview-v2.jpg`, 1200 × 630 px.
- Master de composition : `output/social/preview-master.png`, 2400 × 1260 px. Il s’agit d’un rendu à double densité de la composition, pas d’une photo native à cette résolution.
- Capture reproductible : `npm run render:preview`. Chrome local est nécessaire ; chemin alternatif possible via `QA_CHROME_PATH`. Le script démarre sa propre fixture locale de lecture de `public/`, attend la police et la photo, désactive les animations pour la capture.
- Vérification ciblée : `npm run test:preview`, après `npm run build` et démarrage du serveur local sur le port 4174.

Pour modifier la composition, éditer le HTML/CSS puis lancer `npm run render:preview`, `npm run build` et les vérifications. Commiter l’image fixe produite avec les sources avant publication. Le workflow Pages déploie le rendu JPEG commité ; il n’a pas besoin d’un navigateur pour reconstruire le site. Une future nouvelle carte doit changer le nom de son fichier et la valeur de `shareImage` dans `scripts/build.mjs` afin de distinguer sa ressource des anciennes versions.

## Animation et aperçu des liens

La page affiche une animation CSS finie, d’une durée maximale de 4,5 secondes, rejouable. `prefers-reduced-motion` la désactive. L’aperçu social est un JPEG fixe extrait du même front. Aucune animation de vignette n’est promise dans les messageries ou réseaux.

Les 24 pages de contenu déclarent `og:image`, son format/dimensions/alternative, le nom du site et une carte `twitter:card=summary_large_image`. L’image a une nouvelle URL absolue versionnée ; les services de partage peuvent malgré cela conserver un ancien aperçu en cache. Pas de garantie de délai de rafraîchissement. Les messages déjà envoyés ne sont pas modifiés par la publication du site.

Le site et la page animée restent des démonstrations publiques avec `noindex`. Le noindex ne rend pas l’URL privée. Référence du format : [Open Graph](https://ogp.me/).

## Livraison

`npm run export` inclut le site public, les sources complètes et une archive dédiée `exports/apercu-social.zip` réunissant le front, sa photo, les polices, les deux rendus et la documentation. Les accès locaux restent exclus.

## Contrôles exécutés

- `npm test` : dix tests serveur/build réussis.
- `npm run test:preview` : douze contrôles réussis, aucune erreur JavaScript/HTTP/requête. Les métadonnées des 24 pages pointent vers la nouvelle carte, le JPEG est servi et décodé en 1200 × 630.
- Aucun débordement de la carte à 320, 390, 768 et 1440 px ; police locale et photo chargées.
- Animation normale terminée en 4,5 s, relance clavier fonctionnelle ; aucune animation avec réduction des mouvements.
- Capture exacte 1200 × 630 sans commandes ; ressources et liens vérifiés sous le sous-chemin GitHub Pages.
- Inspection visuelle du JPEG : titre lisible, visage entier, absence de façade, d’adresse et d’émoji. Deux audits Axe complémentaires sur la page animée à 1440 et 390 px : zéro violation.

Rapports d’exécution locaux : `test-results/share-preview-report.json` et `test-results/qa-share-preview-capture.png`. Les captures ne sont pas des tests sur téléphones physiques.
