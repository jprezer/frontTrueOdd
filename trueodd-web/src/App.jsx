import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  BrainCircuit, 
  Trophy, 
  ArrowRight,
  RefreshCw,
  Info,
  Database,
  Download,
  Globe,
  CheckCircle2,
  Wifi,
  Loader2,
  Lock
} from 'lucide-react';

// URL da sua API hospedada no Render
const API_URL = "https://trueodd.onrender.com/api";

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 ${className}`}>
    {children}
  </div>
);

const StatBox = ({ label, value, subtext, highlight = false, color = "text-gray-900" }) => (
  <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-xl transition-transform hover:scale-105">
    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</span>
    <span className={`text-xl font-bold mt-1 ${color}`}>{value}</span>
    {subtext && <span className="text-xs text-gray-400 mt-1 text-center">{subtext}</span>}
  </div>
);

export default function App() {
  const [times, setTimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  
  // Estados do Admin
  const [showAdmin, setShowAdmin] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);
  const [selectedLiga, setSelectedLiga] = useState("");
  
  const [error, setError] = useState(null);
  
  const [form, setForm] = useState({
    casa: '',
    fora: '',
    odd: ''
  });

  const [resultado, setResultado] = useState(null);

  const ligas = [
    { nome: "Brasileirão Série A", codigo: "BSA", pais: "🇧🇷" },
    { nome: "Premier League", codigo: "PL", pais: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
    { nome: "Champions League", codigo: "CL", pais: "🇪🇺" },
    { nome: "La Liga", codigo: "PD", pais: "🇪🇸" },
    { nome: "Série A", codigo: "SA", pais: "🇮🇹" },
    { nome: "Bundesliga", codigo: "BL1", pais: "🇩🇪" },
    { nome: "Ligue 1", codigo: "FL1", pais: "🇫🇷" },
    { nome: "Copa do Mundo", codigo: "WC", pais: "🌍" },
    { nome: "Eurocopa", codigo: "EC", pais: "🇪🇺" },
  ];

  // Variável auxiliar para saber se o banco está vazio
  const isDatabaseEmpty = !loading && times.length === 0;

  async function fetchTimes() {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/partidas`);
      if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
      
      const partidas = await response.json();
      const nomesUnicos = new Set();
      partidas.forEach(p => {
        nomesUnicos.add(p.timeCasa);
        nomesUnicos.add(p.timeFora);
      });
      
      const listaOrdenada = Array.from(nomesUnicos).sort();
      setTimes(listaOrdenada);
      
      // Se não tiver dados, abre o painel de admin automaticamente para o usuário baixar
      if (listaOrdenada.length === 0) {
        setShowAdmin(true);
      }
      
      if (listaOrdenada.length > 1 && !form.casa) {
        setForm(prev => ({ ...prev, casa: listaOrdenada[0], fora: listaOrdenada[1] }));
      }
    } catch (err) {
      console.error("Erro:", err);
      setError("Conectando ao servidor... (Aguarde, ele pode estar 'acordando')");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTimes();
  }, []);

  const handleSync = async () => {
    if (!selectedLiga) return;

    const ligaEncontrada = ligas.find(l => l.codigo === selectedLiga);
    if (!ligaEncontrada) return;

    setSyncing(true);
    setSyncMessage(null);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/partidas/sincronizar?liga=${selectedLiga}`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error("Falha na sincronização");

      const dados = await response.json();
      setSyncMessage(`Sucesso! ${dados.length} jogos do ${ligaEncontrada.nome} atualizados.`);
      await fetchTimes();
      
    } catch (err) {
      setError(`Erro ao baixar dados. A API externa pode estar indisponível no momento.`);
    } finally {
      setSyncing(false);
    }
  };

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
      setError("Erro ao analisar a partida.");
    } finally {
      setAnalyzing(false);
    }
  };

  const getVerdictStyles = (ev) => {
    if (ev > 5) return { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", icon: <TrendingUp className="w-6 h-6 text-green-600" />, label: "Aposta de Valor" };
    if (ev > 0) return { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", icon: <AlertTriangle className="w-6 h-6 text-yellow-600" />, label: "Margem Apertada" };
    return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: <TrendingDown className="w-6 h-6 text-red-600" />, label: "Não Apostar" };
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-20">
      
      {/* Cabeçalho */}
      <header className="bg-white px-6 py-4 shadow-sm sticky top-0 z-20">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <BrainCircuit className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900 leading-none">Aposta AI ⚽</h1>
            </div>
            {/* Indicador de Status Conectando/Conectado */}
            <div className="flex items-center gap-1.5">
               <div className={`h-2 w-2 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`}></div>
               <span className="text-xs font-medium text-gray-500">
                 {loading ? 'Conectando...' : 'Conectado'}
               </span>
            </div>
          </div>
          
          <button 
            onClick={() => setShowAdmin(!showAdmin)}
            className={`p-2 rounded-xl transition-all ${showAdmin ? 'bg-blue-50 text-blue-600 ring-2 ring-blue-100' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <Database className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Barra de Progresso Topo */}
      {(syncing || analyzing) && (
        <div className="fixed top-0 left-0 w-full h-1 z-50 bg-blue-100 overflow-hidden">
          <div className="h-full bg-blue-600 animate-[loading_1s_ease-in-out_infinite] w-1/3"></div>
        </div>
      )}
      <style>{`@keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(400%); } }`}</style>

      <main className="max-w-md mx-auto px-4 mt-6 space-y-6">
        
        {/* Painel de Admin */}
        {showAdmin && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            <Card className="border-blue-200 bg-blue-50/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-blue-800 flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Sincronizar Dados
                </h3>
                <span className="text-xs bg-white text-blue-600 px-2 py-1 rounded-full font-bold border border-blue-100 shadow-sm">
                  {times.length} Times
                </span>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <select 
                    value={selectedLiga}
                    onChange={(e) => setSelectedLiga(e.target.value)}
                    disabled={syncing}
                    className="w-full p-3 bg-white border border-blue-200 rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none appearance-none disabled:opacity-50"
                  >
                    <option value="">Selecione o Campeonato...</option>
                    {ligas.map(liga => (
                      <option key={liga.codigo} value={liga.codigo}>
                        {liga.pais} {liga.nome}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <ArrowRight className="w-4 h-4 rotate-90" />
                  </div>
                </div>

                <button
                  onClick={handleSync}
                  disabled={!selectedLiga || syncing}
                  className={`px-4 rounded-xl font-bold text-white shadow-sm transition-all flex items-center justify-center w-14
                    ${!selectedLiga || syncing ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}
                  `}
                >
                  {syncing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                </button>
              </div>

              {syncMessage && !syncing && (
                <div className="mt-3 p-3 bg-green-100 border border-green-200 text-green-700 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" /> {syncMessage}
                </div>
              )}
            </Card>
          </div>
        )}

        <Card>
          <div className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2">
                <Wifi className="w-4 h-4 flex-shrink-0" /> {error}
              </div>
            )}

            {/* SELEÇÃO DE MANDANTE */}
            <div className="relative">
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block pl-1">Mandante</label>
              <div className="relative">
                <select 
                  value={form.casa}
                  onChange={e => setForm({...form, casa: e.target.value})}
                  disabled={loading || isDatabaseEmpty}
                  className={`w-full p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-900 appearance-none transition-colors cursor-pointer
                    ${isDatabaseEmpty ? 'border-red-200 bg-red-50 text-red-400' : 'border-gray-200'}
                  `}
                >
                  {loading ? <option>Conectando ao servidor...</option> : 
                   isDatabaseEmpty ? <option>⚠️ Nenhuma liga sincronizada</option> :
                   times.map(t => <option key={t} value={t}>{t}</option>)
                  }
                </select>
                {isDatabaseEmpty && !loading && (
                  <div className="absolute right-10 top-1/2 -translate-y-1/2 text-red-400 text-xs font-bold animate-pulse">
                    Baixe uma liga acima 👆
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center -my-2 relative z-10">
              <div className="bg-gray-100 rounded-full p-1.5 border-4 border-white text-gray-400 shadow-sm">
                <span className="font-bold text-xs px-2">VS</span>
              </div>
            </div>

            {/* SELEÇÃO DE VISITANTE */}
            <div className="relative">
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block pl-1">Visitante</label>
              <select 
                value={form.fora}
                onChange={e => setForm({...form, fora: e.target.value})}
                disabled={loading || isDatabaseEmpty}
                className={`w-full p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-900 appearance-none transition-colors cursor-pointer
                    ${isDatabaseEmpty ? 'border-red-200 bg-red-50 text-red-400' : 'border-gray-200'}
                  `}
              >
                 {loading ? <option>...</option> : 
                  isDatabaseEmpty ? <option>⚠️ ...</option> :
                  times.map(t => <option key={t} value={t}>{t}</option>)
                }
              </select>
            </div>

            {/* INPUT DE ODD */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block pl-1">Odd Superbet</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                  {isDatabaseEmpty ? <Lock className="w-4 h-4" /> : '@'}
                </span>
                <input 
                  type="number" 
                  value={form.odd}
                  onChange={e => setForm({...form, odd: e.target.value})}
                  placeholder={isDatabaseEmpty ? "Bloqueado" : "Ex: 1.85"}
                  step="0.01"
                  disabled={loading || isDatabaseEmpty}
                  className="w-full p-3 pl-8 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg text-gray-900 placeholder-gray-300 transition-all disabled:bg-gray-100 disabled:text-gray-400"
                />
              </div>
            </div>

            {/* BOTÃO DE AÇÃO */}
            <button 
              onClick={handleAnalyze}
              disabled={analyzing || loading || !form.odd || isDatabaseEmpty}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2
                ${analyzing || loading || !form.odd || isDatabaseEmpty
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-200 hover:to-indigo-700'
                }`}
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Analisando...
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
                <StatBox label="Probabilidade Real" value={`${resultado.probabilidadeCasa}%`} subtext="Cálculo Poisson" color="text-blue-600" />
                <StatBox label="Odd Justa (Fair)" value={resultado.oddJustaCasa} subtext="Preço correto" />
                <StatBox label="Odd Superbet" value={resultado.oddCasaApostas} subtext="Preço atual" color={resultado.valorEsperado > 0 ? "text-green-600" : "text-gray-900"} />
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