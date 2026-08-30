"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  Check,
  CircleAlert,
  CircleCheckBig,
  ExternalLink,
  FileClock,
  Fingerprint,
  GitCompareArrows,
  History,
  Link2,
  LoaderCircle,
  Network,
  RefreshCcw,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type Verdict = "SUPPORTED" | "CONTRADICTED" | "INSUFFICIENT_EVIDENCE";
type Confidence = "HIGH" | "MEDIUM" | "LOW";

type VerificationRecord = {
  claim_id: string;
  claim: string;
  source_urls: string[];
  original_verdict: Verdict;
  original_confidence: Confidence;
  current_verdict: Verdict;
  current_confidence: Confidence;
  summary: string;
  key_evidence: string;
  quality_score: number;
  source_diversity: Confidence;
  citations: string[];
  risk_flags: string[];
  sources_reviewed: number;
  submission_fingerprint: string;
  status: string;
  latest_revision_id: string;
  revision_count: number;
  submitter: string;
};

type RevisionRecord = {
  revision_id: string;
  claim_id: string;
  challenge_reason: string;
  counter_source_urls: string[];
  prior_verdict: Verdict;
  resolution: "UPHELD" | "OVERTURNED" | "INSUFFICIENT_COUNTER_EVIDENCE";
  canonical_verdict: Verdict;
  confidence: Confidence;
  rationale: string;
  decisive_evidence: string;
  quality_score: number;
  citations: string[];
  challenge_fingerprint: string;
  challenger: string;
};

type Phase =
  | "idle"
  | "wallet"
  | "submitting"
  | "consensus"
  | "reading"
  | "complete"
  | "error";

