import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDpU5eiP4szN0FKkVfd51wqISEuHuPq1zU",
  authDomain: "pcp-alocacao-itamonte.firebaseapp.com",
  projectId: "pcp-alocacao-itamonte",
  storageBucket: "pcp-alocacao-itamonte.firebasestorage.app",
  messagingSenderId: "376351536779",
  appId: "1:376351536779:web:2c46c62d8b8a47f8c3468e"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const Icons = {
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  Search: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>,
  Edit: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
  Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>,
  Pending: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>,
  Alert: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>,
  Import: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>,
  Layers: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>,
  Copy: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>,
  Save: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>,
  Undo: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"></path><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path></svg>,
  TrendingUp: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>,
  Settings: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
  X: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  Pencil: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>,
  ListOrdered: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="10" y1="18" x2="21" y2="18"></line><path d="M4 6h1v4"></path><path d="M4 10h2"></path><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path></svg>,
  Refresh: () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>,
  ClipboardList: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><line x1="8" y1="11" x2="8" y2="11"></line><line x1="8" y1="16" x2="8" y2="16"></line><line x1="12" y1="11" x2="16" y2="11"></line><line x1="12" y1="16" x2="16" y2="16"></line></svg>,
  Lock: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>,
  Unlock: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>,
  Menu: () => <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>,
  Shield: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>,
  FileText: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
  Printer: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>,
  ChevronRight: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>,
  ChevronDown: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>,
  ArrowLeft: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>,
  Grid: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>,
  Cpu: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="15" x2="23" y2="15"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="15" x2="4" y2="15"></line></svg>,
  CloudCheck: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 16.2A4.5 4.5 0 0 0 17.5 8h-1.8A7 7 0 1 0 2 16h.5"></path><polyline points="9 16 12 19 18 13"></polyline></svg>,
  Loader2: ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
};

const formatExcelDate = (val) => {
  if (!val && val !== 0) return '-';
  if (typeof val === 'string' && (val.includes('/') || val.includes('-'))) return val;
  const num = parseFloat(val);
  if (isNaN(num) || num <= 0) return String(val || '-');
  
  const excelEpoch = new Date(Date.UTC(1899, 11, 30));
  const dateObj = new Date(excelEpoch.getTime() + num * 86400000);
  const day = String(dateObj.getUTCDate()).padStart(2, '0');
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
  const year = dateObj.getUTCFullYear();
  return `${day}/${month}/${year}`;
};

