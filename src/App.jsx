import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { 
  Plus, Search, Trash2, Edit2, CheckCircle2, CircleDashed, 
  AlertTriangle, FileUp, Layers, Copy, Check, Loader2, Pencil, 
  Settings, X, ListOrdered 
} from 'lucide-react';

// Suas credenciais reais do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDpU5eiP4szN0FKkVfd51wqISEuHuPq1zU",
  authDomain: "pcp-alocacao-itamonte.firebaseapp.com",
  projectId: "pcp-alocacao-itamonte",
  storageBucket: "pcp-alocacao-itamonte.firebasestorage.app",
  messagingSenderId: "376351536779",
  appId: "1:376351536779:web:2c46c62d8b8a47f8c3468e"
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
    quantidade: '', ordemProducao: '', isPerdaActive: false, status: 'Pendente'
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (!u) signInAnonymously(auth);
      else setUser(u);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, 'config', 'settings'), (snap) => {
      if (snap.exists()) setLossValue(snap.data().lossValue);
    });
    return () => unsub();
  }, [user]);

  const saveSettings = async (val) => {
    await setDoc(doc(db, 'config', 'settings'), { lossValue: parseFloat(val) }, { merge: true });
    setIsSettingsOpen(false);
    setCopyFeedback({ type: 'success', message: 'Configuração salva!' });
  };

  const formatQty = (v) => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(parseFloat(v) || 0);

  useEffect(() => {
    const s = document.createElement('script');
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    document.body.appendChild(s);
  }, []);

  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = window.XLSX.read(evt.target.result, { type: 'binary' });
        const data = window.XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });
        const headers = data[0].map(h => String(h).toUpperCase().trim());
        const rows = data.slice(1);
        const idx = { maquina: headers.indexOf('MÁQUINA'), item: headers.indexOf('ITEM'), itemFinal: headers.indexOf('ITEM FINAL'), descricao: headers.indexOf('DESCRIÇÃO'), quantidade: headers.indexOf('QUANTIDADE'), op: headers.indexOf('OP') };
        const newItems = rows.filter(r => r[idx.maquina]).map((r, i) => ({
          id: Date.now() + i, maquina: r[idx.maquina], item: r[idx.item], itemFinal: r[idx.itemFinal], descricao: r[idx.descricao],
          quantidade: parseFloat(String(r[idx.quantidade]).replace(',','.')) || 0, ordemProducao: r[idx.op], status: 'Pendente'
        }));
        setAllocations(prev => [...prev, ...newItems]);
      } catch (err) { alert("Erro no Excel"); }
      finally { setIsImporting(false); }
    };
    reader.readAsBinaryString(file);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const dataToSave = { ...formData, quantidade: parseFloat(String(formData.quantidade).replace(',', '.')) || 0 };
    if (editingId) setAllocations(prev => prev.map(item => item.id === editingId ? { ...dataToSave, id: editingId } : item));
    else setAllocations(prev => [...prev, { ...dataToSave, id: Date.now() }]);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 font-sans">
      {copyFeedback && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2">
          <Check size={20}/> <span className="font-bold uppercase text-xs">{copyFeedback.message}</span>
        </div>
      )}

      <header className="max-w-[1600px] mx-auto flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm mb-6">
        <h1 className="font-black text-xl text-slate-800 uppercase tracking-tighter">Alocação MG1 - PCP</h1>
        <button onClick={() => setIsSettingsOpen(true)} className="p-3 bg-slate-100 rounded-2xl hover:bg-blue-50 transition-all text-slate-400 hover:text-blue-600"><Settings/></button>
      </header>

      <main className="max-w-[1600px] mx-auto space-y-6">
        <div className="bg-white p-4 rounded-3xl shadow-sm flex flex-wrap gap-4 items-center">
          <input type="text" placeholder="Pesquisar máquina, item ou OP..." className="flex-1 min-w-[300px] p-3 bg-slate-50 border rounded-2xl outline-none focus:border-blue-400" onChange={e => setSearchTerm(e.target.value)} />
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase flex gap-2"><Plus size={16}/> Nova Alocação</button>
          <button onClick={() => fileInputRef.current.click()} className="bg-amber-800 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase flex gap-2 shadow-lg shadow-amber-100"><FileUp size={16}/> Importar Excel</button>
          <button onClick={() => setIsClearModalOpen(true)} className="bg-red-50 text-red-600 px-6 py-3 rounded-2xl font-black text-xs uppercase hover:bg-red-600 hover:text-white transition-all">Limpar</button>
        </div>

        <div className="bg-white rounded-[32px] shadow-sm overflow-hidden border border-slate-200">
          <table className="w-full text-left">
            <thead className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="p-5 border-r border-blue-500 text-center">Máquina</th>
                <th className="p-5 border-r border-blue-500">Item</th>
                <th className="p-5 border-r border-blue-500 text-center">Qtd (kg)</th>
                <th className="p-5 bg-yellow-400 text-slate-900 border-r border-yellow-500">OP</th>
                <th className="p-5 bg-yellow-400 text-slate-900 border-r border-yellow-500 text-center">Perda</th>
                <th className="p-5 bg-yellow-400 text-slate-900 border-r border-yellow-500 text-center">Status</th>
                <th className="p-5 bg-slate-800 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allocations.filter(a => String(a.maquina + a.item + a.ordemProducao).toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-5 font-bold text-slate-700">{item.maquina}</td>
                  <td className="p-5 text-sm text-slate-500">{item.item}</td>
                  <td className="p-5 text-center font-black text-blue-600 text-lg">{formatQty(item.quantidade)}</td>
                  <td className="p-5 font-bold text-slate-800">{item.ordemProducao}</td>
                  <td className="p-5 text-center">
                    <button onClick={() => {
                      const isP = !item.isPerdaActive;
                      setAllocations(allocations.map(i => i.id === item.id ? {...i, isPerdaActive: isP, quantidade: isP ? i.quantidade + lossValue : i.quantidade - lossValue} : i))
                    }} className={`w-16 py-2 rounded-xl font-black text-xs transition-all border-2 ${item.isPerdaActive ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-white text-slate-300 border-slate-100'}`}>{lossValue}</button>
                  </td>
                  <td className="p-5 text-center">
                    <button onClick={() => setAllocations(allocations.map(i => i.id === item.id ? {...i, status: i.status === 'Pendente' ? 'Conferido' : 'Pendente'} : i))} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${item.status === 'Conferido' ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-white text-slate-400 border-slate-200'}`}>{item.status}</button>
                  </td>
                  <td className="p-5 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { if(window.confirm('Excluir?')) setAllocations(allocations.filter(i => i.id !== item.id)) }} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={18}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <input type="file" ref={fileInputRef} className="hidden" onChange={handleImportExcel} accept=".xlsx, .xls" />

      {isSettingsOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-[40px] shadow-2xl w-full max-w-sm">
            <h2 className="font-black text-xl text-slate-800 uppercase mb-6">Ajuste de Perda</h2>
            <div className="relative mb-8">
              <input type="number" className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[28px] text-4xl font-black outline-none focus:border-blue-500 transition-all text-center" value={lossValue} onChange={e => setLossValue(e.target.value)} />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-slate-200 text-xl">KG</span>
            </div>
            <button onClick={() => saveSettings(lossValue)} className="w-full bg-blue-600 text-white py-5 rounded-[24px] font-black text-xs uppercase shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">Salvar na Nuvem</button>
            <button onClick={() => setIsSettingsOpen(false)} className="w-full mt-4 text-slate-400 font-bold text-[10px] uppercase">Fechar</button>
          </div>
        </div>
      )}

      {/* Modal Nova Alocação Simples */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-8 bg-slate-50 border-b flex justify-between items-center">
              <h2 className="font-black uppercase">Nova Alocação</h2>
              <button onClick={() => setIsModalOpen(false)}><X/></button>
            </div>
            <form onSubmit={handleSave} className="p-8 grid grid-cols-2 gap-4">
              <div className="col-span-2"><label className="text-[10px] font-black text-slate-400 uppercase">Máquina</label><input required className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.maquina} onChange={e => setFormData({...formData, maquina: e.target.value})} /></div>
              <div className="col-span-2"><label className="text-[10px] font-black text-slate-400 uppercase">Item</label><input required className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.item} onChange={e => setFormData({...formData, item: e.target.value})} /></div>
              <div><label className="text-[10px] font-black text-slate-400 uppercase">Qtd (kg)</label><input required type="number" step="0.01" className="w-full p-3 bg-slate-50 border rounded-xl font-bold" value={formData.quantidade} onChange={e => setFormData({...formData, quantidade: e.target.value})} /></div>
              <div><label className="text-[10px] font-black text-slate-400 uppercase">OP</label><input required className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.ordemProducao} onChange={e => setFormData({...formData, ordemProducao: e.target.value})} /></div>
              <button type="submit" className="col-span-2 mt-4 bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-xs">Salvar Alocação</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;