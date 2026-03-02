#!/bin/sh

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
