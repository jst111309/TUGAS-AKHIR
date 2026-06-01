'use client';

import { useState, useMemo } from 'react';

// ─── MOCK DATA ───────────────────────────────────────────────
const mockLogs = Array.from({ length: 120 }, (_, i) => ({
  id: `log-${i + 1}`,
  timestamp: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
  hostname: ['router-01', 'firewall-main', 'linux-srv-01', 'win-srv-02', 'linux-srv-03'][Math.floor(Math.random() * 5)],
  source_ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
  rule_id: `100${Math.floor(Math.random() * 900).toString().padStart(3, '0')}`,
  category: ['authentication', 'firewall', 'intrusion', 'malware', 'policy'][Math.floor(Math.random() * 5)],
  severity: (['critical', 'high', 'medium', 'low'] as const)[Math.floor(Math.random() * 4)],
  description: [
    'Failed login attempt detected from external IP',
    'Suspicious outbound connection to unknown host',
    'Malware signature matched in uploaded file',
    'Policy violation: unauthorized access attempt',
    'Brute force attack blocked by firewall rule',
    'Port scanning activity detected from source',
    'Privilege escalation attempt on Linux server',
    'DNS query to known malicious domain blocked',
  ][Math.floor(Math.random() * 8)],
}));

// ─── HELPERS ─────────────────────────────────────────────────
const cn = (...c: (string | boolean | undefined | null)[]) => c.filter(Boolean).join(' ');
const formatDateTime = (ts: string) => new Date(ts).toLocaleString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
const getSeverityColor = (s: string) => ({ critical: 'bg-red-100 text-red-800 border-red-200', high: 'bg-orange-100 text-orange-800 border-orange-200', medium: 'bg-yellow-100 text-yellow-800 border-yellow-200', low: 'bg-green-100 text-green-800 border-green-200' })[s] || 'bg-neutral-100 text-neutral-800';
const getCategoryColor = (c: string) => ({ authentication: 'bg-purple-100 text-purple-700', firewall: 'bg-blue-100 text-blue-700', intrusion: 'bg-red-100 text-red-700', malware: 'bg-pink-100 text-pink-700', policy: 'bg-amber-100 text-amber-700' })[c] || 'bg-neutral-100 text-neutral-700';

