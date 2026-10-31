import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/tasq/button';
import { LabelInput } from '@/components/tasq/label-input';
import { LabelSelect } from '@/components/tasq/label-select';
import { LabelTextarea } from '@/components/tasq/label-textarea';
import { Modal } from '@/components/tasq/modal';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { type Task, type TaskMember, type TaskStatus, type TaskStatusOption } from '@/types/task';

interface TaskFormDialogProps {
    open: boolean;
    teamId: number;
    task: Task | null;
    members: TaskMember[];
    statuses: TaskStatusOption[];
    onClose: () => void;
}

export default function TaskFormDialog({ open, onClose, ...props }: TaskFormDialogProps) {
    return (
        <Modal open={open} title={props.task ? 'Modifier la tâche' : 'Nouvelle tâche'} onClose={onClose}>
            <TaskForm onClose={onClose} {...props} />
        </Modal>
    );
}

function TaskForm({ teamId, task, members, statuses, onClose }: Omit<TaskFormDialogProps, 'open'>) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: task?.name ?? '',
        description: task?.description ?? '',
        status: task?.status ?? ('a_faire' as TaskStatus),
        start_date: task?.start_date ?? '',
        end_date: task?.end_date ?? '',
        lead_id: task?.lead ? String(task.lead.id) : '',
        collaborator_ids: task?.collaborators.map((collaborator) => collaborator.id) ?? [],
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        const options = { preserveScroll: true, onSuccess: () => onClose() };

        if (task) {
            put(route('tasks.update', task.id), options);
        } else {
            post(route('tasks.store', teamId), options);
        }
    };

    const selectLead = (leadId: string) => {
        setData((current) => ({
            ...current,
            lead_id: leadId,
            collaborator_ids: current.collaborator_ids.filter((id) => String(id) !== leadId),
        }));
    };

    const toggleCollaborator = (id: number, isChecked: boolean) => {
        setData('collaborator_ids', isChecked ? [...data.collaborator_ids, id] : data.collaborator_ids.filter((current) => current !== id));
    };

    const collaborators = members.filter((member) => String(member.id) !== data.lead_id);

    return (
        <form className="flex flex-col gap-6" onSubmit={submit}>
            <LabelInput label="Nom de la tâche" autoFocus value={data.name} onChange={(e) => setData('name', e.target.value)} error={errors.name} />

            <LabelTextarea label="Description" rows={2} value={data.description} onChange={(e) => setData('description', e.target.value)} error={errors.description} />

            <div className="grid items-start gap-6 sm:grid-cols-2">
                <LabelInput label="Début" type="date" value={data.start_date} onChange={(e) => setData('start_date', e.target.value)} error={errors.start_date} />
                <LabelInput label="Échéance" type="date" value={data.end_date} onChange={(e) => setData('end_date', e.target.value)} error={errors.end_date} />
            </div>

            <div className="grid items-start gap-6 sm:grid-cols-2">
                <LabelSelect
                    id="status"
                    label="Statut"
                    value={data.status}
                    options={statuses}
                    onValueChange={(value) => setData('status', value as TaskStatus)}
                    error={errors.status}
                />
                <LabelSelect
                    id="lead_id"
                    label="Responsable"
                    value={data.lead_id}
                    options={members.map((member) => ({ value: String(member.id), label: member.name }))}
                    onValueChange={selectLead}
                    error={errors.lead_id}
                />
            </div>

            {collaborators.length > 0 && (
                <fieldset className="grid gap-3">
                    <legend className="text-muted-foreground mb-3 pl-2 text-xs">Collaborateurs</legend>
                    {collaborators.map((member) => (
                        <div key={member.id} className="flex items-center gap-3 pl-6">
                            <Checkbox
                                id={`collaborator-${member.id}`}
                                checked={data.collaborator_ids.includes(member.id)}
                                onCheckedChange={(isChecked) => toggleCollaborator(member.id, isChecked === true)}
                                className="data-[state=checked]:border-brand data-[state=checked]:bg-brand border-foreground/30 data-[state=checked]:text-white"
                            />
                            <Label htmlFor={`collaborator-${member.id}`} className="text-[16px] font-normal">
                                {member.name}
                            </Label>
                        </div>
                    ))}
                    <InputError message={errors.collaborator_ids} />
                </fieldset>
            )}

            <div className="mt-5 flex flex-col gap-2">
                <Button type="submit" className="w-full" disabled={processing}>
                    {processing && <LoaderCircle className="animate-spin" />}
                    {task ? 'Enregistrer' : 'Créer la tâche'}
                </Button>
                <Button type="button" variant="ghost" className="w-full" onClick={onClose}>
                    Annuler
                </Button>
            </div>
        </form>
    );
}
