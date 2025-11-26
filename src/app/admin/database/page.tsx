'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Database,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  HardDrive,
  Activity,
  Zap,
  Server,
  Cpu,
  Terminal,
  Code,
  Layers
} from 'lucide-react';
import { MagicCard } from '@/components/admin/dashboard/magic-card';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DatabaseStats {
  totalCollections: number;
  totalDocuments: number;
  totalSize: string;
  totalIndexes: number;
  activeConnections: number;
  maxConnections: number;
  connectionUtilization: number;
  avgResponseTime: number;
  uptime: number;
  lastBackup: string;
  backupStatus: 'success' | 'failed' | 'pending';
  collections: DatabaseCollection[];
  performance: {
    avgResponseTime: number;
    uptime: number;
    connectionUtilization: number;
    totalIndexes: number;
  };
}

interface DatabaseCollection {
  name: string;
  documentCount: number;
  size: string;
  indexes: number;
  lastModified: string;
  status: 'healthy' | 'warning' | 'error';
  avgDocumentSize: string;
}

export default function DatabasePage() {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [backupInProgress, setBackupInProgress] = useState(false);
  const [optimizeInProgress, setOptimizeInProgress] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>(['> System initialized...', '> Connecting to cluster...']);

  const addLog = (msg: string) => {
    setTerminalLogs(prev => [...prev.slice(-4), `> ${msg}`]);
  };

  const fetchDatabaseStats = async () => {
    try {
      setLoading(true);
      addLog('Fetching system metrics...');
      const response = await fetch('/api/admin/database/stats');

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        addLog('Metrics updated successfully.');
      } else {
        addLog('Error: Failed to fetch metrics.');
        setStats(null);
      }
    } catch (error) {
      addLog('Critical Error: Connection failed.');
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabaseStats();
    const interval = setInterval(fetchDatabaseStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateBackup = async () => {
    try {
      setBackupInProgress(true);
      addLog('Initiating backup sequence...');
      const response = await fetch('/api/admin/database/backup', { method: 'POST' });
      if (response.ok) {
        addLog('Backup completed successfully.');
        setTimeout(() => fetchDatabaseStats(), 1000);
      } else {
        addLog('Error: Backup failed.');
      }
    } catch (error) {
      addLog('Error: Backup sequence interrupted.');
    } finally {
      setBackupInProgress(false);
    }
  };

  const handleOptimizeDatabase = async () => {
    try {
      setOptimizeInProgress(true);
      addLog('Starting optimization protocols...');
      const response = await fetch('/api/admin/database/optimize', { method: 'POST' });
      if (response.ok) {
        addLog('Optimization complete. Indexes rebuilt.');
        setTimeout(() => fetchDatabaseStats(), 1000);
      } else {
        addLog('Error: Optimization failed.');
      }
    } catch (error) {
      addLog('Error: Optimization interrupted.');
    } finally {
      setOptimizeInProgress(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
        <div className="flex flex-col items-center gap-4 font-mono text-green-500">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
          <p className="animate-pulse">INITIALIZING DATA MATRIX...</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-background text-green-700 dark:text-green-500 font-mono p-4 lg:p-8 selection:bg-green-500/30 selection:text-green-200">

      {/* Header HUD */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-green-500/20 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter flex items-center gap-3 text-green-800 dark:text-green-400">
            <Database className="w-8 h-8 animate-pulse" />
            DATA_MATRIX_V2.0
          </h1>
          <p className="text-green-700/60 dark:text-green-500/60 mt-1 text-sm">System Status: ONLINE | Latency: {stats.avgResponseTime}ms</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleCreateBackup}
            disabled={backupInProgress}
            variant="outline"
            className="bg-background border-green-500/30 text-green-800 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-500/10 hover:text-green-900 dark:hover:text-green-300 hover:border-green-500/50"
          >
            {backupInProgress ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            BACKUP_DATA
          </Button>
          <Button
            onClick={handleOptimizeDatabase}
            disabled={optimizeInProgress}
            className="bg-green-600 hover:bg-green-700 text-black font-bold border-none"
          >
            {optimizeInProgress ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
            OPTIMIZE_SYSTEM
          </Button>
        </div>
      </div>

      {/* System Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-card border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-green-700/60 dark:text-green-500/60 uppercase">Active Connections</p>
                <h3 className="text-3xl font-bold mt-1 text-green-800 dark:text-green-400">{stats.activeConnections}</h3>
              </div>
              <Activity className="w-5 h-5 text-green-500 animate-pulse" />
            </div>
            <Progress value={stats.connectionUtilization} className="h-1 mt-4 bg-green-200 dark:bg-green-900/30" />
          </CardContent>
        </Card>
        <Card className="bg-card border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-green-700/60 dark:text-green-500/60 uppercase">Storage Used</p>
                <h3 className="text-3xl font-bold mt-1 text-green-800 dark:text-green-400">{stats.totalSize}</h3>
              </div>
              <HardDrive className="w-5 h-5 text-green-500" />
            </div>
            <div className="flex gap-1 mt-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className={cn("h-1 flex-1 rounded-full", i < 7 ? "bg-green-500" : "bg-green-200 dark:bg-green-900/30")} />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-green-700/60 dark:text-green-500/60 uppercase">Total Documents</p>
                <h3 className="text-3xl font-bold mt-1 text-green-800 dark:text-green-400">{stats.totalDocuments.toLocaleString()}</h3>
              </div>
              <Layers className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-xs text-green-700/40 dark:text-green-500/40 mt-4">Across {stats.totalCollections} collections</p>
          </CardContent>
        </Card>
        <Card className="bg-card border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-green-700/60 dark:text-green-500/60 uppercase">System Uptime</p>
                <h3 className="text-3xl font-bold mt-1 text-green-800 dark:text-green-400">{stats.uptime}%</h3>
              </div>
              <Server className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-xs text-green-700/40 dark:text-green-500/40 mt-4">Last reboot: 14d ago</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Collections Monitor */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card border border-green-500/20">
            <CardHeader className="border-b border-green-500/20">
              <CardTitle className="text-green-800 dark:text-green-400 flex items-center gap-2">
                <Code className="w-5 h-5" />
                COLLECTION_STATUS
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-green-500/10">
                {stats.collections.map((col) => (
                  <div key={col.name} className="p-4 hover:bg-green-100 dark:hover:bg-green-500/5 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded bg-green-100 dark:bg-green-500/10 text-green-800 dark:text-green-400 group-hover:text-green-900 dark:group-hover:text-green-300 group-hover:shadow-[0_0_10px_rgba(34,197,94,0.2)] transition-all">
                        <Database className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-green-900 dark:text-green-300">{col.name}</p>
                        <p className="text-xs text-green-700/50 dark:text-green-500/50">{col.indexes} Indexes | {col.avgDocumentSize} avg</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-lg font-bold text-green-800 dark:text-green-400">{col.documentCount.toLocaleString()}</p>
                      <div className="flex items-center justify-end gap-2 mt-1">
                        <span className={cn(
                          "w-2 h-2 rounded-full animate-pulse",
                          col.status === 'healthy' ? "bg-green-500" : "bg-red-500"
                        )} />
                        <span className="text-xs text-green-700/50 dark:text-green-500/50 uppercase">{col.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Terminal & Logs */}
        <div className="space-y-6">
          <Card className="bg-card border border-green-500/30 h-full min-h-[400px] flex flex-col">
            <CardHeader className="border-b border-green-500/20 bg-green-100 dark:bg-green-500/5">
              <CardTitle className="text-green-800 dark:text-green-400 flex items-center gap-2 text-sm font-mono">
                <Terminal className="w-4 h-4" />
                SYSTEM_LOGS
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-4 font-mono text-xs space-y-2 overflow-hidden">
              {terminalLogs.map((log, i) => (
                <div key={i} className="text-green-700/80 dark:text-green-500/80 animate-in slide-in-from-left-2 fade-in duration-300">
                  {log}
                </div>
              ))}
              <div className="animate-pulse text-green-500">_</div>
            </CardContent>
          </Card>

          <Card className="bg-green-100 dark:bg-green-900/10 border border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <h4 className="font-bold text-yellow-500">System Notice</h4>
              </div>
              <p className="text-xs text-green-700/70 dark:text-green-500/70">
                Scheduled maintenance required for index optimization on 'users' collection. Performance degradation possible during peak hours.
              </p>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