export default function LogsPage() {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [hostFilter, setHostFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('24h');
  const [sortField, setSortField] = useState('timestamp');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<typeof mockLogs[0] | null>(null);
  const logsPerPage = 15;

  const filteredLogs = useMemo(() => {
    let result = [...mockLogs];

    // Time filter
    const now = Date.now();
    const timeMap: Record<string, number> = { '1h': 3600000, '6h': 21600000, '24h': 86400000, '7d': 604800000 };
    if (timeFilter && timeMap[timeFilter]) {
      result = result.filter((l) => now - new Date(l.timestamp).getTime() < timeMap[timeFilter]);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((l) => l.hostname.includes(q) || l.source_ip.includes(q) || l.description.toLowerCase().includes(q) || l.rule_id.includes(q));
    }
    if (severityFilter.length) result = result.filter((l) => severityFilter.includes(l.severity));
    if (categoryFilter) result = result.filter((l) => l.category === categoryFilter);
    if (hostFilter) result = result.filter((l) => l.hostname === hostFilter);

    result.sort((a, b) => {
      const aVal = a[sortField as keyof typeof a] ?? '';
      const bVal = b[sortField as keyof typeof b] ?? '';
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [search, severityFilter, categoryFilter, hostFilter, timeFilter, sortField, sortDir]);

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * logsPerPage, currentPage * logsPerPage);
  const hosts = [...new Set(mockLogs.map((l) => l.hostname))];
  const categories = [...new Set(mockLogs.map((l) => l.category))];

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('desc'); }
  };

  const columns = [
    { key: 'timestamp', label: 'Waktu' },
    { key: 'hostname', label: 'Hostname' },
    { key: 'source_ip', label: 'Source IP' },
    { key: 'description', label: 'Deskripsi' },
    { key: 'category', label: 'Kategori' },
    { key: 'severity', label: 'Severity' },
    { key: 'rule_id', label: 'Rule ID' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-neutral-900">Monitoring Data Log</h2>
        <p className="text-sm text-neutral-500 mt-1">Tabel log keamanan dari seluruh host yang dipantau. Data diperbarui secara berkala.</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[240px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Cari keyword, hostname, IP, rule ID..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition" />
          </div>

          {/* Time Filter */}
          <select value={timeFilter} onChange={(e) => { setTimeFilter(e.target.value); setCurrentPage(1); }} className="px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 outline-none">
            <option value="1h">1 Jam Terakhir</option>
            <option value="6h">6 Jam Terakhir</option>
            <option value="24h">24 Jam Terakhir</option>
            <option value="7d">7 Hari Terakhir</option>
          </select>

          {/* Host Filter */}
          <select value={hostFilter} onChange={(e) => { setHostFilter(e.target.value); setCurrentPage(1); }} className="px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 outline-none">
            <option value="">Semua Host</option>
            {hosts.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>

          {/* Category Filter */}
          <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }} className="px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 outline-none">
            <option value="">Semua Kategori</option>
            {categories.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        </div>

        {/* Severity chips */}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs text-neutral-500 font-medium">Severity:</span>
          {['critical', 'high', 'medium', 'low'].map((sev) => (
            <button key={sev} onClick={() => { setSeverityFilter((prev) => prev.includes(sev) ? prev.filter((x) => x !== sev) : [...prev, sev]); setCurrentPage(1); }} className={cn('px-3 py-1 rounded-full text-xs font-medium border transition', severityFilter.includes(sev) ? getSeverityColor(sev) : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100')}>
              {sev.charAt(0).toUpperCase() + sev.slice(1)}
            </button>
          ))}
          {(severityFilter.length > 0 || categoryFilter || hostFilter || search) && (
            <button onClick={() => { setSeverityFilter([]); setCategoryFilter(''); setHostFilter(''); setSearch(''); setCurrentPage(1); }} className="text-xs text-red-500 hover:text-red-700 ml-2 transition">Reset Filter</button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                {columns.map((col) => (
                  <th key={col.key} onClick={() => handleSort(col.key)} className="text-left py-3 px-4 text-xs font-semibold text-neutral-600 uppercase cursor-pointer hover:text-neutral-900 select-none transition whitespace-nowrap">
                    {col.label}
                    {sortField === col.key && <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {paginatedLogs.map((log) => (
                <tr key={log.id} onClick={() => setSelectedLog(log)} className="hover:bg-primary-50/30 transition cursor-pointer">
                  <td className="py-3 px-4 text-xs text-neutral-600 font-mono whitespace-nowrap">{formatDateTime(log.timestamp)}</td>
                  <td className="py-3 px-4 text-sm font-medium text-neutral-900">{log.hostname}</td>
                  <td className="py-3 px-4 text-sm font-mono text-neutral-700">{log.source_ip}</td>
                  <td className="py-3 px-4 text-sm text-neutral-700 max-w-xs truncate" title={log.description}>{log.description}</td>
                  <td className="py-3 px-4"><span className={cn('px-2 py-0.5 rounded text-xs font-medium', getCategoryColor(log.category))}>{log.category}</span></td>
                  <td className="py-3 px-4"><span className={cn('px-2 py-0.5 rounded-full text-xs font-medium border', getSeverityColor(log.severity))}>{log.severity}</span></td>
                  <td className="py-3 px-4 text-xs font-mono text-neutral-600">{log.rule_id}</td>
                </tr>
              ))}
              {paginatedLogs.length === 0 && (
                <tr><td colSpan={7} className="py-12 text-center text-neutral-400 text-sm">Tidak ada log yang sesuai filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-neutral-200 flex items-center justify-between bg-neutral-50">
          <span className="text-sm text-neutral-600">
            Menampilkan {filteredLogs.length === 0 ? 0 : (currentPage - 1) * logsPerPage + 1}–{Math.min(currentPage * logsPerPage, filteredLogs.length)} dari {filteredLogs.length} log
          </span>
          <div className="flex gap-1">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 border border-neutral-300 rounded text-sm hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition">Prev</button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let page = i + 1;
              if (totalPages > 5 && currentPage > 3) page = currentPage - 2 + i;
              if (page > totalPages) return null;
              return (
                <button key={page} onClick={() => setCurrentPage(page)} className={cn('px-3 py-1 rounded text-sm transition', page === currentPage ? 'bg-primary-600 text-white' : 'border border-neutral-300 hover:bg-white')}>
                  {page}
                </button>
              );
            })}
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1 border border-neutral-300 rounded text-sm hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition">Next</button>
          </div>
        </div>
      </div>

      {/* ── DETAIL EVENT MODAL ───────────────────────────────── */}
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
                <span className="block text-sm text-neutral-500 mb-1.5">Full Log</span>
                <pre className="bg-slate-900 text-green-400 rounded-lg p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
{`{
  "timestamp": "${selectedLog.timestamp}",
  "hostname": "${selectedLog.hostname}",
  "source_ip": "${selectedLog.source_ip}",
  "rule_id": "${selectedLog.rule_id}",
  "category": "${selectedLog.category}",
  "severity": "${selectedLog.severity}",
  "description": "${selectedLog.description}",
  "agent": { "id": "00${Math.floor(Math.random() * 9)}", "name": "${selectedLog.hostname}" },
  "decoder": { "name": "syslog" },
  "location": "/var/log/syslog"
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
