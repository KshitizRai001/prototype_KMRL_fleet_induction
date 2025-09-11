import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertTriangle, PlayCircle, Clock4, Layers, BadgePercent, Gauge, Sparkles, Map, Brush, ShieldCheck, Workflow, ListTree, RefreshCw } from "lucide-react";

type Train = {
  id: string;
  fcRS: boolean; // Rolling-Stock FC
  fcSIG: boolean; // Signalling FC
  fcTEL: boolean; // Telecom FC
  openJobs: number; // Maximo job-cards open
  brandingShortfall: number; // hours below target
  mileageKm: number; // last-7d total km
  cleaningDue: boolean; // deep clean due tonight
  stablingPenalty: number; // 0-100 (higher is worse)
};

const INITIAL: Train[] = [
  { id: "KM-001", fcRS: true, fcSIG: true, fcTEL: true, openJobs: 0, brandingShortfall: 8, mileageKm: 940, cleaningDue: false, stablingPenalty: 10 },
  { id: "KM-002", fcRS: true, fcSIG: true, fcTEL: false, openJobs: 0, brandingShortfall: 2, mileageKm: 1010, cleaningDue: false, stablingPenalty: 15 },
  { id: "KM-003", fcRS: true, fcSIG: true, fcTEL: true, openJobs: 1, brandingShortfall: 5, mileageKm: 880, cleaningDue: true, stablingPenalty: 5 },
  { id: "KM-004", fcRS: true, fcSIG: false, fcTEL: true, openJobs: 0, brandingShortfall: 0, mileageKm: 970, cleaningDue: false, stablingPenalty: 25 },
  { id: "KM-005", fcRS: true, fcSIG: true, fcTEL: true, openJobs: 2, brandingShortfall: 10, mileageKm: 760, cleaningDue: true, stablingPenalty: 0 },
  { id: "KM-006", fcRS: true, fcSIG: true, fcTEL: true, openJobs: 0, brandingShortfall: 4, mileageKm: 1020, cleaningDue: false, stablingPenalty: 12 },
  { id: "KM-007", fcRS: true, fcSIG: true, fcTEL: true, openJobs: 0, brandingShortfall: 0, mileageKm: 900, cleaningDue: false, stablingPenalty: 6 },
  { id: "KM-008", fcRS: false, fcSIG: true, fcTEL: true, openJobs: 0, brandingShortfall: 7, mileageKm: 920, cleaningDue: false, stablingPenalty: 18 },
  { id: "KM-009", fcRS: true, fcSIG: true, fcTEL: true, openJobs: 3, brandingShortfall: 12, mileageKm: 830, cleaningDue: true, stablingPenalty: 30 },
  { id: "KM-010", fcRS: true, fcSIG: true, fcTEL: true, openJobs: 0, brandingShortfall: 1, mileageKm: 990, cleaningDue: false, stablingPenalty: 8 },
  { id: "KM-011", fcRS: true, fcSIG: true, fcTEL: false, openJobs: 1, brandingShortfall: 9, mileageKm: 870, cleaningDue: false, stablingPenalty: 12 },
  { id: "KM-012", fcRS: true, fcSIG: true, fcTEL: true, openJobs: 0, brandingShortfall: 0, mileageKm: 950, cleaningDue: false, stablingPenalty: 4 },
];

const targetMileage = 950; // target 7-day mileage for balancing

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

function scoreReadiness(t: Train) {
  const fc = (Number(t.fcRS) + Number(t.fcSIG) + Number(t.fcTEL)) / 3; // 0..1
  const jobPenalty = Math.min(t.openJobs * 0.2, 0.8); // each open job -20%, cap 80%
  return clamp(Math.round((fc - jobPenalty) * 100));
}

function scoreBranding(t: Train) {
  // Less shortfall is better. Assume targets of 10h; 0 => 100, 10+ => 0
  const s = clamp(Math.round((1 - Math.min(t.brandingShortfall, 10) / 10) * 100));
  return s;
}

function scoreMileage(t: Train) {
  const dev = Math.abs(t.mileageKm - targetMileage);
  // 0 dev =>100, 250+ dev => 0
  const s = clamp(Math.round((1 - Math.min(dev, 250) / 250) * 100));
  return s;
}

