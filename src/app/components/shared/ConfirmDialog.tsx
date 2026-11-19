'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/src/components/ui/dialog';
import { Button } from '@/src/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from '@/src/app/lib/i18n';
import { BubbleLoader } from "@/src/components/ui/bubble-loader";

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'destructive' | 'primary';
    isLoading?: boolean;
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText,
    cancelText,
    variant = 'primary',
    isLoading = false
}: ConfirmDialogProps) {
    const { t } = useTranslation()
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !isLoading && !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {variant === 'destructive' && <AlertTriangle className="h-5 w-5 text-destructive" />}
                        {title}
                    </DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4">
                    <Button 
                        variant="ghost" 
                        onClick={onClose} 
                        disabled={isLoading}
                    >
                        {cancelText ?? t('shared.cancel')}
                    </Button>
                    <Button 
                        variant={variant === 'destructive' ? 'destructive' : 'default'} 
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading && <BubbleLoader size="sm" mono className="mr-2" />}
                        {confirmText ?? t('shared.confirm')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
