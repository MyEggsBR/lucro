'use client';

import { useState, useMemo, useRef } from 'react';
import { Sector, Field, Product, CalcMode, calculatePricing } from '@/lib/pricing-engine';
import { SectorCard } from '@/components/SectorCard';
import { ProductCard } from '@/components/ProductCard';
import { ExportButtons } from '@/components/ExportButtons';
import { FormattedInput } from '@/components/FormattedInput';
import { Plus } from 'lucide-react';

const initialProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Produto A',
    quantity: 1,
    freight: 15.00,
    variableCosts: [
      { id: 'p1', name: 'Embalagem', type: 'R$', value: 2.50 },
      { id: 'p2', name: 'Insumo Base', type: 'R$', value: 45.00 }
    ]
  }
];

const initialGlobalSectors: Sector[] = [
  { 
    id: 'fixedCosts', 
    title: 'Custos Fixos Globais', 
    iconName: 'receipt_long', 
    fields: [
      { id: 'f1', name: 'Aluguel Prorrateado', type: 'R$', value: 1500.00 }
    ] 
  },
  { 
    id: 'taxes', 
    title: 'Impostos Globais', 
    iconName: 'percent', 
    fields: [
      { id: 'i1', name: 'Simples Nacional', type: '%', value: 12.00 }
    ] 
  }
];

