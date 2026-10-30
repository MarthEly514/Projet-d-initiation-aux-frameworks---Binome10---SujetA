import { Link } from '@inertiajs/react';

interface AuthLayoutProps {
    children: React.ReactNode;
    name?: string;
    title?: string;
    description?: string;
}

function TasqIllustration({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 120 120" className={className} fill="none" aria-hidden="true">
            {/* feuille arrière, bleu plein */}
            <rect x="40" y="6" width="74" height="74" rx="6" fill="#0A84FF" />
            {/* feuille avant, translucide, avec coin replié */}
            <path
                d="M8 36a6 6 0 0 1 6-6h58a6 6 0 0 1 6 6v58a6 6 0 0 1-6 6H34L8 74V36Z"
                fill="#3AA0FF"
                fillOpacity="0.55"
            />
            <path d="M8 74h20a6 6 0 0 1 6 6v20L8 74Z" fill="#FFFFFF" fillOpacity="0.3" />
        </svg>
    );
}

export default function AuthSimpleLayout({ children, name = 'Tasq', title, description }: AuthLayoutProps) {
    return (
        <div className="bg-background flex min-h-svh w-full">
            <aside className="bg-[#171717] relative hidden w-[45%] max-w-[600px] flex-col p-15 lg:flex">
                <Link href={route('home')} className="text-4xl font-semibold tracking-tight">
                    {name}
                </Link>

                <div className="flex flex-1 flex-col items-center justify-center gap-6 px-10 xl:px-16">
                    <img src="/images/glass_Icon.png" className='size-52'/>
                    <p className="max-w-[24rem] text-[32px] leading-snug font-regular">
                        Toutes vos tâches au même endroit
                    </p>
                </div>
            </aside>

            <main className="flex flex-1 flex-col items-center justify-center gap-10 p-6 md:p-10">
                <Link href={route('home')} className="text-4xl font-semibold tracking-tight lg:hidden">
                    {name}
                </Link>

                <div className="w-full max-w-[480px]">
                    <div className="flex flex-col gap-8">
                        <div className="space-y-2 text-center">
                            <h1 className="text-5xl font-regular w-full text-center">{title}</h1>
                            {description && <p className="text-muted-foreground text-sm">{description}</p>}
                        </div>
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}