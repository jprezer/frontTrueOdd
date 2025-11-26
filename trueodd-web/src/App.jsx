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
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  
  // Admin States
  const [showAdmin, setShowAdmin] = useState(true); 
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

  // Função INTELIGENTE: Busca só os times da liga escolhida
  async function fetchTimesDaLiga(ligaCode) {
    setLoadingTimes(true);
    setTimes([]); // Limpa lista antiga para não misturar
    try {
      const response = await fetch(`${API_URL}/partidas/times?liga=${ligaCode}`);
      if (!response.ok) throw new Error("Erro ao buscar times");
      
      const listaTimes = await response.json();
      setTimes(listaTimes);
      
      // Se veio vazio, avisa que precisa baixar
      if (listaTimes.length === 0) {
          setSyncMessage("Nenhum time encontrado no banco. Clique no botão de Download.");
      } else {
          // Seleciona os primeiros por padrão
          if (listaTimes.length > 1) {
            setForm(prev => ({ ...prev, casa: listaTimes[0], fora: listaTimes[1] }));
          }
          setShowAdmin(false); // Fecha o painel se ja tiver dados
      }

    } catch (err) {
      console.error(err);
      setError("Erro ao conectar com a API.");
    } finally {
      setLoadingTimes(false);
    }
  }

  // Monitora a troca de liga no ComboBox
  useEffect(() => {
      if (selectedLiga) {
          fetchTimesDaLiga(selectedLiga);
      }
  }, [selectedLiga]);

  // Função de Download
  const handleSync = async () => {
    if (!selectedLiga) return;

    setSyncing(true);
    setSyncMessage(null);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/partidas/sincronizar?liga=${selectedLiga}`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error("Falha na sincronização");

      const dados = await response.json();
      setSyncMessage(`Sucesso! ${dados.length} jogos baixados.`);
      
      // Atualiza a lista de times imediatamente
      await fetchTimesDaLiga(selectedLiga);
      
    } catch (err) {
      setError(`Erro ao baixar dados. API externa pode estar indisponível.`);
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

  // Bloqueia se não escolheu liga ou se a lista de times estiver vazia
  const isLocked = !selectedLiga || times.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-20">
      
      <header className="bg-white px-6 py-4 shadow-sm sticky top-0 z-20">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <BrainCircuit className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900 leading-none">Aposta AI ⚽</h1>
            </div>
            <div className="flex items-center gap-1.5">
               <div className={`h-2 w-2 rounded-full ${loadingTimes ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`}></div>
               <span className="text-xs font-medium text-gray-500">
                 {loadingTimes ? 'Carregando times...' : 'Pronto'}
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

      {(syncing || analyzing || loadingTimes) && (
        <div className="fixed top-0 left-0 w-full h-1 z-50 bg-blue-100 overflow-hidden">
          <div className="h-full bg-blue-600 animate-[loading_1s_ease-in-out_infinite] w-1/3"></div>
        </div>
      )}
      <style>{`@keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(400%); } }`}</style>

      <main className="max-w-md mx-auto px-4 mt-6 space-y-6">
        
        {/* --- PAINEL DE LIGAS --- */}
        <Card className={`border-blue-200 bg-blue-50/50 transition-all ${!showAdmin ? 'hidden' : ''}`}>
            <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-blue-800 flex items-center gap-2">
                <Globe className="w-4 h-4" /> Escolha o Campeonato
            </h3>
            </div>

            <div className="flex gap-2">
            <div className="relative flex-1">
                <select 
                value={selectedLiga}
                onChange={(e) => setSelectedLiga(e.target.value)}
                disabled={syncing}
                className="w-full p-3 bg-white border border-blue-200 rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                >
                <option value="">Selecione...</option>
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
                title="Forçar Download"
                className={`px-4 rounded-xl font-bold text-white shadow-sm transition-all flex items-center justify-center w-14
                ${!selectedLiga || syncing ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}
                `}
            >
                {syncing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            </button>
            </div>

            {syncMessage && (
            <div className="mt-3 p-3 bg-green-100 border border-green-200 text-green-700 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" /> {syncMessage}
            </div>
            )}
            
            {times.length === 0 && selectedLiga && !syncing && !loadingTimes && (
                <div className="mt-3 text-xs text-orange-600 text-center animate-pulse">
                    ⚠️ Banco vazio para esta liga. Clique no botão de download para baixar.
                </div>
            )}
        </Card>

        <Card>
          <div className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2">
                <Wifi className="w-4 h-4 flex-shrink-0" /> {error}
              </div>
            )}

            {/* MANDANTE */}
            <div className="relative">
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block pl-1">Mandante</label>
              <div className="relative">
                <select 
                  value={form.casa}
                  onChange={e => setForm({...form, casa: e.target.value})}
                  disabled={isLocked}
                  className={`w-full p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-900 appearance-none transition-colors cursor-pointer
                    ${isLocked ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed' : 'border-gray-200'}
                  `}
                >
                  {!selectedLiga ? <option>Selecione uma liga acima...</option> : 
                   times.length === 0 ? <option>Nenhum time encontrado</option> :
                   times.map(t => <option key={t} value={t}>{t}</option>)
                  }
                </select>
                {isLocked && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center -my-2 relative z-10">
              <div className="bg-gray-100 rounded-full p-1.5 border-4 border-white text-gray-400 shadow-sm">
                <span className="font-bold text-xs px-2">VS</span>
              </div>
            </div>

            {/* VISITANTE */}
            <div className="relative">
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block pl-1">Visitante</label>
              <select 
                value={form.fora}
                onChange={e => setForm({...form, fora: e.target.value})}
                disabled={isLocked}
                className={`w-full p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-900 appearance-none transition-colors cursor-pointer
                    ${isLocked ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed' : 'border-gray-200'}
                  `}
              >
                 {!selectedLiga ? <option>...</option> : 
                   times.length === 0 ? <option>...</option> :
                   times.map(t => <option key={t} value={t}>{t}</option>)
                }
              </select>
            </div>

            {/* ODD */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block pl-1">Odd da Casa</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                  {isLocked ? <Lock className="w-4 h-4" /> : '@'}
                </span>
                <input 
                  type="number" 
                  value={form.odd}
                  onChange={e => setForm({...form, odd: e.target.value})}
                  placeholder={isLocked ? "Bloqueado" : "Ex: 1.85"}
                  step="0.01"
                  disabled={isLocked}
                  className="w-full p-3 pl-8 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg text-gray-900 placeholder-gray-300 transition-all disabled:bg-gray-100 disabled:text-gray-400"
                />
              </div>
            </div>

            {/* BOTÃO */}
            <button 
              onClick={handleAnalyze}
              disabled={analyzing || loadingTimes || !form.odd || isLocked}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2
                ${analyzing || isLocked
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
                <StatBox label="Odd da Casa" value={resultado.oddCasaApostas} subtext="Preço atual" color={resultado.valorEsperado > 0 ? "text-green-600" : "text-gray-900"} />
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