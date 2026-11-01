import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import { Button } from '@/components/tasq/button';
import { LabelInput } from '@/components/tasq/label-input';
import { Modal } from '@/components/tasq/modal';

type Props = { open: boolean; onClose: () => void };

export function JoinTeamModal({ open, onClose }: Props) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({ code: '' });

    const close = () => {
        reset();
        clearErrors();
        onClose();
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('teams.join'), { onSuccess: close });
    };

    return (
        <Modal
            open={open}
            onClose={close}
            title="Rejoindre une team"
            description="Saisissez le code d'invitation de 8 caractères donné par le responsable."
        >
            <form onSubmit={submit} className="flex flex-col gap-6">
                <LabelInput
                    label="Code d'invitation"
                    required
                    autoFocus
                    maxLength={8}
                    autoComplete="off"
                    className="font-mono tracking-widest uppercase"
                    value={data.code}
                    onChange={(e) => setData('code', e.target.value.toUpperCase())}
                    error={errors.code}
                />
                <Button type="submit" disabled={processing}>
                    {processing && <LoaderCircle className="animate-spin" />}
                    Rejoindre
                </Button>
            </form>
        </Modal>
    );
}