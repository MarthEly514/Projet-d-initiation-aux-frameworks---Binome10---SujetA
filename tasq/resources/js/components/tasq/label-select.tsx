import * as React from 'react';

import InputError from '@/components/input-error';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface LabelSelectOption {
    value: string;
    label: string;
}

export interface LabelSelectProps {
    label: string;
    value: string;
    options: LabelSelectOption[];
    onValueChange: (value: string) => void;
    id?: string;
    error?: string;
    containerClassName?: string;
}

function LabelSelect({ label, value, options, onValueChange, id, error, containerClassName }: LabelSelectProps) {
    const autoId = React.useId();
    const selectId = id ?? autoId;

    return (
        <div className={cn('grid gap-1', containerClassName)}>
            <div className="relative">
                <Select value={value} onValueChange={onValueChange}>
                    <SelectTrigger
                        id={selectId}
                        aria-invalid={!!error}
                        className="peer text-foreground border-foreground/30 focus:border-brand data-[state=open]:border-brand aria-invalid:border-destructive h-14 rounded-none border-0 border-b bg-transparent px-6 pt-5 pb-1 text-left text-[16px] transition-colors focus:ring-0 focus:ring-offset-0"
                    >
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-0">
                        {options.map((option) => (
                            <SelectItem key={option.value} value={option.value} className="focus:bg-brand/10 focus:text-brand rounded-xl py-2 text-[16px]">
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <label
                    htmlFor={selectId}
                    className={cn(
                        'text-muted-foreground pointer-events-none absolute origin-left transition-all duration-200',
                        value ? 'top-1 left-2 translate-y-0 text-xs' : 'top-1/2 left-6 -translate-y-1/2 text-[16px]',
                        'peer-focus:text-brand peer-data-[state=open]:text-brand peer-aria-invalid:text-destructive',
                    )}
                >
                    {label}
                </label>
            </div>
            <InputError message={error} />
        </div>
    );
}

export { LabelSelect };
