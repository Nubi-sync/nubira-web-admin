"use client";

import { api } from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { Shield } from 'lucide-react';

export default function AuditLogsPage() {
  const { data: logs, isLoading, error } = useQuery({
    queryKey: ['auditLogs'],
    queryFn: async () => {
      const res = await api.get('/admin/audit');
      return res.data;
    },
    refetchInterval: 10000, // refresh every 10s
  });

  if (isLoading) return <div className="p-8">Loading audit logs...</div>;
  if (error) return <div className="p-8 text-red-500">Failed to load audit logs</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Traceability & Audit Logs</h2>
        <p className="text-muted-foreground">
          System-wide record of all factory floor transactions and administrative actions.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center space-x-2 pb-2">
          <Shield className="h-5 w-5 text-slate-500" />
          <CardTitle>System Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Performed By</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!logs || logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-500">No logs found.</TableCell>
                </TableRow>
              ) : (
                logs.map((log: any) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-700">
                        {log.action}
                      </span>
                    </TableCell>
                    <TableCell>
                      {log.entityName} {log.entityId ? `(#${log.entityId.substring(0,8)}...)` : ''}
                    </TableCell>
                    <TableCell>
                      {log.performedBy ? log.performedBy.name : 'System'}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      <pre>{JSON.stringify(log.details, null, 2)}</pre>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
