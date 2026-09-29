import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Zap,
  Layers,
  Wrench,
  Sparkles,
  CheckCircle2,
  BookmarkCheck,
  RotateCcw,
  Sliders,
  DollarSign,
  TrendingUp,
  Info
} from 'lucide-react';
import { CalculatorState, ServiceCategory, SavedEstimate } from '../types';

interface BudgetCalculatorProps {
  initialCategory?: ServiceCategory;
  onBudgetCalculated?: (total: number, summary: string) => void;
  onConsultAI?: (summary: string) => void;
}

export const BudgetCalculator: React.FC<BudgetCalculatorProps> = ({
  initialCategory = 'pvc',
  onBudgetCalculated,
  onConsultAI,
}) => {
  const [calcState, setCalcState] = useState<CalculatorState>({
    service: initialCategory,
    pvcArea: 12, // 12 m2 default
    pvcType: 'marmol',
    includeLedProfile: true,
    isCeiling: false,
    electricalPoints: 6,
    breakerPanelUpgrade: false,
    includeLamps: true,
    urgencyLevel: 'standard',
    plumbingType: 'bomba_tinaco',
    plumbingUnits: 1,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Pricing constants (in Dominican Pesos RD$)
  const calculation = useMemo(() => {
    let baseManoDeObra = 0;
    let baseMateriales = 0;
    let serviceLabel = '';
    let detailsSummary = '';

    if (calcState.service === 'pvc') {
      serviceLabel = 'Instalación de Paneles PVC Decorativos';
      // Base price per m2 according to finish
      const ratePerM2 =
        calcState.pvcType === 'marmol' ? 1450 :
        calcState.pvcType === 'madera' ? 1350 :
        calcState.pvcType === 'textura3d' ? 1550 : 1200;

      baseMateriales = calcState.pvcArea * ratePerM2;
      baseManoDeObra = calcState.pvcArea * 650;

      if (calcState.includeLedProfile) {
        baseMateriales += 3200;
        baseManoDeObra += 1500;
      }
      if (calcState.isCeiling) {
        // High ceiling scaffold factor
        baseManoDeObra *= 1.25;
      }
      detailsSummary = `${calcState.pvcArea} m² panel ${calcState.pvcType}${calcState.includeLedProfile ? ' + Perfil LED' : ''}${calcState.isCeiling ? ' (Techo)' : ' (Pared)'}`;

    } else if (calcState.service === 'electricidad') {
      serviceLabel = 'Servicio de Electricidad Residencial';
      const costPerPoint = 750; // labor per point
      baseManoDeObra = calcState.electricalPoints * costPerPoint;
      baseMateriales = calcState.electricalPoints * 450; // wires, boxes, switches

      if (calcState.breakerPanelUpgrade) {
        baseManoDeObra += 4500;
        baseMateriales += 6500; // breaker box + breakers
      }

      if (calcState.includeLamps) {
        baseManoDeObra += 1800;
        baseMateriales += 2800;
      }

      if (calcState.urgencyLevel === 'prioritario') {
        baseManoDeObra *= 1.2;
      }
      detailsSummary = `${calcState.electricalPoints} Puntos eléctricos${calcState.breakerPanelUpgrade ? ' + Tablero Breakers' : ''}${calcState.includeLamps ? ' + Luminarias LED' : ''}`;

    } else if (calcState.service === 'plomeria') {
      serviceLabel = 'Plomería';
      if (calcState.plumbingType === 'bomba_tinaco') {
        baseManoDeObra = 4500;
        baseMateriales = 3800 * calcState.plumbingUnits;
        detailsSummary = `Instalación/Revisión de Tinaco o Presurizador (${calcState.plumbingUnits} ud.)`;
      } else if (calcState.plumbingType === 'griferia_sanitarios') {
        baseManoDeObra = 1800 * calcState.plumbingUnits;
        baseMateriales = 1200 * calcState.plumbingUnits;
        detailsSummary = `Instalación de Grifería/Sanitarios (${calcState.plumbingUnits} unidades)`;
      } else if (calcState.plumbingType === 'fuga_tuberia') {
        baseManoDeObra = 3200;
        baseMateriales = 1500;
        detailsSummary = 'Detección y Corrección de Fuga en Tubería';
      } else {
        baseManoDeObra = 2800;
        baseMateriales = 900;
        detailsSummary = 'Mantenimiento Preventivo General del Hogar';
      }
    } else {
      // Combo Remodelación (Pared PVC 12m2 + Iluminación LED eléctrica)
      serviceLabel = 'Combo Remodelación Sala / Dormitorio';
      baseMateriales = 12 * 1450 + 4000;
      baseManoDeObra = 12 * 650 + 3500;
      detailsSummary = 'Combo 12 m² Pared PVC Mármol + 4 Puntos LED + Cinta Indirecta';
    }

    const totalDOP = Math.round(baseManoDeObra + baseMateriales);
    const approxUSD = Math.round(totalDOP / 60);

    return {
      serviceLabel,
      detailsSummary,
      baseManoDeObra: Math.round(baseManoDeObra),
      baseMateriales: Math.round(baseMateriales),
      totalDOP,
      approxUSD,
    };
  }, [calcState]);

  // Inform parent when budget changes
  React.useEffect(() => {
    if (onBudgetCalculated) {
      onBudgetCalculated(calculation.totalDOP, `${calculation.serviceLabel}: ${calculation.detailsSummary}`);
    }
  }, [calculation, onBudgetCalculated]);

  const handleSaveEstimate = () => {
    const savedList: SavedEstimate[] = JSON.parse(localStorage.getItem('decoelectric-saved-estimates') || '[]');
    const newEstimate: SavedEstimate = {
      id: 'EST-' + Date.now().toString().slice(-5),
      timestamp: new Date().toLocaleDateString('es-DO', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      service: calcState.service,
      totalEstimatedDOP: calculation.totalDOP,
      details: calculation.detailsSummary,
      clientName: 'Presupuesto Calculado',
    };
    savedList.unshift(newEstimate);
    localStorage.setItem('decoelectric-saved-estimates', JSON.stringify(savedList.slice(0, 10)));
    window.dispatchEvent(new Event('decoelectric-estimates-updated'));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = () => {
    setCalcState({
      service: 'pvc',
      pvcArea: 12,
      pvcType: 'marmol',
      includeLedProfile: true,
      isCeiling: false,
      electricalPoints: 6,
      breakerPanelUpgrade: false,
      includeLamps: true,
      urgencyLevel: 'standard',
      plumbingType: 'bomba_tinaco',
      plumbingUnits: 1,
    });
  };

  return (
    <div className="w-full rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600 p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-white/20 backdrop-blur-sm mb-1.5">
            <Calculator className="w-3.5 h-3.5" />
            <span>Estimador Interactivo en Vivo</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight">
            Calcula tu Presupuesto Estimado
          </h3>
          <p className="text-xs sm:text-sm text-sky-100 mt-0.5">
            Selecciona el servicio y ajusta los metros o puntos para obtener un costo orientativo instantáneo.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white/15 hover:bg-white/25 text-white transition-all backdrop-blur-sm"
          title="Reiniciar valores"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restablecer</span>
        </button>
      </div>

      <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Parameters and Selectors */}
        <div className="lg:col-span-7 space-y-6">
          {/* Service Selector Tabs */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
              1. Selecciona el Tipo de Servicio
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setCalcState((s) => ({ ...s, service: 'pvc' }))}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                  calcState.service === 'pvc'
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 font-bold shadow-sm ring-2 ring-sky-400/20'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Layers className="w-5 h-5 mb-1.5 text-sky-500" />
                <span className="text-xs">Paneles PVC</span>
              </button>

              <button
                type="button"
                onClick={() => setCalcState((s) => ({ ...s, service: 'electricidad' }))}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                  calcState.service === 'electricidad'
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-bold shadow-sm ring-2 ring-amber-400/20'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Zap className="w-5 h-5 mb-1.5 text-amber-500" />
                <span className="text-xs">Electricidad</span>
              </button>

              <button
                type="button"
                onClick={() => setCalcState((s) => ({ ...s, service: 'plomeria' }))}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                  calcState.service === 'plomeria'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold shadow-sm ring-2 ring-emerald-400/20'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Wrench className="w-5 h-5 mb-1.5 text-emerald-500" />
                <span className="text-xs">Plomería</span>
              </button>

              <button
                type="button"
                onClick={() => setCalcState((s) => ({ ...s, service: 'combo' }))}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                  calcState.service === 'combo'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-bold shadow-sm ring-2 ring-purple-400/20'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Sparkles className="w-5 h-5 mb-1.5 text-purple-500" />
                <span className="text-xs">Combo Dúo</span>
              </button>
            </div>
          </div>

          {/* DYNAMIC OPTIONS ACCORDING TO SERVICE */}

          {/* 1. PVC Options */}
          {calcState.service === 'pvc' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Slider for square meters */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Área estimada de pared o techo:
                  </label>
                  <span className="text-sm font-black text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2.5 py-0.5 rounded-lg border border-sky-200 dark:border-sky-800">
                    {calcState.pvcArea} m²
                  </span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="60"
                  step="1"
                  value={calcState.pvcArea}
                  onChange={(e) =>
                    setCalcState((s) => ({ ...s, pvcArea: parseInt(e.target.value, 10) }))
                  }
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>4 m² (Pared pequeña)</span>
                  <span>15 m² (Sala estándar)</span>
                  <span>60 m² (Espacio amplio)</span>
                </div>
              </div>

              {/* Finish Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Acabado del Panel PVC:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'marmol', label: 'Mármol Calacatta', sub: 'Brillante de lujo' },
                    { id: 'madera', label: 'Madera Nogal / Roble', sub: 'Calidez natural' },
                    { id: 'textura3d', label: '3D Texturizado', sub: 'Geométrico moderno' },
                    { id: 'blanco_minimalista', label: 'Blanco Mate', sub: 'Económico y limpio' },
                  ].map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() =>
                        setCalcState((s) => ({ ...s, pvcType: type.id as any }))
                      }
                      className={`p-3 rounded-xl border text-left transition-all ${
                        calcState.pvcType === type.id
                          ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 text-slate-900 dark:text-white font-bold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="block text-xs font-bold">{type.label}</span>
                      <span className="block text-[10px] text-slate-500 dark:text-slate-400">{type.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Extras checkboxes */}
              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={calcState.includeLedProfile}
                    onChange={(e) =>
                      setCalcState((s) => ({ ...s, includeLedProfile: e.target.checked }))
                    }
                    className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
                  />
                  <div>
                    <span className="block text-xs font-bold text-slate-900 dark:text-white">
                      Agregar perfilería oculta con cinta LED cálida (+RD$ 4,700)
                    </span>
                    <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                      Crea un efecto flotante espectacular en el contorno del panel
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={calcState.isCeiling}
                    onChange={(e) =>
                      setCalcState((s) => ({ ...s, isCeiling: e.target.checked }))
                    }
                    className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
                  />
                  <div>
                    <span className="block text-xs font-bold text-slate-900 dark:text-white">
                      Instalación en Techo Suspendido (Estructura de soporte)
                    </span>
                    <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                      Incluye perfilería galvanizada liviana para techos altos o exteriores
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* 2. Electricity Options */}
          {calcState.service === 'electricidad' && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Cantidad de puntos eléctricos (tomas, interruptores o luminarias):
                  </label>
                  <span className="text-sm font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800">
                    {calcState.electricalPoints} Puntos
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="30"
                  step="1"
                  value={calcState.electricalPoints}
                  onChange={(e) =>
                    setCalcState((s) => ({ ...s, electricalPoints: parseInt(e.target.value, 10) }))
                  }
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>2 puntos (Ajuste rápido)</span>
                  <span>10 puntos (Habitación completa)</span>
                  <span>30 puntos (Casa entera)</span>
                </div>
              </div>

              {/* Extra checkboxes */}
              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={calcState.breakerPanelUpgrade}
                    onChange={(e) =>
                      setCalcState((s) => ({ ...s, breakerPanelUpgrade: e.target.checked }))
                    }
                    className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
                  />
                  <div>
                    <span className="block text-xs font-bold text-slate-900 dark:text-white">
                      Modernización de Tablero de Breakers / Caja Principal (+RD$ 11,000)
                    </span>
                    <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                      Incluye nuevo centro de carga, breakers certificados y rotulado de circuitos
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={calcState.includeLamps}
                    onChange={(e) =>
                      setCalcState((s) => ({ ...s, includeLamps: e.target.checked }))
                    }
                    className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
                  />
                  <div>
                    <span className="block text-xs font-bold text-slate-900 dark:text-white">
                      Suministro de Lámparas / Ojos de Buey LED ultra delgados (+RD$ 4,600)
                    </span>
                    <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                      Luz cálida o neutra de bajo consumo y alta durabilidad
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* 3. Plumbing Options */}
          {calcState.service === 'plomeria' && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Tipo de Requerimiento de Plomería:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'bomba_tinaco', label: 'Tinaco / Presurizador', sub: 'Presión y almacenamiento residencial' },
                    { id: 'griferia_sanitarios', label: 'Grifería y Sanitarios', sub: 'Inodoros, lavamanos y llaves' },
                    { id: 'fuga_tuberia', label: 'Fugas y Filtraciones', sub: 'Detección y reparación de tubos' },
                    { id: 'mantenimiento_preventivo', label: 'Mantenimiento General', sub: 'Revisión y desatascos' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() =>
                        setCalcState((s) => ({ ...s, plumbingType: p.id as any }))
                      }
                      className={`p-3 rounded-xl border text-left transition-all ${
                        calcState.plumbingType === p.id
                          ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-slate-900 dark:text-white font-bold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="block text-xs font-bold">{p.label}</span>
                      <span className="block text-[10px] text-slate-500 dark:text-slate-400">{p.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Cantidad de equipos / áreas a intervenir:
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setCalcState((s) => ({ ...s, plumbingUnits: Math.max(1, s.plumbingUnits - 1) }))
                    }
                    className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200"
                  >
                    -
                  </button>
                  <span className="text-base font-bold text-slate-900 dark:text-white min-w-[30px] text-center">
                    {calcState.plumbingUnits}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setCalcState((s) => ({ ...s, plumbingUnits: s.plumbingUnits + 1 }))
                    }
                    className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4. Combo Options */}
          {calcState.service === 'combo' && (
            <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200 space-y-2">
              <span className="font-bold flex items-center gap-1.5 text-purple-800 dark:text-purple-300">
                <Sparkles className="w-4 h-4" /> Paquete Integral de Remodelación:
              </span>
              <p>
                Diseñado para renovar la pared principal de tu sala o habitación (hasta 12 m² de paneles PVC tipo mármol de lujo), incorporando 4 ojos de buey empotrados, canalización eléctrica oculta y cinta LED perimetral.
              </p>
              <span className="inline-block font-semibold text-[11px] bg-purple-100 dark:bg-purple-900/60 px-2 py-0.5 rounded-md">
                Ahorro del 15% al contratar paquete combinado
              </span>
            </div>
          )}
        </div>

        {/* Right Side: Estimated Total & Cost Breakdown */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Presupuesto Estimado
              </span>
              <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-950 px-2 py-0.5 rounded">
                Santo Domingo Este
              </span>
            </div>

            {/* Total Highlight */}
            <div className="text-center py-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Costo Total Aproximado:
              </span>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                RD$ {calculation.totalDOP.toLocaleString('es-DO')}
              </div>
              <span className="inline-block mt-1 text-xs font-semibold text-slate-400">
                (Aprox. ~${calculation.approxUSD} USD)
              </span>
            </div>

            {/* Breakdown lines */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Mano de obra certificada:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  RD$ {calculation.baseManoDeObra.toLocaleString('es-DO')}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Materiales estimados:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  RD$ {calculation.baseMateriales.toLocaleString('es-DO')}
                </span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                <span>Garantía de calidad:</span>
                <span className="font-bold">Incluida (Sin costo)</span>
              </div>
            </div>

            {/* Disclaimer note */}
            <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200/60 dark:border-sky-800/60 flex items-start gap-2 text-[11px] text-sky-900 dark:text-sky-200">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-sky-600" />
              <span>
                Cálculo referencial sujeto a inspección visual del sitio. No cobramos por la visita técnica en Santo Domingo Este.
              </span>
            </div>
          </div>

          {/* Action buttons on calculator card */}
          <div className="mt-4 space-y-2">
            <button
              type="button"
              onClick={handleSaveEstimate}
              className="w-full py-2.5 px-4 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {savedSuccess ? (
                <>
                  <BookmarkCheck className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    ¡Presupuesto Guardado en tu dispositivo!
                  </span>
                </>
              ) : (
                <>
                  <BookmarkCheck className="w-4 h-4 text-slate-500" />
                  <span>Guardar Presupuesto Localmente</span>
                </>
              )}
            </button>

            {onConsultAI && (
              <button
                type="button"
                onClick={() =>
                  onConsultAI(
                    `Presupuesto calculado: ${calculation.serviceLabel} - Costo aprox: RD$ ${calculation.totalDOP.toLocaleString(
                      'es-DO'
                    )} (${calculation.detailsSummary}). ¿Podrías darme recomendaciones técnicas o mejores alternativas para este espacio en Santo Domingo Este?`
                  )
                }
                className="w-full py-2.5 px-4 text-xs font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/70 hover:bg-sky-100 dark:hover:bg-sky-900/60 border border-sky-200 dark:border-sky-800 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Analizar y Consultar con DecoBot IA</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
