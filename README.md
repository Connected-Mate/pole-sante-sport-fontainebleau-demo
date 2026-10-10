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

Le test navigateur utilise Chrome installé sur macOS ; `CHROME_PATH` permet un autre chemin si nécessaire. Le site local doit être lancé. Les deux archives sont `exports/site-public.zip` (site HTML autonome, à servir en HTTP) et `exports/sources-completes.zip` (sources, administration, documentation). Les dépendances se réinstallent avec `npm ci` ; `.local/`, mots de passe, historique de travail et `node_modules` sont exclus.

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

## Dossiers de recherche

- [Recherche locale et concurrents](research/local-research.md)
- [Données vérifiées et contradictions](research/business-audit.json)
- [Audit éditorial](research/editorial-audit.md)
- [Contrôles SEO et lancement](research/seo-checklist.md)
- [Provenance des médias](research/assets-manifest.json)

Les photos d’illustration ne sont pas présentées comme des photos des locaux ou des praticiens. La façade du 143 est une photographie du lieu ; aucun intérieur ni portrait fictif n’a été généré.
