import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Inmate } from '../types';

interface InmateFormProps {
  inmate?: Inmate;
  onClose: () => void;
  onSave: (inmate: Partial<Inmate>) => void;
}

export const InmateForm: React.FC<InmateFormProps> = ({ inmate, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Inmate>>({
    matricula: '',
    nome: '',
    raio: '',
    cela: '',
    arquivado: false,
  });

  useEffect(() => {
    if (inmate) {
      setFormData(inmate);
    }
  }, [inmate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-bottom border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-800">
            {inmate ? 'Editar Sentenciado' : 'Novo Sentenciado'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Matrícula</label>
            <input
              required
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              value={formData.matricula}
              onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
            <input
              required
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Raio</label>
              <input
                required
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                value={formData.raio}
                onChange={(e) => setFormData({ ...formData, raio: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cela</label>
              <input
                required
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                value={formData.cela}
                onChange={(e) => setFormData({ ...formData, cela: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <input
              id="arquivado"
              type="checkbox"
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              checked={formData.arquivado}
              onChange={(e) => setFormData({ ...formData, arquivado: e.target.checked })}
            />
            <label htmlFor="arquivado" className="text-sm font-medium text-gray-700 cursor-pointer">
              Não designar mais (Arquivo Morto)
            </label>
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
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
