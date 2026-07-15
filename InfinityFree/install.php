<?php
declare(strict_types=1);
require __DIR__ . '/config.php';

header('Content-Type: text/plain; charset=utf-8');

if (!isset($_GET['key']) || !hash_equals(INSTALL_KEY, (string) $_GET['key'])) {
    http_response_code(403);
    exit("Invalid installation key.\n");
}

try {
    database()->exec(
        'CREATE TABLE IF NOT EXISTS antigravity_state (
            storage_key VARCHAR(191) NOT NULL PRIMARY KEY,
            storage_value LONGTEXT NOT NULL,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                ON UPDATE CURRENT_TIMESTAMP
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci'
    );
    echo "AntigravityOS database installation completed.\n";
    echo "Delete or rename install.php after confirming that the site works.\n";
} catch (Throwable $error) {
    http_response_code(500);
    echo "Installation failed: " . $error->getMessage() . "\n";
}

