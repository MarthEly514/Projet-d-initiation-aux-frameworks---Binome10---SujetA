import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import { Button } from '@/components/tasq/button';
import { LabelInput } from '@/components/tasq/label-input';
import { Modal } from '@/components/tasq/modal';

type Props = { open: boolean; onClose: () => void; teamId: number };

export function AddMemberModal({ open, onClose, teamId }: Props) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({ email: '' });

    const close = () => {
        reset();
        clearErrors();
        onClose();
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('teams.members.store', teamId), { preserveScroll: true, onSuccess: close });
    };

    return (
        <Modal
            open={open}
            onClose={close}
            title="Ajouter un collaborateur"
            description="Saisissez l'e-mail d'une personne déjà inscrite sur Tasq."
        >
            <form onSubmit={submit} className="flex flex-col gap-6">
                <LabelInput
                    label="E-mail"
                    type="email"
                    required
                    autoFocus
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    error={errors.email}
                />
                <Button type="submit" disabled={processing}>
                    {processing && <LoaderCircle className="animate-spin" />}
                    Ajouter
                </Button>
            </form>
        </Modal>
    );
}