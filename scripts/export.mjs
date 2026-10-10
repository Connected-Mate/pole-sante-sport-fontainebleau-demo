import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=process.cwd();
const exportDir=path.join(root,'exports');await fs.mkdir(exportDir,{recursive:true});
for(const [name,dir,files] of [
 ['site-public.zip',path.join(root,'dist'),['.']],
 ['visuels-generes-originaux.zip',path.join(root,'output/imagegen'),['.']],
 ['apercu-social.zip',root,['public/share-preview.html','public/share-preview.css','public/assets/generated/sport-preview-photo.webp','public/assets/social','public/assets/fonts','public/assets/favicon.svg','scripts/render-share-preview.mjs','output/social','research/generated-preview-sport.json','research/preview-sociale.md','research/preview-sociale-qa.json']],
 ['sources-completes.zip',root,['package.json','package-lock.json','.gitignore','server.mjs','content','public','scripts','admin','tests','research/business-audit.json','research/local-research.md','research/editorial-audit.md','research/seo-checklist.md','research/assets-manifest.json','research/verification.md','research/photographies-ia.md','research/photos-qa.json','research/photos-final-qa.json','research/direction-artistique.md','research/design-qa.json','research/generated-kinesitherapie.json','research/generated-podo-nutrition.json','research/generated-yoga-osteo.json','research/generated-facade.json','research/generated-preview-sport.json','research/preview-sociale.md','research/preview-sociale-qa.json','output/social','output/imagegen','README.md','LIVRAISON.md','.github']]
]){
 const target=path.join(exportDir,name);await fs.rm(target,{force:true});
 const r=spawnSync('zip',['-q','-r',target,...files],{cwd:dir,encoding:'utf8'});
 if(r.status!==0)throw new Error(r.stderr||r.stdout||'Export impossible');
 const list=spawnSync('unzip',['-Z1',target],{encoding:'utf8'}).stdout;
 if(/(^|\/)\.local\/|auth\.json|access\.json|node_modules\//m.test(list))throw new Error('Fichier privé détecté dans export');
 console.log(`${name} : ${list.trim().split('\n').length} entrées, aucun accès local inclus.`);
}
