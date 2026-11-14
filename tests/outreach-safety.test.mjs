import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const generator = path.resolve('scripts/generate-daily-outreach.mjs');
test('missing reconciled history fails closed without replacing pending drafts', async () => {
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'fixaur-test-'));
 try {
  await fs.mkdir(path.join(dir,'public/data'),{recursive:true});
  const contacts=Array.from({length:10},(_,i)=>({email:`person${i}@example.com`,emailStatus:'verified'}));
  await fs.writeFile(path.join(dir,'public/data/outreach-contacts.json'),JSON.stringify(contacts));
  await fs.writeFile(path.join(dir,'public/data/daily-outreach.json'),'[]\n');
  const env={...process.env}; delete env.OUTREACH_HISTORY_FILE;
  const result=spawnSync(process.execPath,[generator],{cwd:dir,env,encoding:'utf8'});
  assert.notEqual(result.status,0);
  assert.equal(await fs.readFile(path.join(dir,'public/data/daily-outreach.json'),'utf8'),'[]\n');
 } finally {await fs.rm(dir,{recursive:true,force:true});}
});
test('forged client approval cannot reach provider or database', async () => {
 const {default:handler}=await import('../api/outreach/send.mjs');
 let status,body;
 const res={status(n){status=n; return this},json(x){body=x;return this}};
 const old=globalThis.fetch; globalThis.fetch=()=>{throw Error('provider must not be called')};
 try { await handler({method:'POST',body:{approved:true,to:'test@example.com',subject:'x',text:'x',sourceUrl:'https://example.com'}},res); }
 finally {globalThis.fetch=old;}
 assert.equal(status,409); assert.equal(body.code,'OUTREACH_REVIEW_REQUIRED');
});
