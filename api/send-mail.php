<?php
header('Content-Type: application/json; charset=utf-8');

$configPath = __DIR__ . '/config.php';
if (!file_exists($configPath)) {
    http_response_code(503);
    echo json_encode([
        'success' => false,
        'message' => 'Mail is not configured. Copy api/config.sample.php to api/config.php',
    ]);
    exit;
}

$config = require $configPath;
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = $config['allowed_origins'] ?? '*';
if ($allowed !== '*' && $origin) {
    $list = array_map('trim', explode(',', $allowed));
    if (in_array($origin, $list, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
    }
} else {
    header('Access-Control-Allow-Origin: *');
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
    $data = $_POST;
}

if (!empty($data['website'])) {
    echo json_encode(['success' => true, 'message' => 'OK']);
    exit;
}

function field($data, $key, $default = '') {
    return isset($data[$key]) ? trim(strip_tags((string) $data[$key])) : $default;
}

$formType = field($data, 'formType', 'contact');
$firstName = field($data, 'firstName');
$lastName = field($data, 'lastName');
$name = field($data, 'name');
if (!$name && ($firstName || $lastName)) {
    $name = trim($firstName . ' ' . $lastName);
}
$email = field($data, 'email');
$phone = field($data, 'phone');
$projectBrief = field($data, 'projectBrief');
$message = field($data, 'message') ?: $projectBrief ?: field($data, 'coverLetter');
$service = field($data, 'service');
$budget = field($data, 'budget');
$inquiryType = field($data, 'inquiryType');
$jobProfile = field($data, 'jobProfile');
$experience = field($data, 'experience');
$resume = field($data, 'resumeNote');

if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Valid email is required']);
    exit;
}

if (!$message && $formType !== 'cta') {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Message is required']);
    exit;
}

$company = $config['company_name'] ?? 'Seawind Solution';
$subjectMap = [
    'contact' => 'New Contact Inquiry',
    'cta'     => 'Homepage CTA Inquiry',
    'career'  => 'Career Application',
];
$subject = ($subjectMap[$formType] ?? 'Website Form') . ' - ' . $company;

$lines = [
    "Form type: {$formType}",
    "Name: {$name}",
    "Email: {$email}",
    "Phone: {$phone}",
];
if ($inquiryType) $lines[] = "Inquiry type: {$inquiryType}";
if ($service) $lines[] = "Service: {$service}";
if ($budget) $lines[] = "Budget: {$budget}";
if ($jobProfile) $lines[] = "Job profile: {$jobProfile}";
if ($experience) $lines[] = "Experience: {$experience}";
if ($resume) $lines[] = "Resume note: {$resume}";
$lines[] = '';
$lines[] = 'Message:';
$lines[] = $message ?: '(brief from homepage form)';

$body = implode("\n", $lines);
$to = $config['to_email'] ?? 'info@seawindsolution.com';
$fromEmail = $config['from_email'] ?? 'noreply@localhost';
$fromName = $config['from_name'] ?? $company;

$headers = [
    'MIME-Version: 1.0',
    'Content-type: text/plain; charset=UTF-8',
    'From: ' . $fromName . ' <' . $fromEmail . '>',
    'Reply-To: ' . $name . ' <' . $email . '>',
    'X-Mailer: PHP/' . phpversion(),
];

$sent = @mail($to, $subject, $body, implode("\r\n", $headers));

if ($sent) {
    echo json_encode(['success' => true, 'message' => 'Message sent']);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Mail server could not send. Check PHP mail() or use Web3Forms in forms-config.js',
    ]);
}
