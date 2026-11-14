import test from 'node:test';
import assert from 'node:assert/strict';
const modulePath=new URL('../src/outreach-policy.mjs',import.meta.url);
const policy=await import(modulePath).catch(()=>({}));
const contact={email:' Test@Example.com ',emailStatus:'verified',company:'Example',firstName:'Test'};
const evidence={recipient:'test@example.com',purpose:'fixaur-fleet-introduction-v1',eligible:true,sourceUrl:'https://example.com/contact',validUntil:'2026-11-15T00:00:00Z'};
const snapshot={reconciled:true,asOf:'2026-11-14T12:00:00Z',sends:[],suppressions:[],eligibility:[evidence]};
const now='2026-11-14T12:01:00Z';
test('stable recipient purpose key ignores date and normalizes email',()=>{
 assert.equal(typeof policy.draftKey,'function');
 assert.equal(policy.draftKey(contact.email),policy.draftKey('test@example.com'));
});
test('unknown, failed and sent history blocks fresh introduction regardless of dated campaign',()=>{
 assert.equal(typeof policy.selectCandidates,'function');
 for(const status of ['sending','unknown','failed','sent']) assert.equal(policy.selectCandidates([contact],[],{...snapshot,sends:[{recipient:contact.email,status,campaignKey:'fixaur-fleet-2026-11-13'}]},now,10).length,0);
});
test('eligibility evidence, suppression and pending draft checked independently',()=>{
 assert.equal(typeof policy.selectCandidates,'function');
 assert.equal(policy.selectCandidates([contact,contact],[],snapshot,now,10).length,1);
 assert.equal(policy.selectCandidates([contact],[],{...snapshot,eligibility:[]},now,10).length,0);
 assert.equal(policy.selectCandidates([contact],[],{...snapshot,suppressions:[{recipient:contact.email}]},now,10).length,0);
 assert.equal(policy.selectCandidates([contact],[contact],snapshot,now,10).length,0);
 assert.throws(()=>policy.selectCandidates([contact],[],{...snapshot,reconciled:false},now,10));
 assert.throws(()=>policy.selectCandidates([contact],[],snapshot,'2026-11-16T12:00:00Z',10));
});
test('merge preserves edits, sent and uncertain history and never promotes drafts',()=>{
 assert.equal(typeof policy.mergeOutreach,'function');
 const saved={...contact,id:'original',status:'Sent',body:'owner edit',resendId:'receipt',campaignKey:'old'};
 const daily={...contact,id:'new',status:'Approved',body:'replacement',campaignKey:'new'};
 assert.deepEqual(policy.mergeOutreach([saved],[daily]),[saved]);
 assert.equal(policy.mergeOutreach([],[daily])[0].status,'Draft');
 const unknown={...saved,status:'Unknown'};
 assert.deepEqual(policy.mergeOutreach([unknown],[daily]),[unknown]);
});
test('server sent or uncertain history wins over stale local draft without revival',()=>{
 const local={...contact,id:'local',status:'Draft',body:'local draft'};
 const sent={...contact,id:'server',status:'Sent',body:'sent text',resendId:'receipt'};
 assert.equal(policy.mergeOutreach([local],[sent])[0].status,'Sent');
 assert.equal(policy.mergeOutreach([local],[{...sent,status:'Unknown'}])[0].status,'Unknown');
 assert.equal(policy.mergeOutreach([sent],[local])[0].resendId,'receipt');
});
