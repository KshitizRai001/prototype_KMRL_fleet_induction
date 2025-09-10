import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, FileDown, Satellite, Edit3 } from "lucide-react";

export default function DataFeeds() {
  const feeds = [
    { name: "IBM Maximo", desc: "Job-cards (open/closed)", icon: FileDown, status: "Connected" },
    { name: "IoT Fitness", desc: "FC from Rolling-Stock, S&T", icon: Satellite, status: "Live" },
    { name: "UNS Streams", desc: "SCADA, signalling summaries", icon: Database, status: "Pending" },
    { name: "Manual Overrides", desc: "Supervisor inputs", icon: Edit3, status: "Enabled" },
  ];
  return (
    <section className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Data Feeds</h1>
        <p className="text-muted-foreground">Manage and monitor inbound sources. This page can be expanded with connectors and schedulers.</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {feeds.map((f) => (
          <Card key={f.name}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">{f.name}</CardTitle>
                <CardDescription>{f.desc}</CardDescription>
              </div>
              <f.icon className="h-8 w-8 text-primary" />
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">{f.status}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
