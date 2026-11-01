import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

import { BoardIllustration, ReviewIllustration, TeamIllustration, TimelineIllustration } from '@/components/landing/illustrations';
import { Button } from '@/components/tasq/button';
import { type SharedData } from '@/types';

function Feature({ title, text, reverse, children }: { title: string; text: string; reverse?: boolean; children: React.ReactNode }) {
    return (
        <section className="grid items-center gap-10 md:grid-cols-2 md:gap-20">
            <div className={reverse ? 'md:order-2' : ''}>
                <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
                <p className="text-muted-foreground mt-4 max-w-sm text-lg">{text}</p>
            </div>
            <div className={reverse ? 'md:order-1' : ''}>{children}</div>
        </section>
    );
}

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Tasq · Toutes vos tâches au même endroit" />

            <div className="bg-background text-foreground min-h-svh overflow-x-hidden">
                {/* Header */}
                <header className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
                    <div className='flex flex-row gap-3'>
                        <img src="/logo_tasq.svg" alt="Logo" width={30} />
                        <span className="text-3xl font-semibold tracking-tight">Tasq</span>
                    </div>

                    <nav className="flex items-center gap-2">
                        {auth.user ? (
                            <Button asChild>
                                <Link href={route('dashboard')}>Tableau de bord</Link>
                            </Button>
                        ) : (
                            <>
                                <Button asChild variant="ghost">
                                    <Link href={route('login')}>Se connecter</Link>
                                </Button>
                                <Button asChild className="hidden sm:inline-flex">
                                    <Link href={route('register')}>Créer un compte</Link>
                                </Button>
                            </>
                        )}
                    </nav>
                </header>

                <main className="mx-auto flex max-w-6xl flex-col gap-28 px-6 pb-28 md:gap-40">
                    {/* Hero */}
                    <section className="relative flex flex-col items-center gap-14 pt-10 text-center md:pt-20">
                        <div className="bg-brand/20 pointer-events-none absolute top-0 left-1/2 -z-10 h-72 w-2/3 -translate-x-1/2 rounded-full blur-3xl" />

                        <div className="flex max-w-3xl flex-col items-center gap-6">
                            <h1 className="text-5xl leading-tight font-semibold tracking-tight md:text-7xl">Toutes vos tâches au même endroit</h1>
                            <p className="text-muted-foreground max-w-md text-lg md:text-xl">Créez une team, répartissez le travail, suivez l'avancement.</p>
                            <div className="flex flex-wrap justify-center gap-3 pt-2">
                                <Button asChild size="lg">
                                    <Link href={auth.user ? route('dashboard') : route('register')}>
                                        {auth.user ? 'Ouvrir Tasq' : 'Commencer'}
                                        <ArrowRight />
                                    </Link>
                                </Button>
                                {!auth.user && (
                                    <Button asChild size="lg" variant="outline">
                                        <Link href={route('login')}>Se connecter</Link>
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="relative w-full max-w-4xl text-left">
                            <BoardIllustration />

                            {/* Floating chips */}
                            <div aria-hidden className="bg-background border-foreground/10 absolute -bottom-6 -left-2 flex items-center gap-3 rounded-2xl border p-3 shadow-xl md:-left-8">
                                <span className="grid size-11 place-items-center rounded-full" style={{ background: 'conic-gradient(#22c55e 72%, transparent 0)' }}>
                                    <span className="bg-background grid size-8 place-items-center rounded-full text-[11px] font-semibold">72%</span>
                                </span>
                                <span className="bg-foreground/15 block h-2 w-14 rounded-full" />
                            </div>
                            <div aria-hidden className="bg-brand absolute -top-5 -right-2 rounded-full px-5 py-2.5 text-sm text-white shadow-xl md:-right-6">
                                + Nouvelle tâche
                            </div>
                        </div>
                    </section>

                    <Feature title="Une team en un code" text="Invitez vos collègues en un instant.">
                        <TeamIllustration />
                    </Feature>

                    <Feature title="Un tableau clair" text="À faire, en cours, en revue, terminé." reverse>
                        <BoardIllustration className="shadow-none" />
                    </Feature>

                    <Feature title="Un planning visuel" text="Qui fait quoi, et quand.">
                        <TimelineIllustration />
                    </Feature>

                    <Feature title="Validé par le responsable" text="Une tâche n'est terminée qu'une fois approuvée." reverse>
                        <ReviewIllustration />
                    </Feature>

                    {/* Final CTA */}
                    <section className="bg-foreground/5 relative overflow-hidden rounded-[3rem] px-6 py-16 text-center md:py-24">
                        <div className="bg-brand/20 pointer-events-none absolute -bottom-24 left-1/2 -z-0 h-48 w-2/3 -translate-x-1/2 rounded-full blur-3xl" />
                        <div className="relative flex flex-col items-center gap-8">
                            <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">Prêt à vous y mettre ?</h2>
                            <Button asChild size="lg">
                                <Link href={auth.user ? route('dashboard') : route('register')}>
                                    {auth.user ? 'Ouvrir Tasq' : 'Créer mon compte'}
                                    <ArrowRight />
                                </Link>
                            </Button>
                        </div>
                    </section>
                </main>

                <footer className="text-muted-foreground mx-auto max-w-6xl px-6 pb-10 text-sm">© 2026 Tasq</footer>
            </div>
        </>
    );
}