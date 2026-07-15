<?php
declare(strict_types=1);
require __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond(array $payload, int $status = 200): never
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function allowed_key(string $key): bool
{
    return $key === 'terminal-theme'
        || str_starts_with($key, 'terminal-notes')
        || str_starts_with($key, 'antigravity-')
        || str_starts_with($key, 'ag-');
}

try {
    $pdo = database();
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $action = (string) ($_GET['action'] ?? 'state');

    if ($method === 'GET' && $action === 'health') {
        $pdo->query('SELECT 1');
        respond(['ok' => true, 'service' => 'AntigravityOS API']);
    }

    if ($method === 'GET' && $action === 'state') {
        $rows = $pdo->query('SELECT storage_key, storage_value FROM antigravity_state')->fetchAll();
        $state = [];
        foreach ($rows as $row) {
            if (allowed_key((string) $row['storage_key'])) {
                $state[(string) $row['storage_key']] = (string) $row['storage_value'];
            }
        }
        respond(['ok' => true, 'state' => $state]);
    }

    if ($method !== 'POST') {
        respond(['ok' => false, 'error' => 'Method not allowed.'], 405);
    }

    $raw = file_get_contents('php://input');
    $input = json_decode($raw === false ? '' : $raw, true);
    if (!is_array($input)) {
        respond(['ok' => false, 'error' => 'Invalid JSON body.'], 400);
    }

    $key = (string) ($input['key'] ?? '');
    if ($key === '' || strlen($key) > 191 || !allowed_key($key)) {
        respond(['ok' => false, 'error' => 'Invalid storage key.'], 400);
    }

    if ($action === 'set') {
        $value = $input['value'] ?? null;
        if (!is_string($value)) {
            respond(['ok' => false, 'error' => 'Storage value must be a string.'], 400);
        }
        if (strlen($value) > 2_000_000) {
            respond(['ok' => false, 'error' => 'Storage value is too large.'], 413);
        }
        $statement = $pdo->prepare(
            'INSERT INTO antigravity_state (storage_key, storage_value)
             VALUES (:storage_key, :storage_value)
             ON DUPLICATE KEY UPDATE storage_value = VALUES(storage_value)'
        );
        $statement->execute(['storage_key' => $key, 'storage_value' => $value]);
        respond(['ok' => true]);
    }

    if ($action === 'remove') {
        $statement = $pdo->prepare('DELETE FROM antigravity_state WHERE storage_key = :storage_key');
        $statement->execute(['storage_key' => $key]);
        respond(['ok' => true]);
    }

    respond(['ok' => false, 'error' => 'Unknown action.'], 404);
} catch (Throwable $error) {
    respond(['ok' => false, 'error' => 'Database service unavailable.'], 500);
}

