import { Product, Field, ValueType } from '@/lib/pricing-engine';
import { Plus, Trash2, Package, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { FormattedInput } from './FormattedInput';

interface ProductCardProps {
  product: Product;
  onUpdateProduct: (productId: string, updates: Partial<Product>) => void;
  onUpdateField: (productId: string, fieldId: string, updates: Partial<Field>) => void;
  onAddField: (productId: string) => void;
  onRemoveField: (productId: string, fieldId: string) => void;
  onRemoveProduct: (productId: string) => void;
}

export function ProductCard({ 
  product, 
  onUpdateProduct, 
  onUpdateField, 
  onAddField, 
  onRemoveField,
  onRemoveProduct 
}: ProductCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-[#171717] rounded-xl overflow-hidden transition-all duration-300 border border-white/5 hover:border-[#FFD700]/30">
      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 bg-[#262626]/30">
        <div className="flex items-center gap-3">
          <div className="bg-[#262626] p-2 rounded-lg text-[#FFD700]">
            <Package className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={product.name}
            onChange={(e) => onUpdateProduct(product.id, { name: e.target.value })}
            placeholder="Nome do Produto"
            className="bg-transparent border-none text-lg font-headline font-bold text-white focus:ring-0 outline-none p-0 placeholder:text-[#525252]"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#262626] rounded-lg px-3 py-1.5">
            <span className="text-xs font-bold text-[#a3a3a3] uppercase tracking-wider">Qtd</span>
            <FormattedInput
              type="#"
              value={product.quantity}
              onChange={(value) => onUpdateProduct(product.id, { quantity: value })}
              className="w-16 bg-transparent border-none text-sm font-bold text-[#FFD700] focus:ring-0 outline-none p-0 text-right"
              placeholder="1"
            />
          </div>
          <button
            onClick={() => onRemoveProduct(product.id)}
            className="p-2 text-[#525252] hover:text-[#f87171] transition-colors"
            title="Remover Produto"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#262626]/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h4 className="font-semibold text-sm text-[#a3a3a3] uppercase tracking-wider">Custos Variáveis (Por Unidade)</h4>
        {isExpanded ? <ChevronDown className="w-4 h-4 text-[#a3a3a3]" /> : <ChevronRight className="w-4 h-4 text-[#a3a3a3]" />}
      </div>

      {isExpanded && (
        <div className="px-5 pb-5 space-y-4">
          <div className="space-y-3">
            {product.variableCosts.map((field) => (
              <div key={field.id} className="flex flex-col sm:flex-row sm:items-center gap-2 group animate-in fade-in slide-in-from-top-2 duration-300">
                <input
                  type="text"
                  value={field.name}
                  onChange={(e) => onUpdateField(product.id, field.id, { name: e.target.value })}
                  placeholder="Ex: Embalagem"
                  className="flex-1 bg-[#262626] border-none rounded-lg text-sm px-4 py-3 text-white focus:ring-2 focus:ring-[#FFD700]/50 outline-none transition-all placeholder:text-[#525252]"
                />
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={field.type}
                    onChange={(e) => onUpdateField(product.id, field.id, { type: e.target.value as ValueType })}
                    className="w-16 bg-[#262626] border-none rounded-lg text-xs font-bold px-2 py-3 text-[#FFD700] focus:ring-2 focus:ring-[#FFD700]/50 outline-none appearance-none text-center"
                  >
                    <option value="R$">R$</option>
                    <option value="%">%</option>
                  </select>
                  <FormattedInput
                    type={field.type}
                    value={field.value}
                    onChange={(value) => onUpdateField(product.id, field.id, { value })}
                    placeholder="0,00"
                    className="flex-1 sm:w-24 bg-[#262626] border-none rounded-lg text-sm font-bold px-3 py-3 text-[#FFD700] focus:ring-2 focus:ring-[#FFD700]/50 outline-none transition-all text-right"
                  />
                  <button
                    onClick={() => onRemoveField(product.id, field.id)}
                    className="p-3 bg-[#262626] rounded-lg text-[#525252] hover:text-[#f87171] hover:bg-[#f87171]/10 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => onAddField(product.id)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#262626] text-[#FFD700] font-bold text-sm rounded-lg hover:bg-[#FFD700] hover:text-black transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            ADICIONAR CUSTO VARIÁVEL
          </button>
        </div>
      )}
    </div>
  );
}
