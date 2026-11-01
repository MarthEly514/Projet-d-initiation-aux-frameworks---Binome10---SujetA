import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import { Button } from '@/components/tasq/button';
import { LabelInput } from '@/components/tasq/label-input';
import { Modal } from '@/components/tasq/modal';

type Props = { open: boolean; onClose: () => void };

export function CreateTeamModal({ open, onClose }: Props) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({ name: '' });

    const close = () => {
        reset();
        clearErrors();
        onClose();
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('teams.store'), { onSuccess: close });
    };

    return (
        <Modal open={open} onClose={close} title="Créer une team" description="Vous en serez le responsable.">
            <form onSubmit={submit} className="flex flex-col gap-6">
                <LabelInput
                    label="Nom de la team"
                    required
                    autoFocus
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    error={errors.name}
                />
                <Button type="submit" disabled={processing}>
                    {processing && <LoaderCircle className="animate-spin" />}
                    Créer la team
                </Button>
            </form>
        </Modal>
    );
}