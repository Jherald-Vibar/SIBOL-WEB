FROM php:8.2-fpm-alpine

RUN apk add --no-cache \
    nginx \
    nodejs \
    npm \
    curl \
    zip \
    unzip \
    oniguruma-dev \
    libxml2-dev \
    libpng-dev

RUN docker-php-ext-install \
    pdo \
    pdo_mysql \
    mbstring \
    bcmath \
    xml

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY . .

RUN composer install --no-dev --optimize-autoloader

WORKDIR /var/www/sibol-frontend
RUN npm ci && npm run build
RUN cp -r dist/* /var/www/public/

WORKDIR /var/www

RUN chmod -R 775 storage bootstrap/cache && \
    chown -R www-data:www-data storage bootstrap/cache

COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 8080

CMD ["/start.sh"]
```

## Step 5 — Create `.dockerignore`

In your project root, create `.dockerignore`:
```
node_modules
sibol-frontend/node_modules
.git
.env
storage/logs/*
tests
README.md
nixpacks.toml
Procfile
