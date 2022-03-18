<?php

// ストロークデータをデータベースに保存します

/**
 * Admin settings for the handwriting shortanswer question type.
 *
 * @package    qtype
 * @subpackage hwtestnlab
 * @copyright  2021 Ryo Yajima <yajima.leonad@gmail.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require(__DIR__.'/../../../config.php');

$raw = file_get_contents('php://input'); // POSTされた生のデータを受け取る
$data = json_decode($raw); // json形式をphp変数に変換

// レスポンス
$res = "received strokes data";
echo json_encode($res);

// ストロークをdbに保存
$data;
