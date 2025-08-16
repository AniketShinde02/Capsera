'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  RotateCcw,
  Download,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Calendar,
  User,
  Mail,
  ArrowLeft,
  Eye,
  FileText,
  Database,
  HardDrive,
  Activity,
  RefreshCw
} from 'lucide-react';

interface DataRecoveryRequest {
  id: string;
  userId: string;
  email: string;
  username?: string;
  requestType: 'profile' | 'captions' | 'images' | 'full_account';
  reason: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requestedAt: string;
  processedAt?: string;
  processedBy?: string;
  adminNotes?: string;
  dataSize: string;
  estimatedTime: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  lastActivity?: string;
  profileImage?: string;
}

// REMOVED: Mock data - will fetch real data from database

export default function DataRecovery() {
  const { data: session } = useSession();
  const router = useRouter();
  const [recoveryRequests, setRecoveryRequests] = useState<DataRecoveryRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<DataRecoveryRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<DataRecoveryRequest | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  // Fetch REAL data from database
  useEffect(() => {
    const fetchRecoveryRequests = async () => {
      try {
        setLoading(true);
        
        // Real API call to get recovery requests from database
        const response = await fetch('/api/admin/moderation/reports');
        
        if (response.ok) {
          const data = await response.json();
          // Transform the data to match our interface
          const transformedRequests = data.reports?.map((report: any) => ({
            id: report._id,
            userId: report.userId || report.user?.id || 'unknown',
            email: report.user?.email || report.email || 'unknown@example.com',
            username: report.user?.username || report.username || 'Unknown User',
            requestType: report.type || 'profile',
            reason: report.reason || 'Data recovery request',
            description: report.description || 'User requested data recovery',
            status: report.status || 'pending',
            requestedAt: report.createdAt || new Date().toISOString(),
            processedAt: report.updatedAt,
            processedBy: report.processedBy || 'admin',
            adminNotes: report.adminNotes || '',
            dataSize: report.dataSize || 'Unknown',
            estimatedTime: report.estimatedTime || '1-2 hours',
            priority: report.priority || 'medium',
            lastActivity: report.updatedAt || report.createdAt || new Date().toISOString()
          })) || [];
          
          setRecoveryRequests(transformedRequests);
          setFilteredRequests(transformedRequests);
        } else {
          console.error('Failed to fetch recovery requests:', response.status);
          // Show empty state instead of mock data
          setRecoveryRequests([]);
          setFilteredRequests([]);
        }
      } catch (error) {
        console.error('Error fetching recovery requests:', error);
        // Show empty state instead of mock data
        setRecoveryRequests([]);
        setFilteredRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecoveryRequests();
  }, []);

  useEffect(() => {
    let filtered = recoveryRequests;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(request =>
        request.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.reason.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(request => request.status === filterStatus);
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(request => request.requestType === filterType);
    }

    // Apply priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(request => request.priority === filterPriority);
    }

    setFilteredRequests(filtered);
  }, [recoveryRequests, searchQuery, filterStatus, filterType, filterPriority]);

  const handleProcessRequest = (requestId: string, status: 'approved' | 'rejected' | 'completed') => {
    const updatedRequests = recoveryRequests.map(request => {
      if (request.id === requestId) {
        return {
          ...request,
          status,
          processedAt: new Date().toISOString(),
          processedBy: session?.user?.email || 'admin',
          adminNotes: adminNotes || undefined
        };
      }
      return request;
    });
    setRecoveryRequests(updatedRequests);
    setIsProcessDialogOpen(false);
    setSelectedRequest(null);
    setAdminNotes('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Low</Badge>;
      case 'medium':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Medium</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">High</Badge>;
      case 'urgent':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Urgent</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'profile':
        return <User className="w-4 h-4" />;
      case 'captions':
        return <FileText className="w-4 h-4" />;
      case 'images':
        return <HardDrive className="w-4 h-4" />;
      case 'full_account':
        return <Database className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'profile':
        return 'Profile Data';
      case 'captions':
        return 'Captions';
      case 'images':
        return 'Images';
      case 'full_account':
        return 'Full Account';
      default:
        return type;
    }
  };

  const getDaysAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Recovery</h1>
          <p className="text-muted-foreground">Manage data recovery requests from users</p>
        </div>
        <Button onClick={() => router.push('/admin/dashboard')} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading recovery requests...</p>
          </div>
        </div>
      )}

      {/* No Data State */}
      {!loading && recoveryRequests.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Recovery Requests</h3>
            <p className="text-muted-foreground mb-4">
              There are currently no data recovery requests in the system.
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Content - Only show when not loading and has data */}
      {!loading && recoveryRequests.length > 0 && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <RotateCcw className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{recoveryRequests.length}</p>
                    <p className="text-sm text-gray-600">Total Requests</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-8 h-8 text-yellow-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {recoveryRequests.filter(r => r.status === 'pending').length}
                    </p>
                    <p className="text-sm text-gray-600">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {recoveryRequests.filter(r => r.status === 'completed').length}
                    </p>
                    <p className="text-sm text-gray-600">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Activity className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {recoveryRequests.filter(r => r.priority === 'urgent').length}
                    </p>
                    <p className="text-sm text-gray-600">Urgent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search recovery requests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="profile">Profile</SelectItem>
                    <SelectItem value="captions">Captions</SelectItem>
                    <SelectItem value="images">Images</SelectItem>
                    <SelectItem value="full_account">Full Account</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Recovery Requests Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recovery Requests ({filteredRequests.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">User</th>
                      <th className="text-left p-3 font-medium">Request Details</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Priority</th>
                      <th className="text-left p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((request) => (
                      <tr key={request.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              {request.profileImage ? (
                                <img src={request.profileImage} alt={request.username || request.email} className="w-10 h-10 rounded-full" />
                              ) : (
                                <span className="text-gray-600 font-medium">
                                  {request.username?.charAt(0).toUpperCase() || request.email.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{request.username || 'No username'}</p>
                              <p className="text-sm text-gray-600">{request.email}</p>
                              <p className="text-xs text-gray-500">
                                <Calendar className="w-3 h-3 inline mr-1" />
                                {getDaysAgo(request.requestedAt)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="p-3">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              {getTypeIcon(request.requestType)}
                              <span className="font-medium">{getTypeLabel(request.requestType)}</span>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">{request.reason}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>Size: {request.dataSize}</span>
                              <span>ETA: {request.estimatedTime}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3">
                          {getStatusBadge(request.status)}
                        </td>

                        <td className="p-3">
                          {getPriorityBadge(request.priority)}
                        </td>

                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedRequest(request);
                                setIsViewDialogOpen(true);
                              }}
                            >
                              <Eye className="w-3 h-3" />
                            </Button>

                            {request.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setIsProcessDialogOpen(true);
                                }}
                              >
                                <RotateCcw className="w-3 h-3" />
                              </Button>
                            )}

                            {request.status === 'approved' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleProcessRequest(request.id, 'completed')}
                              >
                                <CheckCircle className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* View Request Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Recovery Request Details</DialogTitle>
              </DialogHeader>

              {selectedRequest && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium">User:</span>
                      <p className="text-muted-foreground">{selectedRequest.username || 'No username'} ({selectedRequest.email})</p>
                    </div>
                    <div>
                      <span className="font-medium">Type:</span>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(selectedRequest.requestType)}
                        <span className="text-muted-foreground">{getTypeLabel(selectedRequest.requestType)}</span>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Priority:</span>
                      <div className="mt-1">{getPriorityBadge(selectedRequest.priority)}</div>
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>
                      <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Reason:</span>
                      <p className="text-muted-foreground text-sm">{selectedRequest.reason}</p>
                    </div>
                    <div>
                      <span className="font-medium">Description:</span>
                      <p className="text-muted-foreground text-sm">{selectedRequest.description}</p>
                    </div>
                  </div>

                  {selectedRequest.adminNotes && (
                    <div>
                      <span className="font-medium">Admin Notes:</span>
                      <p className="text-muted-foreground text-sm">{selectedRequest.adminNotes}</p>
                    </div>
                  )}
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Process Request Dialog */}
          <Dialog open={isProcessDialogOpen} onOpenChange={setIsProcessDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Process Recovery Request</DialogTitle>
              </DialogHeader>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Admin Notes</label>
                  <Textarea
                    placeholder="Add notes (optional)"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={2}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => selectedRequest && handleProcessRequest(selectedRequest.id, 'approved')}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => selectedRequest && handleProcessRequest(selectedRequest.id, 'rejected')}
                    className="text-red-600 hover:text-red-700"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => selectedRequest && handleProcessRequest(selectedRequest.id, 'completed')}
                    className="text-green-600 hover:text-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Complete
                  </Button>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsProcessDialogOpen(false)}>
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
