import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  FileCode2,
  Fingerprint,
  GitCompareArrows,
  History,
  Network,
  Scale,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const acceptedContract = "0xC9425eC2f9899473a3A403550C6241CBC3d5224e";
const previousMilestoneContract = "0x3ce1bd5ba7CEDAabd60CB1f7276f4B0a6e89c70e";
const milestoneContract = "0x94dc4ecE268F2791cbDDa7ad339DAe67443193a6";
const deploymentProof = "https://explorer-studio.genlayer.com/tx/0x74445031d7711ff6b449f97e37a5a5121d7b0be20637d4fdd16f965a7f1a57e9";
const initialProof = "https://explorer-studio.genlayer.com/tx/0xb72eff22922880448c052c3441fe32d289b49beeaa5d4ba3cd50d6c904a4625d";
const challengeProof = "https://explorer-studio.genlayer.com/tx/0x61764efefe5adadd0bafbad04946e569dd908c566e4130494dd0f08aae63b27b";
const finalityGuardProof = "https://explorer-studio.genlayer.com/tx/0x859ba4a8f3eaf9a60828be0b9862ef2b91876e1aac207b20484a84499f56c5fc";
const evidenceHash = "59fc391d06c73439e97ebd4f56dfae9edc9b2669b21fdc613a82750e0adec7ac";
const policyHash = "1587c6046cefd339333d9ac94353adce166c1dc6fef8b0c1b71e9eb8f1dee8a9";

const delta = [
  ["Lifecycle", "Challengeable record with no closing state", "Fixed seven-day window plus deterministic finalization"],
  ["Participants", "Submitter could also recheck", "Original submitter cannot challenge their own claim"],
  ["Evidence ingress", "Public HTTPS URLs", "Strict host, port, credential, fragment, size, and duplicate checks"],
  ["Challenge bounds", "Unbounded linked rechecks", "Maximum ten append-only revisions per case"],
  ["Policy provenance", "Stored authority assessment", "Versioned source-policy hash bound to the exact URL set"],
  ["Public access", "Wallet-oriented interface", "Walletless record and deadline inspection"],
  ["Delivery safety", "Manual verification", "CI for types, lint, production build, UI tests, and Python syntax"],
  ["Contract API", "Seven public methods", "Eleven methods including status and finalization"],
];

const features = [
  [GitCompareArrows, "Independent re-adjudication", "A different wallet can challenge during the fixed window; validators compare original and counter-evidence without favoring either submitter."],
  [Fingerprint, "Versioned trust policy", "The accepted URL set and authority rule receive an immutable policy version and SHA-256 fingerprint."],
  [History, "Bounded append-only history", "The initial record remains queryable and each case can add at most ten separately addressable revisions."],
  [Scale, "Deterministic finality", "After seven days, any wallet can seal the canonical verdict; early finalization and late challenges are rejected."],
];

