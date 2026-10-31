# Tasq : répartition des tâches

**Dev A = backend** (migrations, modèles, contrôleurs, règles métier)
**Dev B = frontend** (layout, pages React, composants)

Pour que personne ne bloque l'autre : se mettre d'accord dès le départ sur les noms de routes et forme des props de chaque page, et B travaille d'abord avec des données factices.

---

## Étape 0 : à faire ensemble (30 à 45 min)

- [ ] Écrire la liste des **noms de routes** (`teams.index`, `tasks.store`, `steps.toggle`, etc.) dans `routes/web.php`, même avec des contrôleurs vides.
- [ ] Écrire dans `resources/js/types/index.d.ts` les types `Team`, `Task`, `Step`, `Member`, `Notification`, `ActivityLog`. C'est le contrat : A envoie exactement ça, B consomme exactement ça.
- [ ] Créer les branches : `main`, puis une branche par fonctionnalité (`feat/teams`, `feat/tasks`...). A merge en premier, B rebase.

---

## Dev A : backend

| # | Tâche | Détail | Dépend de |
|---|---|---|---|
| A1 | Base de données | Migrations (`teams`, `team_user`, `tasks`, `task_user`, `steps`, `activity_logs`, `notifications`), modèles, relations, Enums `TaskStatus` / `TeamRole`, factories | Étape 0 |
| A2 | Seeder | 2 teams, 5 users, tâches à tous les statuts. **À livrer vite**, B en a besoin pour voir de vraies données | A1 |
| A3 | Teams | CRUD, `invite_code`, rejoindre, quitter (règles « dernier membre / dernier responsable »), `TeamPolicy` | A1 |
| A4 | Membres | Ajout par e-mail (erreur si inconnu), changement de rôle, retrait | A3 |
| A5 | Tâches | CRUD dans une team, `StoreTaskRequest`, assignation (`is_lead`), filtres statut / responsable, `TaskPolicy` | A3 |
| A6 | Étapes et statut | CRUD des étapes, `toggle`, `TaskStatusService`, `approve` / `reject` | A5 |
| A7 | Overview, timeline, notifications | Compteurs, retards, `TaskObserver` vers `activity_logs`, notification `TaskReadyForReview`, routes de lecture | A6 |
| A8 | Tests Pest | `TaskStatusTest`, `LeaveTeamTest`, `TaskPolicyTest` | au fil de l'eau |
| A9 | Traduction FR / EN | `laravel-lang/common`, `APP_LOCALE=fr` | libre |

## Dev B : frontend

| # | Tâche | Détail | Dépend de |
|---|---|---|---|
| B1 | Layout de l'app | Sidebar, sélecteur de team, cloche de notifications (vide au début), pages protégées | rien |
| B2 | Composants de base | `StatusBadge`, `TaskCard`, `Modal` (dialog shadcn), `EmptyState`, `ConfirmDialog` | rien |
| B3 | Dashboard et Teams | Liste des teams, modales « Créer » et « Rejoindre », page `teams/show` | A3 (ou données factices) |
| B4 | Collabs | Liste des membres, formulaire d'ajout, changement de rôle, retrait | A4 |
| B5 | Tâches | Liste avec filtres (`router.get` + `preserveState`), modale de création / édition, suppression | A5 |
| B6 | Détail d'une tâche | Checklist des étapes (toggle), assignés, boutons Valider / Renvoyer visibles pour le responsable | A6 |
| B7 | Overview | Cartes de compteurs + graphique Recharts | A7 |
| B8 | Timeline | Journal d'activité, puis vue en barres avec l'algorithme de lanes si le temps le permet | A7 |
| B9 | Notifications | Cloche avec liste, « marquer comme lu » | A7 |
| B10 | Profil et paramètres | Restyler avec `FormCard` / `LabelInput`, traduire | libre |

---

Les 2 prennent ensemble 30 minutes en fin de chaque bloc pour **intégrer** : B branche son écran sur le vrai contrôleur de A, et on corrige les écarts de props. Ne pas repousser ça à la fin.

---

## À drop si le temps manque

1. Vue Gantt de la timeline
2. Graphique Recharts (garder les compteurs)
3. Page Params
4. Traduction des pages de paramètres
5. Notifications par e-mail