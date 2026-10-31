import * as React from 'react';

import InputError from '@/components/input-error';
import { cn } from '@/lib/utils';

export interface LabelTextareaProps extends Omit<React.ComponentProps<'textarea'>, 'placeholder'> {
    label: string;
    error?: string;
    containerClassName?: string;
}

const LabelTextarea = React.forwardRef<HTMLTextAreaElement, LabelTextareaProps>(({ label, error, id, className, containerClassName, ...props }, ref) => {
    const autoId = React.useId();
    const textareaId = id ?? autoId;

    return (
        <div className={cn('grid gap-1', containerClassName)}>
            <div className="relative">
                <textarea
                    {...props}
                    id={textareaId}
                    ref={ref}
                    placeholder=" "
                    aria-invalid={!!error}
                    className={cn(
                        'peer text-foreground border-foreground/30 focus:border-brand aria-invalid:border-destructive block min-h-14 w-full resize-none border-0 border-b bg-transparent px-6 pt-6 pb-1 text-[16px] transition-colors focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
                        className,
                    )}
                />
                <label
                    htmlFor={textareaId}
                    className={cn(
                        'text-muted-foreground pointer-events-none absolute left-6 origin-left transition-all duration-200',
                        'top-4 text-[16px]',
                        'peer-focus:top-1 peer-focus:left-2 peer-focus:text-xs',
                        'peer-not-placeholder-shown:top-1 peer-not-placeholder-shown:left-2 peer-not-placeholder-shown:text-xs',
                        'peer-focus:text-brand peer-aria-invalid:text-destructive',
                    )}
                >
                    {label}
                </label>
            </div>
            <InputError message={error} />
        </div>
    );
});
LabelTextarea.displayName = 'LabelTextarea';

export { LabelTextarea };
