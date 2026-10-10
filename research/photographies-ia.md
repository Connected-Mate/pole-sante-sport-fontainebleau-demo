# Photographies d’illustration créées avec l’IA

## Demande et périmètre

Après la livraison initiale, l’utilisateur a demandé explicitement au deuxième tour : « Refait les photo moche avec ton model d’image […] Ultra ultra realistique haut de gamme photo 8k ultra détailler ». Cette demande autorise la création d’illustrations avec le modèle d’image, en complément de l’autorisation initiale portant sur les médias du site historique.

Six visuels ont été travaillés avec l’outil intégré `image_gen`, avec un appel distinct par image : cinq nouvelles illustrations et une retouche de photographie existante. Aucun outil CLI ni générateur externe n’a été utilisé. Les scènes illustrent la kinésithérapie, la podologie, la nutrition, l’ostéopathie et le yoga. Leur direction visuelle commune associe lumière naturelle douce, tons écru, chêne clair et bleu grisé, textures naturelles et cadrages éditoriaux sobres.

Les cinq illustrations représentent des personnes et des décors fictifs. Elles ne constituent pas des photographies des praticiens, des patients ou des locaux du Pôle Santé Sport, ni une preuve d’équipement, de prestation effectivement réalisée ou de résultat. Leur nature d’illustration générée par IA doit rester signalée. Le logo historique est inchangé. Les cinq anciennes illustrations sont conservées dans le manifeste avec le statut `retired` pour assurer la traçabilité.

Le sixième visuel est une retouche par IA de la photographie historique de la façade du 143 rue Grande. Le prompt demande d’améliorer l’exposition et la tonalité en conservant l’aspect du lieu ; le modèle reconstruit cependant des détails fins. Il ne s’agit ni d’une nouvelle prise de vue réelle, ni d’une reproduction documentaire garantie exacte, ni d’une preuve de l’état actuel du bâtiment. La [photographie source](../public/assets/facade.png) reste intacte dans `public/assets/facade.png`, consultable par un lien dans la galerie. La version retouchée est signalée comme telle.

## Fichiers et définition réelle

| Illustration | Original PNG conservé | Fichier de diffusion | Dimensions natives |
| --- | --- | --- | --- |
| Kinésithérapie / accueil | [kinesitherapie-premium.png](../output/imagegen/kinesitherapie-premium.png) | [kinesitherapie-premium.webp](../public/assets/generated/kinesitherapie-premium.webp) | 1402 × 1122 px |
| Podologie | [podologie-premium.png](../output/imagegen/podologie-premium.png) | [podologie-premium.webp](../public/assets/generated/podologie-premium.webp) | 1536 × 1024 px |
| Nutrition | [nutrition-premium.png](../output/imagegen/nutrition-premium.png) | [nutrition-premium.webp](../public/assets/generated/nutrition-premium.webp) | 1536 × 1024 px |
| Ostéopathie | [osteopathie-premium.png](../output/imagegen/osteopathie-premium.png) | [osteopathie-premium.webp](../public/assets/generated/osteopathie-premium.webp) | 1536 × 1024 px |
| Yoga | [yoga-premium.png](../output/imagegen/yoga-premium.png) | [yoga-premium.webp](../public/assets/generated/yoga-premium.webp) | 1536 × 1024 px |
| Façade, retouche IA de la source historique | [facade-retouchee.png](../output/imagegen/facade-retouchee.png) | [facade-retouchee.webp](../public/assets/generated/facade-retouchee.webp) | 1373 × 1145 px |

La demande de détail « 8K » a guidé les prompts et le rendu ; ces fichiers ne sont pas en 8K natif. Aucun agrandissement n’est appliqué après génération. Les PNG sont les sorties originales du modèle, copiées depuis le dossier de génération de Codex puis conservées dans le projet. La façade source historique mesure 1020 × 851 px ; la retouche a été produite par le modèle à 1373 × 1145 px, avec reconstruction de détails et non récupération garantie d’informations réelles.

Les WebP sont encodés en qualité 90 pour la diffusion sur le site, sans recadrage, redimensionnement ou retouche supplémentaire lors de cette conversion. Cet encodage utilise une compression avec perte ; les pixels décodés ne sont donc pas garantis identiques aux PNG. Les sorties PNG intactes permettent de produire ultérieurement d’autres formats. Les empreintes SHA-256 des PNG et des WebP figurent dans [le manifeste des médias](assets-manifest.json).

## Prompts et provenance

Les prompts exacts, chemins de sortie de l’outil et observations sont archivés dans quatre fichiers :

- [Kinésithérapie](generated-kinesitherapie.json)
- [Podologie et nutrition](generated-podo-nutrition.json)
- [Yoga et ostéopathie](generated-yoga-osteo.json)
- [Retouche de la façade](generated-facade.json)

Les champs de destination des journaux des cinq illustrations décrivent les chemins de travail lors de la génération. Les destinations finales sont celles du tableau ci-dessus et du manifeste ; ces PNG ont ensuite été déplacés vers `output/imagegen/`. Le journal de la façade indique directement les chemins finaux ainsi que l’image source utilisée pour l’édition.

## Vérifications et lancement

Les cinq PNG ont été inspectés visuellement avec `view_image` : composition, cohérence anatomique, absence de marque ou de texte lisible, textures et lumière. Les scènes de soin sont non invasives et ne portent aucune promesse médicale. L’utilisation de l’image de yoga ne confirme pas la présence actuelle de cette activité, qui reste à vérifier auprès de l’établissement.

Un contrôle ciblé des cinq illustrations intégrées a été terminé sur neuf vues locales et consigné dans [photos-qa.json](photos-qa.json) : chargement des images et légendes IA vérifiés, aucun débordement ni erreur navigateur détecté. Ce rapport précède la retouche de la façade. La vérification complémentaire de celle-ci et les contrôles finaux du site, des exports et de la publication après intégration doivent être consignés dans [le rapport de vérification](verification.md). Les résultats de la livraison initiale y restent identifiés comme historiques. Avant le lancement officiel, faire valider les cinq illustrations, la façade retouchée et leur signalement par l’exploitant, puis vérifier leur affichage et leurs légendes sur le site publié.
