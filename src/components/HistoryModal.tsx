import React from 'react';
import { X, History, Calendar, Building2, Info } from 'lucide-react';
import { Inmate } from '../types';
import { format } from 'date-fns';

interface HistoryModalProps {
  inmate: Inmate;
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ inmate, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-bottom border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="flex items-center space-x-3">
            <History className="text-blue-600" size={24} />
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Histórico de Designações</h2>
              <p className="text-sm text-gray-500">{inmate.nome} ({inmate.matricula})</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {inmate.historico.length === 0 ? (
            <div className="text-center py-12 text-gray-500 italic">
              Nenhum histórico de designação encontrado para este sentenciado.
            </div>
          ) : (
            <div className="space-y-6">
              {[...inmate.historico].reverse().map((designation, index) => (
                <div key={designation.id} className="relative pl-8 border-l-2 border-blue-100 pb-2 last:border-0 last:pb-0">
                  <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-sm" />
                  
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-2">
                        <Building2 size={16} className="text-blue-600" />
                        <span className="font-bold text-gray-900">{designation.empresaNome}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        designation.status === 'ativo' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {designation.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Calendar size={14} />
                        <span>Início: {format(new Date(designation.dataInicio), 'dd/MM/yyyy')}</span>
                      </div>
                      {designation.dataDesligamento && (
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Calendar size={14} />
                          <span>Fim: {format(new Date(designation.dataDesligamento), 'dd/MM/yyyy')}</span>
                        </div>
                      )}
                    </div>

                    {designation.observacoes && (
                      <div className="flex items-start space-x-2 bg-white p-3 rounded-lg border border-gray-100">
                        <Info size={14} className="text-gray-400 mt-1 flex-shrink-0" />
                        <p className="text-sm text-gray-600 italic leading-relaxed">
                          {designation.observacoes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium shadow-sm"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
