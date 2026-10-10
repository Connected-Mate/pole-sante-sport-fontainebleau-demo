# Aperçu de partage — 11 octobre 2026

## Résultat actuel

La carte v3 présente une vraie photographie d’un exercice de Pilates, le logo historique du Pôle Santé Sport et un habillage HTML/CSS marine et sable. Titre : « Votre corps. Votre sport. Votre rythme. » Signature : « Pour les sportifs de tous niveaux. » Aucun numéro de rue ni adresse dans la composition.

La photographie provient de la [page professionnelle Espace Pilates](https://www.espace-pilates.fr/la-methode), établissement lié depuis le site historique du pôle. La source native mesure 6016 × 4016 px. Elle est conservée à ses dimensions dans `public/assets/real/pilates-mouvement.webp` après conversion WebP. Aucune personne n’a été générée ou reconstruite. Le geste photographié illustre la discipline ; les personnes ne sont pas identifiées comme membres de l’équipe ou patients du pôle.

La source, son empreinte, ses dimensions et le contexte de réutilisation sont documentés dans [real-sport-images.json](real-sport-images.json). Le logo utilisé est `public/assets/logo.jpg`. La composition, les textes et les animations sont codés. L’ancien aperçu avec une coureuse synthétique a été retiré du site courant et de l’archive dédiée à l’aperçu ; son historique reste dans Git et dans les audits de génération.

## Fichiers et utilisation

- Page animée : `public/share-preview.html`, consultable localement ou sur Pages via `/share-preview.html`.
- Design et animation : `public/share-preview.css`.
- Aperçu fixe destiné au partage : `public/assets/social/pole-sante-sport-preview-v3.jpg`, 1200 × 630 px.
- Master de composition : `output/social/preview-master-v3.png`, 2400 × 1260 px, rendu de la composition à double densité.
- Capture reproductible : `npm run render:preview`. Chrome local est nécessaire ; chemin alternatif possible via `QA_CHROME_PATH`. Le script démarre un serveur local de lecture de `public/`, attend la police, le logo et la photo, puis désactive les animations pour la capture.
- Vérification ciblée : `npm run test:preview`, après `npm run build` et démarrage du serveur local sur le port 4174.

Pour modifier la composition, éditer le HTML/CSS puis lancer `npm run render:preview`, `npm run build` et les vérifications. Commiter l’image fixe produite avec les sources avant publication. Le workflow Pages déploie le JPEG commité ; aucun navigateur n’est nécessaire à la reconstruction du site. Une future nouvelle carte doit changer de nom de fichier et mettre à jour `shareImage` dans `scripts/build.mjs` ainsi que les métadonnées de la page animée.

## Animation et aperçu des liens

La page affiche une animation CSS finie de 4,5 secondes, avec entrée du vrai logo, des textes et du geste photographié. Elle se rejoue au clavier et se désactive avec `prefers-reduced-motion`. L’aperçu social est un JPEG fixe extrait du même front. Aucune animation de vignette n’est promise dans les messageries ou réseaux.

L’accueil possède également une courte signature de marque, distincte de cette carte, définie dans `public/brand-intro.css` et `public/brand-intro.js`. Elle dure 1,5 seconde, ne bloque pas les interactions et laisse la priorité à la popup de démonstration.

Les 24 pages de contenu déclarent `og:image`, son format, ses dimensions et son alternative textuelle, le nom du site et une carte `twitter:card=summary_large_image`. L’image utilise une nouvelle URL absolue v3 ; les services de partage peuvent malgré cela conserver un ancien aperçu en cache. Les messages déjà envoyés ne sont pas modifiés par la publication du site.

Le site et la page animée restent des démonstrations publiques avec `noindex`. Le noindex ne rend pas l’URL privée. Référence du format : [Open Graph](https://ogp.me/).

## Livraison et reproduction des archives

`npm run export` produit `exports/site-public.zip`, `exports/sources-completes.zip` et `exports/apercu-social.zip`. Cette dernière réunit le front courant, le vrai logo, la photo réelle, les polices, le poster v3, le master v3 et leur documentation. Elle ne contient ni ancien poster v2 ni ancienne source synthétique. Les accès locaux restent exclus.

Les originaux réels sont réunis dans `exports/photos-reelles-originaux.zip`. L’export les retrouve grâce aux chemins de [portraits-officiels.json](portraits-officiels.json) et [real-sport-images.json](real-sport-images.json), vérifie leurs empreintes et reconstruit l’archive avec des chemins propres. Si un original manque sur le poste, un message l’indique et l’archive existante est conservée. Les fichiers historiques de génération sont séparés dans `exports/archives-visuels-ia-historiques.zip` ; ils ne sont plus les images du site courant.

## Vérification

Le script `npm run test:preview` contrôle les métadonnées des 24 pages, le JPEG 1200 × 630, les sources réelles et le logo, le contenu de la carte, l’absence de débordement à 320, 390, 768 et 1440 px, la relance au clavier, la réduction des mouvements, le rendu fixe et les chemins GitHub Pages. Pour tester la page 404 avant publication, ses ressources absolues sont servies depuis le build local ; leurs statuts restent contrôlés.

Rapport d’exécution : `test-results/share-preview-report.json`. Capture fixe : `test-results/qa-share-preview-capture.png`. Vérifications complémentaires de la version v3 : `test-results/share-preview-v3-qa.json`. Le poster JPEG et son master PNG ont été inspectés visuellement. Ces contrôles de viewport ne constituent pas des tests sur téléphones physiques.
