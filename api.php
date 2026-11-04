<?php
declare(strict_types=1);

require __DIR__ . '/api/config.php';
require __DIR__ . '/api/session.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, private');
header('X-Content-Type-Options: nosniff');

function reply(int $status, array $body): void
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

function readJsonBody(): array
{
    $raw = file_get_contents('php://input');
    $body = json_decode($raw ?: '', true);
    return is_array($body) ? $body : [];
}

function requireCsrf(): void
{
    $provided = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    $expected = $_SESSION['meal_planner_csrf'] ?? '';
    if (!is_string($expected) || $expected === '' || !is_string($provided) || !hash_equals($expected, $provided)) {
        reply(403, ['error' => 'Security token expired. Refresh the page and try again.']);
    }
}

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($action === 'login' && $method === 'POST') {
    $blockedUntil = (int)($_SESSION['meal_pin_blocked_until'] ?? 0);
    if ($blockedUntil > time()) {
        reply(429, ['error' => 'Too many attempts. Wait a minute and try again.']);
    }

    $body = readJsonBody();
    $pin = $body['pin'] ?? '';
    $validLogin = is_string($pin) && $pin !== '' && password_verify($pin, MEAL_PIN_HASH);
    if (!$validLogin) {
        $attempts = (int)($_SESSION['meal_pin_attempts'] ?? 0) + 1;
        $_SESSION['meal_pin_attempts'] = $attempts;
        if ($attempts >= 5) {
            $_SESSION['meal_pin_attempts'] = 0;
            $_SESSION['meal_pin_blocked_until'] = time() + 60;
        }
        reply(401, ['error' => 'That PIN did not match. Try again.']);
    }

    session_regenerate_id(true);
    $_SESSION['meal_planner_authenticated'] = true;
    unset($_SESSION['meal_planner_member_id'], $_SESSION['meal_planner_role'], $_SESSION['meal_planner_name']);
    $_SESSION['meal_pin_attempts'] = 0;
    $_SESSION['meal_pin_blocked_until'] = 0;
    $_SESSION['meal_planner_csrf'] = bin2hex(random_bytes(32));
    reply(200, ['ok' => true]);
}

if ($action === 'logout' && $method === 'POST') {
    if (empty($_SESSION['meal_planner_authenticated'])) {
        reply(200, ['ok' => true]);
    }
    requireCsrf();
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', [
            'expires' => time() - 42000,
            'path' => $params['path'],
            'secure' => $params['secure'],
            'httponly' => $params['httponly'],
            'samesite' => 'Strict',
        ]);
    }
    session_destroy();
    reply(200, ['ok' => true]);
}

if (!empty($_SESSION['meal_planner_member_id'])) {
    $_SESSION = [];
    reply(401, ['error' => 'Sign in again with the website PIN.']);
}
if (empty($_SESSION['meal_planner_authenticated'])) {
    reply(401, ['error' => 'Enter the website PIN to continue.']);
}

if ($action === 'state' && $method === 'GET') {
    try {
        $pdo = mealDatabase();
        $row = $pdo->query('SELECT payload, revision FROM planner_state WHERE id = 1')->fetch();
        if (!$row) {
            reply(500, ['error' => 'The planner database is not set up yet. Import database.sql first.']);
        }
        $stored = json_decode((string)$row['payload'], true);
        $state = is_array($stored) && isset($stored['meals'], $stored['schedule']) ? $stored : null;
        reply(200, ['state' => $state, 'revision' => (int)$row['revision']]);
    } catch (Throwable $error) {
        error_log('Meal planner database read failed: ' . $error->getMessage());
        reply(500, ['error' => 'The shared database could not be reached. Check the database setup and credentials.']);
    }
}

if ($action === 'state' && $method === 'PUT') {
    requireCsrf();
    $body = readJsonBody();
    $state = $body['state'] ?? null;
    $expectedRevision = filter_var($body['revision'] ?? null, FILTER_VALIDATE_INT);
    if (!is_array($state) || !isset($state['meals'], $state['schedule']) || !is_array($state['meals']) || !is_array($state['schedule']) || $expectedRevision === false || $expectedRevision < 0) {
        reply(400, ['error' => 'The meal plan data is not valid.']);
    }

    try {
        $payload = json_encode($state, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
        $pdo = mealDatabase();
        $pdo->beginTransaction();
        $row = $pdo->query('SELECT payload, revision FROM planner_state WHERE id = 1 FOR UPDATE')->fetch();
        if (!$row) {
            $pdo->rollBack();
            reply(500, ['error' => 'The planner database is not set up yet. Import database.sql first.']);
        }

        $currentRevision = (int)$row['revision'];
        if ($currentRevision !== $expectedRevision) {
            $pdo->rollBack();
            $latest = json_decode((string)$row['payload'], true);
            reply(409, [
                'error' => 'A newer shared plan was saved from another browser.',
                'state' => is_array($latest) && isset($latest['meals'], $latest['schedule']) ? $latest : null,
                'revision' => $currentRevision,
            ]);
        }

        $nextRevision = $currentRevision + 1;
        $statement = $pdo->prepare('UPDATE planner_state SET payload = :payload, revision = :revision WHERE id = 1');
        $statement->execute(['payload' => $payload, 'revision' => $nextRevision]);
        $pdo->commit();
        reply(200, ['ok' => true, 'revision' => $nextRevision]);
    } catch (Throwable $error) {
        if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
            $pdo->rollBack();
        }
        error_log('Meal planner database write failed: ' . $error->getMessage());
        reply(500, ['error' => 'The meal plan could not be saved to the shared database.']);
    }
}

reply(404, ['error' => 'Unknown API action.']);
