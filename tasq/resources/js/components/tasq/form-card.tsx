import React from 'react';
import { cn } from '@/lib/utils';

export interface FormCardProps extends React.ComponentProps<'form'>{
    children: React.ReactNode;
}

const FormCard = ({ children, className, ...props }: FormCardProps) => {
    return (
        <form className={cn("bg-foreground/5 flex flex-col gap-6 rounded-[2rem] p-8", className)} {...props}>
            {children}
        </form>
    )
}

export default FormCard
