import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';

// Ícones SVG para estabilidade e velocidade
const Icons = {
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  Search: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" cy="21" x2="16.65" y2="16.65"></line></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
  Edit: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
  Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>,
  Pending: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>,
  Alert: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path></svg>,
  Import: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>,
  Layers: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline></svg>,
  Copy: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>,
  Save: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline></svg>,
  Settings: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
  X: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  Pencil: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>,
  ListOrdered: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="10" y1="18" x2="21" y2="18"></line></svg>,
  Refresh: () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>,
  ClipboardList: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>,
  Loader2: ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
};

// --- CONFIGURAÇÃO FIREBASE ITAMONTE ---
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
  const [isSaving, setIsSaving] = useState(false);
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

  const stateDocRef = doc(db, 'settings', 'snapshot_alocacao');

  useEffect(() => {
    signInAnonymously(auth).catch(console.error);
    onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const docSnap = await getDoc(stateDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.allocations) setAllocations(data.allocations);
          if (data.discardedOps) setDiscardedOps(data.discardedOps);
          if (data.lossValue) setLossValue(data.lossValue);
        }
      }
    });
    if (!window.XLSX) {
      const script = document.createElement('script');
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
      document.body.appendChild(script);
    }
  }, []);

  const handleSaveToCloud = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await setDoc(stateDocRef, { allocations, discardedOps, lossValue, updatedAt: Date.now() });
      setCopyFeedback({ type: 'success', message: 'Tudo guardado na nuvem!' });
    } catch (err) { setCopyFeedback({ type: 'error', message: 'Erro ao salvar.' }); }
    finally { setIsSaving(false); setTimeout(() => setCopyFeedback(null), 3000); }
  };

  const formatQty = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return "0,00";
    return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(num);
  };

  const handleSequenciar = () => {
    let currentSeq = 1;
    const sequenced = allocations.map((item, index, arr) => {
      if (index > 0 && String(item.item || '').trim().toUpperCase() !== String(arr[index - 1].item || '').trim().toUpperCase()) currentSeq++;
      return { ...item, sequencia: currentSeq };
    });
    setAllocations(sequenced);
  };

  const handleJuncao = () => {
    const grouped = {};
    const discarded = [];
    allocations.forEach((item) => {
      const seq = item.sequencia || 'sem-seq';
      const cleanIF = String(item.itemFinal || '').trim();
      if (!grouped[seq]) {
        grouped[seq] = { ...item, quantidade: parseFloat(item.quantidade) || 0, itensFinaisAgrupados: cleanIF ? [cleanIF] : [] };
      } else {
        grouped[seq].quantidade += (parseFloat(item.quantidade) || 0);
        if (cleanIF && !grouped[seq].itensFinaisAgrupados.includes(cleanIF)) grouped[seq].itensFinaisAgrupados.push(cleanIF);
        discarded.push({ maquina: item.maquina, ordemProducao: item.ordemProducao });
      }
    });
    setAllocations(Object.values(grouped));
    setDiscardedOps(prev => [...prev, ...discarded]);
  };

  const handleClearAll = async () => {
    setAllocations([]);
    setDiscardedOps([]);
    if (user) await deleteDoc(stateDocRef);
    setIsClearModalOpen(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const qty = parseFloat(String(formData.quantidade).replace(',', '.'));
    const dataToSave = { ...formData, quantidade: isNaN(qty) ? 0 : qty };
    if (editingId) setAllocations(prev => prev.map(item => item.id === editingId ? { ...dataToSave, id: editingId } : item));
    else setAllocations(prev => [...prev, { ...dataToSave, id: Date.now() }]);
    setIsModalOpen(false);
  };

  const filtered = useMemo(() => allocations.filter(i => 
    String(i.maquina).toLowerCase().includes(searchTerm.toLowerCase()) || 
    String(i.item).toLowerCase().includes(searchTerm.toLowerCase()) || 
    String(i.ordemProducao).toLowerCase().includes(searchTerm.toLowerCase())
  ), [allocations, searchTerm]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans pb-20">
      {copyFeedback && <div className={`fixed top-4 right-4 z-[100] px-6 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 bg-emerald-500 text-white border-emerald-400`}><Icons.Check /> <span className="font-bold text-sm uppercase">{copyFeedback.message}</span></div>}
      
      <header className="bg-white border-b border-slate-200 p-4 sticky top-0 z-10 shadow-sm flex justify-between items-center">
        <h1 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Alocação MG1 - PCP</h1>
        <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-slate-400 hover:text-blue-600 transition-all"><Icons.Settings /></button>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-8 space-y-6">
        {/* BARRA DE FERRAMENTAS - IGUAL AO PRINT */}
        <section className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[300px] relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Icons.Search /></span>
            <input type="text" placeholder="Pesquisar..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsModalOpen(true)} className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs shadow-lg">+ Nova Alocação</button>
            <button onClick={handleSaveToCloud} className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs shadow-lg flex items-center gap-2">
               {isSaving ? <Icons.Loader2 className="animate-spin" /> : 'Salvar'}
            </button>
            <button onClick={() => setIsClearModalOpen(true)} className="px-6 py-3 bg-red-50 text-red-600 border border-red-100 rounded-2xl font-black uppercase text-xs">Limpar</button>
          </div>
          <div className="w-full flex flex-wrap gap-2 mt-2 pt-4 border-t border-slate-100">
            <button onClick={() => fileInputRef.current.click()} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase flex items-center gap-2"><Icons.Import /> Incluir</button>
            <button onClick={handleSequenciar} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase flex items-center gap-2"><Icons.ListOrdered /> Sequenciar</button>
            <button onClick={handleJuncao} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase flex items-center gap-2"><Icons.Layers /> Junção</button>
            <button onClick={() => {}} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase flex items-center gap-2"><Icons.Copy /> Copiar Dados</button>
          </div>
        </section>

        {/* TABELA PRINCIPAL COM BLOCO DE FUNÇÃO E ITENS FINAIS */}
        <section className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-slate-100 font-black text-[10px] uppercase divide-x divide-white/10">
                  <th className="px-6 py-5 bg-blue-600 text-white text-center w-20">Seq.</th>
                  <th className="px-6 py-5 bg-blue-600 text-white">Máquina</th>
                  <th className="px-6 py-5 bg-blue-600 text-white">Item</th>
                  <th className="px-6 py-5 bg-blue-600 text-white">Item Final</th>
                  <th className="px-6 py-5 bg-blue-600 text-white">Descrição</th>
                  <th className="px-6 py-5 bg-blue-600 text-white text-center">Quantidade</th>
                  <th className="px-6 py-5 bg-yellow-400 text-slate-800">OP</th>
                  <th className="px-6 py-5 bg-yellow-400 text-slate-800 text-center">Perda</th>
                  <th className="px-6 py-5 bg-yellow-400 text-slate-800 text-center">Status</th>
                  <th className="px-6 py-5 bg-slate-800 text-white text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item, index) => {
                  const nextItem = filtered[index + 1];
                  const isLastOfSeq = !nextItem || String(item.sequencia) !== String(nextItem?.sequencia);
                  return (
                    <React.Fragment key={item.id}>
                      <tr className="hover:bg-slate-50 group">
                        <td className="px-6 py-4 text-center font-black text-blue-600">{item.sequencia || '-'}</td>
                        <td className="px-6 py-4 font-bold text-slate-700">{item.maquina}</td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-500">{item.item}</td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-400">{item.itemFinal || '-'}</td>
                        <td className="px-6 py-4 text-[10px] font-bold text-slate-400 max-w-[200px] truncate uppercase">{item.descricao || '-'}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-black text-blue-600 text-base block">{formatQty(item.quantidade)}</span>
                          <span className="text-[9px] font-black text-slate-300 uppercase">kg</span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-700">{item.ordemProducao}</td>
                        <td className="px-6 py-4 text-center">
                           <button className="px-4 py-1.5 rounded-xl border text-slate-300 text-xs font-black">{lossValue}</button>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <button className="px-4 py-1.5 rounded-full border text-[9px] font-black uppercase text-slate-400 flex items-center gap-2 mx-auto"><Icons.Pending /> {item.status}</button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => setAllocations(prev => prev.filter(i => i.id !== item.id))} className="text-slate-200 hover:text-red-600 p-2"><Icons.Trash /></button>
                        </td>
                      </tr>
                      {isLastOfSeq && (
                        <tr className="bg-slate-200/30 border-b border-slate-300">
                          <td className="px-6 py-3 text-center font-black text-slate-300 text-[10px]">{item.sequencia}</td>
                          <td colSpan="9" className="px-6 py-2">
                             <div className="flex items-center gap-3">
                               {item.itensFinaisAgrupados && item.itensFinaisAgrupados.length > 0 ? (
                                 <><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ITENS FINAIS:</span><span className="text-[12px] font-black text-black uppercase tracking-tight">{item.itensFinaisAgrupados.join(' / ')}</span></>
                               ) : <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] italic">BLOCO DE FUNÇÃO</span>}
                             </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* OPS DESCARTADAS COM O BADGE DA CONTAGEM */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden max-w-2xl">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icons.ClipboardList />
              <h2 className="text-xs font-black text-slate-600 uppercase tracking-widest">OPS DESCARTADAS</h2>
              <span className="bg-slate-200 text-slate-500 px-2.5 py-0.5 rounded-lg text-[11px] font-black min-w-[24px] text-center">
                {discardedOps.length}
              </span>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(discardedOps.map(o => o.ordemProducao).join('\n')); alert("Copiado!"); }} className="flex items-center gap-2 px-5 py-2 bg-pink-500 text-white rounded-xl font-black text-[10px] uppercase shadow-lg hover:bg-pink-600 transition-all active:scale-95"><Icons.Copy /> Copiar OP</button>
          </div>
          <div className="max-h-[200px] overflow-y-auto divide-y divide-slate-100">
             {discardedOps.map((op, idx) => <div key={idx} className="px-6 py-3 font-bold text-slate-700 text-xs flex justify-between"><span>{op.maquina}</span><span className="font-mono text-slate-400">{op.ordemProducao}</span></div>)}
          </div>
        </section>
      </main>

      <input type="file" ref={fileInputRef} onChange={handleImportExcel} className="hidden" />
    </div>
  );
};

export default App;
