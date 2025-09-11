import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, FileDown, Satellite, Edit3, Upload } from "lucide-react";
import CSVImporter from "@/components/CSVImporter";

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
        <p className="text-muted-foreground">Manage and monitor inbound sources. Upload CSVs to ingest data quickly.</p>
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

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2"><Upload className="h-5 w-5 text-primary" /><CardTitle>CSV Upload</CardTitle></div>
            <CardDescription>Import Maximo job-cards, FC clearances, or UNS summaries</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <CSVImporter source="IBM Maximo" />
            <CSVImporter source="Fitness Certificates" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Tips</CardTitle>
            <CardDescription>Ensure first row is column headers</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• Supported: .csv (UTF‑8). Large files are truncated to first 1000 rows per upload for preview.</p>
            <p>• Map columns consistently across nightly uploads to enable learning and validation.</p>
            <p>• For databases and real‑time ingestion, connect Neon or Supabase via MCP.</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
