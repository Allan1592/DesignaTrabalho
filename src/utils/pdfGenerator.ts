import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Inmate } from '../types';
import { format } from 'date-fns';

export const generateDesignationPDF = (inmates: Inmate[]) => {
  const doc = new jsPDF();
  const timestamp = format(new Date(), 'dd/MM/yyyy HH:mm');

  doc.setFontSize(18);
  doc.text('Relatório de Designação de Trabalho', 14, 22);
  
  doc.setFontSize(10);
  doc.text(`Gerado em: ${timestamp}`, 14, 30);

  const tableData = inmates.map((inmate) => [
    inmate.matricula,
    inmate.nome,
    inmate.raio,
    inmate.cela,
    inmate.designacaoAtual?.empresaNome || 'Não designado',
    inmate.designacaoAtual?.dataInicio ? format(new Date(inmate.designacaoAtual.dataInicio), 'dd/MM/yyyy') : '-'
  ]);

  autoTable(doc, {
    startY: 35,
    head: [['Matrícula', 'Nome', 'Raio', 'Cela', 'Empresa', 'Data Início']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  doc.save(`designacoes_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`);
};
