import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PlayCircle, Brain, Database, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface MLModel {
  id: number;
  name: string;
  model_type: string;
  is_active: boolean;
  latest_training: any;
}

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
  const [models, setModels] = useState<MLModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<number | null>(null);
  const [predictions, setPredictions] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);

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

  useEffect(() => {
    fetchMLModels();
  }, []);

  const fetchMLModels = async () => {
    try {
      setModelLoading(true);
      const response = await fetch("http://localhost:8000/api/ml/models/", {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setModels(data.models);
        // Auto-select the first active model
        const activeModel = data.models.find((m: MLModel) => m.is_active);
        if (activeModel) {
          setSelectedModel(activeModel.id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch ML models:", error);
    } finally {
      setModelLoading(false);
    }
  };

  const runSimulation = async () => {
    if (!selectedModel) {
      toast.error("Please select an ML model first");
      return;
    }

    try {
      setIsLoading(true);
      setPredictions(null);

      // Use ML model for predictions
      const response = await fetch("http://localhost:8000/api/ml/predict/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          model_id: selectedModel,
          input_data: sampleTrains
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPredictions(data);
        toast.success("Simulation completed successfully!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Simulation failed");
        
        // Fallback to local calculation
        runLocalSimulation();
      }
    } catch (error) {
      console.error("Simulation error:", error);
      toast.error("Connection error, using local simulation");
      runLocalSimulation();
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

  const trainNewModel = async () => {
    try {
      setModelLoading(true);
      const response = await fetch("http://localhost:8000/api/ml/train/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          model_type: "train_optimization",
          model_name: `Train_Optimization_${Date.now()}`,
          config: { weights: weights },
          data_sources: ["IBM Maximo", "Fitness Certificates"]
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Model trained successfully!");
        fetchMLModels(); // Refresh model list
        setSelectedModel(data.model_id);
      } else {
        const error = await response.json();
        toast.error(error.error || "Model training failed");
      }
    } catch (error) {
      console.error("Training error:", error);
      toast.error("Failed to train model");
    } finally {
      setModelLoading(false);
    }
  };

  return (
    <section className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">ML-Powered Simulation</h1>
        <p className="text-muted-foreground">Configure parameters and run AI-driven train optimization scenarios with real-time predictions.</p>
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
                disabled={total !== 100 || isLoading || !selectedModel}
                className="flex-1"
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                {isLoading ? "Running..." : "Run ML Simulation"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              ML Model
            </CardTitle>
            <CardDescription>Select or train a machine learning model</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {modelLoading ? (
              <div className="text-center py-4">Loading models...</div>
            ) : models.length > 0 ? (
              <div className="space-y-3">
                {models.map((model) => (
                  <div 
                    key={model.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedModel === model.id ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedModel(model.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{model.name}</div>
                        <div className="text-sm text-muted-foreground">{model.model_type}</div>
                      </div>
                      <Badge variant={model.is_active ? "default" : "secondary"}>
                        {model.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Alert>
                <Database className="h-4 w-4" />
                <AlertDescription>
                  No ML models found. Upload CSV data and train a model to get started.
                </AlertDescription>
              </Alert>
            )}
            
            <Button 
              onClick={trainNewModel}
              variant="outline" 
              className="w-full"
              disabled={modelLoading}
            >
              <Brain className="h-4 w-4 mr-2" />
              {modelLoading ? "Training..." : "Train New Model"}
            </Button>
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
