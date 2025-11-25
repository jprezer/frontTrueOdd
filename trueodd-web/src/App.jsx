import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  BrainCircuit, 
  Trophy, 
  ArrowRight,
  RefreshCw,
  Info
} from 'lucide-react';

// URL da sua API hospedada no Render
const API_URL = "https://trueodd.onrender.com/api";

// Componente de Card Simples
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 ${className}`}>
    {children}
  </div>
);

// Componente para exibir uma estatística individual
const StatBox = ({ label, value, subtext, highlight = false, color = "text-gray-900" }) => (
  <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-xl">
    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</span>
    <span className={`text-xl font-bold mt-1 ${color}`}>{value}</span>
    {subtext && <span className="text-xs text-gray-400 mt-1">{subtext}</span>}
  </div>
);

export default function App() {
  const [times, setTimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  
  const [form, setForm] = useState({
    casa: '',
    fora: '',
    odd: ''
  });

  const [resultado, setResultado] = useState(null);

  // 1. Carregar Times ao Iniciar
  useEffect(() => {
    async function fetchTimes() {
      try {
        const response = await fetch(`${API_URL}/partidas`);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const partidas = await response.json();
        
        const nomesUnicos = new Set();
        partidas.forEach(p => {
          nomesUnicos.add(p.timeCasa);
          nomesUnicos.add(p.timeFora);
        });
        
        const listaOrdenada = Array.from(nomesUnicos).sort();
        setTimes(listaOrdenada);
        
        if (listaOrdenada.length > 1) {
          setForm(prev => ({ ...prev, casa: listaOrdenada[0], fora: listaOrdenada[1] }));
        }
      } catch (err) {
        console.error("Erro:", err);
        setError("Não foi possível carregar os times. O servidor no Render pode estar 'dormindo'. Aguarde 1 min.");
      } finally {
        setLoading(false);
      }
    }
    fetchTimes();
  }, []);

  const handleAnalyze = async () => {
    if (!form.odd || form.casa === form.fora) return;
    
    setAnalyzing(true);
    setResultado(null);
    setError(null);

    try {
      await new Promise(r => setTimeout(r, 800));

      const query = new URLSearchParams({
        casa: form.casa,
        fora: form.fora,
        odd: form.odd
      }).toString();

      const response = await fetch(`${API_URL}/partidas/prever?${query}`);
      if (!response.ok) throw new Error('Erro na análise');
      
      const data = await response.json();
      setResultado(data);
    } catch (err) {
      setError("Erro ao analisar a partida. Tente novamente.");
    } finally {
      setAnalyzing(false);
    }
  };

  const getVerdictStyles = (ev) => {
    if (ev > 5) return { 
      bg: "bg-green-50", 
      text: "text-green-700", 
      border: "border-green-200", 
      icon: <TrendingUp className="w-6 h-6 text-green-600" />,
      label: "Aposta de Valor"
    };
    if (ev > 0) return { 
      bg: "bg-yellow-50", 
      text: "text-yellow-700", 
      border: "border-yellow-200", 
      icon: <AlertTriangle className="w-6 h-6 text-yellow-600" />,
      label: "Margem Apertada"
    };
    return { 
      bg: "bg-red-50", 
      text: "text-red-700", 
      border: "border-red-200", 
      icon: <TrendingDown className="w-6 h-6 text-red-600" />,
      label: "Não Apostar"
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-10">
      
      <header className="bg-white px-6 py-6 shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-none">ApostaAI</h1>
              <p className="text-xs text-blue-600 font-medium">Seu Assistente de Aposta com IA</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
             <div className={`h-2 w-2 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`}></div>
             <span className="text-xs text-gray-400">{loading ? 'Conectando...' : 'Online'}</span>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 mt-6 space-y-6">
        
        <Card>
          <div className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 animate-pulse">
                <Info className="w-4 h-4" /> {error}
              </div>
            )}

            <div className="relative">
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block pl-1">Mandante (Casa)</label>
              <select 
                value={form.casa}
                onChange={e => setForm({...form, casa: e.target.value})}
                disabled={loading}
                className="w-full p-3 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-900 appearance-none transition-colors"
              >
                {loading ? <option>Conectando...</option> : 
                  times.map(t => <option key={t} value={t}>{t}</option>)
                }
              </select>
            </div>

            <div className="flex justify-center -my-2 relative z-10">
              <div className="bg-gray-100 rounded-full p-1.5 border-4 border-white text-gray-400 shadow-sm">
                <span className="font-bold text-xs px-1">VS</span>
              </div>
            </div>

            <div className="relative">
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block pl-1">Visitante (Fora)</label>
              <select 
                value={form.fora}
                onChange={e => setForm({...form, fora: e.target.value})}
                disabled={loading}
                className="w-full p-3 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-900 appearance-none transition-colors"
              >
                 {loading ? <option>...</option> : 
                  times.map(t => <option key={t} value={t}>{t}</option>)
                }
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block pl-1">Odd Superbet</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">@</span>
                <input 
                  type="number" 
                  value={form.odd}
                  onChange={e => setForm({...form, odd: e.target.value})}
                  placeholder="Ex: 1.85"
                  step="0.01"
                  className="w-full p-3 pl-8 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg text-gray-900 placeholder-gray-300 transition-all"
                />
              </div>
            </div>

            <button 
              onClick={handleAnalyze}
              disabled={analyzing || loading || !form.odd}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2
                ${analyzing || !form.odd 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-200 hover:to-indigo-700'
                }`}
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" /> Analisando...
                </>
              ) : (
                <>
                  Calcular Probabilidade <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </Card>

        {resultado && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className={`border-2 ${getVerdictStyles(resultado.valorEsperado).border} bg-opacity-50`}>
              
              <div className={`p-4 rounded-xl flex items-center justify-between mb-6 ${getVerdictStyles(resultado.valorEsperado).bg}`}>
                <div className="flex items-center gap-3">
                  {getVerdictStyles(resultado.valorEsperado).icon}
                  <div>
                    <h3 className={`font-bold text-lg leading-tight ${getVerdictStyles(resultado.valorEsperado).text}`}>
                      {getVerdictStyles(resultado.valorEsperado).label}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">Recomendação da IA</p>
                  </div>
                </div>
                <div className={`text-right ${getVerdictStyles(resultado.valorEsperado).text}`}>
                  <span className="block text-2xl font-black">{resultado.valorEsperado > 0 ? '+' : ''}{resultado.valorEsperado}%</span>
                  <span className="text-xs font-semibold opacity-75">EV (Valor)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <StatBox 
                  label="Probabilidade Real" 
                  value={`${resultado.probabilidadeCasa}%`} 
                  subtext="Cálculo Poisson"
                  color="text-blue-600"
                />
                 <StatBox 
                  label="Odd Justa (Fair)" 
                  value={resultado.oddJustaCasa} 
                  subtext="Preço correto"
                />
                <StatBox 
                  label="Odd Superbet" 
                  value={resultado.oddCasaApostas} 
                  subtext="Preço atual"
                  color={resultado.valorEsperado > 0 ? "text-green-600" : "text-gray-900"}
                />
                <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <span className="text-xs font-medium text-gray-400 uppercase">Odd Visitante</span>
                  <span className="text-lg font-semibold text-gray-500">{resultado.oddJustaFora}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-center gap-2 text-gray-400 text-xs">
                 <Trophy className="w-3 h-3" />
                 <span>Análise baseada nos últimos 5 jogos de cada time</span>
              </div>

            </Card>
          </div>
        )}

      </main>
    </div>
  );
}