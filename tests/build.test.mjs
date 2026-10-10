import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=process.cwd();
async function fixture(){const tmp=await fs.mkdtemp(path.join(os.tmpdir(),'pss-build-'));for(const item of ['content','public','scripts','server.mjs','package.json'])await fs.cp(path.join(root,item),path.join(tmp,item),{recursive:true});await fs.symlink(path.join(root,'node_modules'),path.join(tmp,'node_modules'),'dir');return tmp;}
const run=dir=>spawnSync(process.execPath,['scripts/build.mjs'],{cwd:dir,encoding:'utf8'});
test('un contenu dangereux est refusé avant de remplacer un export existant',async()=>{const tmp=await fixture();try{await fs.mkdir(path.join(tmp,'dist'));await fs.writeFile(path.join(tmp,'dist','sentinel.txt'),'version valide');const file=path.join(tmp,'content/editorial.json');const content=JSON.parse(await fs.readFile(file,'utf8'));content.services[0].slug='../../echappement';await fs.writeFile(file,JSON.stringify(content));const result=run(tmp);assert.notEqual(result.status,0);assert.equal(await fs.readFile(path.join(tmp,'dist/sentinel.txt'),'utf8'),'version valide');await assert.rejects(fs.access(path.join(tmp,'echappement.html')));}finally{await fs.rm(tmp,{recursive:true,force:true});}});
test('à la date de retrait le build ne conserve aucune ancienne page de démo',async()=>{const tmp=await fixture();try{const file=path.join(tmp,'content/site.json');const site=JSON.parse(await fs.readFile(file,'utf8'));site.demo.retireAt='2020-01-01';await fs.writeFile(file,JSON.stringify(site));const result=run(tmp);assert.equal(result.status,0,result.stderr);assert.deepEqual((await fs.readdir(path.join(tmp,'dist'))).sort(),['.nojekyll','404.html','index.html','robots.txt']);const html=await fs.readFile(path.join(tmp,'dist/index.html'),'utf8');assert.match(html,/démonstration est terminée/);assert.match(html,/noindex,nofollow,noarchive/);assert.doesNotMatch(html,/tel:/);}finally{await fs.rm(tmp,{recursive:true,force:true});}});
