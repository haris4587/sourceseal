"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  CircleAlert,
  CircleCheckBig,
  ExternalLink,
  FileCheck2,
  Fingerprint,
  Link2,
  LoaderCircle,
  Network,
  SearchCheck,
  ShieldCheck,
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
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

type VerificationRecord = {
  claim_id: string;
  claim: string;
  source_urls: string[];
  verdict: "SUPPORTED" | "CONTRADICTED" | "INSUFFICIENT_EVIDENCE";
  confidence: "HIGH" | "MEDIUM" | "LOW";
  summary: string;
  key_evidence: string;
  sources_reviewed: number;
  submitter: string;
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
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (
    event: string,
    listener: (...args: unknown[]) => void,
  ) => void;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

const DEFAULT_CONTRACT_ADDRESS = "0xC9425eC2f9899473a3A403550C6241CBC3d5224e";
const LIVE_PROOF_URL =
  "https://explorer-studio.genlayer.com/tx/0x92fd7f7060fac8ddd2a536dd169cbcb6397b0889229d79d35aacff90dfb8d19c";

const phaseProgress: Record<Phase, number> = {
  idle: 0,
  wallet: 15,
  submitting: 35,
  consensus: 68,
  reading: 90,
  complete: 100,
  error: 0,
};

const phaseCopy: Record<Phase, string> = {
  idle: "Ready for a new verification",
  wallet: "Waiting for wallet confirmation",
  submitting: "Submitting the claim on-chain",
  consensus: "Independent validators are reviewing the evidence",
  reading: "Reading the accepted verdict",
  complete: "Consensus verdict recorded",
  error: "Verification needs attention",
};

function shortAddress(address: string) {
  return address ? address.slice(0, 6) + "…" + address.slice(-4) : "";
}

function isContractAddress(value: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(value.trim());
}

async function makeClaimId(claim: string, urls: string) {
  const data = new TextEncoder().encode(
    claim.trim() + "|" + urls.trim() + "|" + Date.now(),
  );
  const digest = await crypto.subtle.digest("SHA-256", data);
  const hex = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return "ss-" + hex.slice(0, 24);
}

function verdictLabel(verdict: VerificationRecord["verdict"]) {
  if (verdict === "INSUFFICIENT_EVIDENCE") return "Insufficient evidence";
  return verdict.charAt(0) + verdict.slice(1).toLowerCase();
}

export default function Home() {
  const [claim, setClaim] = useState("");
  const [sourceUrls, setSourceUrls] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [contractAddress, setContractAddress] = useState(
    DEFAULT_CONTRACT_ADDRESS,
  );
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState("");
  const [transactionHash, setTransactionHash] = useState("");
  const [record, setRecord] = useState<VerificationRecord | null>(null);

  const urls = useMemo(
    () =>
      sourceUrls
        .split(String.fromCharCode(10))
        .map((url) => url.trim())
        .filter(Boolean),
    [sourceUrls],
  );
  const contractReady = isContractAddress(contractAddress);
  const isWorking = ["wallet", "submitting", "consensus", "reading"].includes(
    phase,
  );

  function saveContractAddress(value: string) {
    setContractAddress(value.trim());
  }

  async function connectWallet() {
    const provider = window.ethereum;
    if (!provider) {
      throw new Error(
        "No browser wallet was found. Open SourceSeal inside MetaMask or install a compatible wallet.",
      );
    }

    setPhase("wallet");
    const accounts = (await provider.request({
      method: "eth_requestAccounts",
    })) as string[];
    if (!accounts?.[0]) throw new Error("No wallet account was selected.");
    setWalletAddress(accounts[0]);
    return { address: accounts[0], provider };
  }

  async function runVerification() {
    setError("");
    setRecord(null);
    setTransactionHash("");

    if (claim.trim().length < 12) {
      setError("Write a claim containing at least 12 characters.");
      setPhase("error");
      return;
    }
    if (urls.length < 1 || urls.length > 3) {
      setError("Add 1 to 3 evidence URLs, with one URL on each line.");
      setPhase("error");
      return;
    }
    if (urls.some((url) => !url.startsWith("https://"))) {
      setError("Every evidence URL must begin with https://");
      setPhase("error");
      return;
    }
    if (!contractReady) {
      setError("Add the deployed SourceSeal contract address under Contract setup.");
      setPhase("error");
      return;
    }

    try {
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
      const claimId = await makeClaimId(claim, sourceUrls);

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
        retries: 60,
      });

      setPhase("reading");
      const rawRecord = await client.readContract({
        address: contractAddress as never,
        functionName: "get_verdict",
        args: [claimId],
        stateStatus: "accepted",
      });
      const parsed = JSON.parse(String(rawRecord)) as VerificationRecord;
      setRecord(parsed);
      setPhase("complete");
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "The verification failed.";
      setError(
        message.toLowerCase().includes("user rejected")
          ? "The wallet request was cancelled. Nothing was submitted."
          : message,
      );
      setPhase("error");
    }
  }

  return (
    <main className="site-shell min-h-screen overflow-hidden">
      <div className="ambient-grid" aria-hidden="true" />

      <header className="relative z-10 border-b border-white/8">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <a href="#verify" className="flex items-center gap-3">
            <span className="brand-seal" aria-hidden="true">
              <Fingerprint className="size-5" />
            </span>
            <span>
              <span className="block text-[15px] font-semibold tracking-tight text-white">
                SourceSeal
              </span>
              <span className="block text-[10px] uppercase tracking-[0.22em] text-emerald-200/55">
                GenLayer verification
              </span>
            </span>
          </a>

          <nav className="flex items-center gap-2" aria-label="Primary navigation">
            <Badge
              variant="outline"
              className="hidden border-emerald-300/20 bg-emerald-300/5 text-emerald-100 sm:inline-flex"
            >
              <span className="size-1.5 rounded-full bg-lime-300 shadow-[0_0_10px_#bef264]" />
              Verified on Studionet
            </Badge>
            <Button asChild variant="ghost" className="text-slate-300 hover:bg-white/5 hover:text-white">
              <a href="/source">Source &amp; evidence</a>
            </Button>
          </nav>
        </div>
      </header>

      <section
        id="verify"
        className="relative z-10 mx-auto grid max-w-7xl gap-8 px-5 pb-16 pt-10 sm:px-8 lg:grid-cols-[minmax(0,1.16fr)_minmax(340px,0.84fr)] lg:gap-10 lg:pt-16"
      >
        <div>
          <div className="mb-8 max-w-3xl">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <Badge className="border border-lime-300/25 bg-lime-300/10 text-lime-200">
                <ShieldCheck /> On-chain AI consensus
              </Badge>
              <span className="text-xs text-slate-500">No single model decides</span>
            </div>
            <h1 className="max-w-3xl text-balance text-4xl font-semibold leading-[1.04] tracking-[-0.04em] text-white sm:text-6xl">
              Turn web evidence into a{" "}
              <span className="text-gradient">verifiable verdict.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-slate-400 sm:text-lg">
              Submit a claim and up to three public sources. Independent GenLayer
              validators inspect the evidence, agree on the outcome, and seal the
              result on-chain.
            </p>
          </div>

          <Card className="glass-card gap-0 overflow-hidden border-white/10 py-0 text-white shadow-2xl shadow-black/30">
            <CardHeader className="border-b border-white/8 px-5 py-5 sm:px-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <SearchCheck className="size-5 text-lime-300" />
                    New claim verification
                  </CardTitle>
                  <CardDescription className="mt-1 text-slate-400">
                    Be precise. Validators assess only the evidence you provide.
                  </CardDescription>
                </div>
                <span className="hidden rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-wider text-slate-500 sm:block">
                  Public record
                </span>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 px-5 py-6 sm:px-7">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <label htmlFor="claim" className="text-sm font-medium text-slate-200">
                    Claim to verify
                  </label>
                  <span className="text-xs tabular-nums text-slate-600">
                    {claim.length}/600
                  </span>
                </div>
                <Textarea
                  id="claim"
                  value={claim}
                  maxLength={600}
                  onChange={(event) => setClaim(event.target.value)}
                  placeholder="Example: The city council approved the solar project on 12 June 2026."
                  className="min-h-32 resize-none border-white/10 bg-black/20 text-base text-white shadow-none placeholder:text-slate-600 focus-visible:border-lime-300/45 focus-visible:ring-lime-300/15"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <label htmlFor="sources" className="text-sm font-medium text-slate-200">
                    Evidence URLs
                  </label>
                  <span className="text-xs text-slate-600">{urls.length}/3 sources</span>
                </div>
                <Textarea
                  id="sources"
                  value={sourceUrls}
                  onChange={(event) => setSourceUrls(event.target.value)}
                  placeholder={"https://example.com/source-one" + String.fromCharCode(10) + "https://example.com/source-two"}
                  className="min-h-28 resize-none border-white/10 bg-black/20 font-mono text-sm leading-6 text-white shadow-none placeholder:text-slate-600 focus-visible:border-lime-300/45 focus-visible:ring-lime-300/15"
                />
                <p className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Link2 className="size-3.5" /> One public HTTPS URL per line.
                </p>
              </div>

              <details className="contract-setup rounded-xl border border-white/8 bg-black/15 p-4">
                <summary className="cursor-pointer text-sm font-medium text-slate-300">
                  Contract setup
                  <span className="ml-2 text-xs font-normal text-slate-600">
                    {contractReady ? shortAddress(contractAddress) : "deployment required"}
                  </span>
                </summary>
                <div className="mt-4 space-y-2">
                  <label htmlFor="contract" className="text-xs uppercase tracking-wider text-slate-500">
                    Studionet contract address
                  </label>
                  <Input
                    id="contract"
                    value={contractAddress}
                    onChange={(event) => saveContractAddress(event.target.value)}
                    placeholder="0x…"
                    className="border-white/10 bg-black/20 font-mono text-sm text-white shadow-none focus-visible:border-lime-300/45 focus-visible:ring-lime-300/15"
                    aria-invalid={Boolean(contractAddress) && !contractReady}
                  />
                </div>
              </details>

              {error ? (
                <div className="flex gap-3 rounded-xl border border-rose-400/20 bg-rose-400/8 p-4 text-sm leading-6 text-rose-100">
                  <CircleAlert className="mt-0.5 size-4 shrink-0 text-rose-300" />
                  <span>{error}</span>
                </div>
              ) : null}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  variant="ghost"
                  onClick={() =>
                    connectWallet().catch((caught: unknown) => {
                      setError(
                        caught instanceof Error
                          ? caught.message
                          : "Wallet connection failed.",
                      );
                      setPhase("error");
                    })
                  }
                  disabled={isWorking}
                  className="justify-start px-0 text-slate-400 hover:bg-transparent hover:text-white"
                >
                  {walletAddress ? <Check /> : <Wallet />}
                  {walletAddress ? shortAddress(walletAddress) : "Connect wallet"}
                </Button>
                <Button
                  size="lg"
                  onClick={runVerification}
                  disabled={isWorking}
                  className="h-12 rounded-xl bg-lime-300 px-6 font-semibold text-[#0a1712] shadow-[0_0_30px_rgba(190,242,100,0.15)] hover:bg-lime-200"
                >
                  {isWorking ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    <Fingerprint />
                  )}
                  Submit for consensus
                  {!isWorking ? <ArrowRight /> : null}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-5 lg:pt-14">
          <Card className="glass-card gap-0 border-white/10 py-0 text-white">
            <CardHeader className="border-b border-white/8 px-5 py-5">
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="text-base">Consensus monitor</CardTitle>
                <Network className="size-4 text-emerald-300" />
              </div>
              <CardDescription className="text-slate-500">
                {phaseCopy[phase]}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-5 py-5">
              <Progress
                value={phaseProgress[phase]}
                className="h-1.5 bg-white/8 [&_[data-slot=progress-indicator]]:bg-lime-300"
              />
              <div className="validator-rail mt-6 grid grid-cols-3 gap-3" aria-label="Validator consensus diagram">
                {["Leader", "Validator 1", "Validator 2"].map((label, index) => (
                  <div key={label} className="relative text-center">
                    <span
                      className={
                        "mx-auto flex size-10 items-center justify-center rounded-full border text-xs " +
                        (phaseProgress[phase] >= 35 + index * 16
                          ? "border-lime-300/50 bg-lime-300/10 text-lime-200"
                          : "border-white/10 bg-white/[0.025] text-slate-600")
                      }
                    >
                      {phaseProgress[phase] >= 84 ? <Check className="size-4" /> : index + 1}
                    </span>
                    <span className="mt-2 block text-[10px] uppercase tracking-wider text-slate-600">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
              {transactionHash ? (
                <div className="mt-5 rounded-lg border border-white/8 bg-black/20 p-3">
                  <span className="block text-[10px] uppercase tracking-wider text-slate-600">
                    Transaction
                  </span>
                  <span className="mt-1 block truncate font-mono text-xs text-slate-400">
                    {transactionHash}
                  </span>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {record ? (
            <Card
              className={
                "verdict-card verdict-" +
                record.verdict.toLowerCase() +
                " gap-0 overflow-hidden py-0 text-white"
              }
            >
              <CardHeader className="px-5 pb-4 pt-5">
                <div className="flex items-center justify-between gap-3">
                  <Badge className="verdict-badge border bg-transparent">
                    <CircleCheckBig /> {verdictLabel(record.verdict)}
                  </Badge>
                  <span className="text-xs uppercase tracking-wider text-slate-500">
                    {record.confidence} confidence
                  </span>
                </div>
                <CardTitle className="pt-3 text-xl leading-7">Consensus reached</CardTitle>
                <CardDescription className="leading-6 text-slate-300">
                  {record.summary}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-5 pb-5">
                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500">
                    Strongest evidence
                  </span>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {record.key_evidence || "No decisive evidence was identified."}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
                  <span>{record.sources_reviewed} sources reviewed</span>
                  <span className="font-mono">{record.claim_id}</span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Empty className="min-h-64 border border-dashed border-white/10 bg-white/[0.015] text-white">
              <EmptyHeader>
                <EmptyMedia variant="icon" className="bg-emerald-300/8 text-emerald-200">
                  <FileCheck2 />
                </EmptyMedia>
                <EmptyTitle>Your verdict will appear here</EmptyTitle>
                <EmptyDescription className="text-slate-500">
                  The result is displayed only after GenLayer validators accept the
                  transaction.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}

          {contractReady ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Button asChild variant="outline" className="border-white/10 bg-white/[0.025] text-slate-300 hover:bg-white/5 hover:text-white">
                  <a href={"https://studio.genlayer.com/?import-contract=" + contractAddress} target="_blank" rel="noreferrer">
                    Studio <ExternalLink />
                  </a>
                </Button>
                <Button asChild variant="outline" className="border-white/10 bg-white/[0.025] text-slate-300 hover:bg-white/5 hover:text-white">
                  <a href={"https://explorer-studio.genlayer.com/address/" + contractAddress} target="_blank" rel="noreferrer">
                    Explorer <ExternalLink />
                  </a>
                </Button>
              </div>
              <a
                href={LIVE_PROOF_URL}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-lg border border-lime-300/15 bg-lime-300/5 px-3 py-2.5 text-xs text-lime-200 transition hover:bg-lime-300/10"
              >
                <Check className="size-3.5" /> View finalized live proof <ExternalLink className="size-3.5" />
              </a>
            </div>
          ) : null}
        </aside>
      </section>

      <section className="relative z-10 border-t border-white/8 bg-black/10">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 md:grid-cols-3">
          {[
            ["01", "Fetch", "Validators independently retrieve the public evidence pages."],
            ["02", "Reason", "Each validator evaluates the claim against the same strict rubric."],
            ["03", "Seal", "Only an agreed verdict is accepted and stored on the GenLayer network."],
          ].map(([number, title, description]) => (
            <article key={number} className="border-l border-white/10 pl-5">
              <span className="font-mono text-xs text-lime-300/65">{number}</span>
              <h2 className="mt-3 font-semibold text-white">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-7 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>SourceSeal · Built on GenLayer Studionet</span>
          <a href="/source" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-lime-200">
            Inspect the implementation <ArrowRight className="size-3" />
          </a>
        </div>
      </footer>
    </main>
  );
}
