import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function HistoryPage() {
  const rows = [
    { date: "2025-09-10", window: "21:00–23:00", ready: 22, standby: 2, ibl: 1, notes: "No conflicts" },
    { date: "2025-09-09", window: "21:00–23:00", ready: 21, standby: 3, ibl: 1, notes: "Branding exposure prioritised" },
  ];
  return (
    <section className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Induction History</h1>
        <p className="text-muted-foreground">Recent runs and outcomes. Replace with persisted results once data store is connected.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent runs</CardTitle>
          <CardDescription>Summary of nightly induction lists</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Window</TableHead>
                <TableHead>Ready</TableHead>
                <TableHead>Standby</TableHead>
                <TableHead>IBL</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.date}>
                  <TableCell>{r.date}</TableCell>
                  <TableCell>{r.window}</TableCell>
                  <TableCell>{r.ready}</TableCell>
                  <TableCell>{r.standby}</TableCell>
                  <TableCell>{r.ibl}</TableCell>
                  <TableCell className="text-muted-foreground">{r.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}
