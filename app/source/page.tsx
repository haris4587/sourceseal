import {
  ArrowLeft,
  Braces,
  CheckCircle2,
  Download,
  ExternalLink,
  FileCode2,
  Fingerprint,
  Network,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const implementationPoints = [
  "Fetches 1–3 public HTTPS evidence pages inside GenVM",
  "Treats retrieved page content as untrusted input",
  "Uses independent leader and validator analysis",
  "Has validators independently check the proposed verdict against the evidence",
  "Stores the accepted verdict as a queryable on-chain record",
  "Connects the web interface through the official GenLayerJS SDK",
];

const contractAddress = "0xC9425eC2f9899473a3A403550C6241CBC3d5224e";
const explorerUrl =
  "https://explorer-studio.genlayer.com/address/0xC9425eC2f9899473a3A403550C6241CBC3d5224e";
const studioUrl =
  "https://studio.genlayer.com/?import-contract=0xC9425eC2f9899473a3A403550C6241CBC3d5224e";
const proofUrl =
  "https://explorer-studio.genlayer.com/tx/0x92fd7f7060fac8ddd2a536dd169cbcb6397b0889229d79d35aacff90dfb8d19c";

export default function SourcePage() {
  return (
    <main className="site-shell min-h-screen overflow-hidden">
      <div className="ambient-grid" aria-hidden="true" />

      <header className="relative z-10 border-b border-white/8">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="brand-seal" aria-hidden="true">
              <Fingerprint className="size-5" />
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-white">
              SourceSeal
            </span>
          </Link>
          <Button asChild variant="ghost" className="text-slate-300 hover:bg-white/5 hover:text-white">
            <Link href="/"><ArrowLeft /> Back to verifier</Link>
          </Button>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="max-w-3xl">
          <Badge className="border border-lime-300/25 bg-lime-300/10 text-lime-200">
            <Braces /> Open implementation
          </Badge>
          <h1 className="mt-6 text-balance text-4xl font-semibold tracking-[-0.04em] text-white sm:text-6xl">
            Evidence reviewers can inspect.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            SourceSeal is a complete GenLayer DApp: a Python Intelligent Contract,
            decentralized AI-validator consensus, persistent on-chain verdicts,
            and a responsive GenLayerJS interface.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-lime-300/20 bg-lime-300/[0.055] p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-lime-200">
                <CheckCircle2 className="size-4" /> Deployed and verified on GenLayer Studionet
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                A five-validator live test finalized with a HIGH-confidence SUPPORTED verdict.
              </p>
              <code className="mt-3 block break-all text-xs text-slate-500">{contractAddress}</code>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" className="border-white/10 bg-black/15 text-slate-300 hover:bg-white/5 hover:text-white">
                <a href={explorerUrl} target="_blank" rel="noreferrer">Contract <ExternalLink /></a>
              </Button>
              <Button asChild variant="outline" className="border-white/10 bg-black/15 text-slate-300 hover:bg-white/5 hover:text-white">
                <a href={studioUrl} target="_blank" rel="noreferrer">Studio <ExternalLink /></a>
              </Button>
              <Button asChild className="bg-lime-300 text-[#0a1712] hover:bg-lime-200">
                <a href={proofUrl} target="_blank" rel="noreferrer">Finalized proof <ExternalLink /></a>
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="glass-card gap-0 border-white/10 py-0 text-white">
            <CardHeader className="border-b border-white/8 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileCode2 className="size-5 text-lime-300" />
                    Intelligent Contract
                  </CardTitle>
                  <CardDescription className="mt-1 text-slate-500">
                    contracts/source_seal.py
                  </CardDescription>
                </div>
                <Badge variant="outline" className="border-white/10 text-slate-400">
                  Python · GenVM
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="px-6 py-6">
              <div className="rounded-xl border border-white/8 bg-black/25 p-4 font-mono text-xs leading-6 text-slate-400 sm:p-5 sm:text-sm">
                <p><span className="text-fuchsia-300">class</span> <span className="text-lime-200">SourceSeal</span>(gl.Contract):</p>
                <p className="pl-4 text-slate-500">verdicts: TreeMap[str, str]</p>
                <p className="mt-2 pl-4"><span className="text-sky-300">@gl.public.write</span></p>
                <p className="pl-4"><span className="text-fuchsia-300">def</span> <span className="text-lime-200">verify_claim</span>(claim_id, claim, source_urls):</p>
                <p className="pl-8 text-slate-500"># fetch → reason → validate → seal</p>
                <p className="pl-8">result = gl.vm.<span className="text-lime-200">run_nondet_unsafe</span>(</p>
                <p className="pl-12">analyze_sources, validate_analysis</p>
                <p className="pl-8">)</p>
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="bg-lime-300 text-[#0a1712] hover:bg-lime-200">
                  <a href="/source_seal.py" download>
                    <Download /> Download contract
                  </a>
                </Button>
                <Button asChild variant="outline" className="border-white/10 bg-white/[0.025] text-slate-300 hover:bg-white/5 hover:text-white">
                  <a href="https://docs.genlayer.com/developers/intelligent-contracts/equivalence-principle" target="_blank" rel="noreferrer">
                    Consensus pattern <ExternalLink />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card gap-0 border-white/10 py-0 text-white">
            <CardHeader className="border-b border-white/8 px-6 py-5">
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-emerald-300" />
                What makes GenLayer central
              </CardTitle>
              <CardDescription className="text-slate-500">
                The product cannot produce an accepted verdict without validator consensus.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 px-6 py-6">
              {implementationPoints.map((point) => (
                <div key={point} className="flex gap-3 rounded-xl border border-white/8 bg-black/15 p-3.5">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-lime-300" />
                  <span className="text-sm leading-6 text-slate-300">{point}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {[
            [Network, "Consensus", "Leader and validators independently derive the verdict from live evidence."],
            [ShieldCheck, "Safety", "URL limits and prompt-injection boundaries protect the adjudication flow."],
            [FileCode2, "Reusable", "The contract exposes simple write and view methods for other GenLayer apps."],
          ].map(([Icon, title, description]) => {
            const ItemIcon = Icon as typeof Network;
            return (
              <Card key={String(title)} className="glass-card gap-3 border-white/10 px-5 py-5 text-white">
                <ItemIcon className="size-5 text-lime-300" />
                <CardTitle className="text-base">{String(title)}</CardTitle>
                <CardDescription className="leading-6 text-slate-500">
                  {String(description)}
                </CardDescription>
              </Card>
            );
          })}
        </div>
      </section>
    </main>
  );
}
