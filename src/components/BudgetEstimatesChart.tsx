import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid
} from 'recharts';
import { BarChart3, TrendingUp, Sparkles, Clock, CheckCircle2, BookmarkCheck } from 'lucide-react';
import { SavedEstimate, ServiceCategory } from '../types';

interface ChartItem {
  id: string;
  shortName: string;
  service: ServiceCategory;
  serviceName: string;
  total: number;
  details: string;
  date: string;
  color: string;
}

const SERVICE_COLORS: Record<ServiceCategory, string> = {
  pvc: '#0284c7', // Sky / Royal Blue
  electricidad: '#f59e0b', // Amber / Gold
  plomeria: '#10b981', // Emerald
  combo: '#8b5cf6', // Purple
};

const SERVICE_LABELS: Record<ServiceCategory, string> = {
  pvc: 'Paneles PVC',
  electricidad: 'Electricidad',
  plomeria: 'Plomería',
  combo: 'Combo Remodelación',
};

// Fallback initial benchmark estimates so the user immediately sees the visual value
const INITIAL_DEMO_ESTIMATES: SavedEstimate[] = [
  {
    id: 'EST-101',
    timestamp: 'Hoy, 09:30 AM',
    service: 'pvc',
    totalEstimatedDOP: 28600,
    details: '12 m² Pared PVC Mármol + Perfil LED perimetral',
    clientName: 'Presupuesto Estimado',
  },
  {
    id: 'EST-102',
    timestamp: 'Ayer, 04:15 PM',
    service: 'electricidad',
    totalEstimatedDOP: 11800,
    details: '6 Puntos eléctricos residenciales + Tablero Breakers',
    clientName: 'Presupuesto Estimado',
  },
  {
    id: 'EST-103',
    timestamp: '18 Sep, 11:00 AM',
    service: 'plomeria',
    totalEstimatedDOP: 8300,
    details: 'Instalación de bomba presurizadora y tinaco',
    clientName: 'Presupuesto Estimado',
  },
  {
    id: 'EST-104',
    timestamp: '17 Sep, 02:40 PM',
    service: 'combo',
    totalEstimatedDOP: 30700,
    details: 'Combo 12 m² PVC + 4 Puntos LED + Cinta Indirecta',
    clientName: 'Presupuesto Estimado',
  },
  {
    id: 'EST-105',
    timestamp: '16 Sep, 05:20 PM',
    service: 'pvc',
    totalEstimatedDOP: 34900,
    details: '16 m² Techo PVC Decorativo en relieve madera',
    clientName: 'Presupuesto Estimado',
  },
];

