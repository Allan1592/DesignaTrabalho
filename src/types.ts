import { format } from 'date-fns';

export interface Inmate {
  id: string;
  matricula: string;
  nome: string;
  raio: string;
  cela: string;
  arquivado: boolean;
  designacaoAtual?: Designation;
  historico: Designation[];
}

export interface Company {
  id: string;
  nome: string;
  raioAtuacao: string;
}

export interface Designation {
  id: string;
  empresaId: string;
  empresaNome: string;
  dataInicio: string;
  dataDesligamento?: string;
  observacoes?: string;
  status: 'ativo' | 'desligado';
}

export type ViewType = 'active' | 'archive' | 'companies';
