import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, setDoc } from "firebase/firestore";

// Configuração atualizada do Firebase para o projeto PCP-Alocacao-Itamonte
const firebaseConfig = {
    apiKey: "AIzaSyDpU5eiP4szN8FKkVfd51wqISEuHuPq1zU",
    authDomain: "pcp-alocacao-itamonte.firebaseapp.com",
    projectId: "pcp-alocacao-itamonte",
    storageBucket: "pcp-alocacao-itamonte.firebasestorage.app",
    messagingSenderId: "376351536779",
    appId: "1:376351536779:web:2c46c62d8b8a47f8c3468e"
};

// Inicialização do Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const Icons = {
  Alert: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  X: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
};

export default function AlocacaoPCPMG1() {
  const [allocations, setAllocations] = useState([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQtyOnlyMode, setIsQtyOnlyMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [lossValue, setLossValue] = useState(0);
  const [copyFeedback, setCopyFeedback] = useState(null);

  const [formData, setFormData] = useState({
    maquina: '',
    item: '',
    itemFinal: '',
    descricao: '',
    quantidade: '',
    ordemProducao: ''
  });

  // Carregar dados do Firestore ao iniciar
  useEffect(() => {
    fetchAllocations();
  }, []);

  const fetchAllocations = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "allocations"));
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAllocations(items);
    } catch (error) {
      console.error("Erro ao carregar dados do Firebase:", error);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const docRef = doc(db, "allocations", String(editingId));
        await updateDoc(docRef, formData);
        setAllocations(allocations.map(item => 
          item.id === editingId ? { ...item, ...formData } : item
        ));
      } else {
        const docRef = await addDoc(collection(db, "allocations"), formData);
        const newItem = {
          id: docRef.id,
          ...formData
        };
        setAllocations([...allocations, newItem]);
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ maquina: '', item: '', itemFinal: '', descricao: '', quantidade: '', ordemProducao: '' });
    } catch (error) {
      console.error("Erro ao guardar dados:", error);
    }
  };

  const handleClearAll = async () => {
    try {
      for (let item of allocations) {
        await deleteDoc(doc(db, "allocations", String(item.id)));
      }
      setAllocations([]);
      setIsClearModalOpen(false);
    } catch (error) {
      console.error("Erro ao limpar dados:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-center bg-slate-800 p-6 rounded-3xl border border-slate-700">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-wider text-white">Alocação MG1 - PCP</h1>
            <p className="text-xs text-slate-400 font-medium">Gestão de produção e controle de alocações</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => { setIsQtyOnlyMode(false); setEditingId(null); setFormData({ maquina: '', item: '', itemFinal: '', descricao: '', quantidade: '', ordemProducao: '' }); setIsModalOpen(true); }}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg"
            >
              + Nova Alocação
            </button>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="px-5 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
            >
              Definições
            </button>
          </div>
        </div>

        {/* Feedback visual */}
        {copyFeedback && (
          <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 p-4 rounded-2xl text-xs font-bold uppercase tracking-wider text-center">
            {copyFeedback.message}
          </div>
        )}

        {/* Tabela de Alocações */}
        <div className="bg-slate-800 rounded-3xl border border-slate-700 overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-700 flex justify-between items-center">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-300">Registos Atuais</h2>
            {allocations.length > 0 && (
              <button 
                onClick={() => setIsClearModalOpen(true)}
                className="text-xs font-bold text-red-400 hover:text-red-300 uppercase tracking-wider"
              >
                Limpar Tudo
              </button>
            )}
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-800/50">
                  <th className="p-4">Máquina</th>
                  <th className="p-4">Item</th>
                  <th className="p-4">Item Final</th>
                  <th className="p-4">Descrição</th>
                  <th className="p-4">Qtd (kg)</th>
                  <th className="p-4">OP</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700 text-sm">
                {allocations.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-500 font-medium">
                      Nenhuma alocação registada no momento.
                    </td>
                  </tr>
                ) : (
                  allocations.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-700/50 transition-colors">
                      <td className="p-4 font-bold uppercase">{row.maquina}</td>
                      <td className="p-4 font-bold text-blue-400 uppercase">{row.item}</td>
                      <td className="p-4 font-medium text-slate-300">{row.itemFinal}</td>
                      <td className="p-4 text-slate-400 text-xs">{row.descricao}</td>
                      <td className="p-4 font-black text-white">{row.quantidade}</td>
                      <td className="p-4 font-mono text-xs text-slate-300">{row.ordemProducao}</td>
                      <td className="p-4 text-right space-x-2">
                        <button 
                          onClick={() => { setEditingId(row.id); setFormData(row); setIsQtyOnlyMode(false); setIsModalOpen(true); }}
                          className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-xs font-bold uppercase tracking-wider"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Modal de Configurações */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white text-slate-800 rounded-[32px] shadow-2xl w-full max-w-md p-8 animate-in zoom-in duration-200 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black uppercase tracking-tight">Definições de Perda</h2>
              <button onClick={() => setIsSettingsOpen(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><Icons.X /></button>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400">Valor Padrão de Perda (kg)</label>
              <div className="relative">
                <input 
                  type="number" 
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-2xl font-black focus:border-blue-500 focus:outline-none" 
                  value={lossValue} 
                  onChange={(e) => setLossValue(parseFloat(e.target.value) || 0)} 
                />
              </div>
              <p className="text-[11px] font-bold text-slate-400">Define o acréscimo em quilogramas (kg) ao clicar no botão de perda da tabela.</p>
            </div>
            <button 
              onClick={() => { setIsSettingsOpen(false); setCopyFeedback({ type: 'success', message: 'Configurações guardadas!' }); setTimeout(() => setCopyFeedback(null), 3000); }} 
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-lg transition-all"
            >
              Guardar Alterações
            </button>
          </div>
        </div>
      )}

      {/* Modal de Confirmação para Limpar Tudo */}
      {isClearModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white text-slate-800 rounded-[32px] shadow-2xl w-full max-w-sm p-8 text-center animate-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icons.Alert />
            </div>
            <h2 className="text-xl font-black uppercase mb-2">Limpar Tudo?</h2>
            <p className="text-slate-500 text-sm font-medium mb-8">Esta ação irá apagar todas as alocações e estoques guardados na nuvem.</p>
            <div className="flex gap-3">
              <button onClick={() => setIsClearModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest">Cancelar</button>
              <button onClick={handleClearAll} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg">Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Nova ou Editar Alocação / Quantidade */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white text-slate-800 rounded-[32px] shadow-2xl w-full max-w-lg p-8 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black uppercase tracking-tight">
                {isQtyOnlyMode ? 'Editar Quantidade' : (editingId ? 'Editar Alocação' : 'Nova Alocação')}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><Icons.X /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {!isQtyOnlyMode && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Máquina</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Ex: EXT01" 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold uppercase text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                        value={formData.maquina} 
                        onChange={(e) => setFormData({ ...formData, maquina: e.target.value })} 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Item</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Ex: TR1010" 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold uppercase text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                        value={formData.item} 
                        onChange={(e) => setFormData({ ...formData, item: e.target.value })} 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Item Final</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Item Final" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                      value={formData.itemFinal} 
                      onChange={(e) => setFormData({ ...formData, itemFinal: e.target.value })} 
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Descrição</label>
                    <input 
                      type="text" 
                      placeholder="Descrição do produto" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                      value={formData.descricao} 
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })} 
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Quantidade (kg)</label>
                <input 
                  type="text" 
                  required 
                  placeholder="0,00" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-black text-blue-600 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                  value={formData.quantidade} 
                  onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })} 
                />
              </div>

              {!isQtyOnlyMode && (
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ordem de Produção (OP)</label>
                  <input 
                    type="text" 
                    placeholder="Número da OP" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                    value={formData.ordemProducao} 
                    onChange={(e) => setFormData({ ...formData, ordemProducao: e.target.value })} 
                  />
                </div>
              )}

              <button 
                type="submit" 
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all mt-4"
              >
                Salvar Registo
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
