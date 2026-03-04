import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Building2, 
  Archive, 
  Plus, 
  Search, 
  FileDown, 
  Edit2, 
  Trash2, 
  UserPlus,
  UserMinus,
  History as HistoryIcon,
  CheckSquare,
  Square,
  Filter,
  LayoutDashboard,
  X,
  ChevronDown,
  Download,
  Upload,
  AlertTriangle,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Inmate, Company, ViewType, Designation } from './types';
import { InmateForm } from './components/InmateForm';
import { CompanyForm } from './components/CompanyForm';
import { DesignationModal } from './components/DesignationModal';
import { HistoryModal } from './components/HistoryModal';
import { DischargeModal } from './components/DischargeModal';
import { generateDesignationPDF } from './utils/pdfGenerator';

const STORAGE_KEY_INMATES = 'designacao_trabalho_inmates_v2';
const STORAGE_KEY_COMPANIES = 'designacao_trabalho_companies_v2';
const STORAGE_KEY_LAST_BACKUP = 'designacao_trabalho_last_backup';

// Obfuscation helpers for basic local privacy
const obfuscate = (data: any) => {
  try {
    return btoa(encodeURIComponent(JSON.stringify(data)));
  } catch (e) {
    return '';
  }
};

const deobfuscate = (data: string) => {
  try {
    return JSON.parse(decodeURIComponent(atob(data)));
  } catch (e) {
    return null;
  }
};

