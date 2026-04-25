export function toBaseQuantity(quantity: number, unit: string): { base: number; baseUnit: string } {
  switch (unit) {
    case 'г':
      return { base: quantity, baseUnit: 'г' };
    case 'кг':
      return { base: quantity * 1000, baseUnit: 'г' };
    case 'мл':
      return { base: quantity, baseUnit: 'мл' };
    case 'л':
      return { base: quantity * 1000, baseUnit: 'мл' };
    case 'шт':
      return { base: quantity, baseUnit: 'шт' };
    default:
      return { base: quantity, baseUnit: unit };
  }
}

export function fromBaseToOriginal(base: number, baseUnit: string, originalUnit: string): number {
  if (originalUnit === 'кг' && baseUnit === 'г') {
    return base / 1000;
  }
  if (originalUnit === 'л' && baseUnit === 'мл') {
    return base / 1000;
  }
  if (originalUnit === 'г' && baseUnit === 'г') {
    return base;
  }
  if (originalUnit === 'мл' && baseUnit === 'мл') {
    return base;
  }
  // Fallback: return the base as-is
  return base;
}
