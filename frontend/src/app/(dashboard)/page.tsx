'use client';

import { useState, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';

// ─── MOCK DATA ───────────────────────────────────────────────
const mockStats = {
  totalLogs: 15847, totalAlerts: 342, criticalAlerts: 12, activeHosts: 8, status: 'Operational',
  logTimeline: [
    { time: '00:00', logs: 120 }, { time: '04:00', logs: 85 }, { time: '08:00', logs: 340 },
    { time: '12:00', logs: 520 }, { time: '16:00', logs: 410 }, { time: '20:00', logs: 280 },
  ],
  alertByCategory: [
    { category: 'Authentication', count: 145 }, { category: 'Firewall', count: 98 },
    { category: 'Intrusion', count: 54 }, { category: 'Malware', count: 23 }, { category: 'Policy', count: 22 },
  ],
  severityDistribution: [
    { level: 'Critical', count: 12, color: '#dc2626' }, { level: 'High', count: 45, color: '#ea580c' },
    { level: 'Medium', count: 128, color: '#ca8a04' }, { level: 'Low', count: 157, color: '#16a34a' },
  ],
};

const mockAlerts = Array.from({ length: 20 }, (_, i) => ({
  id: `alert-${i + 1}`,
  timestamp: new Date(Date.now() - Math.random() * 43200000).toISOString(),
  severity: (['critical', 'high', 'medium', 'low'] as const)[Math.floor(Math.random() * 4)],
  rule_description: ['SSH brute force attack detected', 'SQL injection attempt blocked', 'Unauthorized privilege escalation', 'Suspicious process execution'][Math.floor(Math.random() * 4)],
  source_host: ['router-01', 'firewall-main', 'linux-srv-01', 'win-srv-02'][Math.floor(Math.random() * 4)],
  source_ip: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
}));

const mockHosts = [
  { name: 'router-01', type: 'Router', status: 'online', lastSeen: '30 detik lalu', logs: 2341 },
  { name: 'firewall-main', type: 'Firewall', status: 'online', lastSeen: '1 menit lalu', logs: 4512 },
  { name: 'linux-srv-01', type: 'Linux Server', status: 'online', lastSeen: '2 menit lalu', logs: 3200 },
  { name: 'win-srv-02', type: 'Windows Server', status: 'warning', lastSeen: '5 menit lalu', logs: 1890 },
  { name: 'linux-srv-03', type: 'Linux Server', status: 'online', lastSeen: '1 menit lalu', logs: 2104 },
];

const mockRecentLogs = Array.from({ length: 8 }, (_, i) => ({
  id: `log-${i + 1}`,
  timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
  hostname: ['router-01', 'firewall-main', 'linux-srv-01', 'win-srv-02'][Math.floor(Math.random() * 4)],
  source_ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
  severity: (['critical', 'high', 'medium', 'low'] as const)[Math.floor(Math.random() * 4)],
  description: ['Failed login attempt detected', 'Suspicious outbound connection', 'Malware signature matched', 'Brute force attack blocked'][Math.floor(Math.random() * 4)],
  category: ['authentication', 'firewall', 'intrusion', 'malware'][Math.floor(Math.random() * 4)],
  rule_id: `100${Math.floor(Math.random() * 90)}`,
}));

// ─── HELPERS ─────────────────────────────────────────────────
const cn = (...c: (string | boolean | undefined | null)[]) => c.filter(Boolean).join(' ');
const formatTime = (ts: string) => new Date(ts).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
const getSeverityColor = (s: string) => ({ critical: 'bg-red-100 text-red-800 border-red-200', high: 'bg-orange-100 text-orange-800 border-orange-200', medium: 'bg-yellow-100 text-yellow-800 border-yellow-200', low: 'bg-green-100 text-green-800 border-green-200' })[s] || 'bg-neutral-100 text-neutral-800';

const statConfigs = [
  { label: 'Total Log', key: 'totalLogs', icon: '📄', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
  { label: 'Total Alert', key: 'totalAlerts', icon: '🔔', bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
  { label: 'Critical', key: 'criticalAlerts', icon: '⚠️', bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100', pulse: true },
  { label: 'Active Hosts', key: 'activeHosts', icon: '🖥️', bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100' },
  { label: 'Status', key: 'status', icon: '✅', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
];

export default function DashboardPage() {
  const [stats] = useState(mockStats);
  const [selectedLog, setSelectedLog] = useState<typeof mockRecentLogs[0] | null>(null);

  return (
    <div className="space-y-6">
      {/* ── STAT CARDS ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        {statConfigs.map((stat, i) => {
          const value = stats[stat.key as keyof typeof stats];
          const display = typeof value === 'number' ? value.toLocaleString() : value;
          return (
            <div key={i} className={cn('bg-white rounded-xl border p-5 hover:shadow-md transition-shadow', stat.border)}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-neutral-900 mt-1">{display}</p>
                </div>
                <div className={cn('p-2.5 rounded-lg text-lg', stat.bg, stat.pulse && 'animate-pulse')}>{stat.icon}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── CHARTS ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <h3 className="font-semibold text-neutral-900 mb-4">Aktivitas Log (24 Jam)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.logTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="logs" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <h3 className="font-semibold text-neutral-900 mb-4">Distribusi Alert</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.alertByCategory} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#64748b" fontSize={12} />
                <YAxis dataKey="category" type="category" stroke="#64748b" fontSize={11} width={100} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── SEVERITY + ALERTS ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <h3 className="font-semibold text-neutral-900 mb-4">Severity Monitoring</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.severityDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="count" nameKey="level">
                  {stats.severityDistribution.map((entry, i) => (<Cell key={`cell-${i}`} fill={entry.color} />))}
                </Pie>
                <Legend verticalAlign="bottom" height={36} iconSize={10} formatter={(value: string) => <span className="text-xs text-neutral-700">{value}</span>} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-900">Alert Terbaru</h3>
            <a href="/alerts" className="text-sm text-primary-600 hover:text-primary-700 font-medium transition">Lihat Semua →</a>
          </div>
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {mockAlerts.slice(0, 6).map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-neutral-50 transition cursor-pointer border border-transparent hover:border-neutral-200">
                <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap', getSeverityColor(alert.severity))}>{alert.severity}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">{alert.rule_description}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{alert.source_host} · <span className="font-mono">{alert.source_ip}</span></p>
                </div>
                <span className="text-xs text-neutral-400 font-mono whitespace-nowrap">{formatTime(alert.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RECENT LOGS ────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-neutral-900">Log Terbaru</h3>
          <a href="/logs" className="text-sm text-primary-600 hover:text-primary-700 font-medium transition">Lihat Semua →</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-600 uppercase">Waktu</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-600 uppercase">Hostname</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-600 uppercase">Source IP</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-600 uppercase">Severity</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-600 uppercase">Kategori</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-600 uppercase">Rule ID</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-600 uppercase">Deskripsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {mockRecentLogs.map((log) => (
                <tr key={log.id} onClick={() => setSelectedLog(log)} className="hover:bg-primary-50/30 transition cursor-pointer">
                  <td className="py-3 px-4 text-xs font-mono text-neutral-600 whitespace-nowrap">{formatTime(log.timestamp)}</td>
                  <td className="py-3 px-4 text-sm font-medium text-neutral-900">{log.hostname}</td>
                  <td className="py-3 px-4 text-sm font-mono text-neutral-700">{log.source_ip}</td>
                  <td className="py-3 px-4"><span className={cn('px-2 py-0.5 rounded-full text-xs font-medium border', getSeverityColor(log.severity))}>{log.severity}</span></td>
                  <td className="py-3 px-4 text-xs text-neutral-600 capitalize">{log.category}</td>
                  <td className="py-3 px-4 text-xs font-mono text-neutral-600">{log.rule_id}</td>
                  <td className="py-3 px-4 text-sm text-neutral-700 max-w-xs truncate">{log.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── HOST STATUS ────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5">
        <h3 className="font-semibold text-neutral-900 mb-4">Monitoring Aktivitas Host</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {mockHosts.map((host, i) => (
            <div key={i} className="p-4 rounded-lg border border-neutral-200 hover:border-primary-300 hover:shadow-sm transition cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-medium text-neutral-500 uppercase bg-neutral-100 px-2 py-0.5 rounded">{host.type}</span>
                <span className={cn('w-2.5 h-2.5 rounded-full', host.status === 'online' ? 'bg-green-500' : host.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500')} />
              </div>
              <p className="font-medium text-neutral-900 text-sm">{host.name}</p>
              <p className="text-xs text-neutral-500 mt-1">{host.lastSeen}</p>
              <p className="text-xs text-neutral-400 mt-0.5">{host.logs.toLocaleString()} logs</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── DETAIL EVENT MODAL ──────────────────────────────── */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedLog(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-neutral-200 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50">
              <h3 className="font-semibold text-neutral-900">Detail Event</h3>
              <button onClick={() => setSelectedLog(null)} className="p-1 rounded-lg hover:bg-neutral-200 transition">
                <svg className="w-5 h-5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {[
                { label: 'Timestamp', value: new Date(selectedLog.timestamp).toLocaleString('id-ID'), mono: true },
                { label: 'Hostname', value: selectedLog.hostname },
                { label: 'Source IP', value: selectedLog.source_ip, mono: true },
                { label: 'Rule ID', value: selectedLog.rule_id, mono: true },
                { label: 'Kategori', value: selectedLog.category },
              ].map((item) => (
                <div key={item.label} className="flex items-start">
                  <span className="w-28 text-sm text-neutral-500 shrink-0">{item.label}</span>
                  <span className={cn('text-sm text-neutral-900 font-medium', item.mono && 'font-mono')}>{item.value}</span>
                </div>
              ))}
              <div className="flex items-start">
                <span className="w-28 text-sm text-neutral-500 shrink-0">Severity</span>
                <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium border', getSeverityColor(selectedLog.severity))}>{selectedLog.severity}</span>
              </div>
              <div>
                <span className="block text-sm text-neutral-500 mb-1.5">Deskripsi Event</span>
                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-sm text-neutral-800">{selectedLog.description}</div>
              </div>
              <div>
                <span className="block text-sm text-neutral-500 mb-1.5">Full Log (JSON)</span>
                <pre className="bg-slate-900 text-green-400 rounded-lg p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
{`{
  "timestamp": "${selectedLog.timestamp}",
  "hostname": "${selectedLog.hostname}",
  "source_ip": "${selectedLog.source_ip}",
  "rule_id": "${selectedLog.rule_id}",
  "category": "${selectedLog.category}",
  "severity": "${selectedLog.severity}",
  "description": "${selectedLog.description}",
  "agent": { "id": "003", "name": "${selectedLog.hostname}" },
  "decoder": { "name": "syslog" },
  "location": "/var/log/syslog"
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center text-xs text-neutral-400 py-4">
        CIC SecureWatch · PT. Cipta Informatika Cemerlang · Fakultas Teknik Elektro, Universitas Telkom
      </footer>
    </div>
  );
}
