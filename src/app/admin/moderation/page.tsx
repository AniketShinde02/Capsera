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
  Calendar,
  Flag,
  Shield
} from 'lucide-react';

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
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');

  // Fetch real data from database
  useEffect(() => {
    const fetchContentReports = async () => {
      try {
        setLoading(true);
        
        // Real API call to get content reports
        const response = await fetch('/api/admin/moderation/reports');
        
        if (response.ok) {
          const data = await response.json();
          setReports(data.reports || []);
        } else {
          console.error('Failed to fetch content reports:', response.status);
          // NO MORE MOCK DATA - show empty state instead
          setReports([]);
        }
      } catch (error) {
        console.error('Error fetching content reports:', error);
        // NO MORE MOCK DATA - show empty state instead
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchContentReports();
  }, []);

  // REMOVED: getMockContentReports function - no more mock data!

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reportedUser.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    const matchesSeverity = filterSeverity === 'all' || report.severity === filterSeverity;
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'reviewed': return <Badge variant="outline">Reviewed</Badge>;
      case 'resolved': return <Badge variant="default" className="bg-green-100 text-green-800">Resolved</Badge>;
      case 'dismissed': return <Badge variant="outline">Dismissed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'low': return <Badge variant="default" className="bg-green-100 text-green-800">Low</Badge>;
      case 'medium': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'high': return <Badge variant="destructive" className="bg-orange-100 text-orange-800">High</Badge>;
      case 'critical': return <Badge variant="destructive">Critical</Badge>;
      default: return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getActionBadge = (action?: string) => {
    if (!action) return null;
    
    switch (action) {
      case 'warned': return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Warned</Badge>;
      case 'suspended': return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Suspended</Badge>;
      case 'banned': return <Badge variant="destructive">Banned</Badge>;
      case 'removed': return <Badge variant="outline" className="bg-red-100 text-red-800">Content Removed</Badge>;
      case 'no_action': return <Badge variant="outline">No Action</Badge>;
      default: return <Badge variant="outline">{action}</Badge>;
    }
  };

  const handleReviewReport = async (reportId: string, action: string) => {
    try {
      const response = await fetch(`/api/admin/moderation/reports/${reportId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, status: 'resolved' })
      });
      
      if (response.ok) {
        // Update local state
        setReports(prev => prev.map(r => 
          r._id === reportId ? { 
            ...r, 
            status: 'resolved' as const, 
            action: action as any,
            reviewedAt: new Date().toISOString(),
            reviewedBy: 'ai.captioncraft@outlook.com'
          } : r
        ));
      } else {
        console.error('Failed to review report');
      }
    } catch (error) {
      console.error('Error reviewing report:', error);
    }
  };

  const handleDismissReport = async (reportId: string) => {
    try {
      const response = await fetch(`/api/admin/moderation/reports/${reportId}/dismiss`, {
        method: 'POST'
      });
      
      if (response.ok) {
        setReports(prev => prev.map(r => 
          r._id === reportId ? { ...r, status: 'dismissed' as const } : r
        ));
      }
    } catch (error) {
      console.error('Error dismissing report:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading content reports...</p>
        </div>
      </div>
    );
  }

  // Show empty state if no reports
  if (reports.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Content Moderation</h1>
            <p className="text-muted-foreground">Review and manage content reports and violations</p>
          </div>
        </div>

        {/* Empty State */}
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Content Reports</h3>
            <p className="text-muted-foreground mb-4">
              There are currently no content reports requiring moderation.
            </p>
            <p className="text-sm text-muted-foreground">
              Reports will appear here when users flag inappropriate content or violations are detected.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalReports = reports.length;
  const pendingReports = reports.filter(r => r.status === 'pending').length;
  const criticalReports = reports.filter(r => r.severity === 'critical').length;
  const resolvedReports = reports.filter(r => r.status === 'resolved').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Moderation</h1>
          <p className="text-muted-foreground">Review and manage content reports and violations</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Flag className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Reports</p>
                <p className="text-2xl font-bold">{totalReports}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold">{pendingReports}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical Issues</p>
                <p className="text-2xl font-bold">{criticalReports}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold">{resolvedReports}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                  placeholder="Search reports by reason, description, or user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              </div>
            </div>

            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>
              
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="all">All Severity</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Content Reports ({filteredReports.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Report</th>
                  <th className="text-left py-3 px-4 font-medium">Content & User</th>
                  <th className="text-left py-3 px-4 font-medium">Reason & Description</th>
                  <th className="text-left py-3 px-4 font-medium">Status & Severity</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                  <th className="text-right py-3 px-4 font-medium">Moderation</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr key={report._id} className="border-b border-border/50">
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <Badge variant="outline" className="text-xs capitalize">
                            {report.contentType}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          ID: {report.contentId}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm font-medium">Reported User</p>
                        </div>
                        <p className="text-sm text-muted-foreground">{report.reportedUser}</p>
                        <div className="flex items-center gap-2">
                          <Flag className="h-3 w-3 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">by {report.reportedBy}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="space-y-1 max-w-xs">
                        <p className="text-sm font-medium">{report.reason}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {report.description}
                        </p>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="space-y-2">
                        {getStatusBadge(report.status)}
                        {getSeverityBadge(report.severity)}
                        {report.action && getActionBadge(report.action)}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {report.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDismissReport(report._id)}
                            className="text-muted-foreground"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {report.status === 'pending' && (
                        <div className="flex flex-col gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                            onClick={() => handleReviewReport(report._id, 'warned')}
                            className="text-xs"
                          >
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Warn
                        </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReviewReport(report._id, 'suspended')}
                            className="text-xs"
                          >
                            <Shield className="h-3 w-3 mr-1" />
                            Suspend
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReviewReport(report._id, 'banned')}
                            className="text-xs"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Ban
                          </Button>
                        </div>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
