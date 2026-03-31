import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, collection, deleteDoc, writeBatch } from 'firebase/firestore';

// Ícones SVG Manuais
const Icons = {
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  Search: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
  Edit: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
  Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>,
  Pending: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>,
  Alert: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path></svg>,
  Import: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>,
  Layers: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline></svg>,
  Copy: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>,
  Settings: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
  X: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line></svg>,
  Pencil: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>,
  ListOrdered: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="10" y1="18" x2="21" y2="18"></line></svg>,
  Refresh: () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>,
  ClipboardList: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path></svg>,
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
const db = getFirestore(app);

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
    quantidade: '', ordemProducao: '', perdaCount: 0, status: 'Pendente'
  });

  // Autenticação e Sincronização em Tempo Real
  useEffect(() => {
    signInAnonymously(auth).catch(console.error);
    const unsubscribeAuth = onAuthStateChanged(auth, setUser);
    
    if (!window.XLSX) {
      const script = document.createElement('script');
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
      document.body.appendChild(script);
    }
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubAlloc = onSnapshot(collection(db, 'allocations'), (s) => {
      setAllocations(s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => (a.createdAt || 0) - (b.createdAt || 0)));
    });
    const unsubDisc = onSnapshot(collection(db, 'discarded'), (s) => {
      setDiscardedOps(s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => (a.createdAt || 0) - (b.createdAt || 0)));
    });
    const unsubSet = onSnapshot(doc(db, 'settings', 'config'), (d) => {
      if (d.exists()) setLossValue(d.data().lossValue || 200);
    });
    return () => { unsubAlloc(); unsubDisc(); unsubSet(); };
  }, [user]);

  // Lógica de Sequenciamento via Batch
  const handleSequenciar = async () => {
    if (allocations.length === 0 || !user) return;
    const batch = writeBatch(db);
    let currentSeq = 1;
    allocations.forEach((item, index, arr) => {
      if (index > 0 && String(item.item).toUpperCase() !== String(arr[index - 1].item).toUpperCase()) currentSeq++;
      batch.update(doc(db, 'allocations', item.id), { sequencia: currentSeq });
    });
    await batch.commit();
  };

  // Lógica de Junção Completa (Soma e Descarte)
  const handleJuncao = async () => {
    if (allocations.length === 0 || !user) return;
    const grouped = {};
    const discarded = [];
    allocations.forEach(item => {
      const seq = item.sequencia || 'sem-seq';
      if (!grouped[seq]) grouped[seq] = { ...item, itensFinaisAgrupados: item.itemFinal ? [item.itemFinal] : [] };
      else {
        grouped[seq].quantidade += item.quantidade;
        if (item.itemFinal && !grouped[seq].itensFinaisAgrupados.includes(item.itemFinal)) grouped[seq].itensFinaisAgrupados.push(item.itemFinal);
        discarded.push({ maquina: item.maquina, ordemProducao: item.ordemProducao, createdAt: Date.now() });
      }
    });
    const batch = writeBatch(db);
    allocations.forEach(i => batch.delete(doc(db, 'allocations', i.id)));
    Object.values(grouped).forEach(i => batch.set(doc(collection(db, 'allocations')), { ...i, createdAt: Date.now() }));
    discarded.forEach(d => batch.set(doc(collection(db, 'discarded')), d));
    await batch.commit();
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files[0]; if (!file || !user) return;
    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const wb = window.XLSX.read(evt.target.result, { type: 'binary' });
        const data = window.XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });
        const headers = data[0].map(h => String(h).toUpperCase().trim());
        const idx = { maq: headers.indexOf('MÁQUINA'), itm: headers.indexOf('ITEM'), itf: headers.indexOf('ITEM FINAL'), dsc: headers.indexOf('DESCRIÇÃO'), qtd: headers.indexOf('QUANTIDADE'), op: headers.indexOf('OP') };
        const batch = writeBatch(db);
        data.slice(1).filter(r => r[idx.maq]).forEach((r, i) => {
          let maq = String(r[idx.maq] || '').trim(); if (/^\d+$/.test(maq)) maq = `EXT${maq}`;
          batch.set(doc(collection(db, 'allocations')), {
            maquina: maq, item: String(r[idx.itm] || ''), itemFinal: String(r[idx.itf] || ''),
            descricao: String(r[idx.dsc] || ''), quantidade: parseFloat(String(r[idx.qtd]).replace(',', '.')) || 0,
            ordemProducao: String(r[idx.op] || ''), status: 'Pendente', createdAt: Date.now() + i, sequencia: ''
          });
        });
        await batch.commit();
      } catch (err) { alert("Erro no arquivo!"); }
      finally { setIsImporting(false); e.target.value = null; }
    };
    reader.readAsBinaryString(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const data = { ...formData, quantidade: parseFloat(String(formData.quantidade).replace(',', '.')) };
    if (editingId) await setDoc(doc(db, 'allocations', editingId), data, { merge: true });
    else await setDoc(doc(collection(db, 'allocations')), { ...data, createdAt: Date.now() });
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans pb-20">
      {copyFeedback && <div className="fixed top-4 right-4 z-[100] px-6 py-3 rounded-xl bg-emerald-500 text-white shadow-2xl animate-bounce">{copyFeedback.message}</div>}
      <input type="file" ref={fileInputRef} onChange={handleImportExcel} accept=".xlsx, .xls" className="hidden" />

      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 p-4 shadow-sm flex justify-between items-center">
        <h1 className="text-xl font-black text-slate-800 uppercase">Alocação MG1 - PCP</h1>
        <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-slate-400 hover:text-blue-600 transition-all"><Icons.Settings /></button>
      </header>

      <main className="max-w-[1600px] mx-auto p-6 space-y-6">
        {/* Barra de Ferramentas com Botões Pretos */}
        <section className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-center justify-between">
          <div className="relative flex-1 min-w-[300px]">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Icons.Search /></span>
            <input type="text" placeholder="Filtrar por Máquina, Item ou OP..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 ring-blue-500/10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => fileInputRef.current.click()} disabled={isImporting} className="px-5 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase shadow-md hover:bg-black transition-all flex items-center gap-2"><Icons.Import /> Incluir</button>
            <button onClick={handleSequenciar} className="px-5 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase shadow-md hover:bg-black transition-all flex items-center gap-2"><Icons.ListOrdered /> Sequenciar</button>
            <button onClick={handleJuncao} className="px-5 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase shadow-md hover:bg-black transition-all flex items-center gap-2"><Icons.Layers /> Junção</button>
            <button onClick={() => { setIsQtyOnlyMode(false); setEditingId(null); setFormData({ sequencia: '', maquina: '', item: '', itemFinal: '', descricao: '', quantidade: '', ordemProducao: '', perdaCount: 0, status: 'Pendente' }); setIsModalOpen(true); }} className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg hover:bg-blue-700 transition-all">+ Nova Alocação</button>
            <button onClick={() => setIsClearModalOpen(true)} className="px-6 py-3 bg-red-50 text-red-600 rounded-2xl font-black text-[10px] uppercase border border-red-100 hover:bg-red-600 hover:text-white transition-all">Limpar Tudo</button>
          </div>
        </section>

        {/* Tabela Principal */}
        <section className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left">
              <thead>
                <tr className="text-white font-black text-[10px] uppercase tracking-widest divide-x divide-white/10">
                  <th className="px-6 py-5 bg-blue-600 text-center w-20">Seq.</th>
                  <th className="px-6 py-5 bg-blue-600">Máquina</th>
                  <th className="px-6 py-5 bg-blue-600">Item</th>
                  <th className="px-6 py-5 bg-blue-600">Item Final</th>
                  <th className="px-6 py-5 bg-blue-600 text-center">Quantidade</th>
                  <th className="px-6 py-5 bg-yellow-400 text-slate-800">OP</th>
                  <th className="px-6 py-5 bg-yellow-400 text-slate-800 text-center">Perda</th>
                  <th className="px-6 py-5 bg-yellow-400 text-slate-800 text-center">Status</th>
                  <th className="px-6 py-5 bg-slate-800 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allocations.filter(a => a.maquina.toLowerCase().includes(searchTerm.toLowerCase()) || a.item.toLowerCase().includes(searchTerm.toLowerCase()) || a.ordemProducao.toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 text-center font-black text-blue-600">{item.sequencia}</td>
                    <td className="px-6 py-4 font-bold text-slate-700">{item.maquina}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">{item.item}</td>
                    <td className="px-6 py-4 text-xs text-slate-400 font-mono">{item.itemFinal || '-'}</td>
                    <td className="px-6 py-4 text-center">
                       <span className="font-black text-blue-600 text-lg block">{item.quantidade.toLocaleString('pt-BR', {minimumFractionDigits:2})}</span>
                       <span className="text-[9px] font-black text-slate-300 uppercase">kg</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">{item.ordemProducao}</td>
                    <td className="px-6 py-4 text-center">
                       <div className="flex items-center justify-center gap-2">
                         <button onClick={async () => await setDoc(doc(db, 'allocations', item.id), { perdaCount: (item.perdaCount || 0) + 1, quantidade: item.quantidade + parseFloat(lossValue) }, { merge: true })} className={`px-4 py-2 rounded-xl text-xs font-black border-2 transition-all ${(item.perdaCount || 0) > 0 ? 'bg-emerald-500 border-emerald-600 text-white shadow-md' : 'bg-white border-slate-100 text-slate-300'}`}>{lossValue}</button>
                         {item.perdaCount > 0 && <button onClick={async () => await setDoc(doc(db, 'allocations', item.id), { perdaCount: 0, quantidade: item.quantidade - (item.perdaCount * lossValue) }, { merge: true })} className="text-slate-300 hover:text-red-500"><Icons.Refresh /></button>}
                       </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <button onClick={async () => await setDoc(doc(db, 'allocations', item.id), { status: item.status === 'Pendente' ? 'Conferido' : 'Pendente' }, { merge: true })} className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${item.status === 'Conferido' ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-white border-slate-200 text-slate-400'}`}>{item.status}</button>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button onClick={async () => { if(window.confirm('Eliminar?')) await deleteDoc(doc(db, 'allocations', item.id)); }} className="text-slate-200 hover:text-red-500 transition-colors p-2"><Icons.Trash /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* OPS DESCARTADAS */}
        {discardedOps.length > 0 && (
          <section className="bg-white rounded-3xl p-6 border border-slate-200 max-w-2xl">
            <div className="flex justify-between items-center mb-4 border-b pb-4">
              <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Icons.ClipboardList /> OPS DESCARTADAS (JUNÇÃO)</h2>
              <button onClick={() => { navigator.clipboard.writeText(discardedOps.map(o => o.ordemProducao).join('\n')); alert("Lista de OPs Copiada!"); }} className="px-5 py-2 bg-pink-500 text-white rounded-xl font-black text-[10px] uppercase shadow-lg shadow-pink-100 hover:bg-pink-600 transition-all">Copiar Todas as OPs</button>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
               {discardedOps.map(op => <div key={op.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between text-[11px] font-bold"><span>{op.maquina}</span><span className="text-slate-400">{op.ordemProducao}</span></div>)}
            </div>
          </section>
        )}
      </main>

      {/* MODAL CONFIGURAÇÃO */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl animate-in zoom-in">
            <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-black text-slate-800 uppercase">Ajustes</h2><button onClick={() => setIsSettingsOpen(false)}><Icons.X /></button></div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Valor de Perda Padrão (kg)</label>
            <input type="number" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-2xl font-black mb-8" value={lossValue} onChange={e => setLossValue(e.target.value)} />
            <button onClick={async () => { await setDoc(doc(db, 'settings', 'config'), { lossValue: parseFloat(lossValue) }); setIsSettingsOpen(false); }} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-100">Salvar Definições</button>
          </div>
        </div>
      )}

      {/* MODAL CADASTRO/EDIÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto py-20">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl animate-in zoom-in">
            <h2 className="text-xl font-black text-slate-800 uppercase mb-8">{editingId ? 'Editar Alocação' : 'Nova Alocação'}</h2>
            <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
               <div className="col-span-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-2">Máquina</label><input required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={formData.maquina} onChange={e => setFormData({...formData, maquina: e.target.value})} /></div>
               <div><label className="text-[10px] font-black text-slate-400 uppercase ml-2">Item</label><input required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={formData.item} onChange={e => setFormData({...formData, item: e.target.value})} /></div>
               <div><label className="text-[10px] font-black text-slate-400 uppercase ml-2">Item Final</label><input className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={formData.itemFinal} onChange={e => setFormData({...formData, itemFinal: e.target.value})} /></div>
               <div><label className="text-[10px] font-black text-slate-400 uppercase ml-2">OP</label><input required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={formData.ordemProducao} onChange={e => setFormData({...formData, ordemProducao: e.target.value})} /></div>
               <div><label className="text-[10px] font-black text-slate-400 uppercase ml-2">Quantidade (kg)</label><input required type="number" step="0.01" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" value={formData.quantidade} onChange={e => setFormData({...formData, quantidade: e.target.value})} /></div>
               <button type="submit" className="col-span-2 mt-6 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">Salvar Alocação</button>
               <button type="button" onClick={() => setIsModalOpen(false)} className="col-span-2 py-2 text-slate-400 font-black text-[10px] uppercase">Cancelar</button>
            </form>
          </div>
        </div>
      )}

      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 5px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }`}</style>
    </div>
  );
};

export default App;
