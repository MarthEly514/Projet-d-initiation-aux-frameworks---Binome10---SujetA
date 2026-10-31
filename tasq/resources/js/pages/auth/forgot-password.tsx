// Components
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import TextLink from '@/components/text-link';
import { Button } from '@/components/tasq/button';
import AuthLayout from '@/layouts/auth-layout';
import FormCard from '@/components/tasq/form-card';
import { LabelInput } from '@/components/tasq/label-input';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <AuthLayout title="Mot de passe oublié" description="Entrez votre email pour recevoir un lien de réinitialisation">
            <Head title="Mot de passe oublié" />

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}

            <div className="space-y-6">
                <FormCard onSubmit={submit}>
                    <LabelInput
                        label="Email"
                        type="email"
                        required
                        autoFocus
                        tabIndex={1}
                        autoComplete="off"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        error={errors.email}
                    />

                    <Button className="mt-5 w-full" disabled={processing}>
                        {processing && <LoaderCircle className="animate-spin" />}
                        Envoyer le lien
                    </Button>
                </FormCard>

                <div className="text-muted-foreground space-x-1 text-center text-sm">
                    <span>Ou, revenir à la</span>
                    <TextLink href={route('login')}>Connexion</TextLink>
                </div>
            </div>
        </AuthLayout>
    );
}
