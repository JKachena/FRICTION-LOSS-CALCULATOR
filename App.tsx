
import React, { useState, useMemo } from 'react';
import { calculateFrictionAndHeadLoss } from './services/frictionCalculator';
import type { CalculatorInputs, CalculationResults } from './types';

const FlowRegimeBadge: React.FC<{ regime: CalculationResults['flowRegime'] | null }> = ({ regime }) => {
    if (!regime) return null;

    const baseClasses = "px-3 py-1 text-sm font-semibold rounded-full";
    const regimeConfig = {
        Laminar: { text: "Laminar Flow", classes: "bg-green-800 text-green-200" },
        'Transitional/Turbulent': { text: "Turbulent Flow", classes: "bg-red-800 text-red-200" },
    };

    const { text, classes } = regimeConfig[regime];

    return (
        <span className={`${baseClasses} ${classes}`}>{text}</span>
    );
};

const App: React.FC = () => {
    const [inputs, setInputs] = useState<CalculatorInputs>({
        flowrate: '',
        diameter: '',
        density: '',
        dynamicViscosity: '',
        pipeRoughness: '',
        pipeLength: '',
    });
    const [result, setResult] = useState<CalculationResults | null>(null);
    const [error, setError] = useState<string>('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setInputs(prev => ({ ...prev, [name]: value }));
        setError('');
        if(result) setResult(null);
    };

    const handleCalculate = (e: React.FormEvent) => {
        e.preventDefault();
        const { flowrate, diameter, density, dynamicViscosity, pipeRoughness, pipeLength } = inputs;

        const numValues = Object.values(inputs).map(parseFloat);
        if (numValues.some(isNaN)) {
            setError('All fields must be filled with valid numbers.');
            return;
        }
        
        const [numFlowrate, numDiameter, numDensity, numViscosity, numRoughness, numLength] = numValues;

        if (numFlowrate < 0 || numDiameter <= 0 || numDensity <= 0 || numViscosity <= 0 || numRoughness < 0 || numLength < 0) {
            setError('Inputs must be valid. Diameter, density, and viscosity must be positive.');
            return;
        }

        const calculationResult = calculateFrictionAndHeadLoss(numFlowrate, numDiameter, numDensity, numViscosity, numRoughness, numLength);
        setResult(calculationResult);
    };

    const handleReset = () => {
        setInputs({
            flowrate: '',
            diameter: '',
            density: '',
            dynamicViscosity: '',
            pipeRoughness: '',
            pipeLength: '',
        });
        setResult(null);
        setError('');
    };
    
    const isFormIncomplete = useMemo(() => {
        return Object.values(inputs).some(value => value === '');
    }, [inputs]);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 font-sans flex flex-col items-center justify-center p-4">
            <main className="w-full max-w-lg bg-gray-800/50 backdrop-blur-sm shadow-2xl rounded-2xl border border-teal-500/20">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-cyan-400">
                            Friction Loss Calculator
                        </h1>
                        <p className="mt-2 text-gray-400">Calculate head loss with the Darcy-Weisbach equation.</p>
                    </div>

                    <form onSubmit={handleCalculate} noValidate>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
                            {(Object.keys(inputs) as Array<keyof CalculatorInputs>).map((key) => {
                                const labels = {
                                    flowrate: { label: "Flowrate (Q)", unit: "m³/h", placeholder: "100" },
                                    diameter: { label: "Pipe Diameter (D)", unit: "mm", placeholder: "150" },
                                    density: { label: "Fluid Density (ρ)", unit: "kg/m³", placeholder: "998" },
                                    dynamicViscosity: { label: "Dynamic Viscosity (μ)", unit: "Pa·s", placeholder: "0.001" },
                                    pipeRoughness: { label: "Pipe Roughness (ε)", unit: "mm", placeholder: "0.045" },
                                    pipeLength: { label: "Pipe Length (L)", unit: "m", placeholder: "50" },
                                };
                                const { label, unit, placeholder } = labels[key];
                                return (
                                    <div key={key}>
                                        <label htmlFor={key} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                id={key}
                                                name={key}
                                                value={inputs[key]}
                                                onChange={handleInputChange}
                                                placeholder={placeholder}
                                                className="w-full bg-gray-900/50 border border-gray-600 rounded-lg py-2.5 pl-3 pr-16 text-white focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition"
                                                required
                                                step="any"
                                                min="0"
                                            />
                                            <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 text-sm">{unit}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {error && <p className="mt-4 text-center text-red-400 text-sm">{error}</p>}

                        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                type="submit"
                                disabled={isFormIncomplete}
                                className="w-full py-3 px-4 font-semibold text-white rounded-lg transition-all duration-300 bg-teal-600 hover:bg-teal-500 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-teal-500/50"
                            >
                                Calculate
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="w-full py-3 px-4 font-semibold text-gray-200 bg-gray-700/50 hover:bg-gray-600/80 rounded-lg transition-colors focus:outline-none focus:ring-4 focus:ring-gray-600/50"
                            >
                                Reset
                            </button>
                        </div>
                    </form>
                </div>
                
                {result && (
                     <div className="bg-gray-900/60 rounded-b-2xl p-6 border-t border-teal-500/20">
                        <h2 className="text-lg font-semibold text-center text-gray-300 mb-5">Calculation Results</h2>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                            <div className="text-center">
                                <p className="text-sm text-gray-400">Reynolds Number (Re)</p>
                                <p className="text-2xl font-bold tracking-tight text-teal-300">
                                    {result.reynoldsNumber.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </p>
                            </div>
                            <div className="flex flex-col items-center justify-center">
                                <p className="text-sm text-gray-400 mb-1.5">Flow Regime</p>
                                <FlowRegimeBadge regime={result.flowRegime} />
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-gray-400">Friction Factor (f)</p>
                                <p className="text-2xl font-bold tracking-tight text-white">
                                    {result.frictionFactor.toFixed(5)}
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-gray-400">Head Loss (h_f)</p>
                                <p className="text-2xl font-bold tracking-tight text-white">
                                    {result.headLoss.toFixed(4)}
                                    <span className="text-base font-normal text-gray-400 ml-1">m</span>
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
             <footer className="text-center mt-8">
                <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} Friction Loss Calculator. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default App;
