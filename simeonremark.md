# Remarques de Siméon sur le layout

Deux points à régler dans le layout, vus en testant la page des tâches. Je n'y ai pas touché, car le layout est dans ta partie.

---

## 1. La barre latérale en mode clair

**Le problème**

En mode clair, la barre latérale reste noire, mais une partie de son texte est sombre :
- le nom « Tasq » dans le logo est presque invisible ;
- l'entrée active du menu (par exemple « Tâches ») est presque invisible, alors que c'est celle qu'il faut repérer ;
- une barre de défilement blanche apparaît dans le menu.

En mode sombre, tout est correct.

**La cause**

Le fond noir est écrit en dur, alors que le texte suit le thème :
- fond : `bg-[#171717]` dans `resources/js/components/ui/sidebar.tsx`, ligne 196 ;
- entrée active : `data-[active=true]:text-foreground` dans `resources/js/components/nav-main.tsx`, ligne 25 ;
- logo : le `span` de `resources/js/components/app-logo.tsx` n'a pas de couleur et hérite de celle du thème.

En mode clair, `foreground` est presque noir : on obtient du noir sur du noir.

**Les deux solutions possibles**

- **La barre suit le thème :** remplacer `bg-[#171717]` par `bg-sidebar`, qui est déjà défini pour le clair et le sombre.
- **La barre reste toujours noire :** garder le fond et mettre le texte actif et le logo en blanc (`data-[active=true]:text-white`, `text-white` sur le logo).

À toi de choisir selon la DA voulue. La barre de défilement est à vérifier ensuite : `[scrollbar-width:none]` sur `SidebarContent` la retire si elle reste visible.

**À voir aussi**

Le panneau gauche de `resources/js/layouts/auth/auth-simple-layout.tsx` a le même `bg-[#171717]`, ligne 29. En mode clair, le texte « Toutes vos tâches au même endroit » et le nom « Tasq » y sont donc sombres sur du noir.

---

## 2. Le bouton + de l'en-tête

**Ce que j'ai fait**

Ton `AppTopbar` avait une note pour brancher le bouton + sur la création de tâche. Il reçoit maintenant `onCreateTask`, passé par `AppLayout` :

```tsx
<AppLayout title="Tâches" onCreateTask={canManage ? () => setIsCreating(true) : undefined}>
```

Sur la page des tâches, le bouton + ouvre la fenêtre de création si l'utilisateur est responsable de la team. J'ai retiré mon bouton « Nouvelle tâche » pour ne pas en avoir deux.

**Le problème qui reste**

Le bouton s'affiche partout, mais il ne fait rien dans ces cas :
- sur les autres pages (Accueil, Mes tâches, Teams...), car on ne sait pas dans quelle team créer la tâche ;
- pour un collaborateur, qui n'a pas le droit de créer de tâche.

Un bouton visible qui ne réagit pas ressemble à une panne.

**Ce que je propose**

- **Le plus simple :** dans `app-topbar.tsx`, n'afficher le bouton que si `onCreateTask` existe :

```tsx
{onCreateTask && (
    <Button size="icon" aria-label="Nouvelle tâche" onClick={onCreateTask}>
        <Plus />
    </Button>
)}
```

- **Plus complet :** sur les autres pages, le bouton ouvre d'abord un choix de team, parmi celles où l'utilisateur est responsable. Il faudra alors partager ses teams avec toutes les pages, depuis `HandleInertiaRequests`.

Je conseille la solution simple pour l'instant. On verra pour l'autre quand la page des teams sera prête.
