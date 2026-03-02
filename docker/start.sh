#!/bin/sh

# Test DB connection
echo "Testing DB connection..."

php artisan storage:link
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache

chown -R www-data:www-data /var/www/storage
chmod -R 775 /var/www/storage
chmod -R 775 /var/www/bootstrap/cache

php-fpm -D
nginx -g 'daemon off;'
```

## Also in Render Environment — remove this variable:
```
MYSQL_ATTR_SSL_CA
```
Delete it completely — Alpine Linux doesn't have that cert path by default.

## Add this instead:
```
DB_OPTIONS=ssl-mode=REQUIRED
```

Actually the simplest fix — just **remove SSL entirely** by adding to Render env:
```
MYSQL_ATTR_SSL_CA=
