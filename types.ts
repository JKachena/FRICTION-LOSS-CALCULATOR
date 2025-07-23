
export interface CalculatorInputs {
  flowrate: string;
  diameter: string;
  density: string;
  dynamicViscosity: string;
  pipeRoughness: string;
  pipeLength: string;
}

export interface CalculationResults {
  reynoldsNumber: number;
  frictionFactor: number;
  headLoss: number;
  flowRegime: 'Laminar' | 'Transitional/Turbulent';
}