const formatExcelTime = (val) => {
  if (!val && val !== 0) return '-';
  if (typeof val === 'string' && val.includes(':')) return val;
  const num = parseFloat(val);
  if (isNaN(num)) return String(val || '-');
  
  const totalSeconds = Math.round(num * 86400);
  const hours = String(Math.floor(totalSeconds / 3600) % 24).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

const findHeaderIndex = (headers, candidates) => {
  for (const candidate of candidates) {
    const candidateNorm = candidate.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    const idx = headers.findIndex(h => {
      const hNorm = String(h || '').toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      return hNorm === candidateNorm || hNorm.includes(candidateNorm);
    });
    if (idx !== -1) return idx;
  }
  return -1;
};

const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'alocacao-mg1-pcp';

const parsePtBrFloat = (val) => {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return val;
  const str = String(val).trim();
  if (str.includes(',')) {
    return parseFloat(str.replace(/\./g, '').replace(',', '.')) || 0;
  }
  return parseFloat(str) || 0;
};

export default function App() {
  const [user, setUser] = useState(null);
  const [allocations, setAllocations] = useState([]);
  const [lossValue, setLossValue] = useState(200);
  const [isSaving, setIsSaving] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [history, setHistory] = useState([]);
  
  const [excelStockRows, setExcelStockRows] = useState([]);
  const [expandedRowId, setExpandedRowId] = useState(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isObsSubMenuOpen, setIsObsSubMenuOpen] = useState(false);
  const [isImportMenuOpen, setIsImportMenuOpen] = useState(false);
  const [importType, setImportType] = useState('alocacao'); 

  const [isAlocacaoObsModalOpen, setIsAlocacaoObsModalOpen] = useState(false);
  const [isMatrizCamadasObsModalOpen, setIsMatrizCamadasObsModalOpen] = useState(false);
  const [isExtrusorasObsModalOpen, setIsExtrusorasObsModalOpen] = useState(false);

  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [currentNote, setCurrentNote] = useState({ title: '', content: '' });

  const [isSafetyStockOpen, setIsSafetyStockOpen] = useState(false);
  const [safetyStocks, setSafetyStocks] = useState([]);
  const [editingSafetyId, setEditingSafetyId] = useState(null);
  const [newSafetyItem, setNewSafetyItem] = useState({ 
    cliente: '', 
    item: '', 
    quantidade: '', 
    estoque: '', 
    pendente: '', 
    dataDisponibilidade: '', 
    status: 'Em Estoque' 
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  
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

  useEffect(() => {
    const initAuthAndLoad = async () => {
      try {
        let loggedUser;
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          const result = await signInWithCustomToken(auth, __initial_auth_token);
          loggedUser = result.user;
        } else {
          const result = await signInAnonymously(auth);
          loggedUser = result.user;
        }
        setUser(loggedUser);

        if (loggedUser) {
          const stateDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'appState', 'snapshot');
          const docSnap = await getDoc(stateDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.allocations !== undefined) setAllocations(data.allocations);
            if (data.lossValue !== undefined) setLossValue(data.lossValue);
            if (data.safetyStocks !== undefined) setSafetyStocks(data.safetyStocks);
            if (data.notes !== undefined) setNotes(data.notes);
            if (data.excelStockRows !== undefined) setExcelStockRows(data.excelStockRows);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar dados do Firebase:", err);
      }
    };
    initAuthAndLoad();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  const pushToHistory = useCallback((currentAllocations) => {
    setHistory(prev => {
      const updated = [...prev, JSON.parse(JSON.stringify(currentAllocations))];
      if (updated.length > 20) updated.shift();
      return updated;
    });
  }, []);

  const handleUndo = useCallback(() => {
    if (isReadOnly) {
      setCopyFeedback({ type: 'error', message: 'Desative o Modo Leitura para anular.' });
      return;
    }
    if (history.length === 0) {
      setCopyFeedback({ type: 'error', message: 'Nada para desfazer!' });
      return;
    }
    const previousAllocations = history[history.length - 1];
    setAllocations(previousAllocations);
    setHistory(prev => prev.slice(0, -1));
    setCopyFeedback({ type: 'success', message: 'Ação desfeita!' });
  }, [history, isReadOnly]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (activeTag !== 'input' && activeTag !== 'textarea') {
          e.preventDefault();
          handleUndo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo]);

  const stats = useMemo(() => {
    const total = allocations.length;
    const checked = allocations.filter(item => item.status === 'Conferido').length;
    const percentage = total > 0 ? Math.round((checked / total) * 100) : 0;
    return { total, checked, percentage };
  }, [allocations]);

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return allocations.filter(item => 
      String(item.maquina || '').toLowerCase().includes(term) || 
      String(item.item || '').toLowerCase().includes(term) || 
      String(item.ordemProducao || '').toLowerCase().includes(term)
    );
  }, [allocations, searchTerm]);

  const handleSaveToCloud = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const stateDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'appState', 'snapshot');
      await setDoc(stateDocRef, {
        allocations,
        lossValue,
        safetyStocks,
        notes,
        excelStockRows,
        updatedAt: Date.now()
      });
      setCopyFeedback({ type: 'success', message: 'Sincronizado no Firebase!' });
    } catch (err) {
      console.error("Erro ao salvar:", err);
      setCopyFeedback({ type: 'error', message: 'Erro ao salvar.' });
    } finally {
      setIsSaving(false);
    }
  };

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

  const formatQty = useCallback((val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return "0,00";
    return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
  }, []);

  const copyToClipboard = useCallback((text, msg) => {
    const el = document.createElement("textarea");
    el.value = text;
    el.style.position = 'fixed';
    el.style.left = '-9999px';
    el.style.top = '0';
    document.body.appendChild(el);
    el.focus();
    el.select();
    try {
      if (document.execCommand('copy')) setCopyFeedback({ type: 'success', message: msg });
    } catch (err) {
      setCopyFeedback({ type: 'error', message: 'Erro ao copiar.' });
    }
    document.body.removeChild(el);
  }, []);

  const handleCopyData = useCallback(() => {
    const conferidos = allocations.filter(item => item.status === 'Conferido');
    if (conferidos.length === 0) {
      setCopyFeedback({ type: 'error', message: 'Nada conferido para copiar!' });
      return;
    }
    const header = "MÁQUINA\tITEM\tITEM FINAL\tDESCRIÇÃO\tQUANTIDADE\tOP\n";
    const rows = conferidos.map(item => {
      const itemFinalDisplay = item.itensFinaisAgrupados && item.itensFinaisAgrupados.length > 0
        ? item.itensFinaisAgrupados.join(' / ')
        : (item.itemFinal || '');
      return `${item.maquina || ''}\t${item.item || ''}\t${itemFinalDisplay}\t${item.descricao || ''}\t${formatQty(item.quantidade)}\t${item.ordemProducao || ''}`;
    }).join('\n');
    copyToClipboard(header + rows, 'Dados copiados!');
  }, [allocations, formatQty, copyToClipboard]);

  const handleSequenciar = () => {
    if (isReadOnly) return;
    if (allocations.length === 0) return;
    pushToHistory(allocations);
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
    setCopyFeedback({ type: 'success', message: 'Sequenciamento concluído!' });
  };

  const handleJuncao = () => {
    if (isReadOnly) return;
    if (allocations.length === 0) return;
    pushToHistory(allocations);
    const grouped = {};
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
      }
    });
    setAllocations(Object.values(grouped));
    setCopyFeedback({ type: 'success', message: 'Junção local concluída!' });
  };

  const handleClearAll = async () => {
    if (isReadOnly) return;
    pushToHistory(allocations);
    setAllocations([]);
    setSafetyStocks([]);
    setExcelStockRows([]);
    if (user) {
      const stateDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'appState', 'snapshot');
      await deleteDoc(stateDocRef);
    }
    setIsClearModalOpen(false);
    setCopyFeedback({ type: 'success', message: 'Tudo limpo.' });
  };

  const triggerFileInput = (type) => {
    setImportType(type);
    setIsImportMenuOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImportExcel = (e) => {
    if (isReadOnly) return;
    const file = e.target.files[0];
    if (!file) return;
    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = window.XLSX.read(bstr, { type: 'binary' });
        const data = window.XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });
        if (data.length < 2) return;

        const headers = data[0].map(h => String(h).toUpperCase().trim());
        const rows = data.slice(1);

        if (importType === 'alocacao') {
          pushToHistory(allocations);
          const idx = {
            maquina: findHeaderIndex(headers, ['MÁQUINA', 'MAQUINA', 'EQUIPAMENTO', 'EXTRUSORA']),
            item: findHeaderIndex(headers, ['ITEM', 'PRODUTO', 'CÓDIGO', 'CODIGO']),
            itemFinal: findHeaderIndex(headers, ['ITEM FINAL', 'ITEMFINAL', 'PRODUTO FINAL']),
            descricao: findHeaderIndex(headers, ['DESCRIÇÃO', 'DESCRICAO', 'DESC']),
            quantidade: findHeaderIndex(headers, ['QUANTIDADE', 'QTD', 'PESO']),
            op: findHeaderIndex(headers, ['OP', 'ORDEM', 'ORDEM PRODUCAO', 'ORDEM DE PRODUÇÃO'])
          };
          const newItems = rows.filter(row => row.length > 0 && row[idx.maquina] !== undefined).map((row, index) => {
            let maq = String(row[idx.maquina] || '').trim();
            if (/^\d+$/.test(maq)) maq = `EXT${maq}`;
            return {
              id: Date.now() + index,
              sequencia: '', maquina: maq, item: String(row[idx.item] || ''),
              itemFinal: String(row[idx.itemFinal] || ''), descricao: String(row[idx.descricao] || ''),
              quantidade: parseFloat(String(row[idx.quantidade] || 0).replace('.', '').replace(',', '.')) || 0,
              ordemProducao: String(row[idx.op] || ''), perdaCount: 0, status: 'Pendente'
            };
          });
          setAllocations(prev => [...prev, ...newItems]);
          setCopyFeedback({ type: 'success', message: 'Alocações importadas!' });
        } else if (importType === 'estoque') {
          const idxMap = {
            tipoDeposito: findHeaderIndex(headers, ['TIPO DE DEPÓSITO', 'TIPO DE DEPOSITO', 'DEPÓSITO', 'DEPOSITO', 'TIPO DEP']),
            produto: findHeaderIndex(headers, ['PRODUTO', 'ITEM', 'CÓDIGO', 'CODIGO', 'MATERIAL']),
            unidadeComercial: findHeaderIndex(headers, ['UNIDADE COMERCIAL', 'UN. COMERCIAL', 'CLIENTE', 'UNIDADE']),
            posicaoDeposito: findHeaderIndex(headers, ['POSIÇÃO NO DEPÓSITO', 'POSICAO NO DEPOSITO', 'POSIÇÃO', 'POSICAO', 'ENDEREÇO', 'ENDERECO']),
            quantidade: findHeaderIndex(headers, ['QUANTIDADE', 'QTD', 'SALDO']),
            umBasica: findHeaderIndex(headers, ['UM BÁSICA', 'UM BASICA', 'UM', 'UNIDADE DE MEDIDA']),
            lote: findHeaderIndex(headers, ['LOTE', 'BATCH']),
            denominacaoEstoque: findHeaderIndex(headers, ['DENOMINAÇÃO DO TIPO DE ESTOQUE', 'DENOMINACAO DO TIPO DE ESTOQUE', 'TIPO DE ESTOQUE', 'TIPO ESTOQUE']),
            descricao: findHeaderIndex(headers, ['DESCRIÇÃO BREVE DO PRODUTO', 'DESCRICAO BREVE DO PRODUTO', 'DESCRIÇÃO', 'DESCRICAO']),
            dataEm: findHeaderIndex(headers, ['DATA EM', 'DATA ENTRADA', 'DT.EM']),
            tipoIdVerificacao: findHeaderIndex(headers, ['TIPO ID VERIFICAÇÃO', 'TIPO ID VERIFICACAO', 'TIPO ID', 'TIPO VERIFICACAO']),
            contrQualid: findHeaderIndex(headers, ['CONTR.QUALID.', 'CONTR.QUALID', 'CONTROLE QUALIDADE', 'CQ']),
            hrEntrMercadorias: findHeaderIndex(headers, ['HR.ENTR.MERCADORIAS', 'HR ENTR MERCADORIAS', 'HORA ENTRADA', 'HORA']),
            dataVencimento: findHeaderIndex(headers, ['DATA DO VENCIMENTO', 'DATA VENCIMENTO', 'VENCIMENTO', 'VALIDADE'])
          };

          const rawImportedRows = rows.filter(row => row.length > 0 && row[idxMap.produto] !== undefined).map((row, index) => {
            const prodCode = String(row[idxMap.produto] || '').trim().toUpperCase();
            return {
              id: Date.now() + index,
              tipoDeposito: idxMap.tipoDeposito !== -1 ? String(row[idxMap.tipoDeposito] || '-') : '-',
              produto: prodCode,
              unidadeComercial: idxMap.unidadeComercial !== -1 ? String(row[idxMap.unidadeComercial] || '-') : '-',
              posicaoDeposito: idxMap.posicaoDeposito !== -1 ? String(row[idxMap.posicaoDeposito] || '-') : '-',
              quantidade: idxMap.quantidade !== -1 ? parsePtBrFloat(row[idxMap.quantidade]) : 0,
              umBasica: idxMap.umBasica !== -1 ? String(row[idxMap.umBasica] || 'KG') : 'KG',
              lote: idxMap.lote !== -1 ? String(row[idxMap.lote] || '-') : '-',
              denominacaoEstoque: idxMap.denominacaoEstoque !== -1 ? String(row[idxMap.denominacaoEstoque] || '-') : '-',
              descricao: idxMap.descricao !== -1 ? String(row[idxMap.descricao] || '-') : '-',
              dataEm: idxMap.dataEm !== -1 && row[idxMap.dataEm] !== undefined ? row[idxMap.dataEm] : '-',
              tipoIdVerificacao: idxMap.tipoIdVerificacao !== -1 ? String(row[idxMap.tipoIdVerificacao] || '-') : '-',
              contrQualid: idxMap.contrQualid !== -1 ? String(row[idxMap.contrQualid] || '-') : '-',
              hrEntrMercadorias: idxMap.hrEntrMercadorias !== -1 && row[idxMap.hrEntrMercadorias] !== undefined ? row[idxMap.hrEntrMercadorias] : '-',
              dataVencimento: idxMap.dataVencimento !== -1 && row[idxMap.dataVencimento] !== undefined ? row[idxMap.dataVencimento] : '-'
            };
          });

          setExcelStockRows(rawImportedRows);
          setCopyFeedback({ type: 'success', message: 'Base de Estoque do Excel importada com sucesso!' });
        }
      } catch (err) { 
        console.error("Erro na importação Excel:", err);
        setCopyFeedback({ type: 'error', message: 'Erro na importação.' }); 
      } finally { 
        setIsImporting(false); 
        e.target.value = null; 
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (isReadOnly) return;
    pushToHistory(allocations);
    const qty = parseFloat(String(formData.quantidade).replace(',', '.'));
    const dataToSave = { ...formData, quantidade: isNaN(qty) ? 0 : qty };
    if (editingId) setAllocations(prev => prev.map(item => item.id === editingId ? { ...dataToSave, id: editingId } : item));
    else setAllocations(prev => [...prev, { ...dataToSave, id: Date.now() }]);
    setIsModalOpen(false);
  };

  const toggleStatus = (item) => {
    if (isReadOnly) return;
    pushToHistory(allocations);
    const newStatus = item.status === 'Pendente' ? 'Conferido' : 'Pendente';
    setAllocations(prev => prev.map(a => a.id === item.id ? { ...a, status: newStatus } : a));
  };

  const handleAddPerda = (item) => {
    if (isReadOnly) return;
    pushToHistory(allocations);
    const newQty = (parseFloat(item.quantidade) || 0) + parseFloat(lossValue);
    const newCount = (item.perdaCount || 0) + 1;
    setAllocations(prev => prev.map(a => a.id === item.id ? { ...a, quantidade: newQty, perdaCount: newCount } : a));
  };

  const handleResetPerda = (item) => {
    if (isReadOnly) return;
    pushToHistory(allocations);
    const currentCount = item.perdaCount || 0;
    const newQty = (parseFloat(item.quantidade) || 0) - (currentCount * parseFloat(lossValue));
    setAllocations(prev => prev.map(a => a.id === item.id ? { ...a, quantidade: newQty, perdaCount: 0 } : a));
  };

  const confirmDelete = () => {
    if (!deleteTargetId || isReadOnly) return;
    pushToHistory(allocations);
    setAllocations(prev => prev.filter(a => a.id !== deleteTargetId));
    setDeleteTargetId(null);
    setCopyFeedback({ type: 'success', message: 'Item eliminado.' });
  };

  const handleSaveNote = () => {
    if (!currentNote.title.trim()) return;
    if (activeNoteId) {
      setNotes(prev => prev.map(n => n.id === activeNoteId ? { ...currentNote, id: activeNoteId, updatedAt: Date.now() } : n));
      setCopyFeedback({ type: 'success', message: 'Nota atualizada!' });
    } else {
      const newId = Date.now();
      const newN = { ...currentNote, id: newId, updatedAt: newId };
      setNotes(prev => [newN, ...prev]);
      setActiveNoteId(newId);
      setCopyFeedback({ type: 'success', message: 'Nota criada!' });
    }
  };

  const handleNewNote = () => {
    setActiveNoteId(null);
    setCurrentNote({ title: '', content: '' });
  };

  const handleDeleteNote = (id) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (activeNoteId === id) {
      handleNewNote();
    }
    setCopyFeedback({ type: 'success', message: 'Nota eliminada!' });
  };

  const handleSelectNote = (note) => {
    setActiveNoteId(note.id);
    setCurrentNote({ title: note.title, content: note.content });
  };

  const handleAddOrUpdateSafetyStock = (e) => {
    e.preventDefault();
    const cliente = String(newSafetyItem.cliente || '').trim();
    const itemCode = String(newSafetyItem.item || '').trim().toUpperCase();
    const qty = parsePtBrFloat(newSafetyItem.quantidade);
    const est = parsePtBrFloat(newSafetyItem.estoque);
    const pend = Math.max(0, qty - est);
    const dataDisp = String(newSafetyItem.dataDisponibilidade || '').trim();
    const statusVal = pend === 0 ? 'Em Estoque' : (newSafetyItem.status || 'Pendente');

    if (!itemCode) return;

    if (editingSafetyId) {
      setSafetyStocks(prev => prev.map(s => s.id === editingSafetyId ? {
        ...s,
        cliente,
        item: itemCode,
        quantidade: qty,
        estoque: est,
        pendente: pend,
        dataDisponibilidade: dataDisp,
        status: statusVal
      } : s));
      setEditingSafetyId(null);
      setCopyFeedback({ type: 'success', message: 'Estoque de Segurança atualizado!' });
    } else {
      setSafetyStocks(prev => [
        ...prev,
        {
          id: Date.now(),
          cliente,
          item: itemCode,
          quantidade: qty,
          estoque: est,
          pendente: pend,
          dataDisponibilidade: dataDisp,
          status: statusVal
        }
      ]);
      setCopyFeedback({ type: 'success', message: 'Estoque de Segurança adicionado!' });
    }

    setNewSafetyItem({ 
      cliente: '', 
      item: '', 
      quantidade: '', 
      estoque: '', 
      pendente: '', 
      dataDisponibilidade: '', 
      status: 'Em Estoque' 
    });
  };

  const handleEditSafetyStock = (stock) => {
    setEditingSafetyId(stock.id);
    setNewSafetyItem({
      cliente: stock.cliente || '',
      item: stock.item || '',
      quantidade: stock.quantidade !== undefined ? String(stock.quantidade) : '',
      estoque: stock.estoque !== undefined ? String(stock.estoque) : '',
      pendente: stock.pendente !== undefined ? String(stock.pendente) : '',
      dataDisponibilidade: stock.dataDisponibilidade || '',
      status: stock.status || 'Em Estoque'
    });
  };

  const handleCancelEditSafetyStock = () => {
    setEditingSafetyId(null);
    setNewSafetyItem({ 
      cliente: '', 
      item: '', 
      quantidade: '', 
      estoque: '', 
      pendente: '', 
      dataDisponibilidade: '', 
      status: 'Em Estoque' 
    });
  };

  const toggleSafetyStockStatus = (id) => {
    if (isReadOnly) return;
    setSafetyStocks(prev => prev.map(s => {
      if (s.id === id) {
        const nextStatus = s.status === 'Em Estoque' ? 'Pendente' : 'Em Estoque';
        return { ...s, status: nextStatus };
      }
      return s;
    }));
  };

  const handleDeleteSafetyStock = (id) => {
    if (isReadOnly) return;
    setSafetyStocks(prev => prev.filter(s => s.id !== id));
    setCopyFeedback({ type: 'success', message: 'Regra removida.' });
  };

  const handleGenerateSafetyStockPDF = useCallback(() => {
    if (safetyStocks.length === 0) {
      setCopyFeedback({ type: 'error', message: 'Nenhum registro para exportar.' });
      return;
    }

    const today = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });

    const tableRowsHtml = safetyStocks.map(stock => {
      const isGreen = stock.status === 'Em Estoque';
      const statusBg = isGreen ? '#10b981' : '#f59e0b';
      const statusText = isGreen ? 'EM ESTOQUE' : 'PENDENTE';
      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: 700; font-size: 11px; text-transform: uppercase;">${stock.cliente || '-'}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: 800; font-size: 11px; text-transform: uppercase; color: #1e293b;">${stock.item || '-'}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: 700; font-size: 11px; text-align: center; color: #334155;">${formatQty(stock.quantidade)} kg</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: 800; font-size: 11px; text-align: center; color: #059669;">${formatQty(stock.estoque)} kg</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: 800; font-size: 11px; text-align: center; color: #d97706;">${formatQty(stock.pendente)} kg</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: 700; font-size: 11px; text-align: center; color: #475569;">${stock.dataDisponibilidade || '-'}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">
            <span style="background-color: ${statusBg}; color: #ffffff; padding: 4px 12px; border-radius: 9999px; font-size: 9px; font-weight: 900; letter-spacing: 0.5px; display: inline-block;">
              ${statusText}
            </span>
          </td>
        </tr>
      `;
    }).join('');

    const printableHtml = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>ESTOQUE DE SEGURANÇA - ${today}</title>
        <style>
          @page { size: A4 landscape; margin: 12mm; }
          * { box-sizing: border-box; }
          body { font-family: system-ui, -apple-system, sans-serif; color: #0f172a; margin: 0; padding: 0; background: #ffffff; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #2563eb; padding-bottom: 14px; margin-bottom: 20px; }
          .title { font-size: 22px; font-weight: 900; color: #1e293b; text-transform: uppercase; margin: 0; }
          .subtitle { font-size: 11px; color: #64748b; margin-top: 4px; font-weight: 700; text-transform: uppercase; }
          .date-badge { background: #f1f5f9; border: 1.5px solid #cbd5e1; padding: 8px 16px; border-radius: 12px; font-size: 11px; font-weight: 900; }
          table { width: 100%; border-collapse: collapse; table-layout: fixed; }
          th { background-color: #2563eb; color: #ffffff; font-size: 10px; font-weight: 900; text-transform: uppercase; padding: 10px; text-align: left; }
          .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #e2e8f0; display: flex; justify-between; font-size: 9px; color: #94a3b8; font-weight: 800; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">ESTOQUE DE SEGURANÇA</h1>
            <div class="subtitle">Relatório de gestão - PCP MG1</div>
          </div>
          <div class="date-badge">DATA: ${today}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 18%;">Cliente</th>
              <th style="width: 12%;">Item</th>
              <th style="width: 14%; text-align: center;">Quantidade</th>
              <th style="width: 14%; text-align: center;">Estoque</th>
              <th style="width: 16%; text-align: center;">Pendente Produção</th>
              <th style="width: 14%; text-align: center;">Data Disponibilidade</th>
              <th style="width: 12%; text-align: center;">Status</th>
            </tr>
          </thead>
          <tbody>${tableRowsHtml}</tbody>
        </table>
        <div class="footer">
          <span>Relatório de Estoque de Segurança - PCP</span>
          <span>Página 1 de 1</span>
        </div>
      </body>
      </html>
    `;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const frameDoc = iframe.contentWindow.document;
    frameDoc.open();
    frameDoc.write(printableHtml);
    frameDoc.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    }, 300);

    setCopyFeedback({ type: 'success', message: 'PDF gerado com sucesso!' });
  }, [safetyStocks, formatQty]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans pb-20 w-full">
      {copyFeedback && (
        <div className={`fixed top-4 right-4 z-[150] px-6 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-right duration-300 ${copyFeedback.type === 'success' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-red-500 text-white border-red-400'}`}>
          {copyFeedback.type === 'success' ? <Icons.Check /> : <Icons.Alert />}
          <span className="font-bold text-sm uppercase tracking-wider">{copyFeedback.message}</span>
        </div>
      )}

      <input type="file" ref={fileInputRef} onChange={handleImportExcel} accept=".xlsx, .xls" className="hidden" />

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm w-full">
        <div className="w-full px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto justify-start">
            <div className="relative">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className="p-2.5 text-slate-700 hover:text-blue-600 hover:bg-blue-50 bg-slate-50 border border-slate-200 rounded-2xl transition-all flex items-center justify-center shadow-sm active:scale-95"
                title="Menu Principal"
              >
                <Icons.Menu />
              </button>
              
              {isMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)}></div>
                  <div className="absolute left-0 top-14 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 w-64 py-2 animate-in fade-in zoom-in duration-150">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Menu do Sistema</span>
                    </div>
                    
                    <button 
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsSafetyStockOpen(true);
                      }}
                      className="w-full px-4 py-3 text-left text-xs font-black uppercase text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-3 transition-colors"
                    >
                      <span className="text-blue-600"><Icons.Shield /></span>
                      <span>Estoque de Segurança</span>
                    </button>

                    <div>
                      <button 
                        onClick={() => setIsObsSubMenuOpen(!isObsSubMenuOpen)}
                        className="w-full px-4 py-3 text-left text-xs font-black uppercase text-slate-700 hover:bg-slate-50 flex items-center justify-between transition-colors border-t border-slate-100"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400"><Icons.FileText /></span>
                          <span>Observação</span>
                        </div>
                        <span className={`text-slate-400 transition-transform duration-200 ${isObsSubMenuOpen ? 'rotate-90' : ''}`}>
                          <Icons.ChevronRight />
                        </span>
                      </button>

                      {isObsSubMenuOpen && (
                        <div className="bg-slate-50 py-1 pl-8 pr-2 border-y border-slate-100 flex flex-col gap-1">
                          <button 
                            onClick={() => {
                              setIsMenuOpen(false);
                              setIsObsSubMenuOpen(false);
                              setIsAlocacaoObsModalOpen(true);
                            }}
                            className="w-full px-3 py-2 text-left text-xs font-black uppercase text-blue-600 hover:bg-blue-100/50 rounded-xl flex items-center gap-2 transition-colors"
                          >
                            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                            <span>Alocação</span>
                          </button>

                          <button 
                            onClick={() => {
                              setIsMenuOpen(false);
                              setIsObsSubMenuOpen(false);
                              setIsMatrizCamadasObsModalOpen(true);
                            }}
                            className="w-full px-3 py-2 text-left text-xs font-black uppercase text-blue-600 hover:bg-blue-100/50 rounded-xl flex items-center gap-2 transition-colors"
                          >
                            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                            <span>Matriz-Camadas</span>
                          </button>

                          <button 
                            onClick={() => {
                              setIsMenuOpen(false);
                              setIsObsSubMenuOpen(false);
                              setIsExtrusorasObsModalOpen(true);
                            }}
                            className="w-full px-3 py-2 text-left text-xs font-black uppercase text-blue-600 hover:bg-blue-100/50 rounded-xl flex items-center gap-2 transition-colors"
                          >
                            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                            <span>Extrusoras</span>
                          </button>

                          <button 
                            onClick={() => {
                              setIsMenuOpen(false);
                              setIsObsSubMenuOpen(false);
                              setIsNotesModalOpen(true);
                            }}
                            className="w-full px-3 py-2 text-left text-xs font-black uppercase text-blue-600 hover:bg-blue-100/50 rounded-xl flex items-center gap-2 transition-colors"
                          >
                            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                            <span>Bloco de Notas</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <button 
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsSettingsOpen(true);
                      }}
                      className="w-full px-4 py-3 text-left text-xs font-black uppercase text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors border-t border-slate-100"
                    >
                      <span className="text-slate-400"><Icons.Settings /></span>
                      <span>Configurações</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            <h1 className="text-xl font-black tracking-tight text-slate-800 uppercase text-center sm:text-left">Alocação MG1 - PCP</h1>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-end">
            <button 
              onClick={() => {
                setIsReadOnly(!isReadOnly);
                setCopyFeedback({
                  type: 'success',
                  message: !isReadOnly ? 'Modo Leitura ativo!' : 'Modo Edição ativo!'
                });
              }} 
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl border transition-all font-black text-xs uppercase tracking-wider shadow-md ${isReadOnly ? 'bg-amber-500 text-white border-amber-600 shadow-amber-100' : 'bg-slate-800 text-white border-slate-900'}`}
              title={isReadOnly ? "Mudar para Modo Edição" : "Mudar para Modo Leitura"}
            >
              {isReadOnly ? <Icons.Lock /> : <Icons.Unlock />}
              <span>{isReadOnly ? "Modo Leitura" : "Modo Edição"}</span>
            </button>
            
            <button onClick={() => setIsSettingsOpen(true)} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all">
              <Icons.Settings />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full px-6 py-8 flex flex-col gap-6">
        
        {/* Painel de Indicadores */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Painel Geral</span>
              <h3 className="text-2xl font-black text-slate-800 tabular-nums">
                {stats.total} <span className="text-xs font-bold text-slate-400 uppercase">Alocações Planeadas</span>
              </h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Icons.ClipboardList />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Rendimento</span>
                <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                  <span className="text-emerald-500"><Icons.TrendingUp /></span>
                  <span className="tabular-nums">Eficiência de Conferência</span>
                </h3>
              </div>
              <span className="text-2xl font-black text-emerald-600 tabular-nums bg-emerald-50 px-3.5 py-1.5 rounded-2xl border border-emerald-100">
                {stats.percentage}%
              </span>
            </div>
            
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${stats.percentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center mt-2 text-[10px] font-black uppercase text-slate-400 tracking-wider">
              <span>{stats.checked} Conferidos</span>
              <span>{stats.total - stats.checked} Pendentes</span>
            </div>
          </div>
        </section>

        {/* Barra de Ferramentas */}
        <section className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 w-full">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
            <div className="relative w-full lg:w-[450px]">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Icons.Search /></div>
              <input type="text" placeholder="Pesquisar..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
              <button 
                onClick={() => { setIsQtyOnlyMode(false); setEditingId(null); setFormData({ sequencia: '', maquina: '', item: '', itemFinal: '', descricao: '', quantidade: '', ordemProducao: '', perdaCount: 0, status: 'Pendente' }); setIsModalOpen(true); }} 
                disabled={isReadOnly || allocations.length >= MAX_ROWS} 
                className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 text-white rounded-2xl transition-all shadow-lg font-black text-xs uppercase tracking-widest ${isReadOnly ? 'bg-slate-400 cursor-not-allowed opacity-50 shadow-none' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                <Icons.Plus /> Nova Alocação
              </button>
              
              <div className="flex gap-2">
                <button 
                  onClick={handleUndo} 
                  disabled={isReadOnly || history.length === 0} 
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-md ${isReadOnly || history.length === 0 ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none' : 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-100'}`}
                  title="Anular última ação (Ctrl + Z)"
                >
                  <Icons.Undo /> Desfazer
                </button>
                <button 
                  onClick={handleSaveToCloud} 
                  disabled={isSaving || isReadOnly} 
                  className={`flex items-center gap-2 px-6 py-3 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg ${isReadOnly ? 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-50 shadow-none' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-50'}`}
                >
                  {isSaving ? <Icons.Loader2 className="animate-spin" /> : <Icons.Save />}
                  <span>{isSaving ? 'Salvando...' : 'Salvar'}</span>
                </button>
                <button 
                  onClick={() => setIsClearModalOpen(true)} 
                  disabled={isReadOnly}
                  className={`flex items-center gap-2 px-6 py-3 border rounded-2xl font-black text-xs uppercase transition-all shadow-md ${isReadOnly ? 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed shadow-none' : 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-600 hover:text-white shadow-red-50'}`}
                >
                  <Icons.Trash /> Limpar
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100 items-center">
            {/* BOTÃO INCLUIR COM DROPDOWN */}
            <div className="relative">
              <button 
                onClick={() => setIsImportMenuOpen(!isImportMenuOpen)} 
                disabled={isImporting || isReadOnly} 
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase shadow-md transition-all ${isReadOnly ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-black disabled:opacity-50'}`}
              >
                {isImporting ? <Icons.Loader2 className="w-4 h-4 animate-spin" /> : <Icons.Import />} 
                <span>Incluir</span>
                <Icons.ChevronDown />
              </button>

              {isImportMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsImportMenuOpen(false)}></div>
                  <div className="absolute left-0 top-12 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 w-48 py-2 animate-in fade-in zoom-in duration-150">
                    <button 
                      onClick={() => triggerFileInput('alocacao')}
                      className="w-full px-4 py-2.5 text-left text-xs font-black uppercase text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 transition-colors"
                    >
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      <span>Alocação</span>
                    </button>
                    <button 
                      onClick={() => triggerFileInput('estoque')}
                      className="w-full px-4 py-2.5 text-left text-xs font-black uppercase text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 transition-colors border-t border-slate-100"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      <span>Estoque</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            <button 
              onClick={handleSequenciar} 
              disabled={isReadOnly}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase shadow-md transition-all ${isReadOnly ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-slate-900 text-white hover:bg-black'}`}
            >
              <Icons.ListOrdered /> Sequenciar
            </button>
            <button 
              onClick={handleJuncao} 
              disabled={isReadOnly}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase shadow-md transition-all ${isReadOnly ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-slate-900 text-white hover:bg-black'}`}
            >
              <Icons.Layers /> Junção
            </button>
            <button onClick={handleCopyData} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase shadow-md hover:bg-black active:scale-95 transition-all"><Icons.Copy /> Copiar Dados</button>
          </div>
        </section>

        {/* Tabela Principal */}
        {}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col w-full">
          <div className="overflow-x-auto min-h-[300px] w-full">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="border-b-2 border-slate-100">
                  <th className="w-[4%] px-2 py-5 text-xs font-black text-white uppercase bg-blue-600 border-r border-blue-500 text-center">Seq.</th>
                  <th className="w-[7%] px-4 py-5 text-xs font-black text-white uppercase bg-blue-600 border-r border-blue-500">Máquina</th>
                  <th className="w-[7%] px-4 py-5 text-xs font-black text-white uppercase bg-blue-600 border-r border-blue-500">Item</th>
                  <th className="w-[12%] px-4 py-5 text-xs font-black text-white uppercase bg-blue-600 border-r border-blue-500">Item Final</th>
                  <th className="w-[24%] px-4 py-5 text-xs font-black text-white uppercase bg-blue-600 border-r border-blue-500">Descrição</th>
                  <th className="w-[8%] px-4 py-5 text-xs font-black text-white uppercase bg-blue-600 border-r border-blue-500 text-center">Quantidade</th>
                  <th className="w-[8%] px-4 py-5 text-xs font-black text-slate-800 uppercase bg-yellow-400 border-r border-yellow-500">OP</th>
                  <th className="w-[6%] px-2 py-5 text-xs font-black text-slate-800 uppercase bg-yellow-400 border-r border-yellow-500 text-center">Perda</th>
                  <th className="w-[7%] px-2 py-5 text-xs font-black text-slate-800 uppercase bg-yellow-400 border-r border-yellow-500 text-center">Status</th>
                  <th className="w-[6%] px-4 py-5 text-xs font-black text-white uppercase bg-slate-800 border-r border-slate-700 text-right">
                    {isReadOnly ? "Estado" : "Ações"}
                  </th>
                  <th className="w-[11%] px-2 py-5 text-[10px] font-black text-white uppercase bg-slate-800 text-center">
                    Estoque de Segurança
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => {
                  const isExpanded = expandedRowId === item.id;
                  
                  const rowItemCodes = [
                    String(item.item || '').trim().toUpperCase(),
                    String(item.itemFinal || '').trim().toUpperCase(),
                    ...(item.itensFinaisAgrupados || []).map(code => String(code || '').trim().toUpperCase())
                  ].filter(Boolean);

                  // Filtrar somente as linhas reais importadas do Excel
                  const matchingExcelRows = excelStockRows.filter(r => {
                    const prodCode = String(r.produto || '').trim().toUpperCase();
                    if (!prodCode) return false;
                    const cleanProdCode = prodCode.replace(/^0+/, '');
                    const isCodeMatch = rowItemCodes.some(code => {
                      const cleanCode = code.replace(/^0+/, '');
                      return prodCode === code || cleanProdCode === cleanCode;
                    });
                    return isCodeMatch;
                  });

                  return (
                    <React.Fragment key={item.id}>
                      <tr 
                        onClick={() => setExpandedRowId(isExpanded ? null : item.id)}
                        className={`hover:bg-blue-50/40 transition-colors cursor-pointer group border-b border-slate-100 ${isExpanded ? 'bg-blue-50/30' : 'h-14'}`}
                      >
                        <td className="px-2 py-2 text-center font-black text-blue-600 tabular-nums align-middle">{item.sequencia || '-'}</td>
                        <td className="px-4 py-2 font-bold text-slate-700 whitespace-nowrap align-middle">{item.maquina || '-'}</td>
                        <td className="px-4 py-2 text-sm font-black text-blue-600 whitespace-nowrap align-middle">{item.item || '-'}</td>
                        
                        <td className="px-4 py-2 font-mono text-sm text-slate-500 align-middle">
                          <div className={isExpanded ? 'break-words' : 'truncate'}>
                            {item.itensFinaisAgrupados && item.itensFinaisAgrupados.length > 0 
                              ? item.itensFinaisAgrupados.join(' / ') 
                              : (item.itemFinal || '-')}
                          </div>
                        </td>
                        
                        <td className="px-4 py-2 text-sm text-slate-600 font-medium leading-tight align-middle">
                          <div className={isExpanded ? 'whitespace-normal break-words py-2' : 'truncate'}>
                            {item.descricao || '-'}
                          </div>
                        </td>
                        
                        <td className="px-4 py-2 align-middle">
                          <div className="flex items-center justify-center gap-1 group/qty">
                            {!isReadOnly && (
                              <button 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  setIsQtyOnlyMode(true); 
                                  setEditingId(item.id); 
                                  setFormData(item); 
                                  setIsModalOpen(true); 
                                }} 
                                className="p-1 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover/qty:opacity-100"
                              >
                                <Icons.Pencil />
                              </button>
                            )}
                            <div className="flex flex-col items-center">
                              <span className="font-black text-blue-600 text-base tabular-nums">{formatQty(item.quantidade)}</span>
                              <span className="text-[9px] text-slate-400 uppercase font-black tracking-tighter">kg</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2 font-bold text-slate-700 whitespace-nowrap tabular-nums align-middle">{item.ordemProducao || '-'}</td>
                        <td className="px-2 py-2 text-center align-middle">
                          <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <button 
                              onClick={() => !isReadOnly && handleAddPerda(item)} 
                              disabled={isReadOnly}
                              className={`min-w-[54px] py-1.5 rounded-xl text-xs font-black transition-all border-2 active:scale-95 shadow-sm ${isReadOnly ? 'cursor-not-allowed opacity-60' : ''} ${(item.perdaCount || 0) > 0 ? 'bg-emerald-500 text-white border-emerald-600 shadow-md' : 'bg-white text-slate-300 border-slate-100 hover:border-slate-300'}`}
                            >
                              {lossValue}
                            </button>
                            {!isReadOnly && (item.perdaCount || 0) > 0 && (
                              <div className="flex flex-col items-start scale-90">
                                <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded-md border border-emerald-100">{item.perdaCount}x</span>
                                <button onClick={() => handleResetPerda(item)} className="text-[8px] font-black text-slate-300 hover:text-red-400 uppercase tracking-tighter flex items-center gap-0.5"><Icons.Refresh /> reset</button>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-2 py-2 text-center align-middle">
                          <button 
                            onClick={(e) => { e.stopPropagation(); if (!isReadOnly) toggleStatus(item); }} 
                            disabled={isReadOnly}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider border transition-all ${isReadOnly ? 'cursor-not-allowed opacity-80' : ''} ${item.status === 'Conferido' ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400'}`}
                          >
                            {item.status === 'Conferido' ? <Icons.Check /> : <Icons.Pending />} {item.status}
                          </button>
                        </td>
                        <td className="px-4 py-2 text-right align-middle" onClick={(e) => e.stopPropagation()}>
                          {isReadOnly ? (
                            <span className="text-amber-500 text-[9px] font-black uppercase tracking-wider bg-amber-50 px-2 py-1 rounded-lg border border-amber-100 inline-flex items-center gap-1">
                              <Icons.Lock /> Trancado
                            </span>
                          ) : (
                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => { setIsQtyOnlyMode(false); setEditingId(item.id); setFormData(item); setIsModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Icons.Edit /></button>
                              <button onClick={() => setDeleteTargetId(item.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Icons.Trash /></button>
                            </div>
                          )}
                        </td>

                        {/* COLUNA ESTOQUE DE SEGURANÇA: Exibe texto verde se houver dados, senão fica em branco */}
                        <td className="px-2 py-2 text-center align-middle" onClick={(e) => e.stopPropagation()}>
                          {(() => {
                            const stockRules = safetyStocks.filter(s => {
                              const sItem = String(s.item || '').trim().toUpperCase();
                              return sItem && rowItemCodes.includes(sItem);
                            });

                            if (stockRules.length === 0) return null;

                            return (
                              <div className="flex flex-col items-center gap-1">
                                {stockRules.map(stock => {
                                  const qtyToShow = stock.estoque !== undefined && stock.estoque !== null && stock.estoque !== '' 
                                    ? stock.estoque 
                                    : stock.quantidade;
                                  return (
                                    <button
                                      key={stock.id}
                                      onClick={() => toggleSafetyStockStatus(stock.id)}
                                      disabled={isReadOnly}
                                      className={`inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border transition-all active:scale-95 bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm hover:bg-emerald-100 ${isReadOnly ? 'cursor-not-allowed opacity-80' : ''}`}
                                      title={`Cliente: ${stock.cliente || 'Geral'} | Qtd Total: ${formatQty(stock.quantidade)} kg | Estoque Atual: ${formatQty(stock.estoque)} kg | Pendente: ${formatQty(stock.pendente)} kg | Disp: ${stock.dataDisponibilidade || '-'}`}
                                    >
                                      <Icons.Shield />
                                      <span className="text-emerald-600 font-black">{formatQty(qtyToShow)} kg</span>
                                    </button>
                                  );
                                })}
                              </div>
                            );
                          })()}
                        </td>
                      </tr>

                      {/* TELA DA LINHA EXPANDIDA PARA CONFRONTO DE ESTOQUE PURO DO EXCEL */}
                      {isExpanded && (
                        <tr>
                          <td colSpan="11" className="p-4 bg-slate-100/90 border-b border-slate-300">
                            <div className="bg-slate-200/60 p-4 rounded-2xl border border-slate-300 space-y-4 animate-in fade-in duration-150">
                              
                              <div className="flex justify-between items-center border-b border-slate-300 pb-3">
                                <div className="flex items-center gap-3">
                                  <span className="p-2 bg-blue-600 text-white rounded-xl"><Icons.Grid /></span>
                                  <div>
                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">
                                      REGISTROS DO EXCEL IMPORTADO PARA CONFRONTO DE ESTOQUE DO ITEM: <span className="text-blue-600">{item.item}</span>
                                    </h4>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase">Confronto de saldos reais por lote e posição no depósito</p>
                                  </div>
                                </div>

                                <button 
                                  onClick={(e) => { e.stopPropagation(); setExpandedRowId(null); }}
                                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-black transition-all shadow-md"
                                >
                                  <Icons.ArrowLeft />
                                  <span>Voltar</span>
                                </button>
                              </div>

                              <div className="overflow-x-auto border border-slate-300 rounded-xl bg-white shadow-inner">
                                <table className="w-full text-left border-collapse text-xs">
                                  <thead>
                                    <tr className="bg-slate-800 text-white font-black text-[9px] uppercase tracking-wider">
                                      <th className="px-3 py-2.5 border-r border-slate-700">TIPO DE DEPÓSITO</th>
                                      <th className="px-3 py-2.5 border-r border-slate-700">PRODUTO</th>
                                      <th className="px-3 py-2.5 border-r border-slate-700">UNIDADE COMERCIAL</th>
                                      <th className="px-3 py-2.5 border-r border-slate-700">POSIÇÃO NO DEPÓSITO</th>
                                      <th className="px-3 py-2.5 border-r border-slate-700 text-center">QUANTIDADE</th>
                                      <th className="px-3 py-2.5 border-r border-slate-700 text-center">UM BÁSICA</th>
                                      <th className="px-3 py-2.5 border-r border-slate-700">LOTE</th>
                                      <th className="px-3 py-2.5 border-r border-slate-700">DENOMINAÇÃO DO TIPO DE ESTOQUE</th>
                                      <th className="px-3 py-2.5 border-r border-slate-700">DESCRIÇÃO BREVE DO PRODUTO</th>
                                      <th className="px-3 py-2.5 border-r border-slate-700 text-center">DATA EM</th>
                                      <th className="px-3 py-2.5 border-r border-slate-700 text-center">TIPO ID VERIFICAÇÃO</th>
                                      <th className="px-3 py-2.5 border-r border-slate-700 text-center">CONTR.QUALID.</th>
                                      <th className="px-3 py-2.5 border-r border-slate-700 text-center">HR.ENTR.MERCADORIAS</th>
                                      <th className="px-3 py-2.5 text-center">DATA DO VENCIMENTO</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-200 font-bold text-slate-700 text-[11px]">
                                    {matchingExcelRows.length === 0 ? (
                                      <tr>
                                        <td colSpan="14" className="px-4 py-8 text-center text-slate-400 font-bold uppercase tracking-wider">
                                          Nenhum registro de estoque no Excel importado para este item. Importe a base de estoque em Incluir -&gt; Estoque.
                                        </td>
                                      </tr>
                                    ) : (
                                      matchingExcelRows.map((exRow) => {
                                        const isVerifA = String(exRow.tipoIdVerificacao || '').trim().toUpperCase() === 'A';
                                        return (
                                          <tr key={exRow.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-3 py-2 border-r border-slate-200 font-bold uppercase">{exRow.tipoDeposito || '-'}</td>
                                            <td className="px-3 py-2 border-r border-slate-200 font-black text-blue-600">{exRow.produto || '-'}</td>
                                            <td className="px-3 py-2 border-r border-slate-200 font-mono text-[10px]">{exRow.unidadeComercial || '-'}</td>
                                            <td className="px-3 py-2 border-r border-slate-200 font-bold text-slate-800">{exRow.posicaoDeposito || '-'}</td>
                                            <td className="px-3 py-2 border-r border-slate-200 text-center font-black text-blue-600 tabular-nums">{formatQty(exRow.quantidade)}</td>
                                            <td className="px-3 py-2 border-r border-slate-200 text-center font-bold text-slate-400">{exRow.umBasica || 'KG'}</td>
                                            <td className="px-3 py-2 border-r border-slate-200 font-mono text-emerald-600 text-[10px]">{exRow.lote || '-'}</td>
                                            <td className="px-3 py-2 border-r border-slate-200 font-medium">{exRow.denominacaoEstoque || '-'}</td>
                                            <td className="px-3 py-2 border-r border-slate-200 font-medium uppercase text-[10px]">{exRow.descricao || '-'}</td>
                                            <td className="px-3 py-2 border-r border-slate-200 text-center font-bold text-slate-600">{formatExcelDate(exRow.dataEm)}</td>
                                            <td className="px-3 py-2 border-r border-slate-200 text-center font-black">{exRow.tipoIdVerificacao || '-'}</td>
                                            <td className="px-3 py-2 border-r border-slate-200 text-center font-mono text-[10px] font-bold">{isVerifA ? (exRow.contrQualid || '-') : '-'}</td>
                                            <td className="px-3 py-2 border-r border-slate-200 text-center font-bold text-slate-600">{formatExcelTime(exRow.hrEntrMercadorias)}</td>
                                            <td className="px-3 py-2 text-center font-bold text-amber-600">{formatExcelDate(exRow.dataVencimento)}</td>
                                          </tr>
                                        );
                                      })
                                    )}
                                  </tbody>
                                </table>
                              </div>

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
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center text-[10px] font-black uppercase tracking-widest mt-auto">
            <span className="text-slate-500">Total: <span className={allocations.length >= MAX_ROWS ? 'text-red-600' : 'text-blue-600'}>{allocations.length} / {MAX_ROWS}</span></span>
            <span className="text-[9px] text-slate-400 italic flex items-center gap-2 font-bold">
              <Icons.CloudCheck /> Sincronização em tempo real ativa
            </span>
          </div>
        </section>
      </main>

      {}
      {isNotesModalOpen && (
        <div className="fixed inset-0 z-[100] w-full h-full bg-slate-900 flex flex-col animate-in fade-in duration-200">
          <div className="px-8 py-5 bg-slate-950 border-b border-slate-800 flex justify-between items-center text-white">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsNotesModalOpen(false)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl font-black text-xs uppercase tracking-wider border border-slate-700 transition-all active:scale-95"
              >
                <Icons.ArrowLeft />
                <span>Voltar</span>
              </button>
              <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                <span className="text-blue-500"><Icons.FileText /></span> Bloco de Notas Personalizadas
              </h2>
            </div>
            
            <button 
              onClick={handleSaveNote}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg transition-all active:scale-95"
            >
              <Icons.Save />
              <span>Salvar Nota</span>
            </button>
          </div>

          <div className="flex-1 flex overflow-hidden">
            <div className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col p-4 gap-4">
              <button 
                onClick={handleNewNote}
                className="w-full py-3 bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
              >
                <Icons.Plus />
                <span>Nova Nota</span>
              </button>

              <div className="flex-1 overflow-y-auto space-y-2">
                {notes.length === 0 ? (
                  <p className="text-slate-500 text-xs font-bold text-center py-8">Nenhuma nota guardada.</p>
                ) : (
                  notes.map(note => (
                    <div 
                      key={note.id}
                      onClick={() => handleSelectNote(note)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex justify-between items-start ${activeNoteId === note.id ? 'bg-blue-600/20 border-blue-500 text-white' : 'bg-slate-800/50 border-slate-800 text-slate-300 hover:bg-slate-800'}`}
                    >
                      <div className="overflow-hidden pr-2">
                        <h4 className="font-bold text-sm truncate">{note.title || 'Sem título'}</h4>
                        <p className="text-slate-500 text-xs truncate mt-1">{note.content || 'Sem conteúdo'}</p>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }}
                        className="text-slate-500 hover:text-red-400 p-1"
                        title="Eliminar Nota"
                      >
                        <Icons.Trash />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex-1 bg-slate-950 p-8 flex flex-col gap-6 overflow-y-auto">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Título da Nota</label>
                <input 
                  type="text"
                  placeholder="Escreva um título..."
                  value={currentNote.title}
                  onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-900 border border-slate-800 text-white font-black text-xl rounded-2xl focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex-1 flex flex-col">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Conteúdo / Anotações</label>
                <textarea 
                  placeholder="Escreva aqui as suas observações..."
                  value={currentNote.content}
                  onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
                  className="w-full flex-1 p-6 bg-slate-900 border border-slate-800 text-slate-200 font-medium text-base rounded-2xl focus:outline-none focus:border-blue-500 resize-none min-h-[400px]"
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      )}

      {}
      {isAlocacaoObsModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto py-10">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-5xl overflow-hidden animate-in zoom-in duration-200 my-auto">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                <span className="text-blue-600"><Icons.FileText /></span> Observação - Guia de Alocação
              </h2>
              <button onClick={() => setIsAlocacaoObsModalOpen(false)} className="p-2 bg-slate-200/50 rounded-full hover:bg-slate-200 transition-colors"><Icons.X /></button>
            </div>

            <div className="p-8 space-y-8 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-200/80 text-slate-700 text-xs font-black uppercase">
                        <th className="px-4 py-3 border-r border-slate-300">Dia da Semana</th>
                        <th className="px-4 py-3">Alocação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-xs font-bold text-slate-800">
                      <tr><td className="px-4 py-2.5 border-r border-slate-200">SEGUNDA</td><td className="px-4 py-2.5">QUI</td></tr>
                      <tr><td className="px-4 py-2.5 border-r border-slate-200">TERÇA</td><td className="px-4 py-2.5">SEX</td></tr>
                      <tr><td className="px-4 py-2.5 border-r border-slate-200">QUARTA</td><td className="px-4 py-2.5">SAB - DOM</td></tr>
                      <tr><td className="px-4 py-2.5 border-r border-slate-200">QUINTA</td><td className="px-4 py-2.5">SEG</td></tr>
                      <tr><td className="px-4 py-2.5 border-r border-slate-200">SEXTA</td><td className="px-4 py-2.5">TER - QUA</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isMatrizCamadasObsModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto py-10">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-6xl overflow-hidden animate-in zoom-in duration-200 my-auto">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                <span className="text-blue-600"><Icons.Grid /></span> Observação - Especificações Matriz e Camadas
              </h2>
              <button onClick={() => setIsMatrizCamadasObsModalOpen(false)} className="p-2 bg-slate-200/50 rounded-full hover:bg-slate-200 transition-colors"><Icons.X /></button>
            </div>
            <div className="p-8">
              <p className="text-xs font-bold text-slate-600">Matriz e Camadas configuradas.</p>
            </div>
          </div>
        </div>
      )}

      {isExtrusorasObsModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto py-10">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-5xl overflow-hidden animate-in zoom-in duration-200 my-auto">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                <span className="text-blue-600"><Icons.Cpu /></span> Observação - Extrusoras e Capacidade
              </h2>
              <button onClick={() => setIsExtrusorasObsModalOpen(false)} className="p-2 bg-slate-200/50 rounded-full hover:bg-slate-200 transition-colors"><Icons.X /></button>
            </div>
            <div className="p-8">
              <p className="text-xs font-bold text-slate-600">Extrusoras configuradas.</p>
            </div>
          </div>
        </div>
      )}

      {}
      {isSafetyStockOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-5xl overflow-hidden animate-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                <span className="text-blue-600"><Icons.Shield /></span> Estoque de Segurança
              </h2>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleGenerateSafetyStockPDF} 
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase hover:bg-emerald-700 transition-all shadow-md active:scale-95"
                >
                  <Icons.Printer />
                  <span>Extrair PDF</span>
                </button>
                <button onClick={() => { setIsSafetyStockOpen(false); handleCancelEditSafetyStock(); }} className="p-2 bg-slate-200/50 rounded-full hover:bg-slate-200 transition-colors"><Icons.X /></button>
              </div>
            </div>

            <div className="p-8 space-y-6">
              {!isReadOnly && (
                <form onSubmit={handleAddOrUpdateSafetyStock} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 items-end">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Cliente</label>
                    <input 
                      type="text" 
                      placeholder="Cliente" 
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-xs"
                      value={newSafetyItem.cliente}
                      onChange={(e) => setNewSafetyItem({ ...newSafetyItem, cliente: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Item *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: TR1010" 
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold uppercase text-xs"
                      value={newSafetyItem.item}
                      onChange={(e) => setNewSafetyItem({ ...newSafetyItem, item: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Quantidade</label>
                    <input 
                      type="number" 
                      step="0.01"
                      placeholder="Qtd" 
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-xs"
                      value={newSafetyItem.quantidade}
                      onChange={(e) => {
                        const val = e.target.value;
                        const qty = parsePtBrFloat(val);
                        const est = parsePtBrFloat(newSafetyItem.estoque);
                        const pend = Math.max(0, qty - est);
                        setNewSafetyItem(prev => ({
                          ...prev,
                          quantidade: val,
                          pendente: pend,
                          status: pend === 0 ? 'Em Estoque' : 'Pendente'
                        }));
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-blue-600 uppercase mb-1 font-bold">Estoque</label>
                    <input 
                      type="number" 
                      step="0.01"
                      placeholder="Estoque" 
                      className="w-full px-3 py-2 bg-white border-2 border-blue-200 rounded-xl font-bold text-xs focus:border-blue-500 focus:outline-none"
                      value={newSafetyItem.estoque}
                      onChange={(e) => {
                        const val = e.target.value;
                        const qty = parsePtBrFloat(newSafetyItem.quantidade);
                        const est = parsePtBrFloat(val);
                        const pend = Math.max(0, qty - est);
                        setNewSafetyItem(prev => ({
                          ...prev,
                          estoque: val,
                          pendente: pend,
                          status: pend === 0 ? 'Em Estoque' : 'Pendente'
                        }));
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-amber-600 uppercase mb-1 font-bold">Pendente</label>
                    <input 
                      type="number" 
                      step="0.01"
                      placeholder="Auto" 
                      readOnly
                      className="w-full px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl font-black text-xs text-amber-600 cursor-not-allowed tabular-nums"
                      value={
                        newSafetyItem.pendente !== '' && newSafetyItem.pendente !== undefined
                          ? newSafetyItem.pendente
                          : Math.max(0, parsePtBrFloat(newSafetyItem.quantidade) - parsePtBrFloat(newSafetyItem.estoque))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Data Disponib.</label>
                    <input 
                      type="text" 
                      placeholder="Ex: 20/08/2026" 
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-xs"
                      value={newSafetyItem.dataDisponibilidade}
                      onChange={(e) => setNewSafetyItem({ ...newSafetyItem, dataDisponibilidade: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-1">
                    <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-blue-700 transition-all shadow-md">
                      {editingSafetyId ? 'Salvar' : 'Adicionar'}
                    </button>
                    {editingSafetyId && (
                      <button 
                        type="button" 
                        onClick={handleCancelEditSafetyStock}
                        className="p-2.5 bg-slate-200 text-slate-600 rounded-xl font-black text-xs uppercase hover:bg-slate-300 transition-all"
                      >
                        <Icons.X />
                      </button>
                    )}
                  </div>
                </form>
              )}

              <div className="max-h-[380px] overflow-y-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-400">Cliente</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-400">Item</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-400 text-center">Quantidade</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-400 text-center">Estoque</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-400 text-center">Pendente Produção</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-400 text-center">Data Disponibilidade</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-400 text-center">Status</th>
                      {!isReadOnly && <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-400 text-right">Ação</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {safetyStocks.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-4 py-8 text-center text-xs text-slate-400 font-bold uppercase tracking-wider">
                          Nenhum registro de estoque de segurança definido.
                        </td>
                      </tr>
                    ) : (
                      safetyStocks.map(stock => {
                        const isGreen = stock.status === 'Em Estoque';
                        const isEditingThis = editingSafetyId === stock.id;
                        return (
                          <tr key={stock.id} className={`hover:bg-slate-50 transition-colors ${isEditingThis ? 'bg-blue-50/60' : ''}`}>
                            <td className="px-4 py-3 font-bold text-slate-800 text-xs">{stock.cliente || '-'}</td>
                            <td className="px-4 py-3 font-bold text-slate-800 text-xs">{stock.item}</td>
                            <td className="px-4 py-3 text-center font-black text-slate-600 text-xs tabular-nums">{formatQty(stock.quantidade)} kg</td>
                            <td className="px-4 py-3 text-center font-black text-emerald-600 text-xs tabular-nums">{formatQty(stock.estoque)} kg</td>
                            <td className="px-4 py-3 text-center font-black text-amber-600 text-xs tabular-nums">{formatQty(stock.pendente)} kg</td>
                            <td className="px-4 py-3 text-center font-bold text-slate-600 text-xs">{stock.dataDisponibilidade || '-'}</td>
                            <td className="px-4 py-3 text-center">
                              <button 
                                onClick={() => toggleSafetyStockStatus(stock.id)}
                                disabled={isReadOnly}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all ${isReadOnly ? 'cursor-not-allowed opacity-80' : 'active:scale-95'} ${isGreen ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm' : 'bg-amber-400 text-slate-900 border-amber-500 shadow-sm'}`}
                              >
                                {isGreen ? <Icons.Check /> : <Icons.Pending />}
                                <span>{stock.status}</span>
                              </button>
                            </td>
                            {!isReadOnly && (
                              <td className="px-4 py-3 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button onClick={() => handleEditSafetyStock(stock)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Icons.Edit /></button>
                                  <button onClick={() => handleDeleteSafetyStock(stock.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Icons.Trash /></button>
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {}
      {deleteTargetId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm p-8 text-center animate-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icons.Trash />
            </div>
            <h2 className="text-xl font-black text-slate-800 uppercase mb-2">Eliminar Item?</h2>
            <p className="text-slate-500 text-sm font-medium mb-8">Esta ação apagará esta alocação definitivamente.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTargetId(null)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest">Cancelar</button>
              <button onClick={confirmDelete} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm p-8">
            <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Ajustes</h2><button onClick={() => setIsSettingsOpen(false)} className="p-2 bg-slate-100 rounded-full"><Icons.X /></button></div>
            <div className="space-y-6">
              <div><label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Valor da Perda (kg)</label><div className="relative"><input type="number" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-2xl font-black focus:border-blue-500 focus:outline-none" value={lossValue} onChange={(e) => setLossValue(e.target.value)} /><span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-slate-300">kg</span></div></div>
              <button onClick={() => setIsSettingsOpen(false)} className="w-full py-4 bg-blue-600 text-white rounded-[20px] font-black text-xs uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all">Salvar Alteração</button>
            </div>
          </div>
        </div>
      )}

      {isClearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm p-8 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6"><Icons.Alert /></div>
            <h2 className="text-xl font-black text-slate-800 uppercase mb-2">Limpar Tudo?</h2>
            <p className="text-slate-500 text-sm font-medium mb-8">Apagar todos os dados da aplicação? Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3"><button onClick={() => setIsClearModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest">Cancelar</button><button onClick={handleClearAll} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg">Limpar</button></div>
          </div>
        </div>
      )}

      {}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto py-20">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50"><h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">{isQtyOnlyMode ? 'Ajustar Peso' : (editingId ? 'Editar Alocação' : 'Nova Alocação')}</h2><button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-200/50 rounded-full"><Icons.X /></button></div>
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {isQtyOnlyMode ? (
                  <div className="col-span-2 text-center"><label className="block text-[10px] font-black text-blue-600 uppercase mb-3 tracking-widest">Quantidade Atual (kg)</label><input required type="number" step="0.01" className="w-full px-6 py-8 text-4xl font-black border-2 border-blue-100 rounded-[28px] outline-none focus:border-blue-500 text-center tabular-nums bg-slate-50" value={formData.quantidade} onChange={(e) => setFormData({...formData, quantidade: e.target.value})} autoFocus /></div>
                ) : (
                  <>
                    <div className="col-span-1"><label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Seq.</label><input type="number" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={formData.sequencia} onChange={(e) => setFormData({...formData, sequencia: e.target.value})} /></div>
                    <div className="col-span-1"><label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Máquina</label><input required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={formData.maquina} onChange={(e) => setFormData({...formData, maquina: e.target.value})} /></div>
                    <div><label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Item</label><input required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={formData.item} onChange={(e) => setFormData({...formData, item: e.target.value})} /></div>
                    <div><label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Item Final</label><input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={formData.itemFinal} onChange={(e) => setFormData({...formData, itemFinal: e.target.value})} placeholder="(Opcional)" /></div>
                    <div className="col-span-2"><label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Descrição</label><textarea className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl h-24 resize-none" value={formData.descricao} onChange={(e) => setFormData({...formData, descricao: e.target.value})}></textarea></div>
                    <div><label className="block text-[10px] font-black text-blue-500 uppercase mb-2 font-black">Qtd (kg)</label><input required type="number" step="0.01" className="w-full px-4 py-3 bg-slate-50 border border-blue-200 rounded-xl font-bold" value={formData.quantidade} onChange={(e) => setFormData({...formData, quantidade: e.target.value})} /></div>
                    <div><label className="block text-[10px] font-black text-slate-400 uppercase mb-2">OP</label><input required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={formData.ordemProducao} onChange={(e) => setFormData({...formData, ordemProducao: e.target.value})} /></div>
                  </>
                )}
              </div>
              <div className="pt-4 flex gap-4"><button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 border-2 border-slate-100 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">Cancelar</button><button type="submit" className="flex-1 py-4 bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-slate-900 transition-all">Salvar</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