type EthereumProvider = {
  request: (request: {
    method: string;
    params?: readonly unknown[] | object;
  }) => Promise<unknown>;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const DEFAULT_CONTRACT_ADDRESS = "0x43bD65C68220D08b20793208d50F9F59dEDd7691";
const INITIAL_PROOF_URL =
  "https://explorer-studio.genlayer.com/tx/0x2dfceaca3abfb4a7b11906c5dce6d19d40b2b86f69a38297cc183006b417275d";
const CHALLENGE_PROOF_URL =
  "https://explorer-studio.genlayer.com/tx/0xa7606e15d31ddd6a47b785e737c5f43687c48221db6a753bfb5ada12f794b960";

const phaseProgress: Record<Phase, number> = {
  idle: 0,
  wallet: 12,
  submitting: 32,
  consensus: 68,
  reading: 92,
  complete: 100,
  error: 0,
};

const phaseCopy: Record<Phase, string> = {
  idle: "Ready for a claim, challenge, or record lookup",
  wallet: "Waiting for wallet confirmation",
  submitting: "Writing the request to Studionet",
  consensus: "Independent validators are rechecking the evidence",
  reading: "Reading the accepted canonical record",
  complete: "Consensus record updated",
  error: "The request needs attention",
};

function shortAddress(address: string) {
  return address ? address.slice(0, 6) + "…" + address.slice(-4) : "";
}

function isContractAddress(value: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(value.trim()) && value.trim() !== ZERO_ADDRESS;
}

function parseUrls(value: string) {
  return value
    .split(String.fromCharCode(10))
    .map((url) => url.trim())
    .filter(Boolean);
}

async function makeId(prefix: string, content: string) {
  const payload = new TextEncoder().encode(content + "|" + Date.now());
  const digest = await crypto.subtle.digest("SHA-256", payload);
  const hex = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return prefix + "-" + hex.slice(0, 24);
}

function verdictLabel(verdict: Verdict) {
  if (verdict === "INSUFFICIENT_EVIDENCE") return "Insufficient evidence";
  return verdict.charAt(0) + verdict.slice(1).toLowerCase();
}

function verdictClass(verdict: Verdict) {
  if (verdict === "SUPPORTED") return "border-lime-300/30 bg-lime-300/8 text-lime-200";
  if (verdict === "CONTRADICTED") return "border-rose-300/30 bg-rose-300/8 text-rose-200";
  return "border-amber-300/30 bg-amber-300/8 text-amber-200";
}

function FingerprintValue({ value }: { value: string }) {
  return (
    <code className="block break-all rounded-lg border border-white/8 bg-black/25 px-3 py-2 font-mono text-[11px] leading-5 text-slate-500">
      {value || "Not available"}
    </code>
  );
}

export default function Home() {
  const [claim, setClaim] = useState("");
  const [sourceUrls, setSourceUrls] = useState("");
  const [challengeClaimId, setChallengeClaimId] = useState("");
  const [challengeReason, setChallengeReason] = useState("");
  const [counterUrls, setCounterUrls] = useState("");
  const [inspectClaimId, setInspectClaimId] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const contractAddress = DEFAULT_CONTRACT_ADDRESS;
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState("");
  const [transactionHash, setTransactionHash] = useState("");
  const [record, setRecord] = useState<VerificationRecord | null>(null);
  const [revisions, setRevisions] = useState<RevisionRecord[]>([]);

  const urls = useMemo(() => parseUrls(sourceUrls), [sourceUrls]);
  const counterEvidence = useMemo(() => parseUrls(counterUrls), [counterUrls]);
  const contractReady = isContractAddress(contractAddress);
  const isWorking = ["wallet", "submitting", "consensus", "reading"].includes(phase);

  function resetRequestState() {
    setError("");
    setTransactionHash("");
    setRecord(null);
    setRevisions([]);
  }

  async function connectWallet() {
    const provider = window.ethereum;
    if (!provider) {
      throw new Error(
        "No compatible wallet was found. Open SourceSeal in MetaMask or install a browser wallet.",
      );
    }
    setPhase("wallet");
    const accounts = (await provider.request({ method: "eth_requestAccounts" })) as string[];
    if (!accounts?.[0]) throw new Error("No wallet account was selected.");
    setWalletAddress(accounts[0]);
    return { address: accounts[0], provider };
  }

  async function getConnectedClient() {
    const wallet = walletAddress
      ? { address: walletAddress, provider: window.ethereum }
      : await connectWallet();
    if (!wallet.provider) throw new Error("Wallet connection was lost.");
    const client = createClient({
      chain: studionet,
      account: wallet.address as never,
      provider: wallet.provider as never,
    });
    await client.connect("studionet");
    return client;
  }

  function handleCaught(caught: unknown) {
    const message = caught instanceof Error ? caught.message : "The request failed.";
    setError(
      message.toLowerCase().includes("user rejected")
        ? "The wallet request was cancelled. Nothing was submitted."
        : message,
    );
    setPhase("error");
  }

  async function loadRecord(client: Awaited<ReturnType<typeof getConnectedClient>>, claimId: string) {
    const rawRecord = await client.readContract({
      address: contractAddress as never,
      functionName: "get_verdict",
      args: [claimId],
    });
    if (!String(rawRecord)) throw new Error("No SourceSeal record was found for this claim ID.");
    const parsedRecord = JSON.parse(String(rawRecord)) as VerificationRecord;

    const rawIds = await client.readContract({
      address: contractAddress as never,
      functionName: "get_revision_ids",
      args: [claimId],
    });
    const revisionIds = JSON.parse(String(rawIds || "[]")) as string[];
    const parsedRevisions: RevisionRecord[] = [];
    for (const revisionId of revisionIds) {
      const rawRevision = await client.readContract({
        address: contractAddress as never,
        functionName: "get_revision",
        args: [revisionId],
      });
      if (String(rawRevision)) parsedRevisions.push(JSON.parse(String(rawRevision)) as RevisionRecord);
    }
    setRecord(parsedRecord);
    setRevisions(parsedRevisions);
  }

  async function verifyClaim() {
    resetRequestState();
    if (!contractReady) {
      setError("The SourceSeal milestone contract has not been connected yet.");
      setPhase("error");
      return;
    }
    if (claim.trim().length < 12) {
      setError("Write a claim containing at least 12 characters.");
      setPhase("error");
      return;
    }
    if (urls.length < 1 || urls.length > 5 || urls.some((url) => !url.startsWith("https://"))) {
      setError("Add 1 to 5 public HTTPS evidence URLs, one per line.");
      setPhase("error");
      return;
    }

    try {
      const client = await getConnectedClient();
      const claimId = await makeId("ss", claim + sourceUrls);
      setPhase("submitting");
      const hash = await client.writeContract({
        address: contractAddress as never,
        functionName: "verify_claim",
        args: [claimId, claim.trim(), urls.join(String.fromCharCode(10))],
        value: BigInt(0),
      });
      setTransactionHash(hash);
      setPhase("consensus");
      await client.waitForTransactionReceipt({
        hash,
        status: TransactionStatus.ACCEPTED,
        interval: 5_000,
        retries: 80,
      });
      setPhase("reading");
      await loadRecord(client, claimId);
      setInspectClaimId(claimId);
      setChallengeClaimId(claimId);
      setPhase("complete");
    } catch (caught) {
      handleCaught(caught);
    }
  }

  async function challengeClaim() {
    resetRequestState();
    if (!contractReady) {
      setError("The SourceSeal milestone contract has not been connected yet.");
      setPhase("error");
      return;
    }
    if (challengeClaimId.trim().length < 8) {
      setError("Enter the original SourceSeal claim ID.");
      setPhase("error");
      return;
    }
    if (challengeReason.trim().length < 20) {
      setError("Explain the challenge in at least 20 characters.");
      setPhase("error");
      return;
    }
    if (
      counterEvidence.length < 1 ||
      counterEvidence.length > 5 ||
      counterEvidence.some((url) => !url.startsWith("https://"))
    ) {
      setError("Add 1 to 5 public HTTPS counter-evidence URLs, one per line.");
      setPhase("error");
      return;
    }

    try {
      const client = await getConnectedClient();
      const revisionId = await makeId("rev", challengeClaimId + challengeReason + counterUrls);
      setPhase("submitting");
      const hash = await client.writeContract({
        address: contractAddress as never,
        functionName: "challenge_claim",
        args: [
          revisionId,
          challengeClaimId.trim(),
          challengeReason.trim(),
          counterEvidence.join(String.fromCharCode(10)),
        ],
        value: BigInt(0),
      });
      setTransactionHash(hash);
      setPhase("consensus");
      await client.waitForTransactionReceipt({
        hash,
        status: TransactionStatus.ACCEPTED,
        interval: 5_000,
        retries: 80,
      });
      setPhase("reading");
      await loadRecord(client, challengeClaimId.trim());
      setInspectClaimId(challengeClaimId.trim());
      setPhase("complete");
    } catch (caught) {
      handleCaught(caught);
    }
  }

  async function inspectRecord() {
    resetRequestState();
    if (!contractReady) {
      setError("The SourceSeal milestone contract has not been connected yet.");
      setPhase("error");
      return;
    }
    if (inspectClaimId.trim().length < 8) {
      setError("Enter a complete SourceSeal claim ID.");
      setPhase("error");
      return;
    }
    try {
      const client = await getConnectedClient();
      setPhase("reading");
      await loadRecord(client, inspectClaimId.trim());
      setPhase("complete");
    } catch (caught) {
      handleCaught(caught);
    }
  }

  return (
    <main className="site-shell min-h-screen overflow-hidden">
      <div className="ambient-grid" aria-hidden="true" />

      <header className="relative z-10 border-b border-white/8">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <a href="#protocol" className="flex items-center gap-3">
            <span className="brand-seal"><Fingerprint className="size-5" /></span>
            <span>
              <span className="block text-[15px] font-semibold tracking-tight text-white">SourceSeal</span>
              <span className="block text-[10px] uppercase tracking-[0.22em] text-emerald-200/55">Recheck Protocol</span>
            </span>
          </a>
          <nav className="flex items-center gap-1 sm:gap-2" aria-label="Primary navigation">
            <Badge variant="outline" className="hidden border-fuchsia-300/20 bg-fuchsia-300/5 text-fuchsia-100 sm:inline-flex">
              <Sparkles className="size-3" /> Milestone v2
            </Badge>
            <Button asChild variant="ghost" className="text-slate-300 hover:bg-white/5 hover:text-white">
              <a href="/milestone">Milestone evidence</a>
            </Button>
            <Button asChild variant="ghost" className="hidden text-slate-300 hover:bg-white/5 hover:text-white sm:inline-flex">
              <a href="/source">Source</a>
            </Button>
          </nav>
        </div>
      </header>

      <section id="protocol" className="relative z-10 mx-auto max-w-7xl px-5 pb-16 pt-8 sm:px-8 lg:pt-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(340px,.75fr)]">
          <div>
            <div className="mb-7 max-w-3xl">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge className="border border-lime-300/25 bg-lime-300/10 text-lime-200"><ShieldCheck /> Consensus-backed evidence</Badge>
                <span className="text-xs text-slate-500">Every correction preserves the original</span>
              </div>
              <h1 className="max-w-3xl text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-white sm:text-6xl">
                Verify once. <span className="text-gradient">Recheck when facts change.</span>
              </h1>
              <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-slate-400 sm:text-lg">
                SourceSeal now turns a verdict into a living, append-only case file. New counter-evidence triggers a neutral GenLayer re-adjudication without deleting history.
              </p>
            </div>

            <Card className="glass-card gap-0 overflow-hidden border-white/10 py-0 text-white shadow-2xl shadow-black/30">
              <Tabs defaultValue="verify">
                <CardHeader className="border-b border-white/8 px-4 py-4 sm:px-6">
                  <TabsList className="grid h-auto w-full grid-cols-3 rounded-xl border border-white/8 bg-black/20 p-1">
                    <TabsTrigger value="verify" className="h-10 rounded-lg text-xs sm:text-sm"><Fingerprint /> Verify</TabsTrigger>
                    <TabsTrigger value="challenge" className="h-10 rounded-lg text-xs sm:text-sm"><GitCompareArrows /> Challenge</TabsTrigger>
                    <TabsTrigger value="inspect" className="h-10 rounded-lg text-xs sm:text-sm"><Search /> Inspect</TabsTrigger>
                  </TabsList>
                </CardHeader>

                <TabsContent value="verify" className="mt-0">
                  <CardContent className="space-y-5 px-5 py-6 sm:px-7">
                    <div>
                      <CardTitle className="text-lg">Open a verifiable claim</CardTitle>
                      <CardDescription className="mt-1 text-slate-500">Creates the immutable first entry in a challengeable case file.</CardDescription>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between"><label htmlFor="claim" className="text-sm font-medium text-slate-200">Claim to verify</label><span className="text-xs tabular-nums text-slate-600">{claim.length}/600</span></div>
                      <Textarea id="claim" value={claim} maxLength={600} onChange={(event) => setClaim(event.target.value)} placeholder="Example: The Aurora clean-energy pilot received final council approval." className="min-h-28 resize-none border-white/10 bg-black/20 text-base text-white shadow-none placeholder:text-slate-600 focus-visible:border-lime-300/45 focus-visible:ring-lime-300/15" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between"><label htmlFor="sources" className="text-sm font-medium text-slate-200">Evidence URLs</label><span className="text-xs text-slate-600">{urls.length}/5 sources</span></div>
                      <Textarea id="sources" value={sourceUrls} onChange={(event) => setSourceUrls(event.target.value)} placeholder={"https://example.com/source-one\nhttps://example.com/source-two"} className="min-h-24 resize-none border-white/10 bg-black/20 font-mono text-sm leading-6 text-white shadow-none placeholder:text-slate-600 focus-visible:border-lime-300/45 focus-visible:ring-lime-300/15" />
                      <p className="flex items-center gap-1.5 text-xs text-slate-500"><Link2 className="size-3.5" /> One public HTTPS URL per line. Independent publishers improve quality.</p>
                    </div>
                    <Button size="lg" onClick={verifyClaim} disabled={isWorking} className="h-12 w-full rounded-xl bg-lime-300 font-semibold text-[#0a1712] hover:bg-lime-200">
                      {isWorking ? <LoaderCircle className="animate-spin" /> : <Fingerprint />} Seal initial verdict <ArrowRight />
                    </Button>
                  </CardContent>
                </TabsContent>

                <TabsContent value="challenge" className="mt-0">
                  <CardContent className="space-y-5 px-5 py-6 sm:px-7">
                    <div>
                      <CardTitle className="text-lg">Challenge with material evidence</CardTitle>
                      <CardDescription className="mt-1 text-slate-500">Re-adjudicates the full record and appends a linked revision.</CardDescription>
                    </div>
                    <div className="space-y-2"><label htmlFor="challenge-id" className="text-sm font-medium text-slate-200">Original claim ID</label><Input id="challenge-id" value={challengeClaimId} onChange={(event) => setChallengeClaimId(event.target.value)} placeholder="ss-…" className="border-white/10 bg-black/20 font-mono text-white shadow-none" /></div>
                    <div className="space-y-2"><div className="flex items-center justify-between"><label htmlFor="reason" className="text-sm font-medium text-slate-200">Why should validators recheck it?</label><span className="text-xs text-slate-600">{challengeReason.length}/700</span></div><Textarea id="reason" value={challengeReason} maxLength={700} onChange={(event) => setChallengeReason(event.target.value)} placeholder="A newer official correction materially changes the prior evidence…" className="min-h-24 resize-none border-white/10 bg-black/20 text-white shadow-none placeholder:text-slate-600" /></div>
                    <div className="space-y-2"><div className="flex items-center justify-between"><label htmlFor="counter" className="text-sm font-medium text-slate-200">Counter-evidence URLs</label><span className="text-xs text-slate-600">{counterEvidence.length}/5 sources</span></div><Textarea id="counter" value={counterUrls} onChange={(event) => setCounterUrls(event.target.value)} placeholder="https://example.com/correction" className="min-h-24 resize-none border-white/10 bg-black/20 font-mono text-sm text-white shadow-none placeholder:text-slate-600" /></div>
                    <Button size="lg" onClick={challengeClaim} disabled={isWorking} className="h-12 w-full rounded-xl bg-fuchsia-300 font-semibold text-[#1d1021] hover:bg-fuchsia-200">
                      {isWorking ? <LoaderCircle className="animate-spin" /> : <Scale />} Submit neutral recheck <ArrowRight />
                    </Button>
                  </CardContent>
                </TabsContent>

                <TabsContent value="inspect" className="mt-0">
                  <CardContent className="space-y-5 px-5 py-6 sm:px-7">
                    <div>
                      <CardTitle className="text-lg">Inspect a canonical case file</CardTitle>
                      <CardDescription className="mt-1 text-slate-500">Loads the original verdict and every accepted challenge in order.</CardDescription>
                    </div>
                    <div className="space-y-2"><label htmlFor="inspect-id" className="text-sm font-medium text-slate-200">Claim ID</label><Input id="inspect-id" value={inspectClaimId} onChange={(event) => setInspectClaimId(event.target.value)} placeholder="ss-…" className="border-white/10 bg-black/20 font-mono text-white shadow-none" /></div>
                    <Button size="lg" onClick={inspectRecord} disabled={isWorking} className="h-12 w-full rounded-xl border border-sky-300/20 bg-sky-300/10 font-semibold text-sky-100 hover:bg-sky-300/15">
                      {isWorking ? <LoaderCircle className="animate-spin" /> : <Search />} Load on-chain history
                    </Button>
                    <div className="rounded-xl border border-white/8 bg-black/15 p-4 text-sm leading-6 text-slate-500">
                      <History className="mb-3 size-5 text-sky-300" /> Original records remain immutable. A challenge updates only the canonical view and adds a separately queryable revision.
                    </div>
                  </CardContent>
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          <aside className="space-y-5 lg:pt-10">
            <Card className="glass-card gap-0 border-white/10 py-0 text-white">
              <CardHeader className="border-b border-white/8 px-5 py-5">
                <div className="flex items-center justify-between gap-4"><CardTitle className="text-base">Protocol monitor</CardTitle><Activity className="size-4 text-emerald-300" /></div>
                <CardDescription className="text-slate-500">{phaseCopy[phase]}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 px-5 py-5">
                <Progress value={phaseProgress[phase]} className="h-1.5 bg-white/8 [&_[data-slot=progress-indicator]]:bg-lime-300" />
                <div className="grid grid-cols-3 gap-2 text-center">
                  {["Fetch", "Compare", "Seal"].map((item, index) => (
                    <div key={item} className="rounded-lg border border-white/8 bg-black/15 px-2 py-3">
                      <span className={"mx-auto flex size-7 items-center justify-center rounded-full text-xs " + (phaseProgress[phase] >= 28 + index * 24 ? "bg-lime-300/12 text-lime-200" : "bg-white/5 text-slate-600")}>{phaseProgress[phase] >= 90 ? <Check className="size-3.5" /> : index + 1}</span>
                      <span className="mt-2 block text-[10px] uppercase tracking-wider text-slate-600">{item}</span>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" onClick={() => connectWallet().catch(handleCaught)} disabled={isWorking} className="w-full justify-start text-slate-400 hover:bg-white/5 hover:text-white">
                  {walletAddress ? <Check /> : <Wallet />} {walletAddress ? shortAddress(walletAddress) : "Connect wallet"}
                </Button>
                {transactionHash ? <a href={"https://explorer-studio.genlayer.com/tx/" + transactionHash} target="_blank" rel="noreferrer" className="block truncate rounded-lg border border-white/8 bg-black/20 p-3 font-mono text-xs text-slate-400 hover:text-lime-200">{transactionHash}</a> : null}
              </CardContent>
            </Card>

            {error ? <div className="flex gap-3 rounded-xl border border-rose-400/20 bg-rose-400/8 p-4 text-sm leading-6 text-rose-100"><CircleAlert className="mt-0.5 size-4 shrink-0 text-rose-300" /><span>{error}</span></div> : null}

            <div className="grid grid-cols-3 gap-3">
              {[["5", "sources"], ["100", "quality"], ["∞", "rechecks"]].map(([value, label]) => <div key={label} className="rounded-xl border border-white/8 bg-white/[0.025] p-3 text-center"><span className="block text-lg font-semibold text-white">{value}</span><span className="text-[10px] uppercase tracking-wider text-slate-600">{label}</span></div>)}
            </div>

            {contractReady ? <div className="grid grid-cols-2 gap-3"><Button asChild variant="outline" className="border-white/10 bg-white/[0.025] text-slate-300 hover:bg-white/5 hover:text-white"><a href={"https://explorer-studio.genlayer.com/address/" + contractAddress} target="_blank" rel="noreferrer">Contract <ExternalLink /></a></Button><Button asChild variant="outline" className="border-white/10 bg-white/[0.025] text-slate-300 hover:bg-white/5 hover:text-white"><a href={"https://studio.genlayer.com/?import-contract=" + contractAddress} target="_blank" rel="noreferrer">Studio <ExternalLink /></a></Button></div> : <div className="rounded-xl border border-amber-300/15 bg-amber-300/5 p-4 text-sm leading-6 text-amber-100/70">Milestone contract deployment is being connected.</div>}
          </aside>
        </div>

        {record ? (
          <section className="mt-8 grid gap-5 lg:grid-cols-[.8fr_1.2fr]" aria-live="polite">
            <Card className="glass-card gap-0 border-white/10 py-0 text-white">
              <CardHeader className="border-b border-white/8 px-5 py-5">
                <div className="flex flex-wrap items-center justify-between gap-3"><Badge variant="outline" className={verdictClass(record.current_verdict)}><CircleCheckBig /> {verdictLabel(record.current_verdict)}</Badge><span className="text-xs uppercase tracking-wider text-slate-500">{record.current_confidence} confidence</span></div>
                <CardTitle className="pt-3 text-xl leading-7">Canonical verdict</CardTitle>
                <CardDescription className="leading-6 text-slate-300">{record.summary}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-5 py-5">
                <div className="grid grid-cols-2 gap-3"><div className="rounded-xl border border-white/8 bg-black/20 p-4"><span className="text-[10px] uppercase tracking-wider text-slate-600">Evidence quality</span><span className="mt-2 block text-2xl font-semibold text-white">{record.quality_score}<small className="text-sm text-slate-600">/100</small></span></div><div className="rounded-xl border border-white/8 bg-black/20 p-4"><span className="text-[10px] uppercase tracking-wider text-slate-600">Revisions</span><span className="mt-2 block text-2xl font-semibold text-white">{record.revision_count}</span></div></div>
                <div><span className="mb-2 block text-[10px] uppercase tracking-wider text-slate-600">Submission fingerprint</span><FingerprintValue value={record.submission_fingerprint} /></div>
                <div><span className="mb-2 block text-[10px] uppercase tracking-wider text-slate-600">Claim ID</span><FingerprintValue value={record.claim_id} /></div>
              </CardContent>
            </Card>

            <Card className="glass-card gap-0 border-white/10 py-0 text-white">
              <CardHeader className="border-b border-white/8 px-5 py-5"><CardTitle className="flex items-center gap-2"><FileClock className="size-5 text-fuchsia-300" /> Append-only decision timeline</CardTitle><CardDescription className="text-slate-500">The accepted baseline and every recheck remain independently inspectable.</CardDescription></CardHeader>
              <CardContent className="space-y-4 px-5 py-5">
                <div className="timeline-entry relative rounded-xl border border-white/8 bg-black/18 p-4 pl-5"><span className="absolute -left-1 top-5 size-2.5 rounded-full bg-lime-300 shadow-[0_0_14px_#bef264]" /><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-sm font-medium text-white">Initial consensus verdict</span><Badge variant="outline" className={verdictClass(record.original_verdict)}>{verdictLabel(record.original_verdict)}</Badge></div><p className="mt-3 text-sm leading-6 text-slate-400">{record.claim}</p></div>
                {revisions.map((revision) => <div key={revision.revision_id} className="timeline-entry relative rounded-xl border border-fuchsia-300/15 bg-fuchsia-300/[0.035] p-4 pl-5"><span className="absolute -left-1 top-5 size-2.5 rounded-full bg-fuchsia-300 shadow-[0_0_14px_#f0abfc]" /><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-sm font-medium text-white">Challenge · {revision.resolution.replaceAll("_", " ")}</span><Badge variant="outline" className={verdictClass(revision.canonical_verdict)}>{verdictLabel(revision.canonical_verdict)}</Badge></div><p className="mt-3 text-sm leading-6 text-slate-300">{revision.rationale}</p><div className="mt-3"><FingerprintValue value={revision.challenge_fingerprint} /></div></div>)}
                {revisions.length === 0 ? <div className="rounded-xl border border-dashed border-white/10 p-5 text-center text-sm text-slate-600">No accepted challenge has been appended yet.</div> : null}
              </CardContent>
            </Card>
          </section>
        ) : null}
      </section>

      <section className="relative z-10 border-t border-white/8 bg-black/10">
        <div className="mx-auto grid max-w-7xl gap-5 px-5 py-12 sm:px-8 md:grid-cols-3">
          {[[RefreshCcw, "Re-adjudication", "New counter-evidence is compared against the original sources by independent validators."], [Fingerprint, "Immutable inputs", "Every initial claim and challenge receives a deterministic SHA-256 submission fingerprint."], [Network, "Canonical history", "The latest verdict is easy to query while the complete accepted timeline stays append-only."]].map(([Icon, title, description]) => { const ItemIcon = Icon as typeof RefreshCcw; return <article key={String(title)} className="rounded-2xl border border-white/8 bg-white/[0.02] p-5"><ItemIcon className="size-5 text-lime-300" /><h2 className="mt-4 font-semibold text-white">{String(title)}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{String(description)}</p></article>; })}
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-7 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>SourceSeal Recheck Protocol · Built on GenLayer Studionet</span>
          <div className="flex flex-wrap gap-4"><a href="/milestone" className="hover:text-lime-200">Milestone delta</a>{INITIAL_PROOF_URL ? <a href={INITIAL_PROOF_URL} target="_blank" rel="noreferrer" className="hover:text-lime-200">Initial proof</a> : null}{CHALLENGE_PROOF_URL ? <a href={CHALLENGE_PROOF_URL} target="_blank" rel="noreferrer" className="hover:text-lime-200">Challenge proof</a> : null}</div>
        </div>
      </footer>
    </main>
  );
}
