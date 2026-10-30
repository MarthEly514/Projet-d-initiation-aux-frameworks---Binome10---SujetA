import * as React from 'react';

import InputError from '@/components/input-error';
import { cn } from '@/lib/utils';

export interface LabelInputProps extends Omit<React.ComponentProps<'input'>, 'placeholder'> {
    label: string;
    error?: string;
    containerClassName?: string;
}

const LabelInput = React.forwardRef<HTMLInputElement, LabelInputProps>(
    ({ label, error, id, className, containerClassName, ...props }, ref) => {
        const autoId = React.useId();
        const inputId = id ?? autoId;

        return (
            <div className={cn('grid gap-1', containerClassName)}>
                <div className="relative">
                    <input
                        {...props}
                        id={inputId}
                        ref={ref}
                        placeholder=" "
                        aria-invalid={!!error}
                        className={cn(
                            'peer text-foreground border-foreground/30 focus:border-brand aria-invalid:border-destructive h-14 w-full border-0 border-b bg-transparent px-6 pt-5 pb-1 text-[16px] transition-colors focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
                            className,
                        )}
                    />
                    <label
                        htmlFor={inputId}
                        className={cn(
                            'text-muted-foreground pointer-events-none absolute left-6 origin-left transition-all duration-200',
                            'top-1/2 -translate-y-1/2 text-[16px]',
                            'peer-focus:top-1 peer-focus:left-2 peer-focus:translate-y-0 peer-focus:text-xs',
                            'peer-not-placeholder-shown:top-1 peer-not-placeholder-shown:left-2 peer-not-placeholder-shown:translate-y-0 peer-not-placeholder-shown:text-xs',
                            'peer-autofill:top-2 peer-autofill:translate-y-0 peer-autofill:text-xs',
                            'peer-focus:text-brand peer-aria-invalid:text-destructive',
                        )}
                    >
                        {label}
                    </label>
                </div>
                <InputError message={error} />
            </div>
        );
    },
);
LabelInput.displayName = 'LabelInput';

export { LabelInput };