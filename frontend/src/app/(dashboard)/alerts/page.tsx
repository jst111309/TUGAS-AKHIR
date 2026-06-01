'use client';

import { useState, useMemo } from 'react';

// ─── MOCK DATA ───────────────────────────────────────────────
const mockAlerts = Array.from({ length: 60 }, (_, i) => ({
  id: `alert-${i + 1}`,
  timestamp: new Date(Date.now() - Math.random() * 86400000 * 2).toISOString(),
  severity: (['critical', 'high', 'medium', 'low'] as const)[Math.floor(Math.random() * 4)],
  rule_description: [
    'SSH brute force attack detected — multiple failed attempts',
    'SQL injection attempt blocked on web application',
    'Unauthorized privilege escalation on Linux server',
    'Suspicious process execution with elevated privileges',
    'Ransomware behavior pattern detected in file system',
    'DDoS attack signature matched on network traffic',
    'Phishing email with malicious attachment quarantined',
    'Lateral movement detected between internal hosts',
  ][Math.floor(Math.random() * 8)],
  source_host: ['router-01', 'firewall-main', 'linux-srv-01', 'win-srv-02', 'linux-srv-03'][Math.floor(Math.random() * 5)],
  source_ip: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
  event_category: ['authentication', 'intrusion', 'malware', 'policy', 'network'][Math.floor(Math.random() * 5)],
  rule_id: `200${Math.floor(Math.random() * 900).toString().padStart(3, '0')}`,
}));

// ─── HELPERS ─────────────────────────────────────────────────
const cn = (...c: (string | boolean | undefined | null)[]) => c.filter(Boolean).join(' ');
const formatDateTime = (ts: string) => new Date(ts).toLocaleString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });

const getSeverityColor = (s: string) => ({ critical: 'bg-red-100 text-red-800 border-red-200', high: 'bg-orange-100 text-orange-800 border-orange-200', medium: 'bg-yellow-100 text-yellow-800 border-yellow-200', low: 'bg-green-100 text-green-800 border-green-200' })[s] || 'bg-neutral-100 text-neutral-800';
const getSeverityDot = (s: string) => ({ critical: 'bg-red-500', high: 'bg-orange-500', medium: 'bg-yellow-500', low: 'bg-green-500' })[s] || 'bg-neutral-400';

