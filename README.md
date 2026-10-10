# Pôle Santé Sport Fontainebleau — démonstration

Refonte statique multipage en français. 24 pages, 10 disciplines, 14 intervenants, 3 guides pratiques. Informations tirées du site historique et des profils publics de réservation, avec audit initial du 10 octobre et recherche photographique du 11 octobre 2026. Aucun tarif, avis, diplôme ni résultat ajouté sans preuve.

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

### Ajouter ou remplacer un portrait réel

1. Déposer le fichier dans `public/assets/team/` avec un nom en minuscules, chiffres et tirets, au format JPG, PNG ou WebP (par exemple `jean-luc-tutakowski.webp`). L’administration ne téléverse pas de fichier image.
2. Dans **Équipe & coordonnées**, choisir le praticien puis remplir **Portrait (fichier du projet)** avec `team/jean-luc-tutakowski.webp`, sans `public/assets/`. Ce champ correspond à `portrait` dans le JSON.
3. Remplir **Source du portrait** avec la page professionnelle nominative en HTTPS. Ce champ correspond à `portraitSourceUrl` ; il permet au visiteur de consulter le profil professionnel.
4. Vérifier que la photo représente bien cette personne, conserver sa provenance et les justificatifs de réutilisation, puis enregistrer, valider et publier localement. Vérifier ensuite l’affichage sur la page équipe et la fiche de la discipline.

Laisser `portrait` vide affiche les initiales. La construction refuse un chemin de portrait dont le fichier manque, sans remplacer la version publiée. Ne pas substituer un modèle de soin, un homonyme, un avatar générique ou un visage généré. La sauvegarde JSON conserve les chemins et les sources, mais pas les fichiers image : sauvegarder aussi `public/assets/team/` et l’archive des originaux.

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

Le test navigateur utilise Chrome installé sur macOS ; `QA_CHROME_PATH` permet un autre chemin si nécessaire. Le site local doit être lancé. Les archives principales sont `exports/site-public.zip` (site HTML autonome, à servir en HTTP), `exports/sources-completes.zip` (sources, administration, documentation), `exports/photos-reelles-originaux.zip` (photographies réelles récupérées) et `exports/apercu-social.zip` (carte de partage). Les dépendances se réinstallent avec `npm ci` ; `.local/`, mots de passe, historique de travail et `node_modules` sont exclus.

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

La version du 11 octobre s’adresse aux sportifs de tous niveaux, de la reprise à la pratique régulière : « Votre corps. Votre sport. Votre rythme. ». Bleu profond, pierre et sable, Manrope auto-hébergée (licence SIL OFL dans `public/assets/fonts/`), photographies réelles et habillage HTML/CSS sobre. Le texte valorise la compréhension du corps, le mouvement et l’accompagnement sans promettre de performance ni de résultat médical.

L’arrivée sur l’accueil comporte une courte animation du logo historique : 1,5 seconde, après fermeture de la notice de démonstration lors de la première visite. Elle se rejoue depuis le pied de page, s’arrête dès une interaction et respecte `prefers-reduced-motion`. Le contenu ne dépend pas de cette animation pour fonctionner. Les fichiers sont `public/brand-intro.css` et `public/brand-intro.js`.

## Photographies et portraits

Quatre vrais portraits ont été rapprochés de sources professionnelles nominatives et des pages du pôle : **Jean-Luc Tutakowski, Raj, Frédérique Marty et Didier Lapôtre**. Ils figurent dans `public/assets/team/`. Les détails d’identité, les pages d’origine et les empreintes figurent dans [portraits-officiels.json](research/portraits-officiels.json).

Dix portraits restent indisponibles : les trois portraits référencés sur Doctolib pour Carine Marie, Isabelle Trohel et Jonathan Herjean n’ont pas pu être téléchargés (HTTP 403 du serveur d’images), et aucun portrait fiable n’a été retrouvé pour les sept autres personnes. Ces fiches conservent leurs initiales. Les sources consultées et les limites sont consignées dans [portraits-doctolib.json](research/portraits-doctolib.json) et [portraits-officiels.json](research/portraits-officiels.json).

