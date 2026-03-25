export type ValueType = 'R$' | '%' | '#';

export interface Field {
  id: string;
  name: string;
  type: ValueType;
  value: number;
}

export interface Sector {
  id: string;
  title: string;
  iconName: string;
  fields: Field[];
}

export interface Product {
  id: string;
  name: string;
  quantity: number;
  freight: number;
  variableCosts: Field[];
}

export type CalcMode = 'markup' | 'margin';

export interface ProductResult {
  productId: string;
  productName: string;
  unitVariableCost: number;
  unitFixedCost: number;
  unitFreight: number;
  unitTotalCost: number;
  unitTaxes: number;
  unitFinalPrice: number;
  unitRealProfitValue: number;
  unitRealProfitPercentage: number;
}

export interface GlobalCalculationResult {
  totalFixedCosts: number;
  totalUnits: number;
  productResults: ProductResult[];
}

export function calculatePricing(
  products: Product[],
  fixedCosts: Field[],
  taxes: Field[],
  profitPercentage: number,
  mode: CalcMode
): GlobalCalculationResult {
  
  let totalFixedCosts = 0;
  fixedCosts.forEach(f => { if (f.type === 'R$') totalFixedCosts += f.value; });

  let totalTaxesPercentage = 0;
  taxes.forEach(f => { if (f.type === '%') totalTaxesPercentage += f.value; });

  let totalUnits = products.reduce((acc, p) => acc + (p.quantity || 1), 0);
  if (totalUnits === 0) totalUnits = 1;

  const unitFixedCost = totalFixedCosts / totalUnits;

  const productResults: ProductResult[] = products.map(product => {
    let unitVariableCost = 0;
    let productPercentageDeductions = 0;

    product.variableCosts.forEach(f => {
      if (f.type === 'R$') unitVariableCost += f.value;
      else if (f.type === '%') productPercentageDeductions += f.value;
    });

    const unitFreight = product.freight || 0;
    const unitTotalCost = unitVariableCost + unitFixedCost + unitFreight;
    const totalPercentageDeductions = productPercentageDeductions + totalTaxesPercentage;

    let unitFinalPrice = 0;

    if (mode === 'margin') {
      const denominator = 1 - ((totalPercentageDeductions + profitPercentage) / 100);
      unitFinalPrice = denominator > 0 ? unitTotalCost / denominator : 0;
    } else {
      const costWithMarkup = unitTotalCost * (1 + (profitPercentage / 100));
      const denominator = 1 - (totalPercentageDeductions / 100);
      unitFinalPrice = denominator > 0 ? costWithMarkup / denominator : 0;
    }

    const unitTaxes = unitFinalPrice * (totalTaxesPercentage / 100);
    const totalDeductionsValue = unitTaxes + (unitFinalPrice * (productPercentageDeductions / 100));
    const unitRealProfitValue = unitFinalPrice - unitTotalCost - totalDeductionsValue;
    const unitRealProfitPercentage = unitFinalPrice > 0 ? (unitRealProfitValue / unitFinalPrice) * 100 : 0;

    return {
      productId: product.id,
      productName: product.name || 'Produto Sem Nome',
      unitVariableCost,
      unitFixedCost,
      unitFreight,
      unitTotalCost,
      unitTaxes,
      unitFinalPrice,
      unitRealProfitValue,
      unitRealProfitPercentage
    };
  });

  return {
    totalFixedCosts,
    totalUnits,
    productResults
  };
}
