import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import { Button } from '@/components/tasq/button';
import { LabelInput } from '@/components/tasq/label-input';
import TextLink from '@/components/text-link';
import AuthLayout from '@/layouts/auth-layout';
import FormCard from '@/components/tasq/form-card';

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="Créer un compte">
            <Head title="Inscription" />

            <FormCard onSubmit={submit}>
                <LabelInput
                    label="Nom complet"
                    type="text"
                    required
                    autoFocus
                    tabIndex={1}
                    autoComplete="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    disabled={processing}
                    error={errors.name}
                />

                <LabelInput
                    label="Email"
                    type="email"
                    required
                    tabIndex={2}
                    autoComplete="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    disabled={processing}
                    error={errors.email}
                />

                <LabelInput
                    label="Mot de passe"
                    type="password"
                    required
                    tabIndex={3}
                    autoComplete="new-password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    disabled={processing}
                    error={errors.password}
                />

                <LabelInput
                    label="Confirmer le mot de passe"
                    type="password"
                    required
                    tabIndex={4}
                    autoComplete="new-password"
                    value={data.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    disabled={processing}
                    error={errors.password_confirmation}
                />

                <Button type="submit" className="mt-4 w-full" tabIndex={5} disabled={processing}>
                    {processing && <LoaderCircle className="animate-spin" />}
                    Créer mon compte
                </Button>
            </FormCard>

            <div className="text-muted-foreground text-center text-sm">
                Déjà un compte ?{' '}
                <TextLink href={route('login')} tabIndex={6}>
                    Se connecter
                </TextLink>
            </div>
        </AuthLayout>
    );
}