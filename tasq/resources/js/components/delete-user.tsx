import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/tasq/button';
import { LabelInput } from '@/components/tasq/label-input';
import { Modal } from '@/components/tasq/modal';

export default function DeleteUser() {
    const [open, setOpen] = useState(false);
    const { data, setData, delete: destroy, processing, reset, errors, clearErrors } = useForm({ password: '' });

    const closeModal = () => {
        setOpen(false);
        clearErrors();
        reset();
    };

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: closeModal,
            onFinish: () => reset(),
        });
    };

    return (
        <div className="space-y-6">
            <HeadingSmall title="Supprimer le compte" description="Supprimez votre compte et toutes ses données" />

            <div className="bg-destructive/10 flex flex-col gap-4 rounded-[2.5rem] p-6">
                <div className="text-destructive space-y-0.5">
                    <p className="font-medium">Attention</p>
                    <p className="text-sm">Cette action est définitive. Procédez avec prudence.</p>
                </div>

                <Button variant="destructive" className="w-fit" onClick={() => setOpen(true)}>
                    Supprimer mon compte
                </Button>
            </div>

            <Modal
                open={open}
                onClose={closeModal}
                title="Supprimer votre compte ?"
                description="Une fois votre compte supprimé, toutes ses données seront définitivement effacées. Saisissez votre mot de passe pour confirmer."
            >
                <form onSubmit={deleteUser} className="flex flex-col gap-6">
                    <LabelInput
                        label="Mot de passe"
                        type="password"
                        name="password"
                        autoFocus
                        autoComplete="current-password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        error={errors.password}
                    />

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="ghost" onClick={closeModal}>
                            Annuler
                        </Button>
                        <Button type="submit" variant="destructive" disabled={processing}>
                            {processing && <LoaderCircle className="animate-spin" />}
                            Supprimer le compte
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}