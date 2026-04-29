<?php
// config/cors.php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout', '*'],
    
    'allowed_methods' => ['*'],
    
    'allowed_origins' => [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://192.168.0.10:5173',
        'http://192.168.0.10:8000',
        'http://10.144.66.211:5173',
        'http://10.144.66.211:8000'
    ],
    
    'allowed_origins_patterns' => [],
    
    'allowed_headers' => ['*'],
    
    'exposed_headers' => [],
    
    'max_age' => 0,
    
    'supports_credentials' => true,
];