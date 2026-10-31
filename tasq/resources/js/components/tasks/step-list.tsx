import { router, useForm } from '@inertiajs/react';
import { LoaderCircle, Pencil, Plus, Trash2 } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import { Button } from '@/components/tasq/button';
import { LabelInput } from '@/components/tasq/label-input';
import { Modal } from '@/components/tasq/modal';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { type TaskStep } from '@/types/task';

interface StepListProps {
    taskId: number;
    steps: TaskStep[];
    canManage: boolean;
    canCheck: boolean;
}

export default function StepList({ taskId, steps, canManage, canCheck }: StepListProps) {
    const [editingStep, setEditingStep] = useState<TaskStep | null>(null);

    const toggle = (step: TaskStep) => router.patch(route('steps.toggle', step.id), {}, { preserveScroll: true });
    const remove = (step: TaskStep) => router.delete(route('steps.destroy', step.id), { preserveScroll: true });

    return (
        <section className="bg-foreground/5 flex flex-col gap-6 rounded-[2rem] p-8">
            <div className="flex items-center justify-between gap-4">
                <h2 className="text-[16px] font-medium">Étapes</h2>
                {steps.length > 0 && (
                    <p className="text-muted-foreground text-sm">
                        {steps.filter((step) => step.is_done).length} sur {steps.length}
                    </p>
                )}
            </div>

            {steps.length > 0 && (
                <ul className="flex flex-col gap-2">
                    {steps.map((step) => (
                        <li key={step.id} className="flex items-center gap-3">
                            <Checkbox
                                id={`step-${step.id}`}
                                checked={step.is_done}
                                disabled={!canCheck}
                                onCheckedChange={() => toggle(step)}
                                className="data-[state=checked]:border-brand data-[state=checked]:bg-brand border-foreground/30 data-[state=checked]:text-white"
                            />
                            <Label htmlFor={`step-${step.id}`} className="min-w-0 flex-1 text-[16px] font-normal [overflow-wrap:anywhere]">
                                {step.title}
                            </Label>

                            {canManage && (
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" aria-label={`Modifier ${step.title}`} onClick={() => setEditingStep(step)}>
                                        <Pencil />
                                    </Button>
                                    <Button variant="ghost" size="icon" aria-label={`Supprimer ${step.title}`} onClick={() => remove(step)}>
                                        <Trash2 />
                                    </Button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {canManage && <AddStepForm taskId={taskId} />}

            <Modal open={editingStep !== null} title="Modifier l’étape" onClose={() => setEditingStep(null)}>
                {editingStep && <EditStepForm step={editingStep} onClose={() => setEditingStep(null)} />}
            </Modal>
        </section>
    );
}

function AddStepForm({ taskId }: { taskId: number }) {
    const { data, setData, post, processing, errors, reset } = useForm({ title: '' });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('steps.store', taskId), { preserveScroll: true, onSuccess: () => reset() });
    };

    return (
        <form className="flex items-start gap-3" onSubmit={submit}>
            <LabelInput label="Nouvelle étape" containerClassName="min-w-0 flex-1" value={data.title} onChange={(e) => setData('title', e.target.value)} error={errors.title} />
            <Button type="submit" size="icon" aria-label="Ajouter l’étape" className="mt-1" disabled={processing}>
                {processing ? <LoaderCircle className="animate-spin" /> : <Plus />}
            </Button>
        </form>
    );
}

function EditStepForm({ step, onClose }: { step: TaskStep; onClose: () => void }) {
    const { data, setData, put, processing, errors } = useForm({ title: step.title });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('steps.update', step.id), { preserveScroll: true, onSuccess: () => onClose() });
    };

    return (
        <form className="flex flex-col gap-6" onSubmit={submit}>
            <LabelInput label="Titre de l’étape" autoFocus value={data.title} onChange={(e) => setData('title', e.target.value)} error={errors.title} />

            <div className="mt-5 flex flex-col gap-2">
                <Button type="submit" className="w-full" disabled={processing}>
                    {processing && <LoaderCircle className="animate-spin" />}
                    Enregistrer
                </Button>
                <Button type="button" variant="ghost" className="w-full" onClick={onClose}>
                    Annuler
                </Button>
            </div>
        </form>
    );
}