function scoreCleaning(t: Train) {
  return t.cleaningDue ? 65 : 100; // if due, discourage but not block
}

function scoreStabling(t: Train) {
  return clamp(100 - t.stablingPenalty);
}

function explain(t: Train) {
  const reasons: string[] = [];
  if (!t.fcRS) reasons.push("Rolling-Stock FC missing");
  if (!t.fcSIG) reasons.push("Signalling FC missing");
  if (!t.fcTEL) reasons.push("Telecom FC missing");
  if (t.openJobs > 0) reasons.push(`${t.openJobs} open job-card(s)`);
  if (t.brandingShortfall > 0) reasons.push(`${t.brandingShortfall}h branding shortfall`);
  const dev = Math.abs(t.mileageKm - targetMileage);
  if (dev > 100) reasons.push(`Mileage deviation ${dev} km`);
  if (t.cleaningDue) reasons.push("Deep-clean due tonight");
  if (t.stablingPenalty > 20) reasons.push("Unfavourable stabling position");
  return reasons.length ? reasons : ["No issues detected"];
}

export default function Index() {
  const [weights, setWeights] = useState({ readiness: 40, branding: 15, mileage: 15, cleaning: 15, stabling: 15 });
  const [selected, setSelected] = useState<string | null>(null);

  const trains = INITIAL;

  const scored = useMemo(() => {
    const total = Object.values(weights).reduce((a, b) => a + b, 0) || 1;
    return trains
      .map((t) => {
        const s = {
          readiness: scoreReadiness(t),
          branding: scoreBranding(t),
          mileage: scoreMileage(t),
          cleaning: scoreCleaning(t),
          stabling: scoreStabling(t),
        };
        const composite = Math.round(
          (s.readiness * weights.readiness +
            s.branding * weights.branding +
            s.mileage * weights.mileage +
            s.cleaning * weights.cleaning +
            s.stabling * weights.stabling) /
            total,
        );
        const conflicts = explain(t).filter((r) => r !== "No issues detected");
        const hardBlock = !(t.fcRS && t.fcSIG && t.fcTEL) || t.openJobs > 0;
        return { t, s, composite, conflicts, hardBlock };
      })
      .sort((a, b) => b.composite - a.composite);
  }, [trains, weights]);

  const selectedTrain = scored.find((x) => x.t.id === selected);

  const sliders = [
    { key: "readiness", label: "Service readiness" },
    { key: "branding", label: "Branding exposure" },
    { key: "mileage", label: "Mileage balancing" },
    { key: "cleaning", label: "Cleaning & detailing" },
    { key: "stabling", label: "Stabling geometry" },
  ] as const;

  const total = Object.values(weights).reduce((a, b) => a + b, 0);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-mesh bg-grid" />
        <div className="container mx-auto py-12 md:py-16">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border bg-secondary px-3 py-1 text-xs text-secondary-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> Multi‑objective fleet induction
              </div>
              <h1 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight">
                Algorithm‑driven decisions for Kochi Metro trainset induction
              </h1>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
                Ingest clearances and work orders, enforce constraints, optimise for service readiness, cost and branding exposure, and publish an explainable ranked list—every night, reliably.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button asChild>
                  <a href="/simulate"><PlayCircle className="h-4 w-4" /> Run what‑if</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/data"><RefreshCw className="h-4 w-4" /> Connect data</a>
                </Button>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Target punctuality</CardDescription>
                  <CardTitle className="text-3xl">99.5%</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">Protected by automated FC and job‑card checks</CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Fleet size</CardDescription>
                  <CardTitle className="text-3xl">25 → 40</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">Scales to multiple depots by 2027</CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Induction window</CardDescription>
                  <CardTitle className="text-3xl">21:00–23:00</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">Automated within the nightly operating window</CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Branding exposure</CardDescription>
                  <CardTitle className="text-3xl">SLA‑aware</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">Meets advertiser hour commitments</CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Inputs & Constraints */}
      <section className="container mx-auto py-10">
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Workflow className="h-5 w-5 text-primary" /> Heterogeneous inputs</CardTitle>
              <CardDescription>Near real‑time feeds unify siloed data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { label: "Fitness Certificates", icon: ShieldCheck, status: "Rolling‑Stock, S&T, Telecom" },
                  { label: "Job‑Cards", icon: ListTree, status: "IBM Maximo exports" },
                  { label: "Branding Priorities", icon: BadgePercent, status: "Advertiser SLAs" },
                  { label: "Mileage", icon: Gauge, status: "Bogie, brake, HVAC wear" },
                  { label: "Cleaning & Detailing", icon: Brush, status: "Bay + manpower" },
                  { label: "Stabling Geometry", icon: Map, status: "Minimise shunting" },
                ].map((x) => (
                  <div key={x.label} className="flex items-start gap-3 rounded-md border bg-muted/40 p-3">
                    <x.icon className="h-5 w-5 text-primary mt-0.5" />
                    <div className="text-sm">
                      <div className="font-medium">{x.label}</div>
                      <div className="text-muted-foreground">{x.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Layers className="h-5 w-5 text-primary" /> Objective weights</CardTitle>
              <CardDescription>Total must equal 100%</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sliders.map((s) => (
                <div key={s.key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span>{s.label}</span>
                    <span className="text-muted-foreground">{weights[s.key]}%</span>
                  </div>
                  <Slider
                    value={[weights[s.key]]}
                    max={100}
                    step={1}
                    onValueChange={(v) => setWeights((w) => ({ ...w, [s.key]: v[0] }))}
                  />
                </div>
              ))}
              <div className="text-xs text-muted-foreground">Current total: {total}%</div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Ranked induction list */}
      <section className="container mx-auto pb-16">
        <div className="grid lg:grid-cols-3 gap-6 items-start">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-primary" /> Ranked induction list</CardTitle>
              <CardDescription>Explainable scores with conflict alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rake</TableHead>
                      <TableHead>Composite</TableHead>
                      <TableHead>Readiness</TableHead>
                      <TableHead>Branding</TableHead>
                      <TableHead>Mileage</TableHead>
                      <TableHead>Cleaning</TableHead>
                      <TableHead>Stabling</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scored.map((r) => (
                      <TableRow key={r.t.id} className="cursor-pointer" onClick={() => setSelected(r.t.id)}>
                        <TableCell className="font-medium">{r.t.id}</TableCell>
                        <TableCell>{r.composite}</TableCell>
                        <TableCell>{r.s.readiness}</TableCell>
                        <TableCell>{r.s.branding}</TableCell>
                        <TableCell>{r.s.mileage}</TableCell>
                        <TableCell>{r.s.cleaning}</TableCell>
                        <TableCell>{r.s.stabling}</TableCell>
                        <TableCell>
                          {r.hardBlock ? (
                            <Badge variant="destructive">Blocked</Badge>
                          ) : r.conflicts.length ? (
                            <Badge variant="secondary">Check</Badge>
                          ) : (
                            <Badge className="bg-primary text-primary-foreground hover:bg-primary">Ready</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Clock4 className="h-5 w-5 text-primary" /> Nightly run</CardTitle>
                <CardDescription>21:00 ingest → 22:00 optimise → 23:00 publish</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="rounded-md border p-3">Ingest feeds and validate FCs</div>
                <div className="rounded-md border p-3">Apply constraints and weights</div>
                <div className="rounded-md border p-3">Rank rakes with explanations</div>
                <div className="rounded-md border p-3">Notify conflicts for overrides</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-primary" /> Conflicts</CardTitle>
                <CardDescription>Items requiring attention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {scored.filter((x) => x.conflicts.length || x.hardBlock).slice(0, 5).map((x) => (
                  <Alert key={x.t.id}>
                    <AlertTitle className="text-sm font-medium">{x.t.id}</AlertTitle>
                    <AlertDescription className="text-xs text-muted-foreground">
                      {x.hardBlock ? "Blocked: " : "Warnings: "}
                      {x.conflicts.join(", ") || "None"}
                    </AlertDescription>
                  </Alert>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> Explainability</CardTitle>
                <CardDescription>Selected rake rationale</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedTrain ? (
                  <div className="space-y-2 text-sm">
                    <div className="font-medium">{selectedTrain.t.id}</div>
                    <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                      {explain(selectedTrain.t).map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">Select a rake from the table to view reasoning.</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
