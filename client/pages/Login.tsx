import { Train, LogIn, Shield, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="absolute inset-0 -z-10 bg-mesh bg-grid" />
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="h-10 w-10 grid place-items-center rounded-md bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-brand">
              <Train className="h-5 w-5" />
            </div>
            <div className="leading-tight text-left">
              <div className="font-extrabold tracking-tight text-xl">
                R.O.P.S.
              </div>
              <div className="text-xs text-muted-foreground">
                Rail Optmization and Planning System
              </div>
            </div>
          </div>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Select an access type</CardDescription>
        </CardHeader>
        <CardContent className="pt-2 space-y-3">
          <Button className="w-full" onClick={() => navigate("/dashboard")}>
            <LogIn className="h-4 w-4 mr-2" /> Staff login
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              // Prototype placeholder for public access
              navigate("/login");
            }}
          >
            <Users className="h-4 w-4 mr-2" /> Public access (coming soon)
          </Button>
          <div className="pt-2 text-xs text-muted-foreground flex items-center justify-center gap-1">
            <Shield className="h-3.5 w-3.5" />
            <span>Authorised personnel only</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
