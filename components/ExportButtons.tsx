import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';
import * as XLSX from 'xlsx';
import { GlobalCalculationResult, Sector } from '@/lib/pricing-engine';

interface ExportButtonsProps {
  resultRef: React.RefObject<HTMLDivElement | null>;
  sectors: Sector[];
  results: GlobalCalculationResult;
  profitPercentage: number;
}

export function ExportButtons({ resultRef, sectors, results, profitPercentage }: ExportButtonsProps) {
  
  const prepareForExport = () => {
    const scrollContainer = resultRef.current?.querySelector('#results-scroll-container');
    if (scrollContainer) {
      scrollContainer.classList.remove('max-h-[60vh]', 'overflow-y-auto');
    }
    return scrollContainer;
  };

  const restoreAfterExport = (scrollContainer: Element | null | undefined) => {
    if (scrollContainer) {
      scrollContainer.classList.add('max-h-[60vh]', 'overflow-y-auto');
    }
  };

  const handleExportPDF = async () => {
    if (!resultRef.current) return;
    const scrollContainer = prepareForExport();
    
    // Wait a brief moment for the DOM to update
    await new Promise(resolve => setTimeout(resolve, 150));

    try {
      const element = resultRef.current;
      const dataUrl = await toPng(element, { 
        quality: 0.95, 
        backgroundColor: '#0a0a0a',
        pixelRatio: 2 // Higher quality for PDF
      });
      
      const width = element.offsetWidth;
      const height = element.offsetHeight;
      const orientation = width > height ? 'landscape' : 'portrait';

      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'px',
        format: [width, height]
      });
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
      pdf.save('suportedata-relatorio.pdf');
    } catch (err) {
      console.error('Failed to export PDF', err);
      alert('Ocorreu um erro ao gerar o PDF. Tente novamente.');
    } finally {
      restoreAfterExport(scrollContainer);
    }
  };

  const handleExportImage = async () => {
    if (!resultRef.current) return;
    const scrollContainer = prepareForExport();
    
    // Wait a brief moment for the DOM to update
    await new Promise(resolve => setTimeout(resolve, 150));

    try {
      const dataUrl = await toPng(resultRef.current, { 
        quality: 0.95, 
        backgroundColor: '#0a0a0a',
        pixelRatio: 2
      });
      const link = document.createElement('a');
      link.download = 'suportedata-relatorio.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export Image', err);
      alert('Ocorreu um erro ao gerar a imagem. Tente novamente.');
    } finally {
      restoreAfterExport(scrollContainer);
    }
  };

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    
    // Create data rows
    const data: any[] = [];
    data.push(['CÁLCULO DE LUCRO SUPORTEDATA - RELATÓRIO DE PRECIFICAÇÃO']);
    data.push([]);
    
    data.push(['CUSTOS GLOBAIS']);
    sectors.forEach(sector => {
      data.push([sector.title.toUpperCase()]);
      data.push(['Nome', 'Valor', 'Tipo']);
      sector.fields.forEach(field => {
        data.push([field.name, field.value, field.type]);
      });
      data.push([]);
    });

    data.push(['LUCRO DESEJADO', profitPercentage, '%']);
    data.push([]);
    data.push(['RESULTADOS POR PRODUTO']);
    
    // Header for products
    data.push([
      'Produto', 
      'Custo Variável (Un)', 
      'Rateio Custo Fixo (Un)', 
      'Frete (Un)',
      'Impostos (Un)', 
      'Lucro Real (R$)', 
      'Margem Real (%)', 
      'PREÇO FINAL (R$)'
    ]);

    results.productResults.forEach(res => {
      // Find the product to get its freight
      // Wait, freight is not in ProductResult. Let's add it or just get it from the products array if passed, but we don't have products array here.
      // Let's add unitFreight to ProductResult in pricing-engine.ts
      data.push([
        res.productName,
        res.unitVariableCost,
        res.unitFixedCost,
        res.unitFreight || 0,
        res.unitTaxes,
        res.unitRealProfitValue,
        res.unitRealProfitPercentage,
        res.unitFinalPrice
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Set column widths for better organization
    ws['!cols'] = [
      { wch: 30 }, // Produto
      { wch: 20 }, // Custo Variável
      { wch: 20 }, // Custo Fixo
      { wch: 20 }, // Frete
      { wch: 20 }, // Impostos
      { wch: 20 }, // Lucro Real
      { wch: 20 }, // Margem Real
      { wch: 20 }, // Preço Final
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Precificação');
    XLSX.writeFile(wb, 'suportedata-relatorio.xlsx');
  };

  return (
    <div className="grid grid-cols-3 gap-3 pt-4">
      <button onClick={handleExportPDF} className="flex flex-col items-center justify-center gap-2 p-4 bg-[#171717] rounded-xl hover:bg-[#262626] hover:text-[#FFD700] transition-all text-[#a3a3a3] border border-white/5 hover:border-[#FFD700]/30">
        <span className="material-symbols-outlined">picture_as_pdf</span>
        <span className="text-[10px] font-bold uppercase tracking-wider">PDF</span>
      </button>
      <button onClick={handleExportImage} className="flex flex-col items-center justify-center gap-2 p-4 bg-[#171717] rounded-xl hover:bg-[#262626] hover:text-[#FFD700] transition-all text-[#a3a3a3] border border-white/5 hover:border-[#FFD700]/30">
        <span className="material-symbols-outlined">image</span>
        <span className="text-[10px] font-bold uppercase tracking-wider">Imagem</span>
      </button>
      <button onClick={handleExportExcel} className="flex flex-col items-center justify-center gap-2 p-4 bg-[#171717] rounded-xl hover:bg-[#262626] hover:text-[#FFD700] transition-all text-[#a3a3a3] border border-white/5 hover:border-[#FFD700]/30">
        <span className="material-symbols-outlined">table_chart</span>
        <span className="text-[10px] font-bold uppercase tracking-wider">Excel</span>
      </button>
    </div>
  );
}
