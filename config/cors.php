<?php

return [

    'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
        'auth/*',
        'register',
        'login',
        'logout',
        'broadcasting/auth',
        'api/broadcasting/auth',
    ],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'https://sibol-smart-garden-web-production.up.railway.app',
        'https://sibol-frontend.onrender.com',
        'http://localhost:5173',
        'http://localhost:3000',
        'http://192.168.1.20:8000',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
