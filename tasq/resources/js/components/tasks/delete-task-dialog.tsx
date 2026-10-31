import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import { Button } from '@/components/tasq/button';
import { Modal } from '@/components/tasq/modal';
import { type Task } from '@/types/task';

export default function DeleteTaskDialog({ task, onClose }: { task: Task | null; onClose: () => void }) {
    const { delete: destroy, processing } = useForm({});

    const deleteTask: FormEventHandler = (e) => {
        e.preventDefault();

        if (task) {
            destroy(route('tasks.destroy', task.id), { preserveScroll: true, onSuccess: () => onClose() });
        }
    };

    return (
        <Modal open={task !== null} title="Supprimer cette tâche ?" description={`« ${task?.name} » sera supprimée définitivement.`} onClose={onClose}>
            <form className="mt-5 flex flex-col gap-2" onSubmit={deleteTask}>
                <Button type="submit" variant="destructive" className="w-full" disabled={processing}>
                    {processing && <LoaderCircle className="animate-spin" />}
                    Supprimer
                </Button>
                <Button type="button" variant="ghost" className="w-full" onClick={onClose}>
                    Annuler
                </Button>
            </form>
        </Modal>
    );
}
