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
const milestoneContract = "0x43bD65C68220D08b20793208d50F9F59dEDd7691";
const initialProof = "https://explorer-studio.genlayer.com/tx/0x2dfceaca3abfb4a7b11906c5dce6d19d40b2b86f69a38297cc183006b417275d";
const challengeProof = "https://explorer-studio.genlayer.com/tx/0xa7606e15d31ddd6a47b785e737c5f43687c48221db6a753bfb5ada12f794b960";

const delta = [
  ["Decision model", "One-shot verdict", "Challengeable canonical case file"],
  ["Evidence", "1–3 URLs", "1–5 URLs plus counter-evidence"],
  ["Quality signal", "Confidence only", "0–100 quality, diversity, citations, risk flags"],
  ["Provenance", "Claim ID", "SHA-256 fingerprints for claim and every challenge"],
  ["History", "Single stored record", "Append-only linked revisions with latest canonical verdict"],
  ["Contract API", "3 views + verify", "7 views/writes including challenge and revision inspection"],
];

const features = [
  [GitCompareArrows, "Neutral re-adjudication", "Validators compare the accepted source set with material counter-evidence before they can uphold or overturn a verdict."],
  [Fingerprint, "Deterministic provenance", "The exact claim, URL set, challenge reason, and counter-evidence set are anchored with SHA-256 fingerprints."],
  [History, "Append-only revisions", "The initial record is preserved. Every accepted challenge is stored separately and linked to the canonical case file."],
  [Scale, "Stronger evidence rubric", "Consensus now returns evidence quality, source diversity, exact citations, and risk flags—not just a verdict."],
];

