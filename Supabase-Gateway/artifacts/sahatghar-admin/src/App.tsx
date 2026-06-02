import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";

import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Doctors from "@/pages/Doctors";
import DoctorDetail from "@/pages/DoctorDetail";
import Patients from "@/pages/Patients";
import PatientDetail from "@/pages/PatientDetail";
import Appointments from "@/pages/Appointments";
import Payments from "@/pages/Payments";
import Subscriptions from "@/pages/Subscriptions";
import SupportTickets from "@/pages/SupportTickets";
import HealthRecords from "@/pages/HealthRecords";
import AuditLogs from "@/pages/AuditLogs";
import Settings from "@/pages/Settings";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/doctors" component={Doctors} />
      <Route path="/doctors/:id" component={DoctorDetail} />
      <Route path="/patients" component={Patients} />
      <Route path="/patients/:id" component={PatientDetail} />
      <Route path="/appointments" component={Appointments} />
      <Route path="/payments" component={Payments} />
      <Route path="/subscriptions" component={Subscriptions} />
      <Route path="/support" component={SupportTickets} />
      <Route path="/health-records" component={HealthRecords} />
      <Route path="/audit-logs" component={AuditLogs} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
