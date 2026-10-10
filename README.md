# Pôle Santé Sport Fontainebleau — démonstration

Refonte statique multipage en français. 24 pages, 10 disciplines, 14 intervenants, 3 guides pratiques. Informations tirées du site historique et des profils publics de réservation, avec audit daté du 10 octobre 2026. Aucun tarif, avis, diplôme ni résultat ajouté sans preuve.

## Ouvrir sur cet ordinateur

```sh
npm ci
npm run build
PORT=4174 npm run dev
```

- Site : http://127.0.0.1:4174/
- Back-office : http://127.0.0.1:4174/admin/
- Mot de passe aléatoire : fichier local `.local/access.json`. Il n’est jamais inclus dans Git ou les exports.

Le port par défaut est 4173 ; 4174 est utilisé ici parce que 4173 est déjà occupé. Le serveur écoute uniquement sur la boucle locale. Il doit rester en fonctionnement pour consulter ou administrer le site local. Ne pas exposer ce service sur Internet.

## Contenus et publication

`content/site.json` contient l’identité, les coordonnées, l’équipe et les paramètres de démonstration. `content/editorial.json` contient les spécialités, articles, FAQ et textes légaux. `public/` contient les styles, interactions et médias ; `scripts/build.mjs` produit le HTML dans `dist/`.

Dans l’administration : modifier → enregistrer un brouillon → valider → publier localement. Une validation technique ne remplace pas la validation éditoriale du propriétaire. Historique et restauration sont locaux. Télécharger régulièrement une sauvegarde et la conserver sur un autre support. Voir [la documentation du back-office](admin/README.md).

Pour publier les modifications validées sur GitHub Pages :

```sh
npm test
npm run build
git add content public scripts admin server.mjs
git commit -m "Mettre à jour les contenus validés"
git push origin main
```

L’action GitHub teste le serveur, reconstruit le site et publie uniquement `dist/`. Le back-office et ses identifiants ne sont pas déployés sur Pages. Les sources du dépôt sont publiques ; elles ne contiennent aucun secret.

## Contrôles et fichiers à remettre

```sh
npm test
npm run test:browser
npm run export
```

Le test navigateur utilise Chrome installé sur macOS ; `QA_CHROME_PATH` permet un autre chemin si nécessaire. Le site local doit être lancé. Les archives principales sont `exports/site-public.zip` (site HTML autonome, à servir en HTTP) et `exports/sources-completes.zip` (sources, administration, documentation). Les dépendances se réinstallent avec `npm ci` ; `.local/`, mots de passe, historique de travail et `node_modules` sont exclus.

## Démonstration publique et retrait

