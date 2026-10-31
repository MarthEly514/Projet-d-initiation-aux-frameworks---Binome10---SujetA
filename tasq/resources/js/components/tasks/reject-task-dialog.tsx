import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import { Button } from '@/components/tasq/button';
import { LabelTextarea } from '@/components/tasq/label-textarea';
import { Modal } from '@/components/tasq/modal';

export default function RejectTaskDialog({ taskId, open, onClose }: { taskId: number; open: boolean; onClose: () => void }) {
    return (
        <Modal open={open} title="Renvoyer la tâche" description="Indiquez les étapes à reprendre." onClose={onClose}>
            <RejectForm taskId={taskId} onClose={onClose} />
        </Modal>
    );
}

function RejectForm({ taskId, onClose }: { taskId: number; onClose: () => void }) {
    const { data, setData, post, processing, errors } = useForm({ comment: '' });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('tasks.reject', taskId), { preserveScroll: true, onSuccess: () => onClose() });
    };

    return (
        <form className="flex flex-col gap-6" onSubmit={submit}>
            <LabelTextarea label="Commentaire" rows={3} autoFocus value={data.comment} onChange={(e) => setData('comment', e.target.value)} error={errors.comment} />

            <div className="mt-5 flex flex-col gap-2">
                <Button type="submit" className="w-full" disabled={processing}>
                    {processing && <LoaderCircle className="animate-spin" />}
                    Renvoyer
                </Button>
                <Button type="button" variant="ghost" className="w-full" onClick={onClose}>
                    Annuler
                </Button>
            </div>
        </form>
    );
}
