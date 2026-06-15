'use client';

interface Option {
  name: string;
  values: string[];
}

interface VariantSelectorProps {
  options: Option[];
  selectedOptions: Record<string, string>;
  onChange: (optionName: string, value: string) => void;
  unavailableOptions?: Record<string, string[]>;
}

export default function VariantSelector({ options, selectedOptions, onChange, unavailableOptions = {} }: VariantSelectorProps) {
  if (!options || options.length === 0) return null;

  return (
    <div className="space-y-5">
      {options.map((option) => (
        <div key={option.name}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-900">{option.name}</span>
            {selectedOptions[option.name] && (
              <span className="text-sm text-gray-500">{selectedOptions[option.name]}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {option.values.map((value) => {
              const isSelected = selectedOptions[option.name] === value;
              const isUnavailable = (unavailableOptions[option.name] || []).includes(value);

              return (
                <button
                  key={value}
                  onClick={() => !isUnavailable && onChange(option.name, value)}
                  disabled={isUnavailable}
                  className={`
                    px-4 py-2 text-sm border rounded-lg font-medium transition-all
                    ${isSelected
                      ? 'bg-black text-white border-black'
                      : isUnavailable
                        ? 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed line-through'
                        : 'bg-white text-gray-900 border-gray-300 hover:border-black cursor-pointer'
                    }
                  `}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
