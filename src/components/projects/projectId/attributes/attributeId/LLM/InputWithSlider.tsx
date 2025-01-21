import { useState, useEffect } from "react";

type InputWithSliderProps = {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (newValue: number) => void;
    disabled?: boolean;
}

export function InputWithSlider(props: InputWithSliderProps) {

    const [input, setInput] = useState(props.value.toString());

    function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (!/[\d\b\.\-\+ArrowLeftArrowRight]/.test(e.key) && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
        }
    }

    function onBlur(e: React.FocusEvent<HTMLInputElement>) {
        let value = e.target.value;
        if (value === '') {
            props.onChange(props.min);
        } else {
            const numericValue = parseFloat(value);
            const minMaxValue = Math.min(Math.max(numericValue, props.min), props.max);
            const roundedValue = Math.round(minMaxValue / props.step) * props.step;
            props.onChange(roundedValue);
            setInput(roundedValue.toString());
        }
    }

    useEffect(() => {
        setInput(props.value.toString());
    }, [props.value]);

    return (
        <div className="h-full flex items-center">
            <div className="w-full flex flex-col gap-y-2">
                <div className='flex items-center justify-between'>
                    <label className="block text-sm font-medium text-gray-900">{props.label}</label>
                    <input
                        type="text"
                        value={input}
                        min={props.min}
                        max={props.max}
                        step={props.step}
                        onKeyDown={onKeyDown}
                        onChange={(e) => setInput(e.target.value)}
                        onBlur={onBlur}
                        disabled={props.disabled}
                        className="w-20 h-6 text-right text-sm text-gray-900 border border-transparent hover:border-gray-200 rounded-lg align-top"
                    />
                </div>
                <input
                    type="range"
                    value={props.value * 100}
                    min={props.min * 100}
                    max={props.max * 100}
                    step={props.step * 100}
                    onChange={(e) => props.onChange(parseInt(e.target.value) / 100)}
                    disabled={props.disabled}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
            </div>
        </div>
    );

}