export default function PricingApp() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [globalSectors, setGlobalSectors] = useState<Sector[]>(initialGlobalSectors);
  const [profitPercentage, setProfitPercentage] = useState<number>(30);
  const [calcMode, setCalcMode] = useState<CalcMode>('markup');
  const resultsRef = useRef<HTMLDivElement>(null);

  // --- Product Handlers ---
  const handleAddProduct = () => {
    const newProduct: Product = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Produto ${products.length + 1}`,
      quantity: 1,
      freight: 0,
      variableCosts: []
    };
    setProducts([...products, newProduct]);
  };

  const handleRemoveProduct = (productId: string) => {
    setProducts(products.filter(p => p.id !== productId));
  };

  const handleUpdateProduct = (productId: string, updates: Partial<Product>) => {
    setProducts(products.map(p => p.id === productId ? { ...p, ...updates } : p));
  };

  const handleAddProductField = (productId: string) => {
    const newField: Field = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      type: 'R$',
      value: 0
    };
    setProducts(products.map(p => {
      if (p.id !== productId) return p;
      return { ...p, variableCosts: [...p.variableCosts, newField] };
    }));
  };

  const handleUpdateProductField = (productId: string, fieldId: string, updates: Partial<Field>) => {
    setProducts(products.map(p => {
      if (p.id !== productId) return p;
      return {
        ...p,
        variableCosts: p.variableCosts.map(f => f.id === fieldId ? { ...f, ...updates } : f)
      };
    }));
  };

  const handleRemoveProductField = (productId: string, fieldId: string) => {
    setProducts(products.map(p => {
      if (p.id !== productId) return p;
      return { ...p, variableCosts: p.variableCosts.filter(f => f.id !== fieldId) };
    }));
  };

  // --- Global Sector Handlers ---
  const handleUpdateGlobalField = (sectorId: string, fieldId: string, updates: Partial<Field>) => {
    setGlobalSectors(prev => prev.map(s => {
      if (s.id !== sectorId) return s;
      return {
        ...s,
        fields: s.fields.map(f => f.id === fieldId ? { ...f, ...updates } : f)
      };
    }));
  };

  const handleAddGlobalField = (sectorId: string) => {
    const newField: Field = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      type: 'R$',
      value: 0
    };
    setGlobalSectors(prev => prev.map(s => {
      if (s.id !== sectorId) return s;
      return { ...s, fields: [...s.fields, newField] };
    }));
  };

  const handleRemoveGlobalField = (sectorId: string, fieldId: string) => {
    setGlobalSectors(prev => prev.map(s => {
      if (s.id !== sectorId) return s;
      return { ...s, fields: s.fields.filter(f => f.id !== fieldId) };
    }));
  };

  // --- Calculations ---
  const results = useMemo(() => {
    const fixedCosts = globalSectors.find(s => s.id === 'fixedCosts')?.fields || [];
    const taxes = globalSectors.find(s => s.id === 'taxes')?.fields || [];
    
    return calculatePricing(products, fixedCosts, taxes, profitPercentage, calcMode);
  }, [products, globalSectors, profitPercentage, calcMode]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-12 lg:pl-64">
      
      {/* Desktop Sidebar */}
      <aside className="h-full w-64 fixed left-0 top-0 bg-[#0a0a0a] border-r border-white/5 flex-col py-8 px-4 z-[60] hidden lg:flex">
        <div className="flex items-center gap-3 px-4 mb-10">
          <span className="material-symbols-outlined text-[#FFD700] text-3xl">architecture</span>
          <div className="flex flex-col">
            <span className="text-[#FFD700] font-bold font-headline text-lg leading-none">SuporteData</span>
            <span className="text-[#a3a3a3] text-[10px] font-headline font-semibold uppercase tracking-widest mt-1">Cálculo de Lucro</span>
          </div>
        </div>
        <nav className="flex-1 space-y-2">
          <button className="w-full flex items-center gap-4 px-4 py-3 text-[#FFD700] bg-[#262626]/50 rounded-lg font-headline font-semibold text-sm uppercase tracking-widest">
            <span className="material-symbols-outlined">payments</span>
            Calculadora
          </button>
        </nav>
      </aside>

      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-[#0a0a0a]/80 backdrop-blur-lg border-b border-white/5 lg:pl-64">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 lg:hidden">
            <span className="material-symbols-outlined text-[#FFD700] text-2xl">architecture</span>
            <h1 className="font-headline font-extrabold text-xl text-white tracking-tight uppercase italic">SuporteData</h1>
          </div>
          <div className="hidden lg:block">
             <h1 className="font-headline font-extrabold text-xl text-white tracking-tight">Cálculo de Lucro</h1>
          </div>
          <div className="flex items-center bg-[#262626] p-1 rounded-full text-[12px] font-semibold border border-white/5">
            <button 
              onClick={() => setCalcMode('markup')}
              className={`px-4 py-1.5 rounded-full transition-all ${calcMode === 'markup' ? 'bg-[#FFD700] text-black shadow-lg shadow-[#FFD700]/20' : 'text-[#a3a3a3] hover:text-white'}`}
            >
              Markup
            </button>
            <button 
              onClick={() => setCalcMode('margin')}
              className={`px-4 py-1.5 rounded-full transition-all ${calcMode === 'margin' ? 'bg-[#FFD700] text-black shadow-lg shadow-[#FFD700]/20' : 'text-[#a3a3a3] hover:text-white'}`}
            >
              Margem
            </button>
          </div>
        </div>
      </header>

      <main className="px-6 pt-24 pb-12 max-w-7xl mx-auto flex flex-col xl:flex-row gap-10">
        
        {/* Left Column: Inputs */}
        <div className="flex-1 space-y-10 max-w-2xl w-full mx-auto xl:mx-0">
          <div className="space-y-2 lg:hidden">
            <h2 className="font-headline font-bold text-2xl tracking-tight text-white">Cálculo de Preço</h2>
            <p className="text-[#a3a3a3] text-sm leading-relaxed">Defina seus custos e margens para encontrar o ponto de equilíbrio ideal.</p>
          </div>

          {/* Products Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-headline font-bold text-xl text-white tracking-tight">Produtos</h3>
              <span className="text-xs font-bold text-[#FFD700] bg-[#FFD700]/10 px-3 py-1 rounded-full">
                {results.totalUnits} {results.totalUnits === 1 ? 'Unidade' : 'Unidades'} no Total
              </span>
            </div>
            
            {products.map(product => (
              <ProductCard 
                key={product.id} 
                product={product}
                onUpdateProduct={handleUpdateProduct}
                onUpdateField={handleUpdateProductField}
                onAddField={handleAddProductField}
                onRemoveField={handleRemoveProductField}
                onRemoveProduct={handleRemoveProduct}
              />
            ))}

            <button
              onClick={handleAddProduct}
              className="w-full flex items-center justify-center gap-2 py-4 bg-transparent border-2 border-dashed border-[#262626] text-[#a3a3a3] font-bold text-sm rounded-xl hover:border-[#FFD700]/50 hover:text-[#FFD700] transition-all"
            >
              <Plus className="w-5 h-5" />
              NOVO PRODUTO
            </button>
          </section>

          <hr className="border-white/5" />

          {/* Freight per Product Section */}
          <section className="space-y-4">
            <div className="mb-4">
              <h3 className="font-headline font-bold text-xl text-white tracking-tight">Frete por Produto</h3>
              <p className="text-[#a3a3a3] text-sm mt-1">Defina o valor do frete unitário para cada produto.</p>
            </div>

            <div className="bg-[#171717] rounded-xl overflow-hidden border border-white/5">
              <div className="p-5 space-y-4">
                {products.map(product => (
                  <div key={product.id} className="flex items-center justify-between gap-4 p-3 bg-[#262626]/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#a3a3a3]">local_shipping</span>
                      <span className="font-semibold text-white">{product.name || 'Produto Sem Nome'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#a3a3a3]">R$</span>
                      <FormattedInput
                        type="R$"
                        value={product.freight || 0}
                        onChange={(value) => handleUpdateProduct(product.id, { freight: value })}
                        className="w-24 bg-[#262626] border-none rounded-lg text-sm font-bold px-3 py-2 text-[#FFD700] focus:ring-2 focus:ring-[#FFD700]/50 outline-none text-right"
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <hr className="border-white/5" />

          {/* Global Costs Section */}
          <section className="space-y-4">
            <div className="mb-4">
              <h3 className="font-headline font-bold text-xl text-white tracking-tight">Custos Globais</h3>
              <p className="text-[#a3a3a3] text-sm mt-1">Rateados entre todos os produtos com base na quantidade.</p>
            </div>

            {globalSectors.map(sector => (
              <SectorCard 
                key={sector.id} 
                sector={sector} 
                onUpdateField={handleUpdateGlobalField}
                onAddField={handleAddGlobalField}
                onRemoveField={handleRemoveGlobalField}
              />
            ))}

            {/* Profit Sector (Special Case) */}
            <div className="bg-[#171717] rounded-xl p-5 flex items-center justify-between border border-[#FFD700]/40 ring-1 ring-[#FFD700]/40 shadow-[0_0_20px_rgba(250,204,21,0.05)]">
              <div className="flex items-center gap-3">
                <div className="bg-[#FFD700] p-2 rounded-lg text-black">
                  <span className="material-symbols-outlined">trending_up</span>
                </div>
                <h3 className="font-headline font-bold text-white text-lg tracking-tight">Lucro Desejado</h3>
              </div>
              <div className="flex items-center gap-2">
                <FormattedInput
                  type="%"
                  value={profitPercentage}
                  onChange={(value) => setProfitPercentage(value)}
                  className="w-20 bg-transparent border-none text-right text-xl font-bold text-[#FFD700] focus:ring-0 outline-none p-0"
                />
                <span className="text-xl font-bold text-[#FFD700]">%</span>
              </div>
            </div>
          </section>

          <div className="xl:hidden">
            <ExportButtons resultRef={resultsRef} sectors={globalSectors} results={results as any} profitPercentage={profitPercentage} />
          </div>
        </div>

        {/* Right Column: Results Panel */}
        <aside className="w-full xl:w-[400px]">
          <div className="sticky top-28 space-y-6">
            <div ref={resultsRef} className="bg-[#171717] rounded-2xl shadow-[0_40px_80px_rgba(0,0,0,0.8)] overflow-hidden border border-[#262626]">
              <div className="bg-[#FFD700] px-8 py-8 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black mb-2">Relatório de Precificação</p>
                <h3 className="text-3xl font-headline font-black text-black tracking-tighter">
                  {results.productResults.length} {results.productResults.length === 1 ? 'Produto' : 'Produtos'}
                </h3>
              </div>
              
              <div id="results-scroll-container" className="p-6 space-y-6 bg-[#171717] max-h-[60vh] overflow-y-auto no-scrollbar">
                {results.productResults.map((res, index) => (
                  <div key={res.productId} className={`space-y-4 ${index !== 0 ? 'pt-6 border-t border-[#262626]' : ''}`}>
                    <h4 className="font-headline font-bold text-lg text-white">{res.productName}</h4>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#a3a3a3] mb-1">Preço Unitário</p>
                        <p className="text-2xl font-bold text-[#FFD700]">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(res.unitFinalPrice)} 
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#a3a3a3] mb-1">Lucro Real</p>
                        <p className="text-lg font-bold text-white">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(res.unitRealProfitValue)}
                        </p>
                        <span className="text-xs font-bold text-[#a3a3a3]">({res.unitRealProfitPercentage.toFixed(1)}%)</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-[#a3a3a3]">Custo Variável (Un)</span>
                        <span className="text-xs font-bold text-white">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(res.unitVariableCost)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-[#a3a3a3]">Rateio Custo Fixo (Un)</span>
                        <span className="text-xs font-bold text-white">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(res.unitFixedCost)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-[#a3a3a3]">Frete (Un)</span>
                        <span className="text-xs font-bold text-white">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(res.unitFreight)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-[#a3a3a3]">Impostos (Un)</span>
                        <span className="text-xs font-bold text-white">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(res.unitTaxes)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="hidden xl:block">
               <ExportButtons resultRef={resultsRef} sectors={globalSectors} results={results as any} profitPercentage={profitPercentage} />
            </div>
          </div>
        </aside>

      </main>
    </div>
  );
}

