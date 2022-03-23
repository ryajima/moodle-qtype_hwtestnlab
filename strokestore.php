<?php

// ストロークデータをMoodleデータベースに保存する

/**
 * Admin settings for the handwriting shortanswer question type.
 *
 * @package    qtype
 * @subpackage hwtestnlab
 * @copyright  2021 Ryo Yajima <yajima.leonad@gmail.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

ini_set('display_errors', "On");
require(__DIR__.'/../../../config.php');
//global $DB;

// POSTされた生のデータを受け取る
$raw = file_get_contents('php://input'); 
$answer = json_decode(str_replace('&quot;','"',$raw),true); // json形式をphp変数に変換
$qaid = $answer['qaid'];
$points = $answer['points'];

// レスポンス
$res = 'strokestore.php: received_stroke_json, answerid: ' . $qaid;
//echo json_encode($res);

// ストロークオブジェクトを生成
$strokeObj = new stdClass();
$strokeObj->answerid = $qaid;
$strokeObj->strokes  = json_encode($points);
$table='qtype_hwtestnlab_strokes';

// ストロークをdbに保存
$sql = 'SELECT id FROM {'.$table.'} WHERE '.$DB->sql_compare_text('answerid').' = '.$DB->sql_compare_text(':answerid');
$param = ['answerid' => $strokeObj->answerid];
if ($DB->record_exists_sql($sql, $param)) {
    $strokeObj->id = array_key_first($DB->get_records_sql($sql, $param));
    $DB->update_record($table, $strokeObj);
} else {
    $strokeObj->id = $DB->insert_record($table, $strokeObj);
}

// レスポンスメッセージ
$res = $res.', dbkey: '.$strokeObj->id;
// $sql= 'SELECT strokes FROM {'.$table.'} WHERE '.$DB->sql_compare_text('answerid').' = '.$DB->sql_compare_text(':answerid');
// $res = array_key_first($DB->get_records_sql($sql, $param));
echo json_encode($res);
