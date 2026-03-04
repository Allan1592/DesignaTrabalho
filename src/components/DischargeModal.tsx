import React, { useState } from 'react';
import { X, UserMinus, Calendar, Info } from 'lucide-react';
import { Inmate } from '../types';

interface DischargeModalProps {
  inmate: Inmate;
  onClose: () => void;
  onConfirm: (dischargeDate: string, observations: string) => void;
}

export const DischargeModal: React.FC<DischargeModalProps> = ({ inmate, onClose, onConfirm }) => {
  const [dischargeDate, setDischargeDate] = useState(new Date().toISOString().split('T')[0]);
  const [observacoes, setObservacoes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(dischargeDate, observacoes);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-bottom border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="flex items-center space-x-3">
            <UserMinus className="text-red-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-800">Desligar Sentenciado</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-red-50 p-4 rounded-xl border border-red-100 mb-4">
            <p className="text-sm text-red-700 font-medium">
              Você está desligando <span className="font-bold">{inmate.nome}</span> da empresa <span className="font-bold">{inmate.designacaoAtual?.empresaNome}</span>.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center space-x-2">
              <Calendar size={14} />
              <span>Data de Desligamento</span>
            </label>
            <input
              required
              type="date"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all"
              value={dischargeDate}
              onChange={(e) => setDischargeDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center space-x-2">
              <Info size={14} />
              <span>Observações do Desligamento</span>
            </label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all resize-none"
              rows={3}
              placeholder="Motivo do desligamento, comportamento, etc..."
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
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm"
            >
              Confirmar Desligamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
