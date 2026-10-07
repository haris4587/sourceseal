import assert from 'node:assert/strict';
import { writeFile, mkdir } from 'node:fs/promises';
import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { TransactionHashVariant } from 'genlayer-js/types';
import { createClient as createDevClient } from 'genlayer-js-dev';
import { studioDevnet } from 'genlayer-js-dev/chains';
import { TransactionHashVariant as DevVariant } from 'genlayer-js-dev/types';
const networks = [
  {name:'stable',chain:studionet,client:createClient({chain:studionet}),variant:TransactionHashVariant.LATEST_FINAL,address:'0xaf5Df783aCA48743f13A2B60576FAb07241325f3',claim:'sourceseal-v1-stable-20261007'},
  {name:'dev',chain:studioDevnet,client:createDevClient({chain:studioDevnet}),variant:DevVariant.LATEST_FINAL,address:'0xaA978B24a42005aed411E5f71b82dF674656c50E',claim:'sourceseal-v1-dev-20261007'},
];
await mkdir('docs/evidence',{recursive:true});
for (const n of networks) {
 const raw = await n.client.readContract({address:n.address,functionName:'get_review_bundle',args:[n.claim],transactionHashVariant:n.variant});
 assert.ok(raw, `${n.name}: no finalized review bundle`);
 const bundle=JSON.parse(String(raw));
 assert.equal(bundle.schema,'sourceseal.review.v1');
 assert.equal(bundle.record.claim_id,n.claim);
 assert.equal(bundle.original_record.original_verdict,'SUPPORTED');
 assert.equal(bundle.original_record.revision_count,0);
 assert.equal(bundle.original_record.summary.length>0,true);
 assert.equal(bundle.record.challenge_deadline-bundle.record.created_at,604800);
 assert.equal(bundle.original_record.evidence_content_hashes[0].content_sha256,'61a5378f4255c720beb2a4b4a63b29540147c140f36988bf086291989b4cd2d7');
 assert.equal(bundle.record.revision_count,bundle.revisions.length);
 if (n.name === 'dev') {
  assert.equal(bundle.revisions.length,1);
  assert.equal(bundle.revisions[0].resolution,'UPHELD');
  assert.notEqual(bundle.revisions[0].challenger.toLowerCase(),bundle.original_record.submitter.toLowerCase());
  assert.equal(bundle.original_record.current_verdict,'SUPPORTED');
 }
 const receipt={...bundle,chain_id:n.chain.id,contract_address:n.address,rpc:n.chain.rpcUrls.default.http[0],retrieved_at:new Date().toISOString()};
 await writeFile(`docs/evidence/${n.name}-review.json`,JSON.stringify(receipt,null,2)+'\n');
 console.log(`${n.name}: finalized ${bundle.record.current_verdict}; original snapshot and ${bundle.revisions.length} revisions verified`);
}
