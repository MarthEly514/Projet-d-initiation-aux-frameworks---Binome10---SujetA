import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import TextLink from '@/components/text-link';
import { Button } from '@/components/tasq/button';
import { LabelInput } from '@/components/tasq/label-input';
import AuthLayout from '@/layouts/auth-layout';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
}

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout title="Se connecter">
            <Head title="Connexion" />

            {status && <div className="text-center text-sm font-medium text-green-600">{status}</div>}

            <form onSubmit={submit} className="bg-foreground/5 flex flex-col gap-7.5 rounded-[45px] p-8">
                <LabelInput
                    label="Email"
                    type="email"
                    required
                    autoFocus
                    tabIndex={1}
                    autoComplete="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    error={errors.email}
                />

                <LabelInput
                    label="Mot de passe"
                    type="password"
                    required
                    tabIndex={2}
                    autoComplete="current-password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    error={errors.password}
                />

                <Button type="submit" className="mt-5 w-full" tabIndex={3} disabled={processing}>
                    {processing && <LoaderCircle className="animate-spin" />}
                    Connexion
                </Button>
            </form>

            <div className="text-muted-foreground flex flex-col items-start pl-10 gap-2 text-sm">
                {canResetPassword && (
                    <TextLink href={route('password.request')} tabIndex={4}>
                        Mot de passe oublié ?
                    </TextLink>
                )}
                <span>
                    Pas encore de compte ?{' '}
                    <TextLink href={route('register')} tabIndex={5}>
                        S'inscrire
                    </TextLink>
                </span>
            </div>
        </AuthLayout>
    );
}