export default function MilestonePage() {
  const deployed = /^0x[a-fA-F0-9]{40}$/.test(milestoneContract);

  return (
    <main className="site-shell min-h-screen overflow-hidden">
      <div className="ambient-grid" aria-hidden="true" />
      <header className="relative z-10 border-b border-white/8">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3"><span className="brand-seal"><Fingerprint className="size-5" /></span><span className="text-[15px] font-semibold text-white">SourceSeal</span></Link>
          <Button asChild variant="ghost" className="text-slate-300 hover:bg-white/5 hover:text-white"><Link href="/"><ArrowLeft /> Back to protocol</Link></Button>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="max-w-4xl">
          <Badge className="border border-fuchsia-300/25 bg-fuchsia-300/10 text-fuchsia-100"><CheckCircle2 /> Builder Milestone · SourceSeal v3</Badge>
          <h1 className="mt-6 text-balance text-4xl font-semibold tracking-[-0.045em] text-white sm:text-6xl">From endless rechecks to <span className="text-gradient">deterministic finality.</span></h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-400 sm:text-lg">This milestone completes SourceSeal&apos;s case lifecycle. It adds a deterministic seven-day challenge window, independent challengers, bounded revision history, strict evidence ingress rules, public deadline reads, and permissionless finalization.</p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[["7d", "immutable challenge window"], ["10", "maximum revisions"], ["11", "public contract methods"]].map(([value, label]) => <div key={label} className="rounded-2xl border border-white/8 bg-white/[0.025] p-5"><span className="text-3xl font-semibold text-white">{value}</span><span className="mt-2 block text-xs uppercase tracking-[.16em] text-slate-600">{label}</span></div>)}
        </div>

        <Card className="glass-card mt-8 gap-0 border-white/10 py-0 text-white">
          <CardHeader className="border-b border-white/8 px-5 py-5 sm:px-6"><CardTitle className="flex items-center gap-2"><ArrowRight className="size-5 text-lime-300" /> Documented delta from accepted version</CardTitle></CardHeader>
          <CardContent className="px-0 py-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="border-b border-white/8 bg-black/15 text-[11px] uppercase tracking-[.14em] text-slate-600"><tr><th className="px-5 py-4">Area</th><th className="px-5 py-4">Previous milestone</th><th className="px-5 py-4 text-lime-200">Finality milestone v3</th></tr></thead>
                <tbody>{delta.map(([area, before, after]) => <tr key={area} className="border-b border-white/6 last:border-0"><td className="px-5 py-4 font-medium text-white">{area}</td><td className="px-5 py-4 text-slate-500">{before}</td><td className="px-5 py-4 text-slate-300"><CheckCircle2 className="mr-2 inline size-4 text-lime-300" />{after}</td></tr>)}</tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {features.map(([Icon, title, description]) => { const ItemIcon = Icon as typeof ShieldCheck; return <Card key={String(title)} className="glass-card gap-3 border-white/10 px-5 py-5 text-white"><ItemIcon className="size-5 text-fuchsia-300" /><CardTitle className="text-base">{String(title)}</CardTitle><p className="text-sm leading-6 text-slate-500">{String(description)}</p></Card>; })}
        </div>

        <Card className="mt-5 gap-0 border-sky-300/20 bg-sky-300/[0.045] py-0 text-white">
          <CardHeader className="border-b border-sky-300/10 px-5 py-5 sm:px-6"><CardTitle className="flex items-center gap-2"><ShieldCheck className="size-5 text-sky-300" /> Live full-consensus v3 proof</CardTitle></CardHeader>
          <CardContent className="grid gap-4 px-5 py-5 sm:grid-cols-2 sm:px-6">
            <div className="rounded-xl border border-white/8 bg-black/20 p-4"><span className="text-[10px] uppercase tracking-wider text-slate-600">Source trust gate</span><strong className="mt-2 block text-sm text-lime-200">SUPPORTED · HIGH authority · 95/100</strong><p className="mt-2 text-xs leading-5 text-slate-500">Official GenLayer transaction-context documentation passed the primary-source gate. Policy hash: <code className="break-all text-slate-400">{policyHash}</code></p></div>
            <div className="rounded-xl border border-white/8 bg-black/20 p-4"><span className="text-[10px] uppercase tracking-wider text-slate-600">Fetched content SHA-256</span><code className="mt-2 block break-all text-xs leading-5 text-sky-100">{evidenceHash}</code><p className="mt-2 text-xs leading-5 text-slate-500">Stored with the evidence URL and 273,516-byte response length; the independent recheck detected later dynamic-page drift.</p></div>
          </CardContent>
        </Card>

        <Card className="mt-5 gap-0 border-lime-300/20 bg-lime-300/[0.045] py-0 text-white">
          <CardHeader className="border-b border-lime-300/10 px-5 py-5 sm:px-6"><CardTitle className="flex items-center gap-2"><ShieldCheck className="size-5 text-lime-300" /> Independent challenge preserved the record</CardTitle></CardHeader>
          <CardContent className="grid gap-4 px-5 py-5 sm:grid-cols-3 sm:px-6">
            <div className="rounded-xl border border-white/8 bg-black/20 p-4"><span className="text-[10px] uppercase tracking-wider text-slate-600">Initial adjudication</span><strong className="mt-2 block text-sm text-lime-200">SUPPORTED</strong><span className="mt-1 block text-xs text-slate-500">Quality 95 · full consensus</span></div>
            <div className="rounded-xl border border-white/8 bg-black/20 p-4"><span className="text-[10px] uppercase tracking-wider text-slate-600">Challenge resolution</span><strong className="mt-2 block text-sm text-fuchsia-200">UPHELD</strong><span className="mt-1 block text-xs text-slate-500">Independent wallet · quality 94</span></div>
            <div className="rounded-xl border border-lime-300/15 bg-lime-300/[0.035] p-4"><span className="text-[10px] uppercase tracking-wider text-lime-200/60">Canonical record</span><strong className="mt-2 block text-sm text-lime-200">SUPPORTED</strong><span className="mt-1 block text-xs text-slate-500">CHALLENGE WINDOW OPEN · revision 1</span></div>
            <div className="sm:col-span-3 rounded-xl border border-white/8 bg-black/15 p-4 text-xs leading-6 text-slate-400">
              The original record remains queryable while the linked revision records an independent challenger and detected content drift. Claim fingerprint: <code className="break-all text-slate-300">2609b08f8ea729d1c797d832f0a4a49843e467c3d17347e2e202d9fb9d7e49f9</code>. Challenge fingerprint: <code className="break-all text-slate-300">511253fbc6b639c3fd34d3e0e42882e1b8e950ae7d03d040a8279f1d2aa734e9</code>.
            </div>
          </CardContent>
        </Card>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
          <Card className="glass-card gap-0 border-white/10 py-0 text-white">
            <CardHeader className="border-b border-white/8 px-5 py-5"><CardTitle className="flex items-center gap-2"><Network className="size-5 text-emerald-300" /> Deployment evidence</CardTitle></CardHeader>
            <CardContent className="space-y-4 px-5 py-5">
              <div className="rounded-xl border border-white/8 bg-black/20 p-4"><span className="text-[10px] uppercase tracking-wider text-slate-600">Accepted baseline / previous milestone</span><code className="mt-2 block break-all text-xs text-slate-500">{acceptedContract}</code><code className="mt-2 block break-all text-xs text-slate-400">{previousMilestoneContract}</code></div>
              <div className="rounded-xl border border-lime-300/15 bg-lime-300/[0.035] p-4"><span className="text-[10px] uppercase tracking-wider text-lime-200/60">Milestone contract</span><code className="mt-2 block break-all text-xs text-lime-100">{deployed ? milestoneContract : "Deployment pending"}</code></div>
              <div className="flex flex-wrap gap-2">
                {deployed ? <Button asChild className="bg-lime-300 text-[#0a1712] hover:bg-lime-200"><a href={"https://explorer-studio.genlayer.com/address/" + milestoneContract} target="_blank" rel="noreferrer">Milestone contract <ExternalLink /></a></Button> : null}
                <Button asChild variant="outline" className="border-white/10 bg-black/15 text-slate-300"><a href={deploymentProof} target="_blank" rel="noreferrer">Deployment <ExternalLink /></a></Button>
                <Button asChild variant="outline" className="border-white/10 bg-black/15 text-slate-300"><a href={initialProof} target="_blank" rel="noreferrer">Verification <ExternalLink /></a></Button>
                <Button asChild variant="outline" className="border-white/10 bg-black/15 text-slate-300"><a href={challengeProof} target="_blank" rel="noreferrer">Challenge <ExternalLink /></a></Button>
                <Button asChild variant="outline" className="border-white/10 bg-black/15 text-slate-300"><a href={finalityGuardProof} target="_blank" rel="noreferrer">Early-finalization guard <ExternalLink /></a></Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card gap-0 border-white/10 py-0 text-white">
            <CardHeader className="border-b border-white/8 px-5 py-5"><CardTitle className="flex items-center gap-2"><FileCode2 className="size-5 text-sky-300" /> Reviewable evidence</CardTitle></CardHeader>
            <CardContent className="space-y-3 px-5 py-5">
              <a href="https://github.com/haris4587/sourceseal" target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl border border-white/8 bg-black/15 p-4 text-sm text-slate-300 hover:border-sky-300/20 hover:text-white"><span>Public GitHub repository</span><ExternalLink className="size-4" /></a>
              <a href="/source_seal.py" download className="flex items-center justify-between rounded-xl border border-white/8 bg-black/15 p-4 text-sm text-slate-300 hover:border-sky-300/20 hover:text-white"><span>Download milestone contract</span><FileCode2 className="size-4" /></a>
              <a href="/evidence/aurora-approval.html" className="flex items-center justify-between rounded-xl border border-white/8 bg-black/15 p-4 text-sm text-slate-300 hover:border-sky-300/20 hover:text-white"><span>Initial evidence fixture</span><ExternalLink className="size-4" /></a>
              <a href="/evidence/aurora-correction.html" className="flex items-center justify-between rounded-xl border border-white/8 bg-black/15 p-4 text-sm text-slate-300 hover:border-sky-300/20 hover:text-white"><span>Counter-evidence fixture</span><ExternalLink className="size-4" /></a>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
