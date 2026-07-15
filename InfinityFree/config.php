<?php
declare(strict_types=1);

/*
 * Replace these values with the MySQL details shown in the InfinityFree
 * control panel. The database host is not usually "localhost".
 */
const DB_HOST = 'sql310.infinityfree.com';
const DB_NAME = 'if0_42417316_antigravityos';
const DB_USER = 'if0_42417316';
const DB_PASSWORD = 'Dkzx889797';

/* Change this before uploading, then use the same value in install.php. */
const INSTALL_KEY = 'AGOS-Setup-9xK4mP82vL7Q';

function database(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
    $pdo = new PDO($dsn, DB_USER, DB_PASSWORD, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    return $pdo;
}