export default function App() {
  // State
  const [inmates, setInmates] = useState<Inmate[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [view, setView] = useState<ViewType>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRaio, setSelectedRaio] = useState<string | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [selectedInmateIds, setSelectedInmateIds] = useState<Set<string>>(new Set());
  const [lastBackupDate, setLastBackupDate] = useState<string | null>(null);
  
  // Modals
  const [isInmateFormOpen, setIsInmateFormOpen] = useState(false);
  const [isCompanyFormOpen, setIsCompanyFormOpen] = useState(false);
  const [isDesignationModalOpen, setIsDesignationModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isDischargeModalOpen, setIsDischargeModalOpen] = useState(false);
  
  const [editingInmate, setEditingInmate] = useState<Inmate | undefined>();
  const [editingCompany, setEditingCompany] = useState<Company | undefined>();
  const [designatingInmate, setDesignatingInmate] = useState<Inmate | undefined>();
  const [historyInmate, setHistoryInmate] = useState<Inmate | undefined>();
  const [dischargingInmate, setDischargingInmate] = useState<Inmate | undefined>();

  // Load data
  useEffect(() => {
    const savedInmates = localStorage.getItem(STORAGE_KEY_INMATES);
    const savedCompanies = localStorage.getItem(STORAGE_KEY_COMPANIES);
    const savedBackup = localStorage.getItem(STORAGE_KEY_LAST_BACKUP);

    if (savedInmates) {
      const decoded = deobfuscate(savedInmates);
      if (decoded) setInmates(decoded);
    }
    if (savedCompanies) {
      const decoded = deobfuscate(savedCompanies);
      if (decoded) setCompanies(decoded);
    }
    if (savedBackup) setLastBackupDate(savedBackup);
  }, []);

  // Save data
  useEffect(() => {
    if (inmates.length > 0 || localStorage.getItem(STORAGE_KEY_INMATES)) {
      localStorage.setItem(STORAGE_KEY_INMATES, obfuscate(inmates));
    }
  }, [inmates]);

  useEffect(() => {
    if (companies.length > 0 || localStorage.getItem(STORAGE_KEY_COMPANIES)) {
      localStorage.setItem(STORAGE_KEY_COMPANIES, obfuscate(companies));
    }
  }, [companies]);

  // Filtering
  const filteredInmates = useMemo(() => {
    return inmates.filter(inmate => {
      const isCorrectView = view === 'archive' ? inmate.arquivado : !inmate.arquivado;
      if (!isCorrectView) return false;

      // Raio filter
      if (selectedRaio && inmate.raio !== selectedRaio) return false;

      // Company filter
      if (selectedCompanyId && inmate.designacaoAtual?.empresaId !== selectedCompanyId) return false;

      const query = searchQuery.toLowerCase();
      return (
        inmate.nome.toLowerCase().includes(query) ||
        inmate.matricula.toLowerCase().includes(query) ||
        inmate.raio.toLowerCase().includes(query) ||
        inmate.cela.toLowerCase().includes(query) ||
        inmate.designacaoAtual?.empresaNome.toLowerCase().includes(query)
      );
    });
  }, [inmates, view, searchQuery, selectedRaio, selectedCompanyId]);

  const filteredCompanies = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return companies.filter(company => 
      company.nome.toLowerCase().includes(query) ||
      company.raioAtuacao.toLowerCase().includes(query)
    );
  }, [companies, searchQuery]);

  // Handlers
  const handleSaveInmate = (data: Partial<Inmate>) => {
    if (editingInmate) {
      setInmates(inmates.map(i => i.id === editingInmate.id ? { ...i, ...data } as Inmate : i));
    } else {
      const newInmate: Inmate = {
        ...data,
        id: crypto.randomUUID(),
        arquivado: false,
        historico: [],
      } as Inmate;
      setInmates([...inmates, newInmate]);
    }
    setIsInmateFormOpen(false);
    setEditingInmate(undefined);
  };

  const handleDeleteInmate = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este sentenciado?')) {
      setInmates(inmates.filter(i => i.id !== id));
      const newSelected = new Set(selectedInmateIds);
      newSelected.delete(id);
      setSelectedInmateIds(newSelected);
    }
  };

  const handleSaveCompany = (data: Partial<Company>) => {
    if (editingCompany) {
      setCompanies(companies.map(c => c.id === editingCompany.id ? { ...c, ...data } as Company : c));
    } else {
      const newCompany: Company = {
        ...data,
        id: crypto.randomUUID(),
      } as Company;
      setCompanies([...companies, newCompany]);
    }
    setIsCompanyFormOpen(false);
    setEditingCompany(undefined);
  };

  const handleDeleteCompany = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta empresa?')) {
      setCompanies(companies.filter(c => c.id !== id));
    }
  };

  const handleDesignate = (designation: Designation) => {
    if (designatingInmate) {
      setInmates(inmates.map(i => {
        if (i.id === designatingInmate.id) {
          return {
            ...i,
            designacaoAtual: designation,
            historico: [...i.historico, designation]
          };
        }
        return i;
      }));
      setIsDesignationModalOpen(false);
      setDesignatingInmate(undefined);
    }
  };

  const handleDischarge = (dischargeDate: string, observations: string) => {
    if (dischargingInmate && dischargingInmate.designacaoAtual) {
      const updatedDesignation: Designation = {
        ...dischargingInmate.designacaoAtual,
        dataDesligamento: dischargeDate,
        observacoes: observations ? `${dischargingInmate.designacaoAtual.observacoes || ''} | Desligamento: ${observations}` : dischargingInmate.designacaoAtual.observacoes,
        status: 'desligado'
      };

      setInmates(inmates.map(i => {
        if (i.id === dischargingInmate.id) {
          return {
            ...i,
            designacaoAtual: undefined,
            historico: i.historico.map(h => h.id === updatedDesignation.id ? updatedDesignation : h)
          };
        }
        return i;
      }));
      setIsDischargeModalOpen(false);
      setDischargingInmate(undefined);
    }
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedInmateIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedInmateIds(newSelected);
  };

  const toggleAllSelection = () => {
    if (selectedInmateIds.size === filteredInmates.length) {
      setSelectedInmateIds(new Set());
    } else {
      setSelectedInmateIds(new Set(filteredInmates.map(i => i.id)));
    }
  };

  const handleExportPDF = () => {
    const selectedInmates = inmates.filter(i => selectedInmateIds.has(i.id));
    if (selectedInmates.length === 0) {
      alert('Selecione ao menos um sentenciado para exportar.');
      return;
    }
    generateDesignationPDF(selectedInmates);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedRaio(null);
    setSelectedCompanyId(null);
  };

  const handleBackup = () => {
    const data = {
      inmates,
      companies,
      version: '2.0',
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_designacao_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    const now = new Date().toLocaleString('pt-BR');
    setLastBackupDate(now);
    localStorage.setItem(STORAGE_KEY_LAST_BACKUP, now);
  };

  const handleDestroyData = () => {
    if (confirm('ATENÇÃO: Isso irá apagar permanentemente TODOS os dados deste computador. Esta ação não pode ser desfeita. Deseja continuar?')) {
      if (confirm('CONFIRMAÇÃO FINAL: Você tem certeza absoluta?')) {
        localStorage.removeItem(STORAGE_KEY_INMATES);
        localStorage.removeItem(STORAGE_KEY_COMPANIES);
        localStorage.removeItem(STORAGE_KEY_LAST_BACKUP);
        setInmates([]);
        setCompanies([]);
        setLastBackupDate(null);
        alert('Todos os dados locais foram destruídos.');
        window.location.reload();
      }
    }
  };

  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        if (data.inmates && data.companies) {
          if (confirm('Isso irá substituir todos os dados atuais. Deseja continuar?')) {
            setInmates(data.inmates);
            setCompanies(data.companies);
            alert('Backup restaurado com sucesso!');
          }
        } else {
          alert('Arquivo de backup inválido.');
        }
      } catch (err) {
        alert('Erro ao ler o arquivo de backup.');
      }
    };
    reader.readAsText(file);
    // Reset input
    event.target.value = '';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3 text-blue-600 mb-2">
            <LayoutDashboard size={28} />
            <span className="text-xl font-bold tracking-tight text-gray-900">DesignaTrabalho</span>
          </div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Sistema de Gestão</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => { setView('active'); clearFilters(); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${view === 'active' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Users size={20} />
            <span>Sentenciados</span>
          </button>
          <button
            onClick={() => { setView('archive'); clearFilters(); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${view === 'archive' ? 'bg-amber-50 text-amber-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Archive size={20} />
            <span>Arquivo Morto</span>
          </button>
          <button
            onClick={() => { setView('companies'); clearFilters(); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${view === 'companies' ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Building2 size={20} />
            <span>Empresas</span>
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-2">
          <button
            onClick={handleBackup}
            className="w-full flex items-center space-x-3 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
          >
            <Download size={18} />
            <span>Fazer Backup</span>
          </button>
          
          <label className="w-full flex items-center space-x-3 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-all cursor-pointer">
            <Upload size={18} />
            <span>Restaurar Backup</span>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleRestore}
            />
          </label>

          <button
            onClick={handleDestroyData}
            className="w-full flex items-center space-x-3 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all"
          >
            <ShieldAlert size={18} />
            <span>Destruir Dados</span>
          </button>

          {lastBackupDate && (
            <div className="px-4 py-2">
              <p className="text-[10px] text-gray-400 font-bold uppercase">Último backup:</p>
              <p className="text-[11px] text-gray-500 font-medium">{lastBackupDate}</p>
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-4 mt-2">
            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Resumo</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                <p className="text-xs text-gray-500">Ativos</p>
                <p className="text-lg font-bold text-blue-600">{inmates.filter(i => !i.arquivado).length}</p>
              </div>
              <div className="bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                <p className="text-xs text-gray-500">Empresas</p>
                <p className="text-lg font-bold text-emerald-600">{companies.length}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex-1 max-w-2xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Pesquisar por nome, matrícula, raio, cela ou empresa..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-4 ml-8">
            {view !== 'companies' && (
              <button
                onClick={handleExportPDF}
                disabled={selectedInmateIds.size === 0}
                className="flex items-center space-x-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm font-medium"
              >
                <FileDown size={18} />
                <span>Gerar PDF ({selectedInmateIds.size})</span>
              </button>
            )}
            
            <button
              onClick={() => view === 'companies' ? setIsCompanyFormOpen(true) : setIsInmateFormOpen(true)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-white transition-all shadow-sm font-medium ${view === 'companies' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              <Plus size={18} />
              <span>{view === 'companies' ? 'Nova Empresa' : 'Novo Sentenciado'}</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-8">
          {/* Quick Filters Bar - BUTTON BASED */}
          {view !== 'companies' && (
            <div className="mb-6 space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                  <span className="px-3 text-xs font-bold text-gray-400 uppercase">Raios:</span>
                  {['1', '2', '3'].map((raio) => (
                    <button
                      key={raio}
                      onClick={() => setSelectedRaio(selectedRaio === raio ? null : raio)}
                      className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                        selectedRaio === raio
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Raio {raio}
                    </button>
                  ))}
                </div>

                <div className="relative min-w-[220px]">
                  <select
                    className="w-full pl-4 pr-10 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 appearance-none focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer transition-all shadow-sm"
                    value={selectedCompanyId || ''}
                    onChange={(e) => setSelectedCompanyId(e.target.value || null)}
                  >
                    <option value="">Todas as Empresas</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>{company.nome}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                {(searchQuery || selectedRaio || selectedCompanyId) && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <X size={16} />
                    <span>Limpar Filtros</span>
                  </button>
                )}
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {view === 'companies' ? (
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nome da Empresa</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Raio de Atuação</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredCompanies.length > 0 ? filteredCompanies.map(company => (
                        <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-semibold text-gray-900">{company.nome}</td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-100">
                              {company.raioAtuacao}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => { setEditingCompany(company); setIsCompanyFormOpen(true); }}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteCompany(company.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={3} className="px-6 py-12 text-center text-gray-500 italic">
                            Nenhuma empresa encontrada.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 w-12">
                          <button onClick={toggleAllSelection} className="text-gray-400 hover:text-blue-600 transition-colors">
                            {selectedInmateIds.size === filteredInmates.length && filteredInmates.length > 0 ? (
                              <CheckSquare size={20} className="text-blue-600" />
                            ) : (
                              <Square size={20} />
                            )}
                          </button>
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Matrícula</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Sentenciado</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Localização</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Designação Atual</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredInmates.length > 0 ? filteredInmates.map(inmate => (
                        <tr key={inmate.id} className={`hover:bg-gray-50 transition-colors ${selectedInmateIds.has(inmate.id) ? 'bg-blue-50/30' : ''}`}>
                          <td className="px-6 py-4">
                            <button onClick={() => toggleSelection(inmate.id)} className="text-gray-400 hover:text-blue-600 transition-colors">
                              {selectedInmateIds.has(inmate.id) ? (
                                <CheckSquare size={20} className="text-blue-600" />
                              ) : (
                                <Square size={20} />
                              )}
                            </button>
                          </td>
                          <td className="px-6 py-4 font-mono text-sm font-bold text-gray-500">{inmate.matricula}</td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900">{inmate.nome}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-bold uppercase">R: {inmate.raio}</span>
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-bold uppercase">C: {inmate.cela}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {inmate.designacaoAtual ? (
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-blue-700">{inmate.designacaoAtual.empresaNome}</span>
                                <span className="text-xs text-gray-400">Desde {new Date(inmate.designacaoAtual.dataInicio).toLocaleDateString()}</span>
                              </div>
                            ) : (
                              <span className="text-xs font-medium text-gray-400 italic">Não designado</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end space-x-1">
                              {!inmate.arquivado && !inmate.designacaoAtual && (
                                <button
                                  onClick={() => { setDesignatingInmate(inmate); setIsDesignationModalOpen(true); }}
                                  title="Designar para Empresa"
                                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                >
                                  <UserPlus size={18} />
                                </button>
                              )}
                              {!inmate.arquivado && inmate.designacaoAtual && (
                                <button
                                  onClick={() => { setDischargingInmate(inmate); setIsDischargeModalOpen(true); }}
                                  title="Desligar da Empresa"
                                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                >
                                  <UserMinus size={18} />
                                </button>
                              )}
                              <button
                                onClick={() => { setHistoryInmate(inmate); setIsHistoryModalOpen(true); }}
                                title="Ver Histórico"
                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                              >
                                <HistoryIcon size={18} />
                              </button>
                              <button
                                onClick={() => { setEditingInmate(inmate); setIsInmateFormOpen(true); }}
                                title="Editar"
                                className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteInmate(inmate.id)}
                                title="Excluir"
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-500 italic">
                            Nenhum sentenciado encontrado nesta seção.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Modals */}
      {isInmateFormOpen && (
        <InmateForm
          inmate={editingInmate}
          onClose={() => { setIsInmateFormOpen(false); setEditingInmate(undefined); }}
          onSave={handleSaveInmate}
        />
      )}

      {isCompanyFormOpen && (
        <CompanyForm
          company={editingCompany}
          onClose={() => { setIsCompanyFormOpen(false); setEditingCompany(undefined); }}
          onSave={handleSaveCompany}
        />
      )}

      {isDesignationModalOpen && (
        <DesignationModal
          companies={companies}
          onClose={() => { setIsDesignationModalOpen(false); setDesignatingInmate(undefined); }}
          onConfirm={handleDesignate}
        />
      )}

      {isHistoryModalOpen && historyInmate && (
        <HistoryModal
          inmate={historyInmate}
          onClose={() => { setIsHistoryModalOpen(false); setHistoryInmate(undefined); }}
        />
      )}

      {isDischargeModalOpen && dischargingInmate && (
        <DischargeModal
          inmate={dischargingInmate}
          onClose={() => { setIsDischargeModalOpen(false); setDischargingInmate(undefined); }}
          onConfirm={handleDischarge}
        />
      )}
    </div>
  );
}
