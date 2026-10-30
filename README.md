# Projet d'initiation aux frameworks -- Binôme10
## SujetA
Le but de ce projet est de pouvoir créer avec Laravel une application pour organiser le travail d’une petite équipe : créer, modifier et supprimer des tâches ; préciser leur responsable, leur échéance et leur statut ; filtrer les tâches par statut ou responsable ; afficher un résumé du travail (par exemple, tâches à faire, en cours et terminées).

## Membres de l'équipe
- ADJOVI Mahougnon Enock Marthely
- AMOUSSOU Siméon Céphas

## Fonctionnalités réalisées
- Inscription
- Connexion
- Creer une équipe (ce qui fait du createur de team le responsable de la team)
- Rejoindre une équipe
- Quitter une équipe
- Ajouter des membres a une équipe
- Creer une tache (A faire par le responsable. Ceci ne peut se faire qu'a l'interieur d'une équipe, pas en dehors)
- Modifier une tache
- Assigner une tache a un collaborqteur (tout en specifiant si celui-ci en est le responsable ou juste un collaborateur sur la tache)
- Filtrer les taches par statut / responsable
- Consulter l'overview des taches (le collab simple doit pouvoir voir toutes les taches qui le concernent dans sa vue "overview" La vue complete est uniquement reservee a l'administrateur d'équipe)
- Modifier le statut d'une tache (ceci se fera en cochant "fait" sur les etapes des taches assignees. Ex:Si une tache a 5 sous-taches, le fait de ne pas en cocher au moins une le garde a l'etat "A faire", en cocher au moins une la fait passer a " en cours", tout cocher permet de la faire passer a l'etat "in review" et enfin seul le responsable pourra verifier et marquer "fait" (penser a implementer un systeme de notification dans ce cas))
- Supprimer une tache
- Supprimer un collaborateur
- Supprimer une équipe (previens que toutes les taches seront perdues)
- Consulter la timeline des taches

## Choix techniques

## Instructions de lancement

- **Prerequis**
    - PHP 8.2+ et Composer
    - Node 20+ (pour Vite et React)
    - XAMPP (MySQL/MariaDB + phpMyAdmin)
    - Git

- **Mise en place du projet Laravel avec**
    - React
    - Authentication Laravel

    ```bash
    composer global require laravel/installer
    laravel new taskflow
    ```
    *Attendre la fin de l'installation*

    ```bash
    php artisan serve # ou composer run dev puis aller a http://localhost:8000
    ```


- **Creation de la DB:** 
```bash
# ouverture de XAMPP (les commandes peuvent varier en fonction du systeme d'exploitation)
sudo /opt/lampp/lampp start
```
Aller à `http://localhost/phpmyadmin` puis creez une nouvelle base de donnees nommee **tasq** et la laisser vide





