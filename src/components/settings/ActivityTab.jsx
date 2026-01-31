import React, { useState, useEffect } from "react";
import { Activity, Globe, Smartphone, Monitor } from "lucide-react";
import { Skeleton } from "../index"; 

export default function ActivityTab({ fetchLogs }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs().then(data => { setLogs(data || []); setLoading(false); });
  }, []);

  const getDeviceIcon = (client, device) => {
    const name = (client || device || "").toLowerCase();
    return (name.includes("mobile") || name.includes("android") || name.includes("iphone")) 
      ? <Smartphone size={18} /> : <Monitor size={18} />;
  };

  const formatDate = (dateString) => {
      if (!dateString) return "Unknown";
      try { 
          return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }); 
      } catch { return "Invalid Date"; }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-in fade-in slide-in-from-right-4">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
        <h3 className="font-bold flex items-center gap-2 text-gray-700 dark:text-gray-200"><Activity size={18} /> Recent Login Activity</h3>
      </div>

      {loading ? (
        <div className="p-6 space-y-6">
           {[...Array(8)].map((_, i) => (
             <div key={i} className="flex gap-4 items-center">
                <Skeleton width="36px" height="36px" className="rounded-lg shrink-0" />
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Skeleton width="80%" height="14px" /><Skeleton width="60%" height="14px" /><Skeleton width="90%" height="14px" /><Skeleton width="50%" height="14px" />
                </div>
             </div>
           ))}
        </div>
      ) : logs.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-gray-500 bg-gray-50 dark:bg-gray-800 uppercase text-xs">
              <tr><th className="px-6 py-3">Device</th><th className="px-6 py-3">Location</th><th className="px-6 py-3">IP</th><th className="px-6 py-3">Date</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {logs.map((log, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-6 py-4 font-medium flex items-center gap-2 text-gray-900 dark:text-white">
                      {getDeviceIcon(log.clientName, log.deviceName)} {log.clientName} {log.osName && `(${log.osName})`}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                      <div className="flex items-center gap-1">
                          <Globe size={14} /> 
                          {log.ip === "127.0.0.1" || log.ip.includes("::1") ? "Localhost" : log.countryName}
                      </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-mono text-xs">{log.ip}</td>
                  <td className="px-6 py-4 text-gray-500">{formatDate(log.time)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <div className="p-10 text-center text-gray-500">No logs found.</div>}
    </div>
  );
}