export const BudgetEstimatesChart: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [estimates, setEstimates] = useState<SavedEstimate[]>([]);
  const [isDemoData, setIsDemoData] = useState(false);

  const loadEstimates = () => {
    try {
      const raw = localStorage.getItem('decoelectric-saved-estimates');
      if (raw) {
        const parsed: SavedEstimate[] = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEstimates(parsed);
          setIsDemoData(false);
          return;
        }
      }
    } catch {
      // ignore
    }
    // If empty in localStorage, initialize with demo benchmarks
    setEstimates(INITIAL_DEMO_ESTIMATES);
    setIsDemoData(true);
  };

  useEffect(() => {
    setMounted(true);
    loadEstimates();

    const handleUpdate = () => loadEstimates();
    window.addEventListener('decoelectric-estimates-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('decoelectric-estimates-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Take the last 5 saved estimates
  const chartData = useMemo<ChartItem[]>(() => {
    const list = estimates.slice(0, 5).reverse(); // oldest to newest of the last 5 for pleasant progression
    return list.map((est, idx) => {
      let short = '';
      if (est.service === 'pvc') short = 'PVC';
      else if (est.service === 'electricidad') short = 'Eléctrico';
      else if (est.service === 'plomeria') short = 'Plomería';
      else short = 'Combo';

      return {
        id: est.id,
        shortName: `#${idx + 1} ${short}`,
        service: est.service,
        serviceName: SERVICE_LABELS[est.service] || 'Servicio',
        total: Number(est.totalEstimatedDOP) || 0,
        details: est.details || 'Presupuesto estándar',
        date: est.timestamp,
        color: SERVICE_COLORS[est.service] || '#0284c7',
      };
    });
  }, [estimates]);

  const stats = useMemo(() => {
    if (chartData.length === 0) return { avg: 0, max: 0, count: 0 };
    const totals = chartData.map((d) => d.total);
    const sum = totals.reduce((a, b) => a + b, 0);
    return {
      avg: Math.round(sum / totals.length),
      max: Math.max(...totals),
      count: estimates.length,
    };
  }, [chartData, estimates]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="w-full mt-8 p-6 sm:p-7 rounded-3xl bg-slate-50/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      {/* Header with Title and Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-sky-100 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 mb-1.5 border border-sky-200 dark:border-sky-800">
            <BarChart3 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>Visualización Recharts</span>
          </div>
          <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Últimos 5 Presupuestos Calculados</span>
            {isDemoData && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/40">
                Referenciales
              </span>
            )}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isDemoData
              ? 'Guarda tus cálculos con el botón "Guardar Presupuesto Localmente" para ver tus propios registros en este gráfico.'
              : 'Historial guardado en el almacenamiento local (localStorage) de tu navegador.'}
          </p>
        </div>

        {/* Quick summary stats */}
        <div className="flex items-center gap-4 text-xs">
          <div className="p-2.5 px-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left shadow-2xs">
            <span className="block text-[10px] uppercase font-bold text-slate-400">Promedio</span>
            <span className="text-xs font-black text-slate-900 dark:text-white">
              RD$ {stats.avg.toLocaleString('es-DO')}
            </span>
          </div>
          <div className="p-2.5 px-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left shadow-2xs">
            <span className="block text-[10px] uppercase font-bold text-slate-400">Mayor Monto</span>
            <span className="text-xs font-black text-sky-600 dark:text-sky-400">
              RD$ {stats.max.toLocaleString('es-DO')}
            </span>
          </div>
        </div>
      </div>

      {/* Bar Chart Container */}
      <div className="w-full h-64 sm:h-72 mt-5">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 15, right: 10, left: 10, bottom: 20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#94a3b8"
              strokeOpacity={0.2}
            />
            <XAxis
              dataKey="shortName"
              tickLine={false}
              axisLine={{ stroke: '#94a3b8', strokeOpacity: 0.3 }}
              tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
              dy={6}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              tickFormatter={(v) => `RD$ ${Math.round(v / 1000)}k`}
              dx={-4}
            />
            <Tooltip
              cursor={{ fill: 'rgba(148, 163, 184, 0.12)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as ChartItem;
                  return (
                    <div className="p-3.5 rounded-2xl bg-slate-900/95 text-white shadow-xl border border-slate-700 max-w-xs backdrop-blur-md">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span
                          className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide text-white"
                          style={{ backgroundColor: data.color }}
                        >
                          {data.serviceName}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {data.date}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 font-medium line-clamp-2 mb-2 leading-relaxed">
                        {data.details}
                      </p>
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">Total Estimado:</span>
                        <span className="text-sm font-black text-amber-400">
                          RD$ {data.total.toLocaleString('es-DO')}
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="total"
              radius={[8, 8, 2, 2]}
              animationDuration={800}
            >
              {chartData.map((entry, index) => (
                <Cell key={`bar-cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Interactive Legend and Category Tags */}
      <div className="mt-2 pt-4 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Categorías:
          </span>
          <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7]"></span>
            Paneles PVC
          </span>
          <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></span>
            Electricidad
          </span>
          <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
            Plomería
          </span>
          <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6]"></span>
            Combo
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
          <BookmarkCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Sincronizado con localStorage</span>
        </div>
      </div>
    </div>
  );
};
