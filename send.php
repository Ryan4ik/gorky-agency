<?php
// Настройки заголовков для CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Разрешаем только POST-запросы
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method Not Allowed"]);
    exit;
}

// Получаем JSON-данные из тела запроса
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Если данные пришли в стандартном POST-формате (x-www-form-urlencoded)
if (!$data) {
    $data = $_POST;
}

// Извлекаем и очищаем поля
$name = isset($data['name']) ? strip_tags(trim($data['name'])) : '';
$project = isset($data['project']) ? strip_tags(trim($data['project'])) : '';
$link = isset($data['link']) ? strip_tags(trim($data['link'])) : 'Не указана';
$contact = isset($data['contact']) ? strip_tags(trim($data['contact'])) : '';
$message = isset($data['message']) ? strip_tags(trim($data['message'])) : 'Без описания';

// Проверяем обязательные поля
if (empty($name) || empty($project) || empty($contact)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Заполните все обязательные поля."]);
    exit;
}

// Данные Telegram-бота (теперь они в безопасности на сервере)
$tgToken = '8758324822:AAECnS2-pm588P6UhTBVcsIWI-l_wsTvarw';
$tgChatId = '-1003895176653';

// Текст сообщения
$text = "🔔 <b>Новая заявка на аудит!</b>\n\n"
      . "👤 <b>Имя:</b> " . htmlspecialchars($name) . "\n"
      . "🎮 <b>Проект:</b> " . htmlspecialchars($project) . "\n"
      . "🔗 <b>Ссылка:</b> " . htmlspecialchars($link) . "\n"
      . "📱 <b>Контакты:</b> " . htmlspecialchars($contact) . "\n"
      . "💬 <b>Задача:</b> " . htmlspecialchars($message);

// Настройка отправки через cURL
$url = "https://api.telegram.org/bot" . $tgToken . "/sendMessage";
$postData = [
    'chat_id' => $tgChatId,
    'text' => $text,
    'parse_mode' => 'HTML'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Игнорировать ошибки SSL сертификатов

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Возвращаем результат
if ($httpCode === 200) {
    echo json_encode(["status" => "success", "message" => "Заявка успешно отправлена!"]);
} else {
    http_response_code(502);
    echo json_encode([
        "status" => "error", 
        "message" => "Ошибка при отправке в Telegram.",
        "details" => json_decode($response, true)
    ]);
}
?>
