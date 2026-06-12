import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Shield, DollarSign, ArrowUpRight, 
  Activity, CheckCircle, Download, FileText, Loader2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

interface UWInputs {
  asset_name: string;
  location: string;
  purchase_price: number;
  leasable_area_sqm: number;
  annual_rent_per_sqm: number;
  vacancy_rate: number;
  opex_ratio: number;
  annual_capex: number;
  ltv: number;
  interest_rate: number;
  hold_period_years: number;
  exit_cap_rate: number;
  tenant_concentration: number;
}

const Dashboard: React.FC = () => {
  const [inputs, setInputs] = useState<UWInputs>({
    asset_name: "이천 물류센터 A",
    location: "경기도 이천시",
    purchase_price: 50000000000,
    leasable_area_sqm: 20000,
    annual_rent_per_sqm: 120000,
    vacancy_rate: 0.05,
    opex_ratio: 0.20,
    annual_capex: 200000000,
    ltv: 0.60,
    interest_rate: 0.045,
    hold_period_years: 5,
    exit_cap_rate: 0.055,
    tenant_concentration: 0.30
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs })
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const handleExport = async (type: 'excel' | 'pdf') => {
    const endpoint = type === 'excel' ? '/export/excel' : '/export/pdf';
    try {
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs })
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Analysis_${inputs.asset_name}.${type === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const formatKRW = (v: number) => `${(v / 1e8).toFixed(1)}억원`;
  const formatPct = (v: number) => `${(v * 100).toFixed(1)}%`;

  const handleInputChange = (key: keyof UWInputs, val: any) => {
    setInputs(prev => ({ ...prev, [key]: val }));
  };

  if (!result && loading) return <div className="flex items-center justify-center h-screen bg-slate-950 text-white"><Loader2 className="animate-spin w-10 h-10" /></div>;

  const baseKpi = result?.results?.base?.kpis;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6">
      <header className="mb-8 flex justify-between items-center border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Logistics UW Platform
          </h1>
          <p className="text-slate-400 mt-1">Python Logic + React Interface Integrated Terminal</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => handleExport('excel')} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors text-sm">
            <Download className="w-4 h-4" /> Excel
          </button>
          <button onClick={fetchAnalysis} disabled={loading} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg transition-colors text-sm font-bold">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />} Run Analysis
          </button>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar Inputs */}
        <aside className="col-span-12 lg:col-span-3 space-y-6 bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm h-fit">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" /> Assumptions
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs uppercase text-slate-500 font-bold tracking-wider">Asset Name</label>
              <input type="text" value={inputs.asset_name} onChange={e => handleInputChange('asset_name', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm mt-1 focus:border-blue-500 outline-none" />
            </div>

            <div>
              <label className="text-xs uppercase text-slate-500 font-bold tracking-wider">Purchase Price (KRW)</label>
              <input type="number" value={inputs.purchase_price} onChange={e => handleInputChange('purchase_price', parseFloat(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm mt-1 focus:border-blue-500 outline-none" />
              <div className="text-right text-xs text-blue-400 mt-1">{formatKRW(inputs.purchase_price)}</div>
            </div>

            <div>
              <label className="text-xs uppercase text-slate-500 font-bold tracking-wider">LTV: {formatPct(inputs.ltv)}</label>
              <input type="range" min="0" max="0.8" step="0.01" value={inputs.ltv} 
                onChange={(e) => handleInputChange('ltv', parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
            </div>

            <div>
              <label className="text-xs uppercase text-slate-500 font-bold tracking-wider">Interest Rate: {formatPct(inputs.interest_rate)}</label>
              <input type="range" min="0" max="0.1" step="0.001" value={inputs.interest_rate} 
                onChange={(e) => handleInputChange('interest_rate', parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
            </div>

            <div>
              <label className="text-xs uppercase text-slate-500 font-bold tracking-wider">Exit Cap Rate: {formatPct(inputs.exit_cap_rate)}</label>
              <input type="range" min="0.03" max="0.1" step="0.001" value={inputs.exit_cap_rate} 
                onChange={(e) => handleInputChange('exit_cap_rate', parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
            </div>
          </div>
        </aside>

        {/* Main Dashboard */}
        <main className="col-span-12 lg:col-span-9 space-y-6">
          {baseKpi ? (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                  <div className="flex justify-between text-slate-500 mb-2"><span className="text-sm font-medium">Annual NOI</span><DollarSign className="w-4 h-4" /></div>
                  <div className="text-2xl font-bold">{formatKRW(baseKpi.noi)}</div>
                  <div className="text-xs text-blue-400 mt-1">Net Operating Income</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                  <div className="flex justify-between text-slate-500 mb-2"><span className="text-sm font-medium">DSCR</span><Shield className="w-4 h-4" /></div>
                  <div className={`text-2xl font-bold ${baseKpi.dscr < 1.2 ? 'text-red-400' : 'text-slate-100'}`}>{baseKpi.dscr?.toFixed(2)}x</div>
                  <div className="text-xs text-slate-500 mt-1">Debt Service Coverage</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                  <div className="flex justify-between text-slate-500 mb-2"><span className="text-sm font-medium">Equity IRR</span><TrendingUp className="w-4 h-4" /></div>
                  <div className="text-2xl font-bold text-green-400">{formatPct(baseKpi.equity_irr)}</div>
                  <div className="text-xs text-slate-500 mt-1">Internal Rate of Return</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                  <div className="flex justify-between text-slate-500 mb-2"><span className="text-sm font-medium">Equity Multiple</span><ArrowUpRight className="w-4 h-4" /></div>
                  <div className="text-2xl font-bold">{baseKpi.em}x</div>
                  <div className="text-xs text-slate-500 mt-1">EM (Capital Multiple)</div>
                </div>
              </div>

              {/* Analysis Section */}
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 xl:col-span-8 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                  <h3 className="text-lg font-bold mb-6">Scenario Comparison (IRR %)</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Downside', irr: (result.results.downside?.kpis.equity_irr || 0) * 100 },
                        { name: 'Base Case', irr: baseKpi.equity_irr * 100 },
                        { name: 'Upside', irr: (result.results.upside?.kpis.equity_irr || 0) * 100 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" unit="%" />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                        <Bar dataKey="irr" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                          { [0, 1, 2].map((_, i) => <Cell key={i} fill={i === 1 ? '#6366f1' : i === 0 ? '#ef4444' : '#10b981'} />) }
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="col-span-12 xl:col-span-4 space-y-6">
                  <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-blue-400" /> Investment Memo</h3>
                    <div className="text-sm text-slate-400 leading-relaxed overflow-y-auto max-h-[300px] whitespace-pre-wrap">
                      {result.memo?.summary || "No memo generated."}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[500px] bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">
              <Loader2 className="w-10 h-10 text-slate-700 mb-4 animate-spin" />
              <p className="text-slate-500">Run analysis to see results</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

