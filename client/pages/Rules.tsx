import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { ListChecks } from "lucide-react";

export default function Rules() {
  const rules = [
    "Fitness Certificates must be valid at induction time",
    "Open job-cards block service until closed",
    "Branding exposure targets prioritise advertiser SLA",
    "Mileage balancing maintains component wear within tolerance",
    "Cleaning slots must not exceed bay and manpower capacity",
    "Stabling geometry minimises shunting and turn-out time",
  ];
  return (
    <section className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Rules & Constraints</h1>
        <p className="text-muted-foreground">Configure domain constraints and optimisation objectives. This is a placeholder you can extend with forms and rule builders.</p>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <ListChecks className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>Default policy</CardTitle>
            <CardDescription>Active constraint set</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="grid sm:grid-cols-2 gap-3">
            {rules.map((r) => (
              <li key={r} className="rounded-md border p-3 bg-muted/30">{r}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