export default function AlertsPage() {
  const [severityFilter, setSeverityFilter] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('timestamp');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAlert, setSelectedAlert] = useState<typeof mockAlerts[0] | null>(null);
  const perPage = 12;

  const filteredAlerts = useMemo(() => {
    let result = [...mockAlerts];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((a) => a.rule_description.toLowerCase().includes(q) || a.source_host.includes(q) || a.source_ip.includes(q));
    }
    if (severityFilter.length) result = result.filter((a) => severityFilter.includes(a.severity));
    result.sort((a, b) => {
      const aVal = a[sortField as keyof typeof a] ?? '';
      const bVal = b[sortField as keyof typeof b] ?? '';
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [search, severityFilter, sortField, sortDir]);

  const totalPages = Math.ceil(filteredAlerts.length / perPage);
  const paginated = filteredAlerts.slice((currentPage - 1) * perPage, currentPage * perPage);

  const severityCounts = { critical: mockAlerts.filter((a) => a.severity === 'critical').length, high: mockAlerts.filter((a) => a.severity === 'high').length, medium: mockAlerts.filter((a) => a.severity === 'medium').length, low: mockAlerts.filter((a) => a.severity === 'low').length };

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('desc'); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-neutral-900">Monitoring Alert Keamanan</h2>
        <p className="text-sm text-neutral-500 mt-1">Daftar alert keamanan yang terdeteksi oleh Wazuh Manager dari seluruh host.</p>
      </div>

      {/* Severity Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {([
          { key: 'critical', label: 'Critical', color: 'border-red-300 bg-red-50', textColor: 'text-red-700', dot: 'bg-red-500' },
          { key: 'high', label: 'High', color: 'border-orange-300 bg-orange-50', textColor: 'text-orange-700', dot: 'bg-orange-500' },
          { key: 'medium', label: 'Medium', color: 'border-yellow-300 bg-yellow-50', textColor: 'text-yellow-700', dot: 'bg-yellow-500' },
          { key: 'low', label: 'Low', color: 'border-green-300 bg-green-50', textColor: 'text-green-700', dot: 'bg-green-500' },
        ] as const).map((sev) => (
          <button
            key={sev.key}
            onClick={() => { setSeverityFilter((prev) => prev.includes(sev.key) ? prev.filter((x) => x !== sev.key) : [...prev, sev.key]); setCurrentPage(1); }}
            className={cn('rounded-xl border-2 p-4 text-left transition hover:shadow-md', severityFilter.includes(sev.key) ? sev.color : 'border-neutral-200 bg-white hover:border-neutral-300')}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={cn('w-2.5 h-2.5 rounded-full', sev.dot)} />
              <span className="text-sm font-medium text-neutral-600">{sev.label}</span>
            </div>
            <p className={cn('text-2xl font-bold', severityFilter.includes(sev.key) ? sev.textColor : 'text-neutral-900')}>{severityCounts[sev.key]}</p>
          </button>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Cari deskripsi alert, host, IP..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition" />
          </div>
          {(severityFilter.length > 0 || search) && (
            <button onClick={() => { setSeverityFilter([]); setSearch(''); setCurrentPage(1); }} className="text-xs text-red-500 hover:text-red-700 transition">Reset Filter</button>
          )}
        </div>
      </div>

      {/* Alert Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                {[{ key: 'severity', label: 'Severity' }, { key: 'rule_description', label: 'Deskripsi Rule' }, { key: 'source_host', label: 'Source Host' }, { key: 'source_ip', label: 'Source IP' }, { key: 'event_category', label: 'Kategori' }, { key: 'timestamp', label: 'Waktu' }].map((col) => (
                  <th key={col.key} onClick={() => handleSort(col.key)} className="text-left py-3 px-4 text-xs font-semibold text-neutral-600 uppercase cursor-pointer hover:text-neutral-900 select-none transition whitespace-nowrap">
                    {col.label}
                    {sortField === col.key && <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {paginated.map((alert) => (
                <tr key={alert.id} onClick={() => setSelectedAlert(alert)} className="hover:bg-primary-50/30 transition cursor-pointer">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className={cn('w-2 h-2 rounded-full', getSeverityDot(alert.severity))} />
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium border', getSeverityColor(alert.severity))}>{alert.severity}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-neutral-800 max-w-sm truncate" title={alert.rule_description}>{alert.rule_description}</td>
                  <td className="py-3 px-4 text-sm font-medium text-neutral-900">{alert.source_host}</td>
                  <td className="py-3 px-4 text-sm font-mono text-neutral-700">{alert.source_ip}</td>
                  <td className="py-3 px-4 text-sm text-neutral-600 capitalize">{alert.event_category}</td>
                  <td className="py-3 px-4 text-xs font-mono text-neutral-500 whitespace-nowrap">{formatDateTime(alert.timestamp)}</td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan={6} className="py-12 text-center text-neutral-400 text-sm">Tidak ada alert yang sesuai filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-neutral-200 flex items-center justify-between bg-neutral-50">
          <span className="text-sm text-neutral-600">
            {filteredAlerts.length === 0 ? '0 alert' : `${(currentPage - 1) * perPage + 1}–${Math.min(currentPage * perPage, filteredAlerts.length)} dari ${filteredAlerts.length} alert`}
          </span>
          <div className="flex gap-1">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 border border-neutral-300 rounded text-sm hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition">Prev</button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let page = i + 1;
              if (totalPages > 5 && currentPage > 3) page = currentPage - 2 + i;
              if (page > totalPages) return null;
              return <button key={page} onClick={() => setCurrentPage(page)} className={cn('px-3 py-1 rounded text-sm transition', page === currentPage ? 'bg-primary-600 text-white' : 'border border-neutral-300 hover:bg-white')}>{page}</button>;
            })}
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1 border border-neutral-300 rounded text-sm hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition">Next</button>
          </div>
        </div>
      </div>

      {/* ── ALERT DETAIL MODAL ──────────────────────────────── */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedAlert(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-neutral-200 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50">
              <div className="flex items-center gap-3">
                <span className={cn('w-3 h-3 rounded-full', getSeverityDot(selectedAlert.severity))} />
                <h3 className="font-semibold text-neutral-900">Detail Alert</h3>
              </div>
              <button onClick={() => setSelectedAlert(null)} className="p-1 rounded-lg hover:bg-neutral-200 transition">
                <svg className="w-5 h-5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="flex items-start">
                <span className="w-28 text-sm text-neutral-500 shrink-0">Severity</span>
                <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium border', getSeverityColor(selectedAlert.severity))}>{selectedAlert.severity}</span>
              </div>
              {[
                { label: 'Rule ID', value: selectedAlert.rule_id, mono: true },
                { label: 'Source Host', value: selectedAlert.source_host },
                { label: 'Source IP', value: selectedAlert.source_ip, mono: true },
                { label: 'Kategori', value: selectedAlert.event_category },
                { label: 'Waktu', value: new Date(selectedAlert.timestamp).toLocaleString('id-ID'), mono: true },
              ].map((item) => (
                <div key={item.label} className="flex items-start">
                  <span className="w-28 text-sm text-neutral-500 shrink-0">{item.label}</span>
                  <span className={cn('text-sm text-neutral-900 font-medium', item.mono && 'font-mono')}>{item.value}</span>
                </div>
              ))}
              <div>
                <span className="block text-sm text-neutral-500 mb-1.5">Deskripsi Rule</span>
                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-sm text-neutral-800">{selectedAlert.rule_description}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
