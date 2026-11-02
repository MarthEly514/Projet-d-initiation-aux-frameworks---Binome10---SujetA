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
- Modifier le statut d'une tache (ceci se fera en cochant "fait" sur les etapes des taches assignees. Ex:Si une tache a 5 sous-taches, le fait de ne pas en cocher au moins une le garde a l'etat "A faire", en cocher au moins une la fait passer a " en cours", tout cocher permet de la faire passer a l'etat "in review" et enfin seul le responsable pourra verifier et marquer "fait")
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

- ### 1. Récupérer le projet
 
```bash
git clone https://github.com/MarthEly514/Projet-d-initiation-aux-frameworks---Binome10---SujetA.git tasq
cd tasq
```
 
- ### 2. Installer les dépendances
 
```bash
composer install
npm install
```
  
- ### 3. Créer le fichier d'environnement
 
```bash
cp .env.example .env
php artisan key:generate
```
 
- ### 4. Créer la base de données
 
Démarrer XAMPP (les commandes varient selon le système) :

### Linux
```bash
# Linux
sudo /opt/lampp/lampp start
```

### Windows & macOS
Sous Windows ou macOS, lancer MySQL depuis le panneau de contrôle XAMPP.

- Ouvrir le panneau. Cherchez « XAMPP Control Panel » dans le menu puis lancer.
- Démarrer MySQL. Cliquez sur Start sur la ligne MySQL. Le nom du module passe en vert avec un numéro de port, en général 3306.
- Démarrer Apache. Cliquez sur Start sur la ligne Apache, car phpMyAdmin en a besoin. Il passe en vert avec les ports 80, 443.
 
 
Aller sur `http://localhost/phpmyadmin`, puis créer une base de données nommée **tasq** (interclassement `utf8mb4_unicode_ci`) et la laisser vide.
 
- ### 5. Configurer le `.env`
 
Modifier ces lignes dans le fichier `.env` :
 
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=tasq
DB_USERNAME=root
DB_PASSWORD=
MAIL_MAILER=log
```
 
`MAIL_MAILER=log` écrit les e-mails dans `storage/logs/laravel.log` au lieu de les envoyer.
 
- ### 6. Créer les tables et les données de démonstration
 
```bash
php artisan migrate --seed
```
 
Le seeder crée des utilisateurs, deux équipes, des tâches à tous les statuts et leurs étapes. Compte de démonstration :
 
- E-mail : `demo@tasq.test`
- Mot de passe : `password`
Ce compte est responsable de la première équipe et simple collaborateur de la seconde, ce qui permet de tester les deux rôles. Pour repartir de zéro à tout moment : `php artisan migrate:fresh --seed`.
 
Pour une base vide, sans données de démonstration, lancer seulement `php artisan migrate`.
 
- ### 7. Lancer l'application
 
```bash
composer run dev
```
 
Cette commande démarre le serveur Laravel, Vite, la file d'attente et les logs. Ouvrir ensuite **http://localhost:8000**.
 
Alternative:
 
```bash
php artisan serve
npm run dev
```

