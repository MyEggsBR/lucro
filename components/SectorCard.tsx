import { Sector, Field, ValueType } from '@/lib/pricing-engine';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { FormattedInput } from './FormattedInput';

interface SectorCardProps {
  sector: Sector;
  onUpdateField: (sectorId: string, fieldId: string, updates: Partial<Field>) => void;
  onAddField: (sectorId: string) => void;
  onRemoveField: (sectorId: string, fieldId: string) => void;
}

export function SectorCard({ sector, onUpdateField, onAddField, onRemoveField }: SectorCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Calculate summary for collapsed state
  const summaryValue = sector.fields.reduce((acc, field) => acc + field.value, 0);
  const summaryType = sector.fields.length > 0 ? sector.fields[0].type : 'R$';

  return (
    <div className="bg-[#171717] rounded-xl overflow-hidden transition-all duration-300 border border-white/5 hover:border-[#FFD700]/30">
      <div 
        className="p-5 flex items-center justify-between cursor-pointer hover:bg-[#262626] transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="bg-[#262626] p-2 rounded-lg text-[#FFD700]">
            <span className="material-symbols-outlined">{sector.iconName}</span>
          </div>
          <h3 className="font-headline font-bold text-white text-lg tracking-tight">{sector.title}</h3>
        </div>
        {!isExpanded ? (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-[#a3a3a3]">
              {summaryType === 'R$' ? `R$ ${summaryValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `${summaryValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`}
            </span>
            <ChevronRight className="w-5 h-5 text-[#a3a3a3]" />
          </div>
        ) : (
          <ChevronDown className="w-5 h-5 text-[#a3a3a3]" />
        )}
      </div>

      {isExpanded && (
        <div className="px-5 pb-5 space-y-4">
          <div className="space-y-3">
            {sector.fields.map((field) => (
              <div key={field.id} className="flex flex-col sm:flex-row sm:items-center gap-2 group animate-in fade-in slide-in-from-top-2 duration-300">
                <input
                  type="text"
                  value={field.name}
                  onChange={(e) => onUpdateField(sector.id, field.id, { name: e.target.value })}
                  placeholder="Nome do item"
                  className="flex-1 bg-[#262626] border-none rounded-lg text-sm px-4 py-3 text-white focus:ring-2 focus:ring-[#FFD700]/50 outline-none transition-all placeholder:text-[#525252]"
                />
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={field.type}
                    onChange={(e) => onUpdateField(sector.id, field.id, { type: e.target.value as ValueType })}
                    className="w-16 bg-[#262626] border-none rounded-lg text-xs font-bold px-2 py-3 text-[#FFD700] focus:ring-2 focus:ring-[#FFD700]/50 outline-none appearance-none text-center"
                  >
                    <option value="R$">R$</option>
                    <option value="%">%</option>
                    <option value="#">#</option>
                  </select>
                  <FormattedInput
                    type={field.type}
                    value={field.value}
                    onChange={(value) => onUpdateField(sector.id, field.id, { value })}
                    placeholder="0,00"
                    className="flex-1 sm:w-24 bg-[#262626] border-none rounded-lg text-sm font-bold px-3 py-3 text-[#FFD700] focus:ring-2 focus:ring-[#FFD700]/50 outline-none transition-all text-right"
                  />
                  <button
                    onClick={() => onRemoveField(sector.id, field.id)}
                    className="p-3 bg-[#262626] rounded-lg text-[#525252] hover:text-[#f87171] hover:bg-[#f87171]/10 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => onAddField(sector.id)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#262626] text-[#FFD700] font-bold text-sm rounded-lg hover:bg-[#FFD700] hover:text-black transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            ADICIONAR CAMPO
          </button>
        </div>
      )}
    </div>
  );
}
