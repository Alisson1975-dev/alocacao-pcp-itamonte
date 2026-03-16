import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { 
  Plus, Search, Trash2, Edit2, CheckCircle2, CircleDashed, 
  AlertTriangle, FileUp, Layers, Copy, Check, Loader2, 
  Pencil, ClipboardList, ListOrdered, Settings, X
} from 'lucide-react';

// --- CONFIGURAÇÃO FIREBASE REAL (ALOCAÇÃO - ITAMONTE) ---
const firebaseConfig = {
  apiKey: "AIzaSyCP0KtP6sL0M69wq3FpC5Tmq_IL9AtbnsY",
  authDomain: "pcp-juncao-itamonte.firebaseapp.com",
  projectId: "pcp-juncao-itamonte",
  storageBucket: "pcp-juncao-itamonte.firebasestorage.app",
  messagingSenderId: "827442336306",
  appId: "1:827442336306:web:653270dc35677b6273e22b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'alocacao-mg1-pcp-itamonte';

const App = () => {
  const [user, setUser] = useState(null);
  const [allocations, setAllocations] = useState([]);
  const [discardedOps, setDiscardedOps] = useState([]);
  const [lossValue, setLossValue] = useState(200);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  
  const [editingId, setEditingId] = useState(null);
  const [isQtyOnlyMode, setIsQtyOnlyMode] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  
  const fileInputRef = useRef(null);
  const MAX_ROWS = 800;

  const [formData, setFormData] = useState({
    sequencia: '', maquina: '', item: '', itemFinal: '', descricao: '',
    quantidade: '', ordemProducao: '', isPerdaActive: false, status: 'Pendente'
  });

  // Autenticação
  useEffect(() => {
    signInAnonymously(auth).catch(console.error);
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // Sincronização de Configurações (Perda)
  useEffect(() => {
    if (!user) return;
    const settingsRef = doc(db, 'settings', 'alocacao_config');
    const unsubscribe = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.lossValue) setLossValue(data.lossValue);
      }
    });
    return () => unsubscribe();
  }, [user]);

  const saveSettings = async (newValue) => {
    if (!user) return;
    try {
      const settingsRef = doc(db, 'settings', 'alocacao_config');
      await setDoc(settingsRef, { lossValue: parseFloat(newValue) }, { merge: true });
      setIsSettingsOpen(false);
      setCopyFeedback({ type: 'success', message: 'Configuração atualizada!' });
    } catch (err) {
      setCopyFeedback({ type: 'error', message: 'Erro ao salvar.' });
    }
  };

  const formatQty = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return "0,00";
    return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
  };

  // Carregar biblioteca XLSX dinamicamente
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (copyFeedback) {
      const timer = setTimeout(() => setCopyFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [copyFeedback]);

  // Lógica de Negócio
  const handleSequenciar = () => {
    if (allocations.length === 0) return;
    let currentSeq = 1;
    const sorted = [...allocations].sort((a, b) => String(a.maquina).localeCompare(b.maquina));
    const sequencedData = sorted.map((item, index, arr) => {
      if (index > 0) {
        const itemAtual = String(item.item || '').trim().toUpperCase();
        const itemAnterior = String(arr[index - 1].item || '').trim().toUpperCase();
        if (itemAtual !== itemAnterior) currentSeq++;
      }
      return { ...item, sequencia: currentSeq };
    });
    setAllocations(sequencedData);
    setCopyFeedback({ type: 'success', message: 'Sequenciamento inteligente concluído!' });
  };

  const handleJuncao = () => {
    if (allocations.length === 0) return;
    const grouped = {};
    const discarded = [];
    allocations.forEach((item) => {
      const seq = item.sequencia || 'sem-seq';
      if (!grouped[seq]) {
        grouped[seq] = { ...item, quantidade: parseFloat(item.quantidade) || 0 };
      } else {
        grouped[seq].quantidade += (parseFloat(item.quantidade) || 0);
        discarded.push({ maquina: item.maquina, ordemProducao: item.ordemProducao });
      }
    });
    setAllocations(Object.values(grouped));
    setDiscardedOps(prev => [...prev, ...discarded]);
    setCopyFeedback({ type: 'success', message: 'Itens agrupados!' });
  };

  const handleClearAll = () => {
    setAllocations([]);
    setDiscardedOps([]);
    setIsClearModalOpen(false);
    setCopyFeedback({ type: 'success', message: 'Dados limpos com sucesso.' });
  };

  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = window.XLSX.read(bstr, { type: 'binary' });
        const data = window.XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });
        if (data.length < 2) throw new Error();
        const headers = data[0].map(h => String(h).toUpperCase().trim());
        const rows = data.slice(1);
        const idx = {
          maquina: headers.indexOf('MÁQUINA'),
          item: headers.indexOf('ITEM'),
          itemFinal: headers.indexOf('ITEM FINAL'),
          descricao: headers.indexOf('DESCRIÇÃO'),
          quantidade: headers.indexOf('QUANTIDADE'),
          op: headers.indexOf('OP')
        };
        const newItems = rows.filter(row => row.length > 0 && row[idx.maquina]).map((row, index) => ({
          id: Date.now() + index,
          sequencia: '', maquina: row[idx.maquina] || '', item: row[idx.item] || '',
          itemFinal: row[idx.itemFinal] || '', descricao: row[idx.descricao] || '',
          quantidade: parseFloat(String(row[idx.quantidade]).replace('.', '').replace(',', '.')) || 0,
          ordemProducao: row[idx.op] || '', isPerdaActive: false, status: 'Pendente'
        }));
        if (allocations.length + newItems.length > MAX_ROWS) {
          setCopyFeedback({ type: 'error', message: 'Limite de 800 linhas!' });
        } else {
          setAllocations(prev => [...prev, ...newItems]);
          setCopyFeedback({ type: 'success', message: 'Importação concluída!' });
        }
      } catch (err) { setCopyFeedback({ type: 'error', message: 'Erro ao processar ficheiro.' }); }
      finally { setIsImporting(false); e.target.value = null; }
    };
    reader.readAsBinaryString(file);
  };

  const handleCopyData = () => {
    const conferidos = allocations.filter(item => item.status === 'Conferido');
    if (conferidos.length === 0) return setCopyFeedback({ type: 'error', message: 'Nada conferido para copiar.' });
    const rows = conferidos.map(item => `${item.maquina}\t${item.item}\t${item.itemFinal || ''}\t${item.descricao}\t${formatQty(item.quantidade)}\t${item.ordemProducao}`).join('\n');
    const el = document.createElement("textarea"); el.value = rows; document.body.appendChild(el); el.select();
    document.execCommand('copy'); document.body.removeChild(el);
    setCopyFeedback({ type: 'success', message: 'Dados copiados para Excel!' });
  };

  const handleCopyOP = () => {
    if (discardedOps.length === 0) return;
    const rows = discardedOps.map(item => item.ordemProducao).join('\n');
    const el = document.createElement("textarea"); el.value = rows; document.body.appendChild(el); el.select();
    document.execCommand('copy'); document.body.removeChild(el);
    setCopyFeedback({ type: 'success', message: 'Lista de OPs copiada!' });
  };

  const toggleStatus = (id) => {
    setAllocations(prev => prev.map(item => item.id === id ? { ...item, status: item.status === 'Pendente' ? 'Conferido' : 'Pendente' } : item));
  };

  const togglePerda = (id) => {
    setAllocations(prev => prev.map(item => {
      if (item.id === id) {
        const newState = !item.isPerdaActive;
        const currentQty = parseFloat(item.quantidade) || 0;
        return {
          ...item,
          isPerdaActive: newState,
          quantidade: newState ? currentQty + lossValue : currentQty - lossValue
        };
      }
      return item;
    }));
  };

  const handleOpenModal = (item = null, qtyOnly = false) => {
    setIsQtyOnlyMode(qtyOnly);
    if (item) {
      setFormData(item);
      setEditingId(item.id);
    } else {
      setFormData({ sequencia: '', maquina: '', item: '', itemFinal: '', descricao: '', quantidade: '', ordemProducao: '', isPerdaActive: false, status: 'Pendente' });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const dataToSave = { ...formData, quantidade: parseFloat(String(formData.quantidade).replace(',', '.')) || 0 };
    if (editingId) setAllocations(prev => prev.map(item => item.id === editingId ? { ...dataToSave, id: editingId } : item));
    else setAllocations(prev => [...prev, { ...dataToSave, id: Date.now() }]);
    setIsModalOpen(false);
  };

  const filtered = allocations.filter(item => 
    String(item.maquina).toLowerCase().includes(searchTerm.toLowerCase()) || 
    String(item.item).toLowerCase().includes(searchTerm.toLowerCase()) || 
    String(item.ordemProducao).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans pb-20">
      {copyFeedback && (
        <div className={`fixed top-4 right-4 z-[100] px-6 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-right ${copyFeedback.type === 'success' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-red-500 text-white border-red-400'}`}>
          {copyFeedback.type === 'success' ? <Check className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          <span className="font-bold text-sm uppercase tracking-wider">{copyFeedback.message}</span>
        </div>
      )}

      <input type="file" ref={fileInputRef} onChange={handleImportExcel} accept=".xlsx, .xls" className="hidden" />

      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-black tracking-tight text-slate-800 uppercase">Alocação MG1 - PCP</h1>
          <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-8 flex flex-col gap-6">
        <section className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
            <div className="relative w-full lg:w-[450px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input type="text" placeholder="Pesquisar máquina, item ou OP..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
              <button onClick={() => handleOpenModal()} disabled={allocations.length >= MAX_ROWS} className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl transition-all shadow-lg font-black text-xs uppercase tracking-widest ${allocations.length >= MAX_ROWS ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100'}`}><Plus className="w-4 h-4" /> Nova Alocação</button>
              <button onClick={() => setIsClearModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 border border-red-100 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-md shadow-red-50"><Trash2 className="w-4 h-4" /> Limpar</button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
            <button onClick={() => fileInputRef.current.click()} disabled={isImporting} className="flex items-center gap-2 px-5 py-2.5 bg-[#5d4037] text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md hover:brightness-110 disabled:opacity-50">{isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileUp className="w-4 h-4" />} Incluir Excel</button>
            <button onClick={handleSequenciar} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md hover:bg-black transition-all"><ListOrdered className="w-4 h-4" /> Sequenciar</button>
            <button onClick={handleJuncao} className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md hover:brightness-110 transition-all"><Layers className="w-4 h-4" /> Junção</button>
            <button onClick={handleCopyData} className="flex items-center gap-2 px-5 py-2.5 bg-pink-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md hover:brightness-110 active:scale-95 transition-all"><Copy className="w-4 h-4" /> Copiar Dados</button>
          </div>
        </section>

        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-100">
                  <th className="px-4 py-5 text-xs font-black text-white uppercase bg-blue-600 border-r border-blue-500 text-center w-16">Seq.</th>
                  <th className="px-6 py-5 text-xs font-black text-white uppercase bg-blue-600 border-r border-blue-500">Máquina</th>
                  <th className="px-6 py-5 text-xs font-black text-white uppercase bg-blue-600 border-r border-blue-500">Item</th>
                  <th className="px-6 py-5 text-xs font-black text-white uppercase bg-blue-600 border-r border-blue-500">Item Final</th>
                  <th className="px-6 py-5 text-xs font-black text-white uppercase bg-blue-600 border-r border-blue-500">Descrição</th>
                  <th className="px-6 py-5 text-xs font-black text-white uppercase bg-blue-600 border-r border-blue-500 text-center">Quantidade</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-800 uppercase bg-yellow-400 border-r border-yellow-500">OP</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-800 uppercase bg-yellow-400 border-r border-yellow-500 text-center">Perda</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-800 uppercase bg-yellow-400 border-r border-yellow-500 text-center">Status</th>
                  <th className="px-6 py-5 text-xs font-black text-white uppercase bg-slate-800 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-4 py-4 text-center font-black text-blue-600">{item.sequencia || '-'}</td>
                    <td className="px-6 py-4 font-bold text-slate-700 whitespace-nowrap">{item.maquina}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-600">{item.item}</td>
                    <td className="px-6 py-4 font-mono text-sm text-slate-500">{item.itemFinal || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 max-w-[200px] truncate">{item.descricao}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2 group/qty">
                        <button onClick={() => handleOpenModal(item, true)} className="p-1.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover/qty:opacity-100"><Pencil className="w-4 h-4" /></button>
                        <div className="flex flex-col items-center">
                          <span className="font-black text-blue-600 text-base tabular-nums">{formatQty(item.quantidade)}</span>
                          <span className="text-[9px] text-slate-400 uppercase font-black tracking-tighter">kg</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700 whitespace-nowrap">{item.ordemProducao}</td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => togglePerda(item.id)} className={`w-16 py-2 rounded-xl text-xs font-black transition-all border-2 ${item.isPerdaActive ? 'bg-emerald-500 text-white border-emerald-600 shadow-md scale-105' : 'bg-white text-slate-300 border-slate-100 hover:border-slate-300 hover:text-slate-500'}`}>{lossValue}</button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => toggleStatus(item.id)} className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${item.status === 'Conferido' ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400'}`}>
                        {item.status === 'Conferido' ? <CheckCircle2 className="w-4 h-4" /> : <CircleDashed className="w-4 h-4" />} {item.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenModal(item, false)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => { if(window.confirm('Excluir esta linha?')) setAllocations(prev => prev.filter(i => i.id !== item.id)) }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden max-w-2xl">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><ClipboardList className="w-4 h-4" /> OPS DESCARTADAS NA JUNÇÃO</h2>
            <button onClick={handleCopyOP} className="flex items-center gap-2 px-5 py-2 bg-pink-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-pink-100 hover:bg-pink-600 transition-all"><Copy className="w-3.5 h-3.5" /> Copiar Lista</button>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            <table className="w-full text-left border-collapse text-xs">
              <tbody className="divide-y divide-slate-100">
                {discardedOps.map((item, idx) => (
                  <tr key={`discarded-${idx}`} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3 font-bold text-slate-700">{item.maquina}</td>
                    <td className="px-6 py-3 font-bold text-slate-500 font-mono">{item.ordemProducao}</td>
                  </tr>
                ))}
                {discardedOps.length === 0 && <tr><td className="px-6 py-8 text-center text-slate-400 font-medium">Nenhuma OP descartada.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Modais */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-800 uppercase">Ajustes</h2>
              <button onClick={() => setIsSettingsOpen(false)} className="p-2 bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Valor da Perda Padrão (kg)</label>
                <input type="number" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-2xl font-black" value={lossValue} onChange={(e) => setLossValue(e.target.value)} />
              </div>
              <button onClick={() => saveSettings(lossValue)} className="w-full py-4 bg-blue-600 text-white rounded-[20px] font-black text-xs uppercase shadow-xl hover:bg-blue-700">Salvar Configuração</button>
            </div>
          </div>
        </div>
      )}

      {isClearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm p-8 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6"><AlertTriangle className="w-8 h-8" /></div>
            <h2 className="text-xl font-black text-slate-800 uppercase mb-2">Limpar Tudo?</h2>
            <p className="text-slate-500 text-sm mb-8 font-medium">Esta ação é irreversível.</p>
            <div className="flex gap-3">
              <button onClick={() => setIsClearModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase">Cancelar</button>
              <button onClick={handleClearAll} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase">Limpar</button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg my-10 animate-in zoom-in">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">{isQtyOnlyMode ? 'Ajustar Peso' : (editingId ? 'Editar Alocação' : 'Nova Alocação')}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-200/50 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {isQtyOnlyMode ? (
                  <div className="col-span-2 text-center">
                    <label className="block text-[10px] font-black text-blue-600 uppercase mb-3">Peso Atual (kg)</label>
                    <input required type="number" step="0.01" className="w-full px-6 py-8 text-4xl font-black border-2 border-blue-100 rounded-[28px] text-center bg-slate-50 outline-none focus:border-blue-500" value={formData.quantidade} onChange={(e) => setFormData({...formData, quantidade: e.target.value})} autoFocus />
                  </div>
                ) : (
                  <>
                    <div className="col-span-1"><label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Seq.</label><input type="number" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={formData.sequencia} onChange={(e) => setFormData({...formData, sequencia: e.target.value})} /></div>
                    <div className="col-span-1"><label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Máquina</label><input required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={formData.maquina} onChange={(e) => setFormData({...formData, maquina: e.target.value})} /></div>
                    <div><label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Item</label><input required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={formData.item} onChange={(e) => setFormData({...formData, item: e.target.value})} /></div>
                    <div><label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Item Final</label><input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={formData.itemFinal} onChange={(e) => setFormData({...formData, itemFinal: e.target.value})} /></div>
                    <div className="col-span-2"><label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Descrição</label><textarea className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl h-24 resize-none" value={formData.descricao} onChange={(e) => setFormData({...formData, descricao: e.target.value})}></textarea></div>
                    <div><label className="block text-[10px] font-black text-blue-500 uppercase mb-2">Qtd (kg)</label><input required type="number" step="0.01" className="w-full px-4 py-3 bg-slate-50 border border-blue-200 rounded-xl font-bold" value={formData.quantidade} onChange={(e) => setFormData({...formData, quantidade: e.target.value})} /></div>
                    <div><label className="block text-[10px] font-black text-slate-400 uppercase mb-2">OP</label><input required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={formData.ordemProducao} onChange={(e) => setFormData({...formData, ordemProducao: e.target.value})} /></div>
                  </>
                )}
              </div>
              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 border-2 border-slate-100 text-slate-400 rounded-2xl font-black text-xs uppercase">Cancelar</button>
                <button type="submit" className="flex-1 py-4 bg-slate-800 text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-slate-900">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
