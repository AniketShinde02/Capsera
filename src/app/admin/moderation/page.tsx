'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Ban
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

  // Fetch Data
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/moderation/reports');
        if (response.ok) {
          const data = await response.json();
          setReports(data.reports || []);
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setLoading(false);
      }
    };
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
      }
    } catch (error) {
      console.error('Error processing report:', error);
    }
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

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground animate-pulse">Loading moderation queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-2 sm:p-8 min-h-screen bg-background/50 backdrop-blur-3xl animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-600">
            Moderation Command
          </h1>
          <p className="text-muted-foreground mt-1">Review flagged content and enforce community guidelines.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-red-500/20 text-red-400 hover:bg-red-500/10">
            <Shield className="w-4 h-4 mr-2" />
            Safety Settings
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MagicCard
          title="Pending Review"
          value={reports.filter(r => r.status === 'pending').length.toString()}
          icon={Clock}
          trend="neutral"
          trendValue="Queue"
          className="bg-yellow-500/5 border-yellow-500/10"
        />
        <MagicCard
          title="Critical Issues"
          value={reports.filter(r => r.severity === 'critical' && r.status === 'pending').length.toString()}
          icon={AlertTriangle}
          trend="up"
          trendValue="Urgent"
          className="bg-red-500/5 border-red-500/10"
        />
        <MagicCard
          title="Resolved Today"
          value={reports.filter(r => r.status === 'resolved' && new Date(r.reviewedAt || '').toDateString() === new Date().toDateString()).length.toString()}
          icon={CheckCircle}
          trend="up"
          trendValue="Actions"
          className="bg-green-500/5 border-green-500/10"
        />
        <MagicCard
          title="Total Reports"
          value={reports.length.toString()}
          icon={Flag}
          trend="neutral"
          trendValue="All Time"
          className="bg-blue-500/5 border-blue-500/10"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Queue */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
              <TabsList className="bg-background/50 border border-white/10">
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="critical" className="text-red-400 data-[state=active]:text-red-400">Critical</TabsTrigger>
                <TabsTrigger value="resolved">History</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50 border-white/10"
                />
              </div>
              <div className="flex border border-white/10 rounded-lg overflow-hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("rounded-none", viewMode === 'grid' && "bg-white/10")}
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("rounded-none", viewMode === 'list' && "bg-white/10")}
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Reports Grid */}
          <div className={cn(
            "grid gap-4",
            viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
          )}>
            {filteredReports.length === 0 ? (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No reports found matching your criteria.</p>
              </div>
            ) : (
              filteredReports.map((report) => (
                <div
                  key={report._id}
                  onClick={() => setSelectedReport(report)}
                  className={cn(
                    "group relative overflow-hidden rounded-xl border p-5 backdrop-blur-md transition-all duration-300 cursor-pointer hover:-translate-y-1",
                    report.severity === 'critical' ? "border-red-500/30 bg-red-500/5 hover:bg-red-500/10" :
                      report.severity === 'high' ? "border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10" :
                        "border-white/10 bg-white/5 hover:bg-white/10"
                  )}
                >
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant="outline" className={cn(
                      "capitalize border-opacity-50",
                      report.contentType === 'image' ? "text-blue-400 border-blue-400" :
                        report.contentType === 'caption' ? "text-purple-400 border-purple-400" :
                          "text-gray-400 border-gray-400"
                    )}>
                      {report.contentType}
                    </Badge>
                    <Badge className={cn(
                      report.status === 'pending' ? "bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30" :
                        report.status === 'resolved' ? "bg-green-500/20 text-green-500 hover:bg-green-500/30" :
                          "bg-gray-500/20 text-gray-500"
                    )}>
                      {report.status}
                    </Badge>
                  </div>

                  <h3 className="font-semibold text-lg mb-1">{report.reason}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {report.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3" />
                      <span className="text-foreground/80">{report.reportedUser}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-background/90 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-end gap-2">
                    <Button size="sm" variant="secondary" className="h-8 text-xs">
                      Review Details
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Quick Review Panel */}
        <div className="lg:col-span-4">
          <div className="sticky top-6 space-y-6">
            {selectedReport ? (
              <Card className="border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden animate-in slide-in-from-right-10">
                <div className={cn(
                  "h-2 w-full",
                  selectedReport.severity === 'critical' ? "bg-red-500" :
                    selectedReport.severity === 'high' ? "bg-orange-500" : "bg-blue-500"
                )} />
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Report Details</span>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedReport(null)}>
                      <XCircle className="w-5 h-5" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Content Preview Placeholder */}
                  <div className="aspect-video rounded-lg bg-black/50 flex items-center justify-center border border-white/10">
                    {selectedReport.contentType === 'image' ? (
                      <div className="text-center">
                        <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <span className="text-xs text-muted-foreground">Image Preview</span>
                      </div>
                    ) : (
                      <div className="p-4 text-sm italic text-muted-foreground">
                        "{selectedReport.description}"
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground block text-xs uppercase tracking-wider">Reported User</span>
                        <span className="font-medium">{selectedReport.reportedUser}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs uppercase tracking-wider">Reported By</span>
                        <span className="font-medium">{selectedReport.reportedBy}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs uppercase tracking-wider">Reason</span>
                        <span className="font-medium text-red-400">{selectedReport.reason}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs uppercase tracking-wider">Severity</span>
                        <Badge variant="outline" className={cn(
                          "mt-1",
                          selectedReport.severity === 'critical' ? "text-red-500 border-red-500" : "text-blue-500 border-blue-500"
                        )}>
                          {selectedReport.severity}
                        </Badge>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/10 space-y-3">
                      <h4 className="text-sm font-medium">Take Action</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          className="border-green-500/20 hover:bg-green-500/10 hover:text-green-500"
                          onClick={() => handleAction(selectedReport._id, 'no_action', 'dismissed')}
                        >
                          <ThumbsUp className="w-4 h-4 mr-2" />
                          Dismiss
                        </Button>
                        <Button
                          variant="outline"
                          className="border-yellow-500/20 hover:bg-yellow-500/10 hover:text-yellow-500"
                          onClick={() => handleAction(selectedReport._id, 'warned')}
                        >
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Warn
                        </Button>
                        <Button
                          variant="outline"
                          className="border-orange-500/20 hover:bg-orange-500/10 hover:text-orange-500"
                          onClick={() => handleAction(selectedReport._id, 'suspended')}
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          Suspend
                        </Button>
                        <Button
                          variant="destructive"
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20"
                          onClick={() => handleAction(selectedReport._id, 'banned')}
                        >
                          <Ban className="w-4 h-4 mr-2" />
                          Ban User
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-white/10 bg-white/5 backdrop-blur-xl border-dashed">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Eye className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>Select a report to view details and take action.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
