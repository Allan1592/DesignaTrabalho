import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Company, Designation } from '../types';

interface DesignationModalProps {
  companies: Company[];
  onClose: () => void;
  onConfirm: (designation: Designation) => void;
}

export const DesignationModal: React.FC<DesignationModalProps> = ({ companies, onClose, onConfirm }) => {
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [observacoes, setObservacoes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const company = companies.find(c => c.id === selectedCompanyId);
    if (company) {
      onConfirm({
        id: crypto.randomUUID(),
        empresaId: company.id,
        empresaNome: company.nome,
        dataInicio: startDate,
        observacoes,
        status: 'ativo',
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-bottom border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-800">Adicionar ao Boletim</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Selecionar Empresa</label>
            <select
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
            >
              <option value="">Selecione uma empresa...</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.nome} ({company.raioAtuacao})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Início</label>
            <input
              required
              type="date"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
              rows={3}
              placeholder="Digite observações relevantes..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
            />
          </div>

          <div className="pt-4 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!selectedCompanyId}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
            >
              Confirmar Designação
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
