import { useEffect, useState } from "react";
import { adminApi } from "@/lib/adminApi";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminActivityPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getActivityLog({ limit: 100 })
      .then(r => setLogs(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-white">Activity Log</h1>
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading...</div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No activity yet</div>
          ) : (
            <div className="divide-y divide-slate-800">
              {logs.map(log => (
                <div key={log.id} className="p-3 flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-white">
                      <span className="text-emerald-400 font-medium">{log.admin_name || "System"}</span>
                      {" "}
                      <span className="text-slate-300">{log.action.replace(/_/g, " ")}</span>
                      {log.entity && <Badge variant="outline" className="ml-2 border-slate-700 text-slate-400 text-xs">{log.entity} #{log.entity_id}</Badge>}
                    </p>
                    {log.details && <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xl">{JSON.stringify(log.details)}</p>}
                  </div>
                  <span className="text-xs text-slate-500 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