`demo.enabled: true` active la notice, la barre de démonstration et `noindex,nofollow,noarchive` sur toutes les pages. `robots.txt` laisse lire cette directive : bloquer l’exploration empêcherait les moteurs de la voir. Ce mécanisme ne protège pas l’URL et ne garantit pas son absence de tout moteur. [Documentation Google](https://developers.google.com/search/docs/crawling-indexing/block-indexing).

`demo.retireAt` est **null tant que la date n’a pas été fournie**. Pour préparer le retrait, saisir une date `AAAA-MM-JJ`, puis valider, construire et publier. À partir de cette date en Europe/Paris : le navigateur montre une page de fin de démonstration ; la prochaine reconstruction remplace tous les fichiers publiés par `index.html` et `404.html` de fin de démonstration. Le workflow quotidien à 03:17 UTC reconstruit l’export (exécution GitHub susceptible de retard ou de désactivation après inactivité). Pour un retrait immédiat, lancer manuellement « Publier la démonstration » dans Actions à la date convenue. Ceci retire les pages de démo du site, pas les sources publiques et l’historique Git. Pour dépublier entièrement, utiliser Settings → Pages → Unpublish site.

## Lancement officiel

1. Faire valider par l’exploitant les praticiens toujours présents, coordonnées, adresses, prestations, droits documentés et conditions d’accès.
2. Résoudre le numéro d’Isabelle Trohel, confirmer l’activité yoga et compléter l’identité légale, le responsable de publication et les informations de confidentialité.
3. Fixer l’hébergement officiel, domaine, DNS et procédure de sauvegarde/restauration. Un back-office distant exige une infrastructure serveur distincte ; GitHub Pages ne l’exécute pas.
4. Adapter les textes de démo, renseigner `publicBaseUrl` officiel, préparer les redirections des anciens chemins, puis retirer la notice et `noindex` en passant `demo.enabled` à `false` et `retireAt` à `null`.
5. Vérifier le site déployé, les réservations et téléphones avec le propriétaire, le mobile, le clavier, les mentions, le sitemap, les URL canoniques et les données structurées.
6. Soumettre le sitemap dans les outils de recherche et harmoniser les coordonnées de la fiche Google. Aucune modification de la fiche Google n’a été effectuée.

## Direction artistique actuelle

La révision du 10 octobre privilégie le soin et le mouvement avec une palette bleu profond, pierre et sable. Typographie Manrope auto-hébergée (licence SIL OFL dans `public/assets/fonts/`), compositions photographiques rectangulaires, navigation et CTA au trait, sans émojis décoratifs. L’accueil associe soin, pratique sportive et rythme personnel sans promettre de résultat médical. Les pages publiques ne mentionnent plus la génération ou la retouche ; les scènes restent des illustrations sans attribution à l’équipe ou aux locaux.

La provenance reste consignée dans les fichiers du projet. Voir [la direction artistique](research/direction-artistique.md) et [les contrôles de cette révision](research/design-qa.json).

## Dossiers de recherche

- [Recherche locale et concurrents](research/local-research.md)
- [Données vérifiées et contradictions](research/business-audit.json)
- [Audit éditorial](research/editorial-audit.md)
- [Contrôles SEO et lancement](research/seo-checklist.md)
- [Provenance des médias](research/assets-manifest.json)
- [Photographies d’illustration créées avec l’IA](research/photographies-ia.md)

À la demande explicite de l’utilisateur au deuxième tour, six visuels ont été travaillés avec l’outil intégré `image_gen` : cinq nouvelles illustrations pour la kinésithérapie, la podologie, la nutrition, l’ostéopathie et le yoga, et une retouche de la photographie historique de la façade du 143. Les cinq illustrations représentent des scènes fictives et ne sont pas présentées comme les locaux, praticiens ou patients réels. La façade retouchée comporte des détails fins reconstruits par le modèle ; elle n’est pas une nouvelle photographie réelle ni une reproduction documentaire exacte. La source `public/assets/facade.png` reste conservée et consultable depuis la galerie. Le logo historique est inchangé ; les anciennes illustrations restent documentées dans le manifeste avec le statut `retired`.

Les sorties PNG du modèle sont conservées dans `output/imagegen/` ; les fichiers diffusés sont `public/assets/generated/*-premium.webp` et `facade-retouchee.webp`, encodés en WebP qualité 90 sans recadrage, redimensionnement ni retouche supplémentaire lors de la conversion. Cette compression est avec perte ; les PNG restent intacts. La résolution native est de 1402 × 1122 px pour l’accueil (kinésithérapie), de 1536 × 1024 px pour les quatre autres illustrations et de 1373 × 1145 px pour la façade retouchée. La demande d’un rendu « 8K » guide l’esthétique et le détail : les fichiers ne sont pas en 8K natif. Les prompts exacts, sources et contrôles visuels sont documentés dans [le dossier des photographies IA](research/photographies-ia.md).

Les six originaux PNG du nouveau jeu de visuels sont aussi livrés dans `exports/visuels-generes-originaux.zip`. Le détail des prompts et résolutions est dans [la provenance des photographies IA](research/photographies-ia.md).

## Aperçu des liens et carte animée

L’image de partage ne reprend plus la façade. Une carte sportive composée en HTML/CSS utilise une nouvelle photo, sans adresse dans le visuel. Le JPEG social est `public/assets/social/pole-sante-sport-preview-v2.jpg` (1200 × 630), son master est `output/social/preview-master.png` (2400 × 1260) et la version animée se trouve à `/share-preview.html`. Les balises Open Graph et Twitter des 24 pages de contenu pointent vers cette nouvelle ressource.

Pour recréer la carte après édition de `public/share-preview.html` ou `public/share-preview.css` : `npm run render:preview`, puis `npm run build`. Le navigateur utilisé est Chrome local, paramétrable via `QA_CHROME_PATH`. `npm run test:preview` vérifie les métadonnées, les ressources, le responsive, le clavier et la réduction des animations. Le rendu est commité ; le workflow Pages n’exécute pas de capture navigateur.

L’archive `exports/apercu-social.zip` contient le front, la photo, les polices et les rendus. Le dossier des photographies comporte désormais sept originaux (six visuels du site et une photo pour le partage). Voir [la documentation et les contrôles](research/preview-sociale.md) et [le prompt exact de la nouvelle photo](research/generated-preview-sport.json).
