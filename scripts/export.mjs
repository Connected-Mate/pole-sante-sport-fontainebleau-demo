import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=process.cwd();
const exportDir=path.join(root,'exports');await fs.mkdir(exportDir,{recursive:true});
for(const [name,dir,files] of [
 ['site-public.zip',path.join(root,'dist'),['.']],
 ['sources-completes.zip',root,['package.json','package-lock.json','.gitignore','server.mjs','content','public','scripts','admin','tests','research/business-audit.json','research/local-research.md','research/editorial-audit.md','research/seo-checklist.md','research/assets-manifest.json','research/verification.md','README.md','LIVRAISON.md','.github']]
]){
 const target=path.join(exportDir,name);await fs.rm(target,{force:true});
 const r=spawnSync('zip',['-q','-r',target,...files],{cwd:dir,encoding:'utf8'});
 if(r.status!==0)throw new Error(r.stderr||r.stdout||'Export impossible');
 const list=spawnSync('unzip',['-Z1',target],{encoding:'utf8'}).stdout;
 if(/(^|\/)\.local\/|auth\.json|access\.json|node_modules\//m.test(list))throw new Error('Fichier privé détecté dans export');
 console.log(`${name} : ${list.trim().split('\n').length} entrées, aucun accès local inclus.`);
}
