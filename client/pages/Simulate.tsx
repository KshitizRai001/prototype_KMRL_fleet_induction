import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PlayCircle, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";


interface PredictionResult {
  predictions: number[];
  feature_importance: Record<string, number>;
  model_info: {
    name: string;
    type: string;
    is_active: boolean;
  };
}

export default function Simulate() {
  const [weights, setWeights] = useState({ readiness: 40, branding: 15, mileage: 15, cleaning: 15, stabling: 15 });
  const [predictions, setPredictions] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const update = (k: keyof typeof weights) => (v: number[]) => setWeights((w) => ({ ...w, [k]: v[0] }));
  const total = Object.values(weights).reduce((a, b) => a + b, 0);

  const sliders = [
    { key: "readiness", label: "Service readiness (FC & job-cards)" },
    { key: "branding", label: "Branding exposure" },
    { key: "mileage", label: "Mileage balancing" },
    { key: "cleaning", label: "Cleaning & detailing" },
    { key: "stabling", label: "Stabling geometry" },
  ] as const;

  // Sample train data for simulation
  const sampleTrains = [
    { train_id: "KM-001", fc_rs: true, fc_sig: true, fc_tel: true, open_jobs: 0, mileage_km: 940, stabling_penalty: 10, cleaning_due: false },
    { train_id: "KM-002", fc_rs: true, fc_sig: true, fc_tel: false, open_jobs: 0, mileage_km: 1010, stabling_penalty: 15, cleaning_due: false },
    { train_id: "KM-003", fc_rs: true, fc_sig: false, fc_tel: true, open_jobs: 1, mileage_km: 880, stabling_penalty: 25, cleaning_due: true },
  ];



  const runSimulation = async () => {
    try {
      setIsLoading(true);
      setPredictions(null);

      // Run local simulation
      runLocalSimulation();
      toast.success("Simulation completed successfully!");
    } catch (error) {
      console.error("Simulation error:", error);
      toast.error("Simulation failed");
    } finally {
      setIsLoading(false);
    }
  };

  const runLocalSimulation = () => {
    // Simple local calculation as fallback
    const localPredictions = sampleTrains.map(train => {
      const fcScore = (Number(train.fc_rs) + Number(train.fc_sig) + Number(train.fc_tel)) / 3;
      const jobPenalty = Math.max(0, 1 - (train.open_jobs * 0.2));
      const mileageScore = Math.max(0, 1 - (Math.abs(train.mileage_km - 950) / 250));
      const stablingScore = Math.max(0, 1 - (train.stabling_penalty / 100));
      const cleaningScore = train.cleaning_due ? 0.65 : 1.0;
      
      return Math.round((fcScore * 0.4 + jobPenalty * 0.2 + mileageScore * 0.2 + stablingScore * 0.1 + cleaningScore * 0.1) * 100);
    });

    setPredictions({
      predictions: localPredictions,
      feature_importance: {
        fc_rs: 0.25, fc_sig: 0.25, fc_tel: 0.20, open_jobs: 0.15, mileage_km: 0.10, stabling_penalty: 0.05
      },
      model_info: { name: "Local Calculation", type: "fallback", is_active: true }
    });
  };


  return (
    <section className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Train Optimization Simulation</h1>
        <p className="text-muted-foreground">Configure parameters and run train optimization scenarios with real-time predictions.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Objective weights
            </CardTitle>
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
            <div className="flex gap-2">
              <Button 
                onClick={runSimulation}
                disabled={total !== 100 || isLoading}
                className="flex-1"
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                {isLoading ? "Running..." : "Run Simulation"}
              </Button>
            </div>
          </CardContent>
        </Card>


        {predictions && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Simulation Results</CardTitle>
              <CardDescription>
                Model: {predictions.model_info.name} ({predictions.model_info.type})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-3">Train Suitability Scores</h4>
                  <div className="space-y-2">
                    {sampleTrains.map((train, idx) => (
                      <div key={train.train_id} className="flex items-center justify-between p-2 border rounded">
                        <span className="font-medium">{train.train_id}</span>
                        <Badge 
                          variant={predictions.predictions[idx] > 80 ? "default" : 
                                 predictions.predictions[idx] > 60 ? "secondary" : "destructive"}
                        >
                          {predictions.predictions[idx]}/100
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Feature Importance</h4>
                  <div className="space-y-2">
                    {Object.entries(predictions.feature_importance).map(([feature, importance]) => (
                      <div key={feature} className="flex items-center justify-between">
                        <span className="text-sm">{feature.replace('_', ' ')}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-muted rounded">
                            <div 
                              className="h-full bg-primary rounded" 
                              style={{ width: `${importance * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-8">
                            {Math.round(importance * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
