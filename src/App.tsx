import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppSidebar from "@/components/AppSidebar";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import AttendanceAnalytics from "./components/AttendanceAnalytics";
import AttendanceMarking from "./components/AttendanceMarking";
import ParentNotifications from "./components/ParentNotifications";
import TeacherManagement from "./components/TeacherManagement";
import TimetableManagement from "./components/TimetableManagement";
import Timetable from "./pages/Timetable";
import Students from './pages/Students';
import Classes from './pages/Classes';

const queryClient = new QueryClient();

const DashboardLayout = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider>
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <div className="flex-1">
        <header className="flex h-14 items-center border-b px-4 bg-gradient-to-r from-primary/5 to-primary/10">
          <SidebarTrigger />
          <div className="ml-4 flex items-center gap-3">
            <img 
              src="/src/assets/ewit-logo.png" 
              alt="EWIT Logo" 
              className="h-8 w-8 object-contain"
            />
            <h1 className="text-lg font-semibold text-primary">EWIT Student Attendance System</h1>
          </div>
        </header>
        <main className="flex-1 p-6 bg-gradient-to-br from-background to-primary/5">
          {children}
        </main>
      </div>
    </div>
  </SidebarProvider>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Dashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/attendance" 
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <AttendanceAnalytics />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/subjects" 
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <div className="p-6">
                      <h1 className="text-2xl font-bold mb-4">My Subjects</h1>
                      <p className="text-muted-foreground">Subject management coming soon...</p>
                    </div>
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/mark-attendance" 
              element={
                <ProtectedRoute allowedRoles={['TEACHER', 'HOD', 'ADMIN']}>
                  <DashboardLayout>
                    <AttendanceMarking />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/notifications" 
              element={
                <ProtectedRoute allowedRoles={['TEACHER', 'HOD', 'ADMIN']}>
                  <DashboardLayout>
                    <ParentNotifications />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/reports" 
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <AttendanceAnalytics />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/children" 
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <div className="p-6">
                      <h1 className="text-2xl font-bold mb-4">My Children</h1>
                      <p className="text-muted-foreground">Children management coming soon...</p>
                    </div>
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/attendance-view" 
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <AttendanceAnalytics />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/teachers" 
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <TeacherManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <AttendanceAnalytics />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/timetable" 
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Timetable />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/students" 
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Students />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/classes" 
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Classes />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
