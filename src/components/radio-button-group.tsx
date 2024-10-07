import React from "react";
import { useController, UseControllerProps } from "react-hook-form";

type OptionValue = string | number;

type Option = {
  label: string;
  value: OptionValue;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface RadioButtonGroupProps extends UseControllerProps<any> {
  options: Option[];
  label: string;
}

const colorMappings: { [key: number]: string } = {
  1: "#808080",
  2: "#00FF00",
  3: "#FFFF00",
  4: "#FFA500",
  5: "#FF0000",
};

export const getColorForRating = (rating: number): string => {
  return colorMappings[rating] || "#808080"; // Default to gray if rating is not found
};

const RadioButtonGroup: React.FC<RadioButtonGroupProps> = ({
  name,
  control,
  rules,
  options,
  label,
}) => {
  const {
    field: { onChange, value },
    fieldState: { error },
  } = useController({
    name,
    control,
    rules,
  });

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="space-y-2">
        {options.map((option) => (
          <label key={option.value.toString()} className="flex items-center">
            <input
              type="radio"
              className="form-radio h-4 w-4 text-indigo-600"
              value={option.value.toString()}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span
              className="ml-2 text-sm"
              style={{
                color: getColorForRating(Number(option.value)),
              }}
            >
              {option.label}
            </span>
          </label>
        ))}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
    </div>
  );
};

export default RadioButtonGroup;
