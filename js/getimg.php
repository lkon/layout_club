<?php
/*
 ** Основа сценария взята из курса лекций по ajax Учебного центра "Специалист".
 */

define('PARTY_FILE', '../i/party/log.txt');
header('Content-type: text/plain; charset=utf-8');
// Запрет кеширования
header('Cache-COntrol: no-store, no-cache');
header('Expires: ' . date('r'));
// Чтение файла
$titles = file(PARTY_FILE);
	for ($num = 0; $num < count($titles); $num++)
		echo $titles[$num];
?>