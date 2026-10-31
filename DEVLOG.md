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
    

- ## Ely514:
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

    
