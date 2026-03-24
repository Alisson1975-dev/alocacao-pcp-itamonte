import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

// Ícones SVG Manuais para estabilidade
const Icons = {
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  Search: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
  Import: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>,
  Layers: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline></svg>,
  Copy: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>,
  Settings: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
  Refresh: () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>,
  ListOrdered: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="10" y1="18" x2="21" y2="18"></line></svg>,
  Pending: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>,
  X: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
};

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

export default function App() {
  const [user, setUser] = useState(null);
  const [allocations, setAllocations] = useState([]);
  const [discardedOps, setDiscardedOps] = useState([]);
  const [lossValue, setLossValue] = useState(200);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    signInAnonymously(auth).catch(console.error);
    onAuthStateChanged(auth, setUser);
    if (!window.XLSX) {
      const script = document.createElement('script');
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, 'settings', 'config_alocacao'), (d) => {
      if (d.exists()) setLossValue(d.data().lossValue || 200);
    });
    return () => unsub();
  }, [user]);

  // FUNÇÃO DE IMPORTAÇÃO
  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = window.XLSX.read(bstr, { type: 'binary' });
      const data = window.XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });
      const headers = data[0].map(h => String(h).toUpperCase().trim());
      const rows = data.slice(1);
      const idx = { maq: headers.indexOf('MÁQUINA'), itm: headers.indexOf('ITEM'), itf: headers.indexOf('ITEM FINAL'), qtd: headers.indexOf('QUANTIDADE'), op: headers.indexOf('OP'), dsc: headers.indexOf('DESCRIÇÃO') };
      
      const newItems = rows.filter(r => r[idx.maq]).map((r, i) => ({
        id: Date.now() + i,
        maquina: String(r[idx.maq] || ''),
        item: String(r[idx.itm] || ''),
        itemFinal: String(r[idx.itf] || ''),
        descricao: String(r[idx.dsc] || ''),
        quantidade: parseFloat(String(r[idx.qtd] || '0').replace(',', '.')) || 0,
        ordemProducao: String(r[idx.op] || ''),
        sequencia: '', perdaCount: 0, status: 'PENDENTE'
      }));
      setAllocations(prev => [...prev, ...newItems]);
      e.target.value = null;
    };
    reader.readAsBinaryString(file);
  };

  // LÓGICA DE SEQUENCIAMENTO
  const handleSequenciar = () => {
    let currentSeq = 1;
    const sequenced = allocations.map((item, index, arr) => {
      if (index > 0 && String(item.item) !== String(arr[index - 1].item)) currentSeq++;
      return { ...item, sequencia: currentSeq };
    });
    setAllocations(sequenced);
  };

  // LÓGICA DE JUNÇÃO E OPs DESCARTADAS
  const handleJuncao = () => {
    const grouped = {};
    const discarded = [];
    allocations.forEach(item => {
      const seq = item.sequencia || 'sem-seq';
      if (!grouped[seq]) {
        grouped[seq] = { ...item };
      } else {
        grouped[seq].quantidade += item.quantidade;
        discarded.push({ maquina: item.maquina, ordemProducao: item.ordemProducao });
      }
    });
    setAllocations(Object.values(grouped));
    setDiscardedOps(prev => [...prev, ...discarded]);
  };

  // FUNÇÕES DE PERDA
  const handlePerda = (id) => {
    setAllocations(prev => prev.map(item => item.id === id ? { ...item, perdaCount: (item.perdaCount || 0) + 1, quantidade: item.quantidade + parseFloat(lossValue) } : item));
  };

  const resetPerda = (id) => {
    setAllocations(prev => prev.map(item => {
      if (item.id === id) {
        const subtrair = (item.perdaCount || 0) * parseFloat(lossValue);
        return { ...item, perdaCount: 0, quantidade: item.quantidade - subtrair };
      }
      return item;
    }));
  };

  // COPIAR PARA EXCEL
  const handleCopyData = () => {
    const rows = allocations.map(i => `${i.maquina}\t${i.item}\t${i.itemFinal}\t${i.quantidade.toLocaleString('pt-BR')}\t${i.ordemProducao}`).join('\n');
    navigator.clipboard.writeText(rows);
    setCopyFeedback("Copiado!"); setTimeout(() => setCopyFeedback(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans pb-20">
      <input type="file" ref={fileInputRef} onChange={handleImportExcel} accept=".xlsx, .xls" className="hidden" />
      {copyFeedback && <div className="fixed top-4 right-4 z-[100] px-6 py-3 rounded-xl bg-slate-900 text-white font-bold animate-bounce">{copyFeedback}</div>}

      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 p-4 shadow-sm flex justify-between items-center">
        <h1 className="text-xl font-black text-[#1e293b] uppercase">Alocação MG1 - PCP</h1>
        <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-slate-400 hover:text-blue-600"><Icons.Settings /></button>
      </header>

      <main className="max-w-[1600px] mx-auto p-6 space-y-6">
        {/* BARRA DE FERRAMENTAS */}
        <section className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-center justify-between">
          <div className="relative flex-1 min-w-[300px]">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Icons.Search /></span>
            <input type="text" placeholder="Pesquisar..." className="w-full pl-12 pr-4 py-3 bg-[#f1f5f9] border border-slate-200 rounded-2xl outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => fileInputRef.current.click()} className="px-5 py-3 bg-[#0f172a] text-white rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 hover:bg-black transition-all"><Icons.Import /> Incluir</button>
            <button onClick={handleSequenciar} className="px-5 py-3 bg-[#0f172a] text-white rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 hover:bg-black transition-all"><Icons.ListOrdered /> Sequenciar</button>
            <button onClick={handleJuncao} className="px-5 py-3 bg-[#0f172a] text-white rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 hover:bg-black transition-all"><Icons.Layers /> Junção</button>
            <button onClick={handleCopyData} className="px-5 py-3 bg-[#0f172a] text-white rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 hover:bg-black transition-all"><Icons.Copy /> Copiar Dados</button>
          </div>
          <div className="flex gap-2">
             <button className="px-6 py-3 bg-[#2563eb] text-white rounded-2xl font-black text-[10px] uppercase shadow-lg">+ Nova Alocação</button>
             <button onClick={() => { setAllocations([]); setDiscardedOps([]); }} className="px-6 py-3 bg-red-50 text-red-600 rounded-2xl font-black text-[10px] uppercase border border-red-100">Limpar</button>
          </div>
        </section>

        {/* TABELA PRINCIPAL */}
        <section className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-white font-black text-[10px] uppercase tracking-widest divide-x divide-white/10">
                  <th className="px-6 py-5 bg-[#2563eb] text-center w-16">Seq.</th>
                  <th className="px-6 py-5 bg-[#2563eb]">Máquina</th>
                  <th className="px-6 py-5 bg-[#2563eb]">Item</th>
                  <th className="px-6 py-5 bg-[#2563eb]">Item Final</th>
                  <th className="px-6 py-5 bg-[#2563eb] text-center">Quantidade</th>
                  <th className="px-6 py-5 bg-[#facc15] text-[#1e293b]">OP</th>
                  <th className="px-6 py-5 bg-[#facc15] text-[#1e293b] text-center">Perda</th>
                  <th className="px-6 py-5 bg-[#facc15] text-[#1e293b] text-center">Status</th>
                  <th className="px-6 py-5 bg-[#1e293b] text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allocations.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-5 text-center font-black text-blue-600">{item.sequencia}</td>
                    <td className="px-6 py-5 font-black text-slate-700">{item.maquina}</td>
                    <td className="px-6 py-5 text-sm font-bold text-slate-400">{item.item}</td>
                    <td className="px-6 py-5 text-sm text-slate-400 font-bold">{item.itemFinal || '-'}</td>
                    <td className="px-6 py-5 text-center">
                       <span className="font-black text-[#2563eb] text-lg block">{item.quantidade.toLocaleString('pt-BR', {minimumFractionDigits:2})}</span>
                       <span className="text-[9px] font-black text-slate-400 uppercase">kg</span>
                    </td>
                    <td className="px-6 py-5 font-bold text-slate-700">{item.ordemProducao}</td>
                    <td className="px-6 py-5">
                       <div className="flex items-center justify-center gap-2">
                         <button onClick={() => handlePerda(item.id)} className="bg-[#10b981] text-white px-5 py-2 rounded-xl font-black text-xs shadow-sm hover:scale-105 active:scale-95 transition-all">{lossValue}</button>
                         {item.perdaCount > 0 && (
                           <div className="flex flex-col items-start">
                             <span className="bg-emerald-50 text-emerald-600 text-[10px] px-1.5 py-0.5 rounded-md font-black border border-emerald-100">{item.perdaCount}x</span>
                             <button onClick={() => resetPerda(item.id)} className="text-[8px] text-slate-300 hover:text-red-500 font-bold flex items-center gap-0.5"><Icons.Refresh /> reset</button>
                           </div>
                         )}
                       </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                       <button onClick={() => setAllocations(prev => prev.map(i => i.id === item.id ? {...i, status: i.status === 'PENDENTE' ? 'CONFERIDO' : 'PENDENTE'} : i))} className={`px-5 py-2 rounded-full border text-[9px] font-black tracking-widest flex items-center gap-2 mx-auto ${item.status === 'CONFERIDO' ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-white border-slate-200 text-slate-400'}`}>
                         <Icons.Pending /> {item.status}
                       </button>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <button onClick={() => setAllocations(prev => prev.filter(i => i.id !== item.id))} className="text-slate-200 hover:text-red-500 p-2"><Icons.Trash /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* OPS DESCARTADAS */}
        {discardedOps.length > 0 && (
          <section className="bg-white rounded-3xl p-6 border border-slate-200 max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">OPs Descartadas (Junção)</h2>
              <button onClick={() => { navigator.clipboard.writeText(discardedOps.map(o => o.ordemProducao).join('\n')); }} className="px-4 py-1.5 bg-pink-500 text-white rounded-xl text-[10px] font-black uppercase">Copiar OPs</button>
            </div>
            <div className="max-h-40 overflow-y-auto space-y-1">
               {discardedOps.map((op, idx) => <div key={idx} className="text-xs font-bold text-slate-500 flex justify-between bg-slate-50 p-2 rounded-lg"><span>{op.maquina}</span><span>{op.ordemProducao}</span></div>)}
            </div>
          </section>
        )}
      </main>

      {/* MODAL CONFIG */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm animate-in zoom-in">
            <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-black text-slate-800 uppercase">Ajustes</h2><button onClick={() => setIsSettingsOpen(false)}><Icons.X /></button></div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Perda Padrão (kg)</label>
            <input type="number" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-2xl font-black mb-6" value={lossValue} onChange={e => setLossValue(e.target.value)} />
            <button onClick={async () => { await setDoc(doc(db, 'settings', 'config_alocacao'), { lossValue: parseFloat(lossValue) }); setIsSettingsOpen(false); }} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs">Salvar</button>
          </div>
        </div>
      )}
    </div>
  );
}
