import Link from "next/link";
import { ArrowLeft, ExternalLink, Fingerprint } from "lucide-react";
import { deployments } from "@/lib/deployments";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const changes = [
  ["Decision history", "Original verdict label retained; summary and quality updated by challenges", "Full first-decision snapshot retained separately and returned alongside the current record"],
  ["Reviewer access", "Multiple reads for case and revisions", "One get_review_bundle read with original decision, current record, ordered revisions and deadline"],
  ["Sharing", "Manually copy claim ID", "Network-scoped review links and downloadable JSON review receipts"],
  ["Evidence checks", "Accepts HTTP responses below 400; :443 can bypass duplicate detection", "Requires HTTP 2xx, normalizes default HTTPS port and bounds stored hash manifests"],
  ["Guidance", "Technical labels and browser-wallet instructions", "Plain-language steps, concrete use cases and direct Studio built-in-account route"],
  ["Deployment", "Old account and potentially reset Studio addresses", "Separate current Studionet and Studio Dev deployments; replacement Netlify project prepared"],
];

export default function MilestonePage() {
  return <main className="site-shell min-h-screen overflow-hidden">
    <div className="ambient-grid" aria-hidden="true" />
    <header className="relative z-10 border-b border-white/8"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8"><Link href="/" className="flex items-center gap-3 text-white"><span className="brand-seal"><Fingerprint className="size-5" /></span>SourceSeal</Link><Button asChild variant="ghost"><Link href="/"><ArrowLeft /> Back to verifier</Link></Button></div></header>
    <section className="relative z-10 mx-auto max-w-6xl px-5 py-12 sm:px-8">
      <Badge className="border border-fuchsia-300/25 bg-fuchsia-300/10 text-fuchsia-100">Portal milestone v1 · October 7, 2026</Badge>
      <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-6xl">A verdict others can <span className="text-gradient">review and share.</span></h1>
      <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300">This update extends the existing SourceSeal app. It preserves the complete first decision, packages the on-chain history in one read, exports a portable receipt and explains the workflow for first-time users. The existing seven-day window and three verdict outcomes remain.</p>
      <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10 bg-black/15"><table className="w-full min-w-[650px] text-left text-sm"><thead className="border-b border-white/10 text-slate-300"><tr><th className="p-4">Area</th><th className="p-4">Existing repository baseline</th><th className="p-4">New milestone work</th></tr></thead><tbody>{changes.map(([area,before,after])=><tr key={area} className="border-b border-white/8"><td className="p-4 font-medium text-white">{area}</td><td className="p-4 text-slate-400">{before}</td><td className="p-4 text-slate-200">{after}</td></tr>)}</tbody></table></div>
      <div className="mt-6 grid gap-5 md:grid-cols-2">{Object.entries(deployments).map(([key,d])=><article key={key} className="glass-card rounded-2xl border border-white/10 p-5 text-slate-300"><h2 className="text-lg font-semibold text-white">{d.label} · {d.chainId}</h2><code className="mt-3 block break-all text-xs">{d.address}</code><p className="mt-3 text-sm">Use Inspect → Use live review example → Load on-chain history. Reads and exports require no wallet.</p><div className="mt-4 flex flex-wrap gap-2"><Button asChild variant="outline"><a href={d.explorer+"/address/"+d.address} target="_blank" rel="noreferrer">Contract <ExternalLink /></a></Button><Button asChild variant="outline"><a href={d.explorer+"/tx/"+d.deployTx} target="_blank" rel="noreferrer">Deployment <ExternalLink /></a></Button><Button asChild variant="outline"><a href={d.explorer+"/tx/"+d.verifyTx} target="_blank" rel="noreferrer">Verification <ExternalLink /></a></Button>{d.challengeTx && <Button asChild variant="outline"><a href={d.explorer+"/tx/"+d.challengeTx} target="_blank" rel="noreferrer">Challenge <ExternalLink /></a></Button>}<Button asChild variant="outline"><Link href={"/?network="+key+"&claim="+d.claimId}>Review live example</Link></Button></div></article>)}</div>
      <article className="mt-6 rounded-2xl border border-sky-300/20 bg-sky-300/5 p-5 text-sm leading-7 text-slate-300"><h2 className="text-lg font-semibold text-white">What the evidence means</h2><p>A review receipt is a snapshot read from the selected network and contract, not a cryptographic proof of truth. It includes stored hashes and the full first decision, current outcome and challenge history. Reload the live record to check changes. Studio Dev is a resettable preview; historical links can stop resolving after a reset.</p><p className="mt-2">The reported wallet “dangerous site” warning has not been independently reproduced or confirmed resolved. This update offers walletless review and a Studio test-account route. Do not bypass a browser or wallet warning.</p></article>
      <div className="mt-6 flex flex-wrap gap-4 text-sm text-sky-200"><a href="https://github.com/haris4587/sourceseal" target="_blank" rel="noreferrer">GitHub repository</a><Link href="/source">Contract source</Link><a href="/source_seal.py" download>Stable source</a><a href="/source_seal_dev.py" download>Dev source</a></div>
    </section>
  </main>;
}
