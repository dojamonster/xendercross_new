import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, FileText, Download, Wrench, ShoppingCart } from "lucide-react";
import type { FaultReport } from "./ReportsTable";

export interface FaultReportDetailProps {
  report: FaultReport;
  onBack?: () => void;
  onIssueJobCard?: (reportId: string) => void;
  onPullRequest?: (reportId: string) => void;
}

export default function FaultReportDetail({ 
  report, 
  onBack, 
  onIssueJobCard, 
  onPullRequest 
}: FaultReportDetailProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-status-pending text-white", label: "Pending" },
      approved: { color: "bg-status-approved text-white", label: "Approved" },
      assigned: { color: "bg-status-assigned text-white", label: "Assigned to PM" },
      rejected: { color: "bg-destructive text-destructive-foreground", label: "Rejected" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge className={config.color} data-testid={`status-badge-${status}`}>
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { color: "bg-secondary text-secondary-foreground", label: "Low" },
      medium: { color: "bg-status-pending text-white", label: "Medium" },
      high: { color: "bg-status-assigned text-white", label: "High" },
      critical: { color: "bg-destructive text-destructive-foreground", label: "Critical" }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.low;
    
    return (
      <Badge variant="outline" className={config.color} data-testid={`priority-badge-${priority}`}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleJobCard = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing
    onIssueJobCard?.(report.id);
    setIsProcessing(false);
  };

  const handlePullRequest = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing
    onPullRequest?.(report.id);
    setIsProcessing(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={onBack}
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Reports
        </Button>
        <h1 className="text-2xl font-bold" data-testid="text-detail-title">Fault Report Details</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div className="space-y-2">
              <CardTitle className="text-xl" data-testid="text-report-title">
                {report.title}
              </CardTitle>
              <div className="flex gap-2">
                {getStatusBadge(report.status)}
                {getPriorityBadge(report.priority)}
              </div>
            </div>
            <div className="text-sm text-muted-foreground" data-testid="text-report-id">
              Report ID: {report.id}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Department</label>
              <p className="text-sm" data-testid="text-department">{report.department || 'Not specified'}</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Location</label>
              <p className="text-sm" data-testid="text-location">{report.location || 'Not specified'}</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Reported By</label>
              <p className="text-sm" data-testid="text-reported-by">{report.reportedBy || 'Anonymous'}</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Created Date</label>
              <p className="text-sm" data-testid="text-created-date">{formatDate(report.createdAt)}</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Priority</label>
              <p className="text-sm capitalize" data-testid="text-priority-text">{report.priority}</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <p className="text-sm capitalize" data-testid="text-status-text">{report.status}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Description</label>
            <p className="text-sm leading-relaxed" data-testid="text-description">
              {report.description}
            </p>
          </div>

          {report.files && report.files.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <label className="text-sm font-medium text-muted-foreground">
                  Attachments ({report.files.length})
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {report.files.map((file, index) => (
                    <Card key={index} className="hover-elevate">
                      <CardContent className="p-3">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" data-testid={`file-name-${index}`}>
                              {file.name}
                            </p>
                            <p className="text-xs text-muted-foreground" data-testid={`file-size-${index}`}>
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => console.log('Download file:', file.name)}
                            data-testid={`button-download-${index}`}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" data-testid="text-actions-title">Actions</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleJobCard}
                disabled={isProcessing || report.status === 'approved'}
                className="flex-1 sm:flex-none"
                data-testid="button-issue-job-card"
              >
                <Wrench className="h-4 w-4 mr-2" />
                {isProcessing ? "Processing..." : "Issue Job Card"}
              </Button>
              
              <Button
                variant="outline"
                onClick={handlePullRequest}
                disabled={isProcessing || report.status === 'assigned'}
                className="flex-1 sm:flex-none"
                data-testid="button-pull-request"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {isProcessing ? "Processing..." : "Pull Request to Procurement Manager"}
              </Button>
            </div>
            
            {(report.status === 'approved' || report.status === 'assigned') && (
              <div className="text-sm text-muted-foreground mt-2" data-testid="text-action-note">
                {report.status === 'approved' && "Job card has been issued to workshop planner."}
                {report.status === 'assigned' && "Task has been assigned to Procurement Manager."}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}