import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";
import { useState } from "react";

export default function Simulate() {
  const [weights, setWeights] = useState({ readiness: 40, branding: 15, mileage: 15, cleaning: 15, stabling: 15 });
  const update = (k: keyof typeof weights) => (v: number[]) => setWeights((w) => ({ ...w, [k]: v[0] }));
  const total = Object.values(weights).reduce((a, b) => a + b, 0);

  const sliders = [
    { key: "readiness", label: "Service readiness (FC & job-cards)" },
    { key: "branding", label: "Branding exposure" },
    { key: "mileage", label: "Mileage balancing" },
    { key: "cleaning", label: "Cleaning & detailing" },
    { key: "stabling", label: "Stabling geometry" },
  ] as const;

  return (
    <section className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">What‑if Simulation</h1>
        <p className="text-muted-foreground">Adjust objective weights and run a scenario. This is a placeholder to be expanded with scenario results.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Objective weights</CardTitle>
          <CardDescription>Total must equal 100%. Current total: {total}%</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {sliders.map((s) => (
            <div key={s.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">{s.label}</div>
                <div className="text-sm text-muted-foreground">{weights[s.key]}%</div>
              </div>
              <Slider value={[weights[s.key]]} max={100} step={1} onValueChange={update(s.key)} />
            </div>
          ))}
          <Button disabled={total !== 100}>
            <PlayCircle className="h-4 w-4" /> Run scenario
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