Les photos de mouvement viennent du site professionnel Espace Pilates, relié au pôle ; les photographies de soins, la façade et le logo proviennent du site historique. Les modèles des photographies de disciplines ne sont pas présentés comme les praticiens ou patients du pôle. Aucun nouveau visage n’a été généré, aucune reconstruction de visage ni retouche IA n’a été appliquée à ce jeu de photos. Les originaux sont réunis dans `exports/photos-reelles-originaux.zip` ; les fichiers de diffusion et leurs traitements sont décrits dans [real-sport-images.json](research/real-sport-images.json) et [assets-manifest.json](research/assets-manifest.json).

Les droits sur les photos et le logo du site historique ont été confirmés par l’utilisateur le 10 octobre. La récupération des photos professionnelles réelles a été explicitement demandée le 11 octobre. La disponibilité publique d’une photo ne vaut pas licence : conserver les autorisations et crédits du cabinet et des professionnels pour le lancement officiel. Aucune licence tierce n’est supposée.

Les fichiers synthétiques des versions précédentes sont retirés des médias publics de cette révision. Les masters historiques et leurs prompts restent conservés dans `output/imagegen/` et `research/` pour la traçabilité ; ils ne sont plus utilisés sur le site. L’archive `exports/archives-visuels-ia-historiques.zip` est historique et ne fait pas partie du jeu photographique actuel.

## Aperçu des liens et carte animée

L’aperçu **v3** utilise une vraie photographie de Pilates, le logo du pôle et une composition HTML/CSS, sans adresse dans le visuel. Le JPEG social est `public/assets/social/pole-sante-sport-preview-v3.jpg` (1200 × 630), son master est `output/social/preview-master-v3.png` et la carte animée est accessible à `/share-preview.html`. Cette animation de partage est distincte de l’introduction de 1,5 seconde sur l’accueil. Les balises Open Graph et Twitter utilisent la ressource v3 ; les anciens partages peuvent garder leur vignette en cache.

Pour recréer la carte après édition de `public/share-preview.html` ou `public/share-preview.css` : `npm run render:preview`, puis `npm run build`. Chrome local est paramétrable via `QA_CHROME_PATH`. `npm run test:preview` contrôle notamment les métadonnées, les ressources, le responsive, le clavier et la réduction des animations. Le rendu est commité ; le workflow Pages n’exécute pas de capture navigateur.

Les 10 tests serveur/build et les 158 contrôles navigateur ont réussi pour cette révision ; 24 analyses Axe n’ont détecté aucun défaut. Les 20 contrôles ciblés des photos et de l’animation, les 12 contrôles de l’aperçu v3 et les 6 contrôles des champs portrait du back-office passent aussi. Les cinq archives ont été vérifiées, dont les 62 fichiers du site public comparés au build. La publication des 24 pages, des portraits, du logo et de l’aperçu v3 est confirmée dans `research/real-publication.json`. Consulter [le rapport de livraison](LIVRAISON.md) pour le bilan final ; les résultats historiques ne remplacent pas la validation de la version actuelle.

## Dossiers de recherche

- [Recherche locale et concurrents](research/local-research.md)
- [Données vérifiées et contradictions](research/business-audit.json)
- [Audit éditorial](research/editorial-audit.md)
- [Contrôles SEO et lancement](research/seo-checklist.md)
- [Provenance et statut des médias](research/assets-manifest.json)
- [Portraits professionnels récupérés](research/portraits-officiels.json)
- [Recherche Doctolib et limites](research/portraits-doctolib.json)
- [Photographies réelles de soins et de mouvement](research/real-sport-images.json)
- [Historique des anciennes images générées, désormais retirées du site](research/photographies-ia.md)
