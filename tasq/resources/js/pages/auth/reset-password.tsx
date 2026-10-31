import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import AuthLayout from '@/layouts/auth-layout';
import FormCard from '@/components/tasq/form-card';
import { LabelInput } from '@/components/tasq/label-input';
import { Button } from '@/components/tasq/button';

interface ResetPasswordProps {
    token: string;
    email: string;
}

type ResetPasswordForm = {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const { data, setData, post, processing, errors, reset } = useForm<ResetPasswordForm>({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="Reset password" description="Please enter your new password below">
            <Head title="Reset password" />

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

                <LabelInput
                    label="Mot de passe"
                    type="password"
                    required
                    tabIndex={2}
                    autoComplete="new-password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    error={errors.password}
                />

                <LabelInput
                    label="Confirmer le mot de passe"
                    type="password"
                    required
                    tabIndex={3}
                    autoComplete="new-password"
                    value={data.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    disabled={processing}
                    error={errors.password_confirmation}
                />

                <Button className="mt-5 w-full" disabled={processing}>
                    {processing && <LoaderCircle className="animate-spin" />}
                    Réinitialiser le mot de passe
                </Button>
            </FormCard>
        </AuthLayout>
    );
}
