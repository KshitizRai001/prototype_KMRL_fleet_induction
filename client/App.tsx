import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Layout from "@/components/Layout";
import { ThemeProvider } from "@/components/ThemeProvider";
import DataFeeds from "./pages/DataFeeds";
import Rules from "./pages/Rules";
import Simulate from "./pages/Simulate";
import HistoryPage from "./pages/History";
import Login from "./pages/Login";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {/* Public routes without layout */}
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
          </Routes>

          {/* App routes with layout */}
          <Layout>
            <Routes>
              <Route path="/dashboard" element={<Index />} />
              <Route path="/data" element={<DataFeeds />} />
              <Route path="/rules" element={<Rules />} />
              <Route path="/simulate" element={<Simulate />} />
              <Route path="/history" element={<HistoryPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