export default function MilestonePage() {
  const deployed = milestoneContract !== "0x0000000000000000000000000000000000000000";

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
          <Badge className="border border-fuchsia-300/25 bg-fuchsia-300/10 text-fuchsia-100"><CheckCircle2 /> Builder Milestone · SourceSeal v2</Badge>
          <h1 className="mt-6 text-balance text-4xl font-semibold tracking-[-0.045em] text-white sm:text-6xl">From static verdicts to a <span className="text-gradient">recheck protocol.</span></h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-400 sm:text-lg">This milestone adds meaningful contract functionality to the accepted SourceSeal project. Claims can now be challenged with material counter-evidence, re-adjudicated by GenLayer validators, and resolved through a public append-only revision history.</p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[["4", "new contract methods"], ["100", "quality-score ceiling"], ["∞", "linked rechecks"]].map(([value, label]) => <div key={label} className="rounded-2xl border border-white/8 bg-white/[0.025] p-5"><span className="text-3xl font-semibold text-white">{value}</span><span className="mt-2 block text-xs uppercase tracking-[.16em] text-slate-600">{label}</span></div>)}
        </div>

        <Card className="glass-card mt-8 gap-0 border-white/10 py-0 text-white">
          <CardHeader className="border-b border-white/8 px-5 py-5 sm:px-6"><CardTitle className="flex items-center gap-2"><ArrowRight className="size-5 text-lime-300" /> Documented delta from accepted version</CardTitle></CardHeader>
          <CardContent className="px-0 py-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="border-b border-white/8 bg-black/15 text-[11px] uppercase tracking-[.14em] text-slate-600"><tr><th className="px-5 py-4">Area</th><th className="px-5 py-4">Accepted SourceSeal</th><th className="px-5 py-4 text-lime-200">Milestone v2</th></tr></thead>
                <tbody>{delta.map(([area, before, after]) => <tr key={area} className="border-b border-white/6 last:border-0"><td className="px-5 py-4 font-medium text-white">{area}</td><td className="px-5 py-4 text-slate-500">{before}</td><td className="px-5 py-4 text-slate-300"><CheckCircle2 className="mr-2 inline size-4 text-lime-300" />{after}</td></tr>)}</tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {features.map(([Icon, title, description]) => { const ItemIcon = Icon as typeof ShieldCheck; return <Card key={String(title)} className="glass-card gap-3 border-white/10 px-5 py-5 text-white"><ItemIcon className="size-5 text-fuchsia-300" /><CardTitle className="text-base">{String(title)}</CardTitle><p className="text-sm leading-6 text-slate-500">{String(description)}</p></Card>; })}
        </div>

        <Card className="mt-5 gap-0 border-lime-300/20 bg-lime-300/[0.045] py-0 text-white">
          <CardHeader className="border-b border-lime-300/10 px-5 py-5 sm:px-6"><CardTitle className="flex items-center gap-2"><ShieldCheck className="size-5 text-lime-300" /> Verified full-consensus recheck</CardTitle></CardHeader>
          <CardContent className="grid gap-4 px-5 py-5 sm:grid-cols-3 sm:px-6">
            <div className="rounded-xl border border-white/8 bg-black/20 p-4"><span className="text-[10px] uppercase tracking-wider text-slate-600">Initial adjudication</span><strong className="mt-2 block text-sm text-amber-200">INSUFFICIENT_EVIDENCE</strong><span className="mt-1 block text-xs text-slate-500">Quality 25 · finalized</span></div>
            <div className="rounded-xl border border-white/8 bg-black/20 p-4"><span className="text-[10px] uppercase tracking-wider text-slate-600">Challenge resolution</span><strong className="mt-2 block text-sm text-fuchsia-200">OVERTURNED</strong><span className="mt-1 block text-xs text-slate-500">Counter-evidence quality 85 · finalized</span></div>
            <div className="rounded-xl border border-lime-300/15 bg-lime-300/[0.035] p-4"><span className="text-[10px] uppercase tracking-wider text-lime-200/60">Canonical record</span><strong className="mt-2 block text-sm text-lime-200">CONTRADICTED</strong><span className="mt-1 block text-xs text-slate-500">CHALLENGED_OVERTURNED · revision 1</span></div>
            <div className="sm:col-span-3 rounded-xl border border-white/8 bg-black/15 p-4 text-xs leading-6 text-slate-400">
              The original record remains queryable while the accepted revision becomes canonical. Claim fingerprint: <code className="break-all text-slate-300">412fdff4f6008b93e23425a7a716871b3bbd8da340193e156c4caae7c3bdea81</code>. Challenge fingerprint: <code className="break-all text-slate-300">44792a20a755648c1df1eb091e79e8c9c21464b3ae34b8fb0219dbc77dcf98de</code>.
            </div>
          </CardContent>
        </Card>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
          <Card className="glass-card gap-0 border-white/10 py-0 text-white">
            <CardHeader className="border-b border-white/8 px-5 py-5"><CardTitle className="flex items-center gap-2"><Network className="size-5 text-emerald-300" /> Deployment evidence</CardTitle></CardHeader>
            <CardContent className="space-y-4 px-5 py-5">
              <div className="rounded-xl border border-white/8 bg-black/20 p-4"><span className="text-[10px] uppercase tracking-wider text-slate-600">Accepted baseline contract</span><code className="mt-2 block break-all text-xs text-slate-400">{acceptedContract}</code></div>
              <div className="rounded-xl border border-lime-300/15 bg-lime-300/[0.035] p-4"><span className="text-[10px] uppercase tracking-wider text-lime-200/60">Milestone contract</span><code className="mt-2 block break-all text-xs text-lime-100">{deployed ? milestoneContract : "Deployment pending"}</code></div>
              <div className="flex flex-wrap gap-2">
                {deployed ? <Button asChild className="bg-lime-300 text-[#0a1712] hover:bg-lime-200"><a href={"https://explorer-studio.genlayer.com/address/" + milestoneContract} target="_blank" rel="noreferrer">Milestone contract <ExternalLink /></a></Button> : null}
                {initialProof ? <Button asChild variant="outline" className="border-white/10 bg-black/15 text-slate-300"><a href={initialProof} target="_blank" rel="noreferrer">Initial verdict <ExternalLink /></a></Button> : null}
                {challengeProof ? <Button asChild variant="outline" className="border-white/10 bg-black/15 text-slate-300"><a href={challengeProof} target="_blank" rel="noreferrer">Challenge proof <ExternalLink /></a></Button> : null}
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
