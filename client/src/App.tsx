import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, Plus, Home } from "lucide-react";

import FaultReportForm from "./components/FaultReportForm";
import ReportsTable, { type FaultReport } from "./components/ReportsTable";
import FaultReportDetail from "./components/FaultReportDetail";
import JobCardStatus from "./components/JobCardStatus";
import ProcurementRequest from "./components/ProcurementRequest";
import ThemeToggle from "./components/ThemeToggle";

type AppView = 
  | { type: 'dashboard' }
  | { type: 'detail'; report: FaultReport }
  | { type: 'job-card'; reportId: string; reportTitle: string }
  | { type: 'procurement'; report: FaultReport };

function App() {
  const [currentView, setCurrentView] = useState<AppView>({ type: 'dashboard' });
  const [reports, setReports] = useState<FaultReport[]>([
    // TODO: remove mock functionality
    {
      id: "1",
      title: "Air Conditioning Not Working in Server Room",
      description: "The main air conditioning unit in the server room has stopped working, causing temperature to rise above safe levels for equipment.",
      priority: "critical",
      department: "IT",
      location: "Building A, Floor 2, Server Room",
      reportedBy: "John Smith",
      status: "pending",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "2", 
      title: "Elevator Making Strange Noises",
      description: "The main elevator is making grinding noises when moving between floors. Possibly a mechanical issue with the motor.",
      priority: "high",
      department: "Maintenance",
      location: "Building B, Main Elevator",
      reportedBy: "Sarah Johnson",
      status: "approved",
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "3",
      title: "Broken Window in Conference Room",
      description: "Large crack in the window of Conference Room C. Needs immediate attention for safety reasons.",
      priority: "medium",
      department: "Facilities",
      location: "Building A, Floor 3, Conference Room C",
      reportedBy: "Mike Davis",
      status: "assigned",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    }
  ]);

  const handleSubmitReport = (newReport: any) => {
    const report: FaultReport = {
      ...newReport,
      id: Date.now().toString(),
      status: 'pending' as const,
      createdAt: new Date().toISOString()
    };
    setReports(prev => [report, ...prev]);
    console.log('New fault report submitted:', report);
  };

  const handleViewReport = (report: FaultReport) => {
    setCurrentView({ type: 'detail', report });
  };

  const handleUpdateStatus = (reportId: string, status: string) => {
    setReports(prev => prev.map(report => 
      report.id === reportId 
        ? { ...report, status: status as FaultReport['status'] }
        : report
    ));
    console.log('Report status updated:', reportId, status);
  };

  const handleIssueJobCard = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (report) {
      handleUpdateStatus(reportId, 'approved');
      setCurrentView({ type: 'job-card', reportId, reportTitle: report.title });
    }
  };

  const handlePullRequest = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (report) {
      setCurrentView({ type: 'procurement', report });
    }
  };

  const handleProcurementSubmit = (reportId: string, priority: string) => {
    handleUpdateStatus(reportId, 'assigned');
    setCurrentView({ type: 'dashboard' });
    console.log('Procurement request submitted:', reportId, priority);
  };

  const handleBackToDashboard = () => {
    setCurrentView({ type: 'dashboard' });
  };

  const getStatusCounts = () => {
    return {
      pending: reports.filter(r => r.status === 'pending').length,
      approved: reports.filter(r => r.status === 'approved').length,
      assigned: reports.filter(r => r.status === 'assigned').length,
      total: reports.length
    };
  };

  const statusCounts = getStatusCounts();

  if (currentView.type === 'detail') {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen bg-background">
            <div className="container mx-auto p-6">
              <FaultReportDetail
                report={currentView.report}
                onBack={handleBackToDashboard}
                onIssueJobCard={handleIssueJobCard}
                onPullRequest={handlePullRequest}
              />
            </div>
          </div>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  if (currentView.type === 'job-card') {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen bg-background">
            <div className="container mx-auto p-6">
              <JobCardStatus
                reportId={currentView.reportId}
                reportTitle={currentView.reportTitle}
                onBackToReports={handleBackToDashboard}
              />
            </div>
          </div>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  if (currentView.type === 'procurement') {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen bg-background">
            <div className="container mx-auto p-6">
              <ProcurementRequest
                reportId={currentView.report.id}
                reportTitle={currentView.report.title}
                reportDescription={currentView.report.description}
                onBack={() => setCurrentView({ type: 'detail', report: currentView.report })}
                onSubmit={handleProcurementSubmit}
              />
            </div>
          </div>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          {/* Header */}
          <header className="border-b border-border bg-card">
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                    <ClipboardList className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold" data-testid="text-app-title">
                      Fault Report Management System
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Streamlined workflow for fault reporting and resolution
                    </p>
                  </div>
                </div>
                <ThemeToggle />
              </div>
            </div>
          </header>

          {/* Dashboard Stats */}
          <div className="container mx-auto px-6 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Reports</p>
                      <p className="text-2xl font-semibold" data-testid="stat-total">{statusCounts.total}</p>
                    </div>
                    <Home className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-2xl font-semibold" data-testid="stat-pending">{statusCounts.pending}</p>
                    </div>
                    <Badge className="bg-status-pending text-white">
                      {statusCounts.pending}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Approved</p>
                      <p className="text-2xl font-semibold" data-testid="stat-approved">{statusCounts.approved}</p>
                    </div>
                    <Badge className="bg-status-approved text-white">
                      {statusCounts.approved}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Assigned to PM</p>
                      <p className="text-2xl font-semibold" data-testid="stat-assigned">{statusCounts.assigned}</p>
                    </div>
                    <Badge className="bg-status-assigned text-white">
                      {statusCounts.assigned}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="reports" className="w-full">
              <TabsList className="grid w-full grid-cols-2 max-w-md">
                <TabsTrigger value="reports" className="flex items-center gap-2" data-testid="tab-reports">
                  <ClipboardList className="h-4 w-4" />
                  Reports
                </TabsTrigger>
                <TabsTrigger value="submit" className="flex items-center gap-2" data-testid="tab-submit">
                  <Plus className="h-4 w-4" />
                  Submit Report
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="reports" className="mt-6">
                <ReportsTable
                  reports={reports}
                  onViewReport={handleViewReport}
                  onUpdateStatus={handleUpdateStatus}
                />
              </TabsContent>
              
              <TabsContent value="submit" className="mt-6">
                <FaultReportForm onSubmit={handleSubmitReport} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;