'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  MessageSquare,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Flag,
  Shield,
  Zap,
  Clock,
  LayoutGrid,
  List,
  MoreHorizontal,
  ThumbsUp,
  ThumbsDown,
  Ban,
  RefreshCw,
  Trash2,
  CheckSquare
} from 'lucide-react';
import { MagicCard } from '@/components/admin/dashboard/magic-card';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ContentReport {
  _id: string;
  contentType: 'caption' | 'image' | 'comment' | 'profile';
  contentId: string;
  reportedBy: string;
  reportedUser: string;
  reason: string;
  description: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  action?: 'warned' | 'suspended' | 'banned' | 'removed' | 'no_action';
}

export default function ContentModerationPage() {
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedReport, setSelectedReport] = useState<ContentReport | null>(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [currentPage, setCurrentPage] = useState(1);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  // Bulk Selection State
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Fetch Data
  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/moderation/reports');
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || []);
        // Clear selection on refresh
        setSelectedReports([]);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Actions
  const handleAction = async (reportId: string, action: string, status: string = 'resolved') => {
    try {
      const endpoint = status === 'dismissed'
        ? `/api/admin/moderation/reports/${reportId}/dismiss`
        : `/api/admin/moderation/reports/${reportId}/review`;

      const body = status === 'dismissed' ? {} : { action, status };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        setReports(prev => prev.map(r =>
          r._id === reportId ? {
            ...r,
            status: status as any,
            action: action as any,
            reviewedAt: new Date().toISOString()
          } : r
        ));
        setSelectedReport(null);
        // Remove from selection if it was selected
        setSelectedReports(prev => prev.filter(id => id !== reportId));
      }
    } catch (error) {
      console.error('Error processing report:', error);
    }
  };

  // Bulk Actions
  const handleBulkAction = async (action: string, status: string = 'resolved') => {
    if (selectedReports.length === 0) return;

    setBulkActionLoading(true);
    try {
      // Process all selected reports concurrently
      await Promise.all(selectedReports.map(reportId => {
        const endpoint = status === 'dismissed'
          ? `/api/admin/moderation/reports/${reportId}/dismiss`
          : `/api/admin/moderation/reports/${reportId}/review`;

        const body = status === 'dismissed' ? {} : { action, status };

        return fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
      }));

      // Refresh data after bulk action
      await fetchReports();
      setSelectedReports([]);
    } catch (error) {
      console.error('Error processing bulk action:', error);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const toggleSelection = (reportId: string) => {
    setSelectedReports(prev =>
      prev.includes(reportId)
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  // Filtering
  const filteredReports = reports.filter(report => {
    const matchesSearch =
      report.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reportedUser.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab =
      activeTab === 'all' ? true :
        activeTab === 'pending' ? report.status === 'pending' :
          activeTab === 'resolved' ? ['resolved', 'dismissed'].includes(report.status) :
            activeTab === 'critical' ? report.severity === 'critical' : true;

    return matchesSearch && matchesTab;
  });

  const toggleSelectAll = () => {
    if (selectedReports.length === filteredReports.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(filteredReports.map(r => r._id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Moderation Queue
          </h1>
          <p className="text-muted-foreground mt-1">
            Review and manage user-reported content
          </p>
        </div>
        <Button onClick={fetchReports} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MagicCard className="p-6" gradientColor="#D9D9D955">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Reports</p>
              <h3 className="text-2xl font-bold mt-2">{reports.filter(r => r.status === 'pending').length}</h3>
            </div>
            <Clock className="h-5 w-5 text-yellow-500" />
          </div>
        </MagicCard>
        <MagicCard className="p-6" gradientColor="#D9D9D955">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Critical Issues</p>
              <h3 className="text-2xl font-bold mt-2">{reports.filter(r => r.severity === 'critical').length}</h3>
            </div>
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
        </MagicCard>
        <MagicCard className="p-6" gradientColor="#D9D9D955">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Resolved Today</p>
              <h3 className="text-2xl font-bold mt-2">{reports.filter(r => r.status === 'resolved').length}</h3>
            </div>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
        </MagicCard>
        <MagicCard className="p-6" gradientColor="#D9D9D955">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Reports</p>
              <h3 className="text-2xl font-bold mt-2">{reports.length}</h3>
            </div>
            <Flag className="h-5 w-5 text-blue-500" />
          </div>
        </MagicCard>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="critical">Critical</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
            <TabsTrigger value="all">All Reports</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            {/* Bulk Actions */}
            {selectedReports.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleBulkAction('removed')}
                  disabled={bulkActionLoading}
                >
                  {bulkActionLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                  Remove ({selectedReports.length})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('no_action', 'dismissed')}
                  disabled={bulkActionLoading}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Dismiss ({selectedReports.length})
                </Button>
              </div>
            )}

            {/* View Toggle */}
            <div className="border rounded-md p-1 flex bg-muted/20">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          {filteredReports.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground border rounded-lg bg-muted/5 border-dashed">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No reports found matching your criteria.</p>
            </div>
          ) : (
            <>
              <div className={cn(
                "grid gap-4",
                viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
              )}>
                {filteredReports.slice((currentPage - 1) * 6, currentPage * 6).map(report => (
                  <Card key={report._id} className={cn(
                    "transition-all hover:shadow-md border-muted",
                    selectedReports.includes(report._id) && "ring-2 ring-primary border-primary"
                  )}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedReports.includes(report._id)}
                            onCheckedChange={() => toggleSelection(report._id)}
                          />
                          <Badge variant={
                            report.severity === 'critical' ? 'destructive' :
                              report.severity === 'high' ? 'default' :
                                'secondary'
                          }>
                            {report.severity}
                          </Badge>
                          <Badge variant="outline">{report.contentType}</Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <CardTitle className="text-base mt-2 line-clamp-1">
                        {report.reason}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {report.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                        <User className="h-3 w-3" />
                        <span>Reported by: {report.reportedBy}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2 flex justify-between">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedReport(report)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Review
                      </Button>
                      {report.status === 'pending' && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-50"
                            onClick={() => handleAction(report._id, 'no_action', 'dismissed')}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleAction(report._id, 'removed', 'resolved')}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {/* Pagination Controls */}
              {filteredReports.length > 6 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {Math.ceil(filteredReports.length / 6)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredReports.length / 6), p + 1))}
                    disabled={currentPage === Math.ceil(filteredReports.length / 6)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Report</DialogTitle>
            <DialogDescription>
              Review the details of this report and take appropriate action.
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4 my-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">Reason</span>
                  <p className="text-sm font-medium">{selectedReport.reason}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">Severity</span>
                  <Badge variant={selectedReport.severity === 'critical' ? 'destructive' : 'secondary'}>
                    {selectedReport.severity}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">Reported User</span>
                  <p className="text-sm">{selectedReport.reportedUser}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">Date</span>
                  <p className="text-sm">{new Date(selectedReport.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                <span className="text-xs font-medium text-muted-foreground">Description</span>
                <p className="text-sm">{selectedReport.description}</p>
              </div>

              <div className="border rounded-lg p-4">
                <span className="text-xs font-medium text-muted-foreground block mb-2">Content Preview</span>
                <div className="bg-background border rounded p-4 text-center text-muted-foreground">
                  {/* Placeholder for content preview */}
                  {selectedReport.contentType === 'image' ? (
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      <Eye className="h-8 w-8 opacity-50" />
                    </div>
                  ) : (
                    <p className="italic">Content preview not available</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setSelectedReport(null)}>Cancel</Button>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => selectedReport && handleAction(selectedReport._id, 'no_action', 'dismissed')}
              >
                Dismiss
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedReport && handleAction(selectedReport._id, 'removed', 'resolved')}
              >
                Remove Content
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
