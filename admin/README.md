# Administration locale

Le back-office fonctionne uniquement sur l’ordinateur qui exécute `node server.mjs`. Le serveur écoute exclusivement sur `127.0.0.1:4173`. Ouvrir `http://127.0.0.1:4173/admin/`. GitHub Pages héberge seulement le site statique exporté dans `dist/` : il ne peut pas exécuter ce back-office.

Si ce port est occupé, utiliser `PORT=4174 npm run dev` puis ouvrir `http://127.0.0.1:4174/admin/`. La variable `PORT` accepte les entiers de 1024 à 65535. Le démarrage actualise l’URL dans `.local/access.json` sans régénérer le mot de passe.

## Première connexion

Exécuter `node server.mjs --setup`, puis ouvrir le fichier `.local/access.json` sur cet ordinateur pour lire le mot de passe généré aléatoirement. Le serveur génère aussi ces accès à son premier démarrage s’ils n’existent pas. Ne jamais ajouter `.local/` à Git, transmettre son contenu ou le copier dans `dist/`. Les fichiers d’accès ont les permissions `0600` et leur répertoire `0700`.

Le secret de vérification est dérivé avec scrypt. Le cookie de session dure huit heures et utilise HttpOnly et SameSite=Strict. Les écritures exigent une origine locale et un jeton CSRF. Huit échecs de connexion déclenchent une limite de quinze minutes. La session et cette limite sont en mémoire : elles repartent de zéro au redémarrage. Le serveur utilise HTTP sur la boucle locale ; ce service ne doit pas être ouvert à Internet ni placé derrière un proxy public.

## Modifier et publier

1. Modifier les champs guidés (accueil, praticiens, prestations et articles), ou les deux zones JSON dans les réglages avancés, puis **Enregistrer le brouillon**. Le brouillon est conservé dans `.local/draft.json` et ne change pas le site.
2. **Valider le brouillon** vérifie sa structure, ses longueurs et les protocoles des liens. Cette validation technique ne vérifie pas la vérité des informations, les droits des images ou l’adéquation médicale des contenus.
3. Relire puis **Publier localement**. L’action remplace `content/site.json` et `content/editorial.json`, conserve un instantané avant et après, puis exécute `node scripts/build.mjs`. Un échec de génération restaure les sources et le dossier `dist/` précédents.
4. Ouvrir le site local et vérifier les changements. Publier ensuite les fichiers par le workflow GitHub du projet. Aucun `git push` n’est exécuté par le back-office.

Chaque édition d’un brouillon annule sa validation. Restaurer une version de l’historique crée un brouillon à relire et à revalider. L’historique est conservé dans `.local/history/`. Il ne doit pas contenir d’informations de patient.

## Sauvegardes et récupération

**Télécharger la sauvegarde** produit un fichier JSON contenant les contenus publiés, le brouillon éventuel et tout l’historique. Les identifiants et sessions sont exclus. Conserver ces sauvegardes sur un support distinct du projet. Les instantanés automatiques locaux protègent des erreurs éditoriales mais pas de la perte de l’ordinateur.

Pour récupérer une sauvegarde : installer le projet sur un ordinateur de confiance, générer de nouveaux accès, ouvrir le JSON téléchargé et copier ses objets `published.site` et `published.editorial` dans les deux éditeurs. Enregistrer, valider et publier localement. Pour repartir d’un ancien instantané de la sauvegarde, utiliser plutôt les objets `history[n].content.site` et `history[n].content.editorial`. Les anciens mots de passe ne sont pas restaurés.

En cas de perte du mot de passe, arrêter le serveur, déplacer `.local/auth.json` et `.local/access.json` dans un emplacement local sûr, puis relancer `node server.mjs --setup`. Le brouillon et l’historique restent disponibles ; toutes les sessions sont invalidées par l’arrêt du serveur. Ne pas afficher les anciens fichiers dans un terminal partagé.

## Schéma minimum

`site` est un objet. Il contient les chaînes `name`, `address`, `addressLocality`, `postalCode`, `heroTitle`, `heroText`, `phone`, `bookingUrl`, `hoursNote`, le tableau `team`, l’objet `media` avec le booléen `approved`, et l’objet `demo` avec le booléen `enabled` et `retireAt` à `null` ou une date réelle `AAAA-MM-JJ`. `name`, `addressLocality` et `heroTitle` ne peuvent pas être vides. Les autres champs sont conservés sous réserve des limites de sécurité. `editorial` peut être un objet ou un tableau.

Les liens dont le nom de champ se termine par `url`, `href`, `website` ou `link` doivent utiliser `https:`, `http:`, `tel:` ou `mailto:` (ou être vides). Les clés `__proto__`, `prototype` et `constructor` sont interdites. Limites : corps JSON 2 Mo, profondeur 12, chaîne 20 000 caractères, tableau 500 éléments, objet 300 champs. Le nom et les champs courts du site sont limités à 500 caractères ; `heroText` et `hoursNote` à 5 000.

Les tableaux de liens en `urls`, `hrefs`, `websites` et `links` sont également contrôlés ; les liens sources exigent HTTP ou HTTPS. Les identifiants `slug` utilisent uniquement minuscules, chiffres et tirets ; ils sont uniques dans chaque collection de prestations ou d’articles. Quand les collections éditoriales, l’équipe et les adresses sont présentes, leurs objets et listes de textes sont validés avant publication.

## API

Les réponses et erreurs sont des objets JSON. Les écritures requièrent `Content-Type: application/json`, une origine `http://127.0.0.1:4173` ou `http://localhost:4173`, le cookie de session et `X-CSRF-Token`, sauf la connexion qui ne requiert pas encore de session.

| Route | Usage |
| --- | --- |
| `GET /api/session` | `{ authenticated, csrf?, expiresAt? }` |
| `POST /api/login` | `{ password }` → cookie et `{ authenticated, csrf }` |
| `POST /api/logout` | Invalider la session |
| `GET /api/content` | `{ published: { site, editorial }, draft }` |
| `PUT /api/draft` | `{ site, editorial }` → brouillon enregistré |
| `POST /api/validate` | `{}` → validation du brouillon courant |
| `POST /api/publish` | `{}` → build local et instantanés |
| `GET /api/history` | Liste des 100 derniers instantanés |
| `POST /api/restore` | `{ id }` → version restaurée en brouillon |
| `GET /api/backup` | Téléchargement authentifié des contenus et de tout l’historique |

Les routes publiques servent exclusivement `dist/`, les ressources de l’administration exclusivement `admin/`. Les chemins remontants, fichiers cachés, accès directs aux sources et liens symboliques sortant du dossier servi sont refusés.
