import React from "react";
import { Button } from "../ui/button";
import { Minus, Plus } from "lucide-react";
import { Input } from "../ui/input";

type QuantityCounterProps = {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
};

const QuantityCounter: React.FC<QuantityCounterProps> = ({
  value,
  min = 0,
  max = Infinity,
  onChange,
}) => {
  const increment = () => {
    if (value < max) onChange(value + 1);
  };

  const decrement = () => {
    if (value > min) onChange(value - 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  return (
    <div className="inline-flex items-center border border-secondary   overflow-hidden w-full">
      <Button
        aria-label="Decrease quantity"
        type="button"
        onClick={decrement}
        disabled={value <= min}
        variant={"red"}
        className="disabled:cursor-not-allowed"
      >
        <Minus />
      </Button>

      <Input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={handleInputChange}
        aria-label="Quantity"
      />
      <Button
        variant={"green"}
        type="button"
        onClick={increment}
        disabled={value >= max}
        aria-label="Increase quantity"
        className="disabled:cursor-not-allowed"
      >
        <Plus />
      </Button>
    </div>
  );
};

export default QuantityCounter;
