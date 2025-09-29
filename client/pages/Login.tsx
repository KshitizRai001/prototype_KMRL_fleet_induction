import { Train, LogIn, Shield, Users, Eye, EyeOff } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const [showStaffLogin, setShowStaffLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/auth/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`Welcome back, ${data.user.first_name || data.user.username}!`);
        localStorage.setItem('staff_user', JSON.stringify(data.user));
        navigate("/dashboard");
      } else {
        toast.error(data.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Connection error. Please check if the backend is running.");
    }

    setIsLoading(false);
  };

  if (showStaffLogin) {
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
            <CardTitle>Staff Login</CardTitle>
            <CardDescription>Enter your credentials to access the system</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <form onSubmit={handleStaffLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign in"}
                  {!isLoading && <LogIn className="h-4 w-4 ml-2" />}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowStaffLogin(false)}
                >
                  Back to options
                </Button>
              </div>
            </form>
            <div className="pt-4 text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Shield className="h-3.5 w-3.5" />
              <span>Demo: username: admin, password: admin123</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <Button className="w-full" onClick={() => setShowStaffLogin(true)}>
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
