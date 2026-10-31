// Components
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';
import AuthLayout from '@/layouts/auth-layout';
import FormCard from '@/components/tasq/form-card';
import { LabelInput } from '@/components/tasq/label-input';
import { Button } from '@/components/tasq/button';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout
            title="Confirmez votre mot de passe"
            description="This is a secure area of the application. Please confirm your password before continuing."
        >
            <Head title="Confirmez votre mot de passe" />

            <FormCard onSubmit={submit}>
                <LabelInput
                    label="Mot de passe"
                    type="password"
                    required
                    autoFocus
                    tabIndex={1}
                    autoComplete="current-password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    error={errors.password}
                />

                <Button className="mt-5 w-full" disabled={processing}>
                    {processing && <LoaderCircle className="animate-spin" />}
                    Confirmer le mot de passe
                </Button>
                {/* <div className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            placeholder="Password"
                            autoComplete="current-password"
                            value={data.password}
                            autoFocus
                            onChange={(e) => setData('password', e.target.value)}
                        />

                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center">
                        <Button className="w-full" disabled={processing}>
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            Confirm password
                        </Button>
                    </div>
                </div> */}
            </FormCard>
        </AuthLayout>
    );
}
