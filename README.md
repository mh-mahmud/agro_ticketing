Node version v16.13.0
NPM version 8.1.0

## Project Setup:

Setup timezone from config/App.php

### 1. Clone the repo to htdocs or www folder

```
git clone gslgit@192.168.10.63:/home/gslgit/ticketingSystem.git
```

### 2. go to the directory 
```
cd ticketingSystem
```

### 3. Install Composer
```
composer install
```

### 4. Create .env File
```
copy .env.example .env
```

### 5. Generate Key
```
php artisan key:generate
```

### 6. Enable Permission (for Linux User)

```
sudo chmod -R 777 storage
```

## 7. Database Section
Delete on update attribute from tickets_agents and logs Tables
Add mysql credentials config/Database.php also

```
Create db ticketing_system
```
```
php artisan migrate
```
php artisan db:seed --class=AllSeeder
```
php artisan db:seed --class=PermissionGroupSeeder
```
```
php artisan db:seed --class=PermissionTableSeeder
```
```
php artisan db:seed --class=RoleTableSeeder
```
```
php artisan db:seed --class=BulkUserTableSeeder
```

```
php artisan db:seed --class=UserTableSeeder
```

```
php artisan db:seed --class=PrioritySeeder
```

```
php artisan db:seed --class=StatusSeeder
```
```
php artisan migrate:refresh --path=/database/migrations/2021_11_09_050353_create_timezones_table.php
php artisan db:seed --class=TimezoneSeeder
```
```
php artisan db:seed --class=BusinessHourSeeder
```
```$xslt
php artisan db:seed --class=NotificationSeeder
```
```
php artisan db:seed --class=AllSeeder
```

## Clear All
```
Check config file >> config\others.php
```

## Clear All
```
php artisan config:cache
php artisan route:cache
```

## 8. Authentication

```
php artisan passport:install
```

# Great ! Done! 

## 9. From Browser
```html
http://localhost/ticketingSystem/public
```

### 10. From Postman ### post request
```html
http://localhost/ticketingSystem/public/api/login

body: 
    username: admin
    password: 123456
```


