import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

// Ícones SVG para estabilidade total
const Icons = {
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  Search: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
  Edit: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
  Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>,
  Import: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>,
  Layers: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline></svg>,
  Copy: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>,
  Settings: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
  X: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  ListOrdered: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="10" y1="18" x2="21" y2="18"></line></svg>,
};

// Configuração Firebase PCP Itamonte (CHAVES REAIS)
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
  const [lossValue, setLossValue] = useState(200);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    signInAnonymously(auth).catch(console.error);
    onAuthStateChanged(auth, setUser);
    
    // Carregar biblioteca XLSX dinamicamente
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
      
      const idx = {
        maq: headers.indexOf('MÁQUINA'),
        item: headers.indexOf('ITEM'),
        if: headers.indexOf('ITEM FINAL'),
        qtd: headers.indexOf('QUANTIDADE'),
        op: headers.indexOf('OP')
      };

      const newItems = rows.filter(r => r[idx.maq]).map((r, i) => ({
        id: Date.now() + i,
        maquina: String(r[idx.maq] || ''),
        item: String(r[idx.item] || ''),
        itemFinal: String(r[idx.if] || ''),
        quantidade: parseFloat(String(r[idx.qtd] || '0').replace(',', '.')) || 0,
        ordemProducao: String(r[idx.op] || ''),
        sequencia: ''
      }));

      setAllocations(prev => [...prev, ...newItems]);
      e.target.value = null;
    };
    reader.readAsBinaryString(file);
  };

  const handleSequenciar = () => {
    let currentSeq = 1;
    const sequenced = allocations.map((item, index, arr) => {
      if (index > 0 && String(item.item) !== String(arr[index - 1].item)) currentSeq++;
      return { ...item, sequencia: currentSeq };
    });
    setAllocations(sequenced);
  };

  const handleJuncao = () => {
    const grouped = {};
    allocations.forEach(item => {
      const seq = item.sequencia || 'sem-seq';
      if (!grouped[seq]) {
        grouped[seq] = { ...item };
      } else {
        grouped[seq].quantidade += item.quantidade;
      }
    });
    setAllocations(Object.values(grouped));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <input type="file" ref={fileInputRef} onChange={handleImportExcel} accept=".xlsx, .xls" className="hidden" />
      
      <header className="max-w-[1400px] mx-auto mb-8 flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <h1 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Alocação MG1 - PCP</h1>
        <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-slate-400 hover:text-blue-600 transition-all"><Icons.Settings /></button>
      </header>

      <main className="max-w-[1400px] mx-auto space-y-6">
        <section className="bg-white p-4 rounded-[2rem] shadow-sm border border-slate-200 flex flex-wrap gap-3">
          <div className="flex-1 min-w-[300px] relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Icons.Search /></span>
            <input type="text" placeholder="Filtrar por item, máquina ou OP..." className="w-full pl-12 pr-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 ring-blue-500/10 transition-all text-sm font-medium" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-2">
            {/* BOTÕES PRETOS CONFORME SOLICITADO */}
            <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all shadow-lg"><Icons.Import /> Incluir</button>
            <button onClick={handleSequenciar} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all shadow-lg"><Icons.ListOrdered /> Sequenciar</button>
            <button onClick={handleJuncao} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all shadow-lg"><Icons.Layers /> Junção</button>
          </div>
        </section>

        <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest">
                  <th className="px-6 py-5 border-r border-blue-500 w-20 text-center">Seq.</th>
                  <th className="px-6 py-5 border-r border-blue-500">Máquina</th>
                  <th className="px-6 py-5 border-r border-blue-500">Item</th>
                  <th className="px-6 py-5 border-r border-blue-500 text-center">Qtd (kg)</th>
                  <th className="px-6 py-5 bg-yellow-400 text-slate-800 border-r border-yellow-500">OP</th>
                  <th className="px-6 py-5 bg-slate-800 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allocations.filter(a => a.item.toLowerCase().includes(searchTerm.toLowerCase()) || a.ordemProducao.toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 font-black text-blue-600 text-center">{item.sequencia}</td>
                    <td className="px-6 py-4 font-bold text-slate-700 whitespace-nowrap">{item.maquina}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">{item.item}</td>
                    <td className="px-6 py-4 font-black text-slate-800 tabular-nums text-center">{item.quantidade.toLocaleString('pt-BR', {minimumFractionDigits:2})}</td>
                    <td className="px-6 py-4 font-bold text-slate-600 whitespace-nowrap">{item.ordemProducao}</td>
                    <td className="px-6 py-4 text-right">
                       <button onClick={() => setAllocations(prev => prev.filter(i => i.id !== item.id))} className="text-slate-300 hover:text-red-500 p-2"><Icons.Trash /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Modal Ajustes */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl animate-in zoom-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-800 uppercase">Ajustes</h2>
              <button onClick={() => setIsSettingsOpen(false)}><Icons.X /></button>
            </div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Perda Padrão (kg)</label>
            <input type="number" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-2xl font-black mb-8" value={lossValue} onChange={e => setLossValue(e.target.value)} />
            <button onClick={async () => {
              await setDoc(doc(db, 'settings', 'config_alocacao'), { lossValue: parseFloat(lossValue) });
              setIsSettingsOpen(false);
            }} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-100">Salvar</button>
          </div>
        </div>
      )}
    </div>
  );
}
