import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { DashboardMetrics } from '@/types';

interface ApprovalPipelineProps {
  pipeline: DashboardMetrics['approvalPipeline'];
  isLoading?: boolean;
}

export function ApprovalPipeline({ pipeline, isLoading }: ApprovalPipelineProps) {
  const stepLabels = {
    application: 'Application Submission',
    verification: 'Document Verification',
    inspection: 'Site Inspection',
    noc: 'NOC Issuance',
    clearance: 'Final Installation Clearance',
  };

  const stepColors = [
    'bg-blue-500',
    'bg-green-500', 
    'bg-yellow-500',
    'bg-purple-500',
    'bg-red-500',
  ];

  if (isLoading) {
    return (
      <Card className="lg:col-span-2 animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2 shadow-sm" data-testid="card-approval-pipeline">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Government Approval Pipeline</CardTitle>
          <Button variant="ghost" size="sm" data-testid="button-view-all-approvals">
            View All
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {pipeline.map((step, index) => (
            <div
              key={step.step}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              data-testid={`approval-step-${step.step}`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 ${stepColors[index]} rounded-full`}></div>
                <span className="text-sm font-medium">
                  {stepLabels[step.step as keyof typeof stepLabels]}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground" data-testid={`text-step-count-${step.step}`}>
                  {step.count} clients
                </span>
                <div className="w-16">
                  <Progress value={step.percentage} className="h-2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
