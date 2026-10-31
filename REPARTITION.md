# Tasq : répartition par features (équipe de 2)

Chaque dev livre des features complètes, de bout en bout : migration, contrôleur, policy, page React.

---

## Fondations (ensemble, environ 1 h)

À faire avant de se séparer :

- [ ] **Migrations, modèles, relations, Enums, factories** (tables pivot `team_user` et `task_user` incluses)
- [ ] **Seeder** : 2 teams, 5 users, tâches à tous les statuts (chacun travaille ainsi sans attendre l'autre)
- [ ] **Helpers partagés** sur `Team` : `isResponsable($user)`, `hasMember($user)`, utilisés par toutes les policies
- [ ] **Layout de l'app** : sidebar, en-tête, liens vers les futures pages
- [ ] **Événements de tâche** à écouter par l'observer : créée, modifiée, assignée, statut changé, supprimée

Un dev fait migrations, modèles et seeder pendant que l'autre fait le layout, puis relecture croisée.

---

## Dev A : Équipes et vue d'ensemble

| # | Feature | Backend | Frontend |
|---|---|---|---|
| A1 | **Teams** | Créer, rejoindre par `invite_code`, quitter (règles dernier membre / dernier responsable), supprimer, `TeamPolicy` | Dashboard avec la liste des teams, modales Créer / Rejoindre, page `teams/show`, confirmation de suppression |
| A2 | **Membres (Collabs)** | Ajout par e-mail (erreur si inconnu), changement de rôle, retrait | Page Collabs : liste, ajout, rôle, retrait |
| A3 | **Overview** | Compteurs par statut, retards | Cartes de compteurs, graphique Recharts |
| A4 | **Timeline** | Observer sur `Task` vers `activity_logs`, route de lecture | Journal d'activité, puis vue en barres (lanes) si le temps le permet |
| A5 | **Finitions** | Traduction FR (`laravel-lang`) | Restyler profil et paramètres |

## Dev B : Tâches et workflow

| # | Feature | Backend | Frontend |
|---|---|---|---|
| B1 | **Tâches** | CRUD dans une team, `StoreTaskRequest`, `TaskPolicy`, assignation (`is_lead`), filtres statut / responsable | Liste avec filtres, modale de création / édition, suppression |
| B2 | **Étapes et statut** | CRUD des étapes, `toggle`, `TaskStatusService`, `approve` / `reject` | Page `tasks/show` : checklist, assignés, boutons Valider / Renvoyer |
| B3 | **Notifications** | Notification `TaskReadyForReview`, routes lire / tout lire | Cloche dans l'en-tête, liste, « marquer comme lu » |
| B4 | **Mes tâches** | Route `/my-tasks` multi-teams | Page avec filtres |
| B5 | **Tests** | Pest : `TaskStatusTest`, `TaskPolicyTest`, `LeaveTeamTest` | n/a |

---

## Éviter les conflits Git

- **Un fichier de routes par feature** : `routes/teams.php`, `routes/tasks.php`, etc., chargés depuis `web.php`.
- **Types TypeScript par feature** : `types/team.d.ts`, `types/task.d.ts`, plutôt qu'un seul `index.d.ts`.
- **Chacun possède ses dossiers** : `pages/teams/` et `components/teams/` pour A ; `pages/tasks/` et `components/tasks/` pour B.
- **Composants partagés** (`StatusBadge`, `Modal`...) dans `components/tasq/` : le premier qui en a besoin les crée et prévient l'autre.
- Une branche par feature (`feat/teams`, `feat/tasks`...), merge dans `main` dès qu'une feature est stable, `git pull --rebase` avant la suivante.

## Dépendances croisées

- B a besoin d'une team pour créer des tâches : il travaille sur les teams seedées pendant que A construit la création de team.
- A (overview, timeline) lit des tâches créées par B : le seeder suffit jusqu'à ce que les tâches existent vraiment.
- Seul vrai point de contact : `TaskObserver` (A) écoute les événements des tâches (B). Les événements sont fixés pendant les fondations.

---

## À couper si le temps manque

1. Vue Gantt de la timeline
2. Graphique Recharts (garder les compteurs)
3. Page Params
4. Traduction des pages de paramètres
5. Notifications par e-mail