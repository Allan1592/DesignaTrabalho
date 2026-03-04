import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Company } from '../types';

interface CompanyFormProps {
  company?: Company;
  onClose: () => void;
  onSave: (company: Partial<Company>) => void;
}

export const CompanyForm: React.FC<CompanyFormProps> = ({ company, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Company>>({
    nome: '',
    raioAtuacao: '',
  });

  useEffect(() => {
    if (company) {
      setFormData(company);
    }
  }, [company]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-bottom border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-800">
            {company ? 'Editar Empresa' : 'Nova Empresa'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa</label>
            <input
              required
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Raio de Atuação</label>
            <input
              required
              type="text"
              placeholder="Ex: Raio 1, Raio 2"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              value={formData.raioAtuacao}
              onChange={(e) => setFormData({ ...formData, raioAtuacao: e.target.value })}
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
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-sm"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
