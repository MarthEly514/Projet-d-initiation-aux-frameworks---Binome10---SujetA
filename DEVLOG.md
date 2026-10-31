# DEVLOG.md
Each developer **should notify his changes** and everything he's done in the code so far. That will help the other developers to easily pick up from where the previous developer left. 

- ## Ely514:
**Definition des modalites de l'application**
## Acteurs:
- Collaborateur (User)
- Responsable (User)
- Admin Team (User)

## Actions:
- Inscription
- Connexion
- Creer une team (ce qui fait du createur de team le responsable de la team)
- Rejoindre une team
- Quitter une team (Pas possible de quitter une team quand on est le seul dans la team ou quand on en est le seul responsable. Il faut en designer un autre avant de s'en aller)
- Ajouter des membres a une team (renvoie une err si l'user n'est pas enreegistre dan sla base)
- Creer une tache (A faire par le responsable. Ceci ne peut se faire qu'a l'interieur d'une team, pas en dehors)
- Modifier une tache
- Assigner une tache a un collab (tout en specifiant si celui-ci en est le responsable ou juste un collab sur la tache)
- Filtrer les taches par statut / responsable
- Consulter l'overview des taches (a trancher: le collab simple doit il pouvoir voir toutes les taches ou seulement les taches qui le concernent dans sa vue "overview"? La vue complete est elle uniquement reservee au responsable / admin de team?)
- Modifier le statut d'une tache (ceci se fera en cochant "fait" sur les etapes des taches assignees. Si une tache a 5 sous-taches, le fait de ne pas en cocher le garde a l'etat "A faire", en cocher au moins une la fait passer a " en cours", tout cocher permet de la faire passer a l'etat "in review" et enfin seul le responsable pourra verifier et marquer "fait" (penser a implementer un systeme de notification dans ce cas))
- Supprimer une tache
- Supprimer un collab
- Supprimer une team (previens que toutes les taches seront perdues)
- Consulter la timeline

## Qui fait quoi? (Use case diagram)
* user --> [
    - se connecter
    - s'inscrire
    - filtrer les taches
    - rejoindre une team
    - changer le statut d'une tache
    - consulter ses taches
    - Consulter la timeline
      ]
* Admin Team (herite de user) --> [
    - Creer une team
    - Delete une team
    - Consulter toutes les taches
    - Ajouter un collab
    - Retirer un collab
    - Creer des taches
    - Modifier des taches
    - Assigner des taches
    - Supprimer une tache
    - Consulter la timeline
      ]

## Ecrans principaux:
- login
- register
- accueil
- Teams/:id
- Tasks
- Tasks/new (Might be a modal)
- Tasks/:id
- Collabs
- Params
- Profile
- Forgot password (if necessary, mais pas obligé)
- OTP (if necessary, mais pas obligé)

## Modeles:
- **User**
    - id
    - fullName
    - email
    - password
    - teamsId [list]
    - tasksId [list]
    
- **Task**
    - id
    - name
    - description
    - responsibleId
    - state (a faire / en cours / review / faite)
    - startDate
    - endDate
    - collabsId [list]
    - steps [list]
    
- **Team**
    - id
    - name
    - collabsId [list]
    - tasksId [list]
    
- **Step**
    - taskId
    - title
    - state (enum: faite / a faire)
    
## Routes
- Authentification
  
|Méthode|URI|Action|
|---|---|---|
|GET/POST|/register|Inscription|
|GET/POST|/login|Connexion|
|POST|/logout|Déconnexion|
|GET/POST|/forgot-password|Demande de réinitialisation|
|GET/POST|/reset-password/{token}|Nouveau mot de passe|

- Accueil, profil, paramètres
  
|Méthode|URI|Role|
|---|---|---|
|GET|/dashboard|Accueil : mes teams, mes tâches urgentes, notifications|
|GET|/my-tasks|Toutes mes tâches (toutes teams), filtrables|
|GET|/ PATCH / DELETE|/profile|Voir, modifier, supprimer son compte|
|PUT|/profile/password|Changer le mot de passe|
|GET|/settings|Paramètres(Params)|

- Teams

|Méthode|URI|Action|Qui|
|---|---|---|---|
GET|/teams|Liste de mes teams|membre
POST|/teams|Créer (le créateur devient responsable)|tout user|
GET|/teams/{team}|Page de la team|membre|
PUT|/teams/{team}|Renommer, régénérer le code d’invitation|responsable|
DELETE|/teams/{team}|Supprimer (confirmation : toutes les tâches seront perdues)|responsable|
POST|/teams/join|Rejoindre via un code d’invitation|tout user|
POST|/teams/{team}/leave|Quitter (refusé si dernier membre ou dernier responsable)|membre|

- Collabs (membres)

|Méthode|URI|Action|Qui|
|---|---|---|---|
|GET|/teams/{team}/members|Liste des collabs|membre|
|POST|/teams/{team}/members|Ajouter par e-mail (erreur de validation si l’e-mail n’existe pas dans users)|responsable|
|PATCH|/teams/{team}/members/{user}/role|Promouvoir ou rétrograder (nécessaire avant qu’un responsable parte)|responsable|
|DELETE|/teams/{team}/members/{user}|Retirer un collab|responsable|

- Tâches

|Méthode|URI|Action|Qui|
|---|---|---|---|
|GET|/teams/{team}/tasks?status=&responsible=|Liste filtrée|membre|
|POST|/teams/{team}/tasks|Créer (uniquement dans une team)|responsable|
|GET|/tasks/{task}|Détail, étapes, assignés|membre concerné|
|PUT|/tasks/{task}|Modifier|responsable|
|DELETE|/tasks/{task}|Supprimer|responsable|
|POST|/tasks/{task}/assignees	Assigner (user_id, is_lead)	responsable|
|DELETE|/tasks/{task}/assignees/{user}|Désassigner|responsable|

- Étapes et workflow de statut

|Méthode|URI|Action|Qui|
|---|---|---|---|
|POST|/tasks/{task}/steps|Ajouter une étape|responsable|
|PUT / DELETE|/steps/{step}|Modifier ou supprimer|responsable|
|PATCH|/steps/{step}/toggle|Cocher ou décocher « fait » (recalcule le statut)|assigné|
|POST|/tasks/{task}/approve|Valider : review → faite|responsable|
|POST|/tasks/{task}/reject|Renvoyer en en cours|responsable|
    
## 2026-10-30
- ### Ely514:
- Mise en place du projet Laravel avec 
    - React
    - Authentication Laravel

- Creation de la DB: 
```bash
# ouverture de XAMPP (les commandes peuvent varier en fonction du systeme d'exploitation)
sudo /opt/lampp/lampp start
```
Aller à `http://localhost/phpmyadmin` puis creez une nouvelle base de donnees nommee **tasq** et la laisser vide

- Enumeration des composantes UI:
    - TextInput (type: text\password)
    - LabeledTextInput (extends TextInput, label:text)
    - Avatar (image)
    - Button
    - SearchBar
    - SideNav
    - NavOptions
    - Logo
    - TasksGraph
    - Timeline
    - Taskboard
    - TaskCard
    - NewTaskModal
    - AssigneesModal
    - 

- Update du .env

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=taskflow
DB_USERNAME=root
DB_PASSWORD=
MAIL_MAILER=log
```

- Migration de la base
```bash
php artisan migrate
composer run dev
```

- Creation des interfaces de connexion et d'inscription, ajout du logo (public/images/), creation des composantes prores a Tasq (resources/js/components/tasq). A faire: forgot password et les autres, creation des contorlleurs lies aux taches etc.

- ## Cephas:
**Fondations communes (partie données de REPARTITION.md), sur la branche `fondation_commune`**

- Tables : `teams` (avec `invite_code`), `team_user` (avec `role`), `tasks`, `task_user` (avec `is_lead`), `steps`
- Modèles : `Team`, `Task`, `Step`, et les relations `teams()` et `tasks()` sur `User`
- Enums dans `app/Enums` :
    - `TeamRole` : responsable / collaborateur
    - `TaskStatus` : a_faire / en_cours / review / faite
    - `TaskEvent` : created / updated / assigned / status_changed / deleted (les événements à écouter par l'observer)
- Helpers sur `Team`, à utiliser dans toutes les policies : `hasMember($user)` et `isResponsable($user)`
- Sur `Task` : `assignees()` donne tous les assignés, `leads()` seulement ceux avec `is_lead`
- Factories : `Team::factory()->withResponsable($user)`, `Task::factory()->status(...)` et `->overdue()`, `Step::factory()->done()`
- Seeder : 5 users, 2 teams, 5 tâches par team (une par statut, plus une en retard), avec 3 étapes chacune
    - Connexion : `test@example.com`, `awa@`, `koffi@`, `marie@` ou `yao@example.com`, mot de passe `password`
- Tests : `tests/Feature/FondationsTest.php`

**Pour reprendre**
```bash
php artisan migrate:fresh --seed
php artisan test --compact
```
Les tests qui affichent une page ont besoin de `npm run build` au moins une fois (sinon erreur Vite manifest).

**Choix faits dans les colonnes**
- Le responsable d'une tâche n'a pas de colonne `responsibleId` : c'est la ligne de `task_user` avec `is_lead = true`. Il faudra vérifier qu'il n'y en a qu'un seul à l'assignation (B1).
- L'échéance est `end_date`, comme `endDate` dans le modèle de départ.
- `activity_logs` et la table des notifications ne sont pas créées : elles restent avec A4 et B3.

**A faire / à trancher**
- Layout de l'app (sidebar, en-tête) : pas fait ici.
- Une tâche sans étape : comment change-t-elle de statut ?
- Après un `reject` : que deviennent les étapes cochées ?
- Un membre retiré de la team : que deviennent ses tâches ?
- Base MySQL de XAMPP : pas encore essayée, seulement SQLite.
- `npx tsc --noEmit` signale déjà une erreur dans `welcome.tsx` (`plus-darker`), hors de ce travail.

- ## Cephas:
**B1 : Tâches (branche `feat/tasks`, partie de `fondation_commune`)**

- Routes dans `routes/tasks.php` :
    - `GET /teams/{team}/tasks?status=&responsible=` : liste filtrée, pour tout membre
    - `POST /teams/{team}/tasks`, `PUT /tasks/{task}`, `DELETE /tasks/{task}` : pour le responsable de la team
- `TaskPolicy`, `StoreTaskRequest`, `UpdateTaskRequest` : le responsable et les collaborateurs d'une tâche doivent être membres de sa team
- `Task::syncAssignees($leadId, $collaboratorIds)` : garantit un seul responsable par tâche, à réutiliser partout où on assigne
- `TaskResource` : forme d'une tâche envoyée au frontend (à réutiliser pour `/my-tasks` et l'overview)
- Frontend : `pages/tasks/index.tsx`, `components/tasks/` (carte et dialogues), `types/task.d.ts`
- Nouveaux composants partagés dans `components/tasq/`, à réutiliser pour garder la même DA que les pages d'authentification :
    - `LabelSelect` et `LabelTextarea` : mêmes champs soulignés à label flottant que `LabelInput`
    - `Modal` : fenêtre arrondie comme `FormCard`, titre en 32 px
    - `StatusBadge` : statuts en noir et bleu `brand` uniquement
- Repères de la DA : titre de page `text-5xl`, blocs `bg-foreground/5 rounded-[2rem] p-8` sans bordure, espacements `gap-6` et `gap-8`, boutons taille par défaut (48 px)
- Tests : `tests/Feature/TaskTest.php`

**Pour Ely**
- Le bouton + de `AppTopbar` reçoit `onCreateTask` via `AppLayout` : il ouvre la création sur la page des tâches, si l'utilisateur est responsable. Ailleurs il ne fait encore rien, il faudra choisir la team.
- La page utilise `title` de `AppLayout` pour le titre, et les marges du layout.
- Pour y aller tant que `/teams` n'existe pas : `php artisan migrate:fresh --seed`, se connecter avec `test@example.com`, aller sur `/teams/1/tasks`.

**A faire**
- Pour l'instant le statut se choisit à la main dans le formulaire. B2 doit le calculer à partir des étapes.
- Les messages d'erreur des tâches sont en français dans `StoreTaskRequest`, en attendant la traduction générale (A5).
- Le seeder donne des noms de tâches en faux latin (Faker), à remplacer si on s'en sert pour la démo.


## 2026-10-31

- Creation de l'app layout utilisable par toutes les vues de l'application.

- Composants UI custom (`resources/js/components/tasq/`)
    - button.tsx
    - dropdown-menu.tsx
    - form-card.tsx
    - label-input.tsx
    - user-menu-centent.tsx

Ces composants sont la base visuelle de Tasq (pilules bleues, champs soulignés, cartes arrondies). Ils **ne remplacent pas** ceux du kit (`components/ui/*`), qui restent utilisés par les pages de paramètres et d'autres composants du kit.
 
```
resources/js/components/tasq/
├── button.tsx
├── dropdown-menu.tsx
├── form-card.tsx
├── label-input.tsx
├── logo-mark.tsx
└── user-menu-content.tsx
```
  
### Conventions
 
- **Import** : toujours avec l'alias `@/`, par exemple `import { Button } from '@/components/tasq/button'`.
- **Exports** : `Button`, `LabelInput`, `UserMenuContent`, `LogoMark` et les éléments du dropdown sont des **exports nommés** (`{ Button }`). `FormCard` est un **export par défaut** (`import FormCard from ...`).
- **Couleur de marque** : `bg-brand`, `text-brand`, `border-brand` viennent de `--color-brand: #1a8fe8;` déclaré dans le bloc `@theme` de `resources/css/app.css`. Sans cette ligne, ces classes ne font rien.
- **Surcharge de style** : tous les composants acceptent `className`, fusionné avec `cn(...)` (tailwind-merge). Une classe passée de l'extérieur l'emporte sur celle du composant.
- **Police** : Lexend (`--font-sans`), appliquée globalement.
- **Textes** : en français.
---
 
### 1. `Button` (`button.tsx`)
 
**Ce que ça fait** : bouton en forme de pilule (`rounded-full`), bleu par défaut, avec 5 variantes et 4 tailles. Basé sur `class-variance-authority` et Radix `Slot`.
 
**Route** : aucune.
 
**Props** : toutes les props d'un `<button>` HTML, plus :
 
| Prop | Valeurs | Défaut | Rôle |
|---|---|---|---|
| `variant` | `default`, `outline`, `ghost`, `destructive`, `link` | `default` | Style du bouton |
| `size` | `default` (h-12), `sm` (h-9), `lg` (h-14), `icon` (carré 40 px) | `default` | Taille |
| `asChild` | `boolean` | `false` | Rend l'enfant à la place d'un `<button>` (utile pour un `Link` Inertia) |
| `className` | `string` | | Surcharge de style |
 
Exporte aussi `buttonVariants` (pour appliquer le style à un autre élément).
 
**Utilisation**
 
```tsx
import { Button } from '@/components/tasq/button';
import { LoaderCircle } from 'lucide-react';
 
// Bouton de formulaire avec état de chargement (useForm)
<Button type="submit" className="w-full" disabled={processing}>
    {processing && <LoaderCircle className="animate-spin" />}
    Connexion
</Button>
 
// Variantes
<Button variant="outline">Annuler</Button>
<Button variant="destructive">Supprimer la team</Button>
<Button variant="ghost" size="sm">Voir plus</Button>
 
// Bouton icône (ex. « + » de la barre du haut)
<Button size="icon" aria-label="Nouvelle tâche"><Plus /></Button>
 
// Lien Inertia stylé comme un bouton
import { Link } from '@inertiajs/react';
<Button asChild>
    <Link href={route('teams.index')}>Mes teams</Link>
</Button>
```
 
**À savoir** : pour un bouton `icon`, mettre toujours un `aria-label`. Les SVG enfants sont automatiquement à 16 px.
 
---
 
### 2. `LabelInput` (`label-input.tsx`)
 
**Ce que ça fait** : champ de saisie avec **label flottant** (style Material Design). Le label sert de placeholder tant que le champ est vide et sans focus, puis monte et rétrécit au clic ou quand il y a du texte. Le champ est souligné (pas de cadre), bleu au focus, rouge en cas d'erreur. Il affiche aussi le message d'erreur dessous (via `InputError`).
 
**Route** : aucune.
 
**Props** : toutes les props d'un `<input>` **sauf `placeholder`** (interdit par le type), plus :
 
| Prop | Type | Rôle |
|---|---|---|
| `label` | `string` (obligatoire) | Texte du label flottant |
| `error` | `string` | Message d'erreur (typiquement `errors.email` de `useForm`) ; met aussi le champ en rouge via `aria-invalid` |
| `containerClassName` | `string` | Classes du conteneur extérieur |
| `className` | `string` | Classes de l'`<input>` lui-même |
| `id` | `string` | Optionnel : généré automatiquement avec `useId()` sinon |
 
Le composant accepte une `ref` (`forwardRef`).
 
**Utilisation**
 
```tsx
import { LabelInput } from '@/components/tasq/label-input';
 
<LabelInput
    label="Email"
    type="email"
    required
    autoComplete="email"
    value={data.email}
    onChange={(e) => setData('email', e.target.value)}
    error={errors.email}
/>
```
 
**Comment ça marche** : l'input porte la classe `peer` et un `placeholder=" "` (un espace). Le label, placé **après** l'input dans le DOM, réagit à `peer-focus` et `peer-not-placeholder-shown`. Ne pas inverser l'ordre input / label, ne pas passer de `placeholder`.
 
**Limites connues**
 
- **`type="date"`, `time`, `datetime-local`** : `:placeholder-shown` ne fonctionne pas, le label chevauche la valeur affichée par le navigateur. Pour les dates des tâches (`start_date`, `end_date`), il faudra ajouter une prop `alwaysFloat` (à faire dans la feature Tâches).
- **Autofill du navigateur** : si Chrome colore le fond, ajouter dans `app.css` :
```css
  input:-webkit-autofill {
      -webkit-text-fill-color: var(--foreground);
      transition: background-color 9999s ease-in-out 0s;
  }
```
- **Zone de texte** (description de tâche) : ce composant est pour les `<input>` seulement. Prévoir un `LabelTextarea` si besoin.
---
 
### 3. `FormCard` (`form-card.tsx`)
 
**Ce que ça fait** : un `<form>` présenté comme une carte : fond `bg-foreground/5`, coins `rounded-[2rem]`, `p-8`, éléments empilés avec `gap-6`.
 
**Route** : aucune.
 
**Props** : toutes les props d'un `<form>` (`onSubmit`, `id`, `noValidate`, `method`...), plus `children` et `className` (fusionné).
 
**Utilisation**
 
```tsx
import FormCard from '@/components/tasq/form-card';
 
<FormCard onSubmit={submit}>
    <LabelInput label="Email" ... />
    <LabelInput label="Mot de passe" ... />
    <Button type="submit" className="mt-4 w-full">Connexion</Button>
</FormCard>
 
// Surcharger l'espacement
<FormCard onSubmit={submit} className="gap-4 p-6">...</FormCard>
```
 
**Pièges**
 
- **Toujours passer `onSubmit`** et faire `e.preventDefault()` dans le handler. Sans cela, le navigateur soumet le formulaire de façon native (rechargement complet de la page, champs dans l'URL).
- Le composant transmet bien `{...props}` au `<form>` : si `onSubmit` ne semble pas appelé, vérifier ce point en premier.
- C'est un `<form>`, pas une carte générique. Pour une carte sans formulaire (stats du dashboard), créer un composant séparé avec les mêmes classes (`bg-foreground/5 rounded-[2rem]`).
---
 
### 4. `DropdownMenu` (`dropdown-menu.tsx`)
 
**Ce que ça fait** : menu déroulant (Radix) au style de la carte de login : fond opaque de la même teinte que `bg-foreground/5`, coins très arrondis, éléments en pilule, séparateurs discrets. Version tasq de `components/ui/dropdown-menu.tsx`, qui reste inchangé.
 
**Route** : aucune.
 
**Exports et props**
 
| Export | Rôle | Props notables |
|---|---|---|
| `DropdownMenu` | Racine (état ouvert / fermé) | Celles de Radix `Root` |
| `DropdownMenuTrigger` | Élément qui ouvre le menu | `asChild` pour utiliser son propre bouton |
| `DropdownMenuContent` | Panneau flottant | `align` (`start` / `center` / `end`), `sideOffset` (défaut 8), `className` |
| `DropdownMenuItem` | Ligne cliquable | `asChild` (pour un `Link`), `onSelect`, `disabled`, `className` |
| `DropdownMenuLabel` | En-tête non cliquable | `className` |
| `DropdownMenuSeparator` | Trait de séparation | `className` |
| `DropdownMenuGroup` | Regroupe des éléments | |
 
**Utilisation**
 
```tsx
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/tasq/dropdown-menu';
 
<DropdownMenu>
    <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Actions"><MoreVertical /></Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => setEditing(true)}>
            <Pencil /> Modifier
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
            className="text-destructive focus:bg-destructive/10 [&_svg]:text-destructive"
            onSelect={() => setConfirmOpen(true)}
        >
            <Trash2 /> Supprimer
        </DropdownMenuItem>
    </DropdownMenuContent>
</DropdownMenu>
```
 
Pour un lien de navigation, utiliser `asChild` avec un `Link` Inertia (`as="button"` si c'est un POST).
 
**Limites connues** : seuls les éléments nécessaires au menu utilisateur sont stylés. Pas de sous-menus, cases à cocher ni radios : les copier depuis `components/ui/dropdown-menu.tsx` avec le même style si besoin. Ne pas mélanger les éléments `ui/` et `tasq/` dans un même menu.
 
---
 
### 5. `UserMenuContent` (`user-menu-content.tsx`)
 
**Ce que ça fait** : contenu du menu de l'utilisateur connecté : en-tête avec avatar, nom et e-mail, lien vers les paramètres, déconnexion (en rouge). Version tasq de `components/user-menu-content.tsx` du kit.
 
**Routes utilisées** (noms Ziggy, fournis par le kit) :
 
| Route | Méthode | Usage |
|---|---|---|
| `profile.edit` | GET | Lien « Paramètres » |
| `logout` | POST | Bouton « Déconnexion » |
 
**Props**
 
| Prop | Type | Rôle |
|---|---|---|
| `user` | `User` (type de `@/types`) | Utilisateur affiché dans l'en-tête |
 
**Dépendances du kit** : `UserInfo` (`@/components/user-info`) et `useMobileNavigation` (`@/hooks/use-mobile-navigation`, ferme le menu mobile à la navigation).
 
**Utilisation** : toujours à l'intérieur d'un `DropdownMenuContent` tasq (voir `components/app-topbar.tsx`).
 
```tsx
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/tasq/dropdown-menu';
import { UserMenuContent } from '@/components/tasq/user-menu-content';
 
const { auth } = usePage<SharedData>().props;
 
<DropdownMenu>
    <DropdownMenuTrigger asChild>
        {/* avatar + nom */}
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
        <UserMenuContent user={auth.user} />
    </DropdownMenuContent>
</DropdownMenu>
```
 
Pour ajouter un lien (par exemple « Mes teams »), ajouter un `DropdownMenuItem asChild` avec un `Link` dans le groupe central.
 
---
 
### 6. `LogoMark` (`logo-mark.tsx`)
 
**Ce que ça fait** : logo de Tasq (deux feuilles bleues, celle de devant translucide avec un coin replié) en SVG inline.
 
**Props** : `className?: string` (taille et couleurs via Tailwind, ex. `size-7`).
 
**Utilisation** : dans `AppLogo` (barre latérale) et dans le layout d'authentification (à la place de l'illustration inline).
 
```tsx
import { LogoMark } from '@/components/tasq/logo-mark';
 
<LogoMark className="size-7 shrink-0" />
```
 
Pour le favicon, le même dessin est dans `public/favicon.svg`.
 
---
 
### Récapitulatif
 
| Composant | Export | Route | Utilisé dans |
|---|---|---|---|
| `Button` | nommé | aucune | login, register, topbar, toutes les futures pages |
| `LabelInput` | nommé | aucune | login, register, tous les futurs formulaires |
| `FormCard` | défaut | aucune | login, register, formulaires de création |
| `DropdownMenu*` | nommés | aucune | menu utilisateur (et futurs menus d'actions) |
| `UserMenuContent` | nommé | `profile.edit`, `logout` | barre du haut (`app-topbar.tsx`) |
| `LogoMark` | nommé | aucune | sidebar, layout d'authentification |
 
 
### À faire
 
- [ ] Prop `alwaysFloat` sur `LabelInput` (champs de date).
- [ ] `LabelTextarea` pour les descriptions de tâche.
- [ ] Composants de base communs aux features : `StatusBadge`, `Modal`, `ConfirmDialog` (à créer dans ce dossier par le premier qui en a besoin, en prévenant l'autre dev).
- [ ] Rendre `FormCard` cohérent avec les autres (export nommé), si l'équipe préfère une seule convention.

    

    
