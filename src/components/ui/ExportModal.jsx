import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Download,
  FileSpreadsheet,
  FileJson,
  FileText,
  CheckCircle,
  Info,
  Building2,
  Users,
  Calendar,
  Filter
} from 'lucide-react';

/**
 * ExportModal Component
 * Comprehensive export center for agency data
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal visibility
 * @param {function} props.onClose - Close callback
 * @param {Array} props.agencies - All agencies data
 * @param {Array} props.filteredAgencies - Filtered agencies (if any filters active)
 * @param {Object} props.filters - Current filter state { searchQuery, deptFilter, statusFilter }
 */
const ExportModal = ({
  isOpen,
  onClose,
  agencies = [],
  filteredAgencies = null,
  filters = {}
}) => {
  const [format, setFormat] = useState('csv');
  const [scope, setScope] = useState('filtered'); // 'all' | 'filtered' | 'active'
  const [includeFields, setIncludeFields] = useState({
    name: true,
    shortName: true,
    department: true,
    employees: true,
    city: true,
    orgNumber: true,
    formed: true,
    ended: true,
    structure: true,
    historyData: false
  });
  const [exportStatus, setExportStatus] = useState(null); // null | 'exporting' | 'success'

  const hasFilters = filters.searchQuery || filters.deptFilter !== 'all' || filters.statusFilter !== 'active';

  // Get agencies based on scope
  const getExportAgencies = () => {
    switch (scope) {
      case 'all':
        return agencies;
      case 'active':
        return agencies.filter(a => !a.e);
      case 'filtered':
      default:
        return filteredAgencies || agencies;
    }
  };

  const exportAgencies = getExportAgencies();

  // Field definitions
  const fieldGroups = [
    {
      title: 'Grunddata',
      icon: Building2,
      fields: [
        { key: 'name', label: 'Namn', required: true },
        { key: 'shortName', label: 'Kortnamn' },
        { key: 'department', label: 'Departement' },
        { key: 'orgNumber', label: 'Organisationsnummer' }
      ]
    },
    {
      title: 'Personal & Plats',
      icon: Users,
      fields: [
        { key: 'employees', label: 'Antal anställda' },
        { key: 'city', label: 'Ort' },
        { key: 'structure', label: 'Ledningsform' }
      ]
    },
    {
      title: 'Datum',
      icon: Calendar,
      fields: [
        { key: 'formed', label: 'Bildad' },
        { key: 'ended', label: 'Avslutad (om nedlagd)' }
      ]
    },
    {
      title: 'Historik',
      icon: Filter,
      fields: [
        { key: 'historyData', label: 'Historisk personaldata (alla år)', advanced: true }
      ]
    }
  ];

  const toggleField = (key) => {
    if (key === 'name') return; // Name is required
    setIncludeFields(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const generateCSV = (data) => {
    const headers = [];
    if (includeFields.name) headers.push('Namn');
    if (includeFields.shortName) headers.push('Kortnamn');
    if (includeFields.department) headers.push('Departement');
    if (includeFields.employees) headers.push('Anställda');
    if (includeFields.city) headers.push('Ort');
    if (includeFields.orgNumber) headers.push('Organisationsnummer');
    if (includeFields.formed) headers.push('Bildad');
    if (includeFields.ended) headers.push('Avslutad');
    if (includeFields.structure) headers.push('Ledningsform');

    const rows = data.map(a => {
      const row = [];
      if (includeFields.name) row.push(`"${(a.n || a.name || '').replace(/"/g, '""')}"`);
      if (includeFields.shortName) row.push(a.sh || '');
      if (includeFields.department) row.push(`"${(a.d || a.department || '').replace(/"/g, '""')}"`);
      if (includeFields.employees) row.push(a.emp || '');
      if (includeFields.city) row.push(`"${(a.city || '').replace(/"/g, '""')}"`);
      if (includeFields.orgNumber) row.push(a.org || '');
      if (includeFields.formed) row.push(a.s || '');
      if (includeFields.ended) row.push(a.e || '');
      if (includeFields.structure) row.push(a.str || '');
      return row.join(';');
    });

    return '\ufeff' + [headers.join(';'), ...rows].join('\n');
  };

  const generateJSON = (data) => {
    const formatted = data.map(a => {
      const obj = {};
      if (includeFields.name) obj.name = a.n || a.name;
      if (includeFields.shortName) obj.shortName = a.sh;
      if (includeFields.department) obj.department = a.d || a.department;
      if (includeFields.employees) obj.employees = a.emp;
      if (includeFields.city) obj.city = a.city;
      if (includeFields.orgNumber) obj.orgNumber = a.org;
      if (includeFields.formed) obj.formed = a.s;
      if (includeFields.ended) obj.ended = a.e;
      if (includeFields.structure) obj.structure = a.str;
      if (includeFields.historyData && a.empH) obj.employeeHistory = a.empH;
      return obj;
    });
    return JSON.stringify(formatted, null, 2);
  };

  const generateMarkdown = (data) => {
    const headers = [];
    if (includeFields.name) headers.push('Namn');
    if (includeFields.shortName) headers.push('Kort');
    if (includeFields.department) headers.push('Departement');
    if (includeFields.employees) headers.push('Anställda');
    if (includeFields.city) headers.push('Ort');

    const separator = headers.map(() => '---').join(' | ');

    const rows = data.slice(0, 100).map(a => {
      const cols = [];
      if (includeFields.name) cols.push(a.n || a.name || '');
      if (includeFields.shortName) cols.push(a.sh || '');
      if (includeFields.department) cols.push(a.d?.replace('departementet', '').trim() || '');
      if (includeFields.employees) cols.push(a.emp?.toLocaleString('sv-SE') || '–');
      if (includeFields.city) cols.push(a.city || '');
      return cols.join(' | ');
    });

    let md = `# Svenska myndigheter\n\n`;
    md += `> Exporterad ${new Date().toLocaleDateString('sv-SE')}\n`;
    md += `> ${data.length} myndigheter\n\n`;
    md += `| ${headers.join(' | ')} |\n`;
    md += `| ${separator} |\n`;
    md += rows.map(r => `| ${r} |`).join('\n');

    if (data.length > 100) {
      md += `\n\n*Visar de 100 första. Fullständig data finns i CSV/JSON-format.*`;
    }

    return md;
  };

  const handleExport = () => {
    setExportStatus('exporting');

    setTimeout(() => {
      let content, mimeType, extension;

      switch (format) {
        case 'json':
          content = generateJSON(exportAgencies);
          mimeType = 'application/json;charset=utf-8';
          extension = 'json';
          break;
        case 'markdown':
          content = generateMarkdown(exportAgencies);
          mimeType = 'text/markdown;charset=utf-8';
          extension = 'md';
          break;
        case 'csv':
        default:
          content = generateCSV(exportAgencies);
          mimeType = 'text/csv;charset=utf-8';
          extension = 'csv';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `myndigheter-${scope}-${new Date().toISOString().split('T')[0]}.${extension}`;
      link.click();
      URL.revokeObjectURL(url);

      setExportStatus('success');
      setTimeout(() => {
        setExportStatus(null);
      }, 2000);
    }, 500);
  };

  const formatOptions = [
    { id: 'csv', label: 'CSV', icon: FileSpreadsheet, desc: 'Excel-kompatibelt' },
    { id: 'json', label: 'JSON', icon: FileJson, desc: 'För utvecklare' },
    { id: 'markdown', label: 'Markdown', icon: FileText, desc: 'Dokumentation' }
  ];

  const scopeOptions = [
    { id: 'filtered', label: 'Filtrerade', count: filteredAgencies?.length || agencies.length, disabled: !hasFilters },
    { id: 'active', label: 'Aktiva', count: agencies.filter(a => !a.e).length },
    { id: 'all', label: 'Alla', count: agencies.length }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-serif">Exportera data</h2>
              <p className="text-sm text-slate-500 mt-1">Välj format och omfattning</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* Format Selection */}
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-3 block">Format</label>
              <div className="grid grid-cols-3 gap-3">
                {formatOptions.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setFormat(opt.id)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      format === opt.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <opt.icon className={`w-6 h-6 mb-2 ${format === opt.id ? 'text-primary-600' : 'text-slate-400'}`} />
                    <div className={`font-semibold ${format === opt.id ? 'text-primary-700' : 'text-slate-700'}`}>
                      {opt.label}
                    </div>
                    <div className="text-xs text-slate-500">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Scope Selection */}
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-3 block">Omfattning</label>
              <div className="flex gap-2">
                {scopeOptions.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => !opt.disabled && setScope(opt.id)}
                    disabled={opt.disabled}
                    className={`flex-1 px-4 py-3 rounded-lg border transition-all ${
                      opt.disabled
                        ? 'opacity-50 cursor-not-allowed border-slate-200 bg-slate-50'
                        : scope === opt.id
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-medium">{opt.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {opt.count.toLocaleString('sv-SE')} myndigheter
                    </div>
                  </button>
                ))}
              </div>
              {hasFilters && scope === 'filtered' && (
                <div className="mt-2 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                  <Info className="w-4 h-4" />
                  <span>Exporterar med aktiva filter: {filters.searchQuery && `"${filters.searchQuery}"`} {filters.deptFilter !== 'all' && filters.deptFilter?.replace('departementet', '')} {filters.statusFilter !== 'active' && `(${filters.statusFilter})`}</span>
                </div>
              )}
            </div>

            {/* Field Selection */}
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-3 block">Inkludera fält</label>
              <div className="space-y-4">
                {fieldGroups.map(group => (
                  <div key={group.title} className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <group.icon className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-600">{group.title}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {group.fields.map(field => (
                        <button
                          key={field.key}
                          onClick={() => toggleField(field.key)}
                          disabled={field.required}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                            includeFields[field.key]
                              ? field.advanced
                                ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                : 'bg-primary-100 text-primary-700 border border-primary-200'
                              : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
                          } ${field.required ? 'cursor-default' : ''}`}
                        >
                          {field.label}
                          {field.required && <span className="ml-1 text-xs opacity-60">*</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-500">
                <span className="font-mono">{exportAgencies.length.toLocaleString('sv-SE')}</span> myndigheter i {format.toUpperCase()}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                >
                  Avbryt
                </button>
                <button
                  onClick={handleExport}
                  disabled={exportStatus === 'exporting'}
                  className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
                    exportStatus === 'success'
                      ? 'bg-green-500 text-white'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {exportStatus === 'exporting' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Exporterar...
                    </>
                  ) : exportStatus === 'success' ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Klart!
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Exportera
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ExportModal;
