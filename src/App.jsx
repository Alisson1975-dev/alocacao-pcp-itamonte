import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Definição manual de ícones SVG
const Icons = {
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  Search: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" cy="21" x2="16.65" y2="16.65"></line></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
  Edit: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
  Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>,
  Pending: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>,
  Alert: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path></svg>,
  Import: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>,
  Layers: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline></svg>,
  Copy: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>,
  Settings: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
  X: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  Pencil: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>,
  ListOrdered: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="10" y1="18" x2="21" y2="18"></line><path d="M4 6h1v4"></path><path d="M4 10h2"></path><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path></svg>,
  Refresh: () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>,
  ClipboardList: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><line x1="8" y1="11" x2="8" y2="11"></line><line x1="8" y1="16" x2="8" y2="16"></line><line x1="12" y1="11" x2="16" y2="11"></line><line x1="12" y1="16" x2="16" y2="16"></line></svg>,
  Loader2: ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
};

// --- CONFIGURAÇÃO FIREBASE REAL (PCP ITAMONTE) ---
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

const App = () => {
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
    quantidade: '', ordemProducao: '', perdaCount: 0, status: 'Pendente'
  });

  // Autenticação para permitir funcionamento do Firebase
  useEffect(() => {
    signInAnonymously(auth).catch(console.error);
    if (!window.XLSX) {
      const script = document.createElement('script');
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (copyFeedback) {
      const timer = setTimeout(() => setCopyFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [copyFeedback]);

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return allocations.filter(item => 
      String(item.maquina || '').toLowerCase().includes(term) || 
      String(item.item || '').toLowerCase().includes(term) || 
      String(item.ordemProducao || '').toLowerCase().includes(term)
    );
  }, [allocations, searchTerm]);

  const copyToClipboard = useCallback((text, msg) => {
    const el = document.createElement("textarea"); el.value = text; document.body.appendChild(el); el.select();
    try { document.execCommand('copy'); setCopyFeedback({ type: 'success', message: msg }); } catch (err) {}
    document.body.removeChild(el);
  }, []);

  const handleCopyOP = useCallback(() => {
    if (discardedOps.length === 0) return;
    const rows = discardedOps.map(item => item.ordemProducao).join('\n');
    copyToClipboard(rows, 'Lista de OPs copiada!');
  }, [discardedOps, copyToClipboard]);

  const formatQty = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return "0,00";
    return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
  };

  const handleSequenciar = () => {
    if (allocations.length === 0) return;
    let currentSeq = 1;
    const sequencedData = allocations.map((item, index, arr) => {
      if (index > 0) {
        const itemAtual = String(item.item || '').trim().toUpperCase();
        const itemAnterior = String(arr[index - 1].item || '').trim().toUpperCase();
        if (itemAtual !== itemAnterior) currentSeq++;
      }
      return { ...item, sequencia: currentSeq };
    });
    setAllocations(sequencedData);
    setCopyFeedback({ type: 'success', message: 'Sequenciamento local concluído!' });
  };

  const handleJuncao = () => {
    if (allocations.length === 0) return;
    const grouped = {};
    const discarded = [];
    allocations.forEach((item) => {
      const seq = item.sequencia || 'sem-seq';
      const cleanItemFinal = String(item.itemFinal || '').trim();
      if (!grouped[seq]) {
        grouped[seq] = { ...item, quantidade: parseFloat(item.quantidade) || 0, itensFinaisAgrupados: cleanItemFinal ? [cleanItemFinal] : [] };
      } else {
        grouped[seq].quantidade += (parseFloat(item.quantidade) || 0);
        if (cleanItemFinal && !grouped[seq].itensFinaisAgrupados.includes(cleanItemFinal)) {
          grouped[seq].itensFinaisAgrupados.push(cleanItemFinal);
        }
        discarded.push({ maquina: item.maquina, ordemProducao: item.ordemProducao });
      }
    });
    setAllocations(Object.values(grouped));
    setDiscardedOps(prev => [...prev, ...discarded]);
    setCopyFeedback({ type: 'success', message: 'Junção local concluída!' });
  };

  const handleClearAll = () => {
    setAllocations([]);
    setDiscardedOps([]);
    setIsClearModalOpen(false);
    setCopyFeedback({ type: 'success', message: 'Dados limpos com sucesso.' });
  };

  const toggleStatus = (item) => {
    const newStatus = item.status === 'Pendente' ? 'Conferido' : 'Pendente';
    setAllocations(prev => prev.map(a => a.id === item.id ? { ...a, status: newStatus } : a));
  };

  const handleAddPerda = (item) => {
    const newQty = (parseFloat(item.quantidade) || 0) + parseFloat(lossValue);
    const newCount = (item.perdaCount || 0) + 1;
    setAllocations(prev => prev.map(a => a.id === item.id ? { ...a, quantidade: newQty, perdaCount: newCount } : a));
  };

  const handleResetPerda = (item) => {
    const currentCount = item.perdaCount || 0;
    const newQty = (parseFloat(item.quantidade) || 0) - (currentCount * parseFloat(lossValue));
    setAllocations(prev => prev.map(a => a.id === item.id ? { ...a, quantidade: newQty, perdaCount: 0 } : a));
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const wb = window.XLSX.read(evt.target.result, { type: 'binary' });
        const data = window.XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });
        const headers = data[0].map(h => String(h).toUpperCase().trim());
        const rows = data.slice(1);
        const idx = { maquina: Math.max(headers.indexOf('MÁQUINA'), headers.indexOf('MAQUINA')), item: headers.indexOf('ITEM'), itemFinal: Math.max(headers.indexOf('ITEM FINAL'), headers.indexOf('ITEMFINAL')), descricao: Math.max(headers.indexOf('DESCRIÇÃO'), headers.indexOf('DESCRICAO')), quantidade: headers.indexOf('QUANTIDADE'), op: headers.indexOf('OP') };
        const newItems = rows.filter(row => row.length > 0 && row[idx.maquina] !== undefined).map((row, index) => {
          let maq = String(row[idx.maquina] || '').trim(); if (/^\d+$/.test(maq)) maq = `EXT${maq}`;
          return { id: Date.now() + index, sequencia: '', maquina: maq, item: String(row[idx.item] || ''), itemFinal: String(row[idx.itemFinal] || ''), descricao: String(row[idx.descricao] || ''), quantidade: parseFloat(String(row[idx.quantidade] || 0).replace('.', '').replace(',', '.')) || 0, ordemProducao: String(row[idx.op] || ''), perdaCount: 0, status: 'Pendente' };
        });
        setAllocations(prev => [...prev, ...newItems]);
        setCopyFeedback({ type: 'success', message: 'Importação concluída!' });
      } catch (err) { alert("Erro na importação!"); }
      finally { setIsImporting(false); e.target.value = null; }
    };
    reader.readAsBinaryString(file);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const qty = parseFloat(String(formData.quantidade).replace(',', '.'));
    const dataToSave = { ...formData, id: editingId || Date.now(), quantidade: isNaN(qty) ? 0 : qty };
    if (editingId) setAllocations(prev => prev.map(item => item.id === editingId ? dataToSave : item));
    else setAllocations(prev => [...prev, dataToSave]);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans pb-20 text-sm">
      {copyFeedback && (
        <div className={`fixed top-4 right-4 z-[100] px-6 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-right duration-300 ${copyFeedback.type === 'success' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-red-500 text-white border-red-400'}`}>
          {copyFeedback.type === 'success' ? <Icons.Check /> : <Icons.Alert />}
          <span className="font-bold text-sm uppercase tracking-wider">{copyFeedback.message}</span>
        </div>
      )}

      <input type="file" ref={fileInputRef} onChange={handleImportExcel} accept=".xlsx, .xls" className="hidden" />

      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm p-4">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center">
          <h1 className="text-xl font-black text-slate-800 uppercase">Alocação MG1 - PCP</h1>
          <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-slate-400 hover:text-blue-600 transition-all"><Icons.Settings /></button>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-8 flex flex-col gap-6">
        <section className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
            <div className="relative w-full lg:w-[450px]">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Icons.Search /></div>
              <input type="text" placeholder="Pesquisar..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => { setIsQtyOnlyMode(false); setEditingId(null); setFormData({ sequencia: '', maquina: '', item: '', itemFinal: '', descricao: '', quantidade: '', ordemProducao: '', perdaCount: 0, status: 'Pendente' }); setIsModalOpen(true); }} className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs shadow-lg"><Icons.Plus /> Nova</button>
              <button onClick={() => setIsClearModalOpen(true)} className="px-6 py-3 bg-red-50 text-red-600 border border-red-100 rounded-2xl font-black uppercase text-xs">Limpar</button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
            <button onClick={() => fileInputRef.current.click()} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase shadow-md hover:bg-black"><Icons.Import /> Incluir</button>
            <button onClick={handleSequenciar} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase shadow-md hover:bg-black"><Icons.ListOrdered /> Sequenciar</button>
            <button onClick={handleJuncao} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase shadow-md hover:bg-black"><Icons.Layers /> Junção</button>
            <button onClick={() => {
              const rows = allocations.filter(i => i.status === 'Conferido').map(i => `${i.maquina}\t${i.item}\t${i.itemFinal}\t${i.quantidade}\t${i.ordemProducao}`).join('\n');
              copyToClipboard(rows, 'Copiado para Excel!');
            }} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase shadow-md hover:bg-black"><Icons.Copy /> Copiar Dados</button>
          </div>
        </section>

        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-slate-100">
                  <th className="px-4 py-5 bg-blue-600 text-white text-center w-16">Seq.</th>
                  <th className="px-6 py-5 bg-blue-600 text-white font-black uppercase text-[10px]">Máquina</th>
                  <th className="px-6 py-5 bg-blue-600 text-white font-black uppercase text-[10px]">Item</th>
                  <th className="px-6 py-5 bg-blue-600 text-white font-black uppercase text-[10px] text-center">Quantidade</th>
                  <th className="px-6 py-5 bg-yellow-400 text-slate-800 font-black uppercase text-[10px]">OP</th>
                  <th className="px-6 py-5 bg-yellow-400 text-slate-800 font-black uppercase text-[10px] text-center">Perda</th>
                  <th className="px-6 py-5 bg-yellow-400 text-slate-800 font-black uppercase text-[10px] text-center">Status</th>
                  <th className="px-6 py-5 bg-slate-800 text-white text-right font-black uppercase text-[10px]">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item, index) => {
                  const isLast = !filtered[index+1] || String(item.sequencia) !== String(filtered[index+1]?.sequencia);
                  return (
                    <React.Fragment key={item.id}>
                      <tr className="hover:bg-slate-50 transition-colors group">
                        <td className="px-4 py-4 text-center font-black text-blue-600">{item.sequencia || '-'}</td>
                        <td className="px-6 py-4 font-bold text-slate-700">{item.maquina || '-'}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{item.item || '-'}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center">
                             <span className="font-black text-blue-600 text-base">{formatQty(item.quantidade)}</span>
                             <span className="text-[9px] text-slate-400 uppercase font-black">kg</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-700">{item.ordemProducao || '-'}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleAddPerda(item)} className={`min-w-[64px] py-2 rounded-xl text-xs font-black border-2 ${(item.perdaCount || 0) > 0 ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-white text-slate-300 border-slate-100'}`}>{lossValue}</button>
                            {(item.perdaCount || 0) > 0 && <button onClick={() => handleResetPerda(item)} className="text-slate-300 hover:text-red-400"><Icons.Refresh /></button>}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button onClick={() => toggleStatus(item)} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase border ${item.status === 'Conferido' ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm' : 'bg-white text-slate-400 border-slate-200'}`}>{item.status}</button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => setAllocations(prev => prev.filter(a => a.id !== item.id))} className="text-slate-200 hover:text-red-500 p-2"><Icons.Trash /></button>
                        </td>
                      </tr>
                      {isLast && (
                        <tr className="bg-slate-200/30 border-b border-slate-200">
                           <td className="px-4 py-3 text-center font-black text-slate-300 text-[10px]">{item.sequencia}</td>
                           <td colSpan="7" className="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Fim da sequência</td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {discardedOps.length > 0 && (
          <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden max-w-2xl">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Icons.ClipboardList /> OPS DESCARTADAS</h2>
              <button onClick={handleCopyOP} className="px-5 py-2 bg-pink-500 text-white rounded-xl font-black text-[10px] uppercase shadow-lg">Copiar OP</button>
            </div>
            <div className="max-h-[200px] overflow-y-auto divide-y divide-slate-100">
               {discardedOps.map((op, idx) => <div key={idx} className="px-6 py-3 font-bold text-slate-700 text-xs flex justify-between"><span>{op.maquina}</span><span>{op.ordemProducao}</span></div>)}
            </div>
          </section>
        )}
      </main>

      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in zoom-in">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl">
            <h2 className="text-xl font-black text-slate-800 uppercase mb-6">Perda Padrão</h2>
            <input type="number" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-2xl font-black mb-6" value={lossValue} onChange={(e) => setLossValue(e.target.value)} />
            <button onClick={() => setIsSettingsOpen(false)} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl">Salvar</button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-lg shadow-2xl animate-in zoom-in">
            <h2 className="text-xl font-black text-slate-800 uppercase mb-8">{editingId ? 'Editar' : 'Nova'} Alocação</h2>
            <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
               <div className="col-span-2"><label className="text-[10px] font-black text-slate-400 uppercase">Máquina</label><input required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={formData.maquina} onChange={(e) => setFormData({...formData, maquina: e.target.value})} /></div>
               <div className="col-span-2"><label className="text-[10px] font-black text-slate-400 uppercase">Item</label><input required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={formData.item} onChange={(e) => setFormData({...formData, item: e.target.value})} /></div>
               <div><label className="text-[10px] font-black text-slate-400 uppercase">OP</label><input required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={formData.ordemProducao} onChange={(e) => setFormData({...formData, ordemProducao: e.target.value})} /></div>
               <div><label className="text-[10px] font-black text-slate-400 uppercase font-black text-blue-600">Qtd (kg)</label><input required type="number" step="0.01" className="w-full px-4 py-3 bg-slate-50 border border-blue-200 rounded-xl font-bold" value={formData.quantidade} onChange={(e) => setFormData({...formData, quantidade: e.target.value})} /></div>
               <button type="submit" className="col-span-2 mt-6 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">Salvar Alocação</button>
               <button type="button" onClick={() => setIsModalOpen(false)} className="col-span-2 py-2 text-slate-400 font-black text-[10px] uppercase">Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
