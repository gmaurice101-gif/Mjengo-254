export const formatCurrency = (val: number): string => {
  return 'KSh ' + val.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export const getSiteStatusColor = (status: string): string => {
  switch (status) {
    case 'Active':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Planning':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Paused':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'Completed':
      return 'bg-sky-50 text-sky-700 border-sky-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};
