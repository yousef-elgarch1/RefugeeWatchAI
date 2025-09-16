// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SidebarProvider } from "@/components/ui/sidebar";
import Header from "@/components/Header";
import { AppSidebar } from "@/components/AppSidebar";
import Dashboard from "@/pages/Dashboard";
import CrisisMap from "@/pages/CrisisMap";
import ResponsePlans from "@/pages/ResponsePlans";
import EmergencyAlerts from "@/components/EmergencyAlerts";
import NotFound from "@/pages/NotFound";
import AIAnalysis from "@/pages/AIAnalysis";  
import GlobalMetrics from "@/pages/GlobalMetrics";  // ✅ NEW DEDICATED PAGE
import DataSources from "@/pages/DataSources";      // ✅ NEW DEDICATED PAGE
import Reports from "@/pages/Reports"; 
// Create a client with error retry configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="min-h-screen flex w-full bg-background">
              <AppSidebar />
              <div className="flex-1 flex flex-col">
                <Header />
                <main className="flex-1 overflow-auto relative">
                  <EmergencyAlerts />
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/crisis-map" element={<CrisisMap />} />
                    <Route path="/ai-analysis" element={<AIAnalysis />} /> 
                    <Route path="/response-plans" element={<ResponsePlans />} />
                    <Route path="/metrics" element={<GlobalMetrics />} />       {/* ✅ FIXED */}
                    <Route path="/data-sources" element={<DataSources />} />    {/* ✅ FIXED */}
                    <Route path="/reports" element={<Reports />} />  
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;