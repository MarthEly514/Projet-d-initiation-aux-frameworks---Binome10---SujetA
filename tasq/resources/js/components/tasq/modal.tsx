import * as React from 'react';

import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

export interface ModalProps {
    open: boolean;
    title: string;
    description?: string;
    onClose: () => void;
    children: React.ReactNode;
}

function Modal({ open, title, description, onClose, children }: ModalProps) {
    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent
                {...(!description && { 'aria-describedby': undefined })}
                className="max-h-[90vh] w-[calc(100%-2rem)] max-w-[480px] gap-6 overflow-y-auto rounded-[2rem] border-0 p-8 [scrollbar-width:none] sm:rounded-[2rem] [&>button]:top-8 [&>button]:right-8"
            >
                <DialogTitle className="pr-8 text-[32px] leading-snug font-normal tracking-normal">{title}</DialogTitle>
                {description && <DialogDescription>{description}</DialogDescription>}
                {children}
            </DialogContent>
        </Dialog>
    );
}

export { Modal };
