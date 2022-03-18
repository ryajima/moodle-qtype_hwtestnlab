<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Strings for component 'qtype_hwtestnlab', language 'en', branch 'MOODLE_20_STABLE'
 *
 * @package    qtype
 * @subpackage hwtestnlab
 * @copyright  2021 Ryo Yajima <yajima.leonad@gmail.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

$string['addmoreanswerblanks'] = 'さらに {no} 個の正答例入力欄を追加する。';
$string['answer'] = '解答: {$a}';
$string['answermustbegiven'] = 'You must enter an answer if there is a grade or feedback.';
$string['answerno'] = '解答 {$a}';
$string['caseno'] = '区別しない';
$string['casesensitive'] = '大文字小文字の区別';
$string['caseyes'] = '区別する';
$string['correctansweris'] = 'あなたの答えは正しくありません。 正解: {$a}';
$string['correctanswers'] = '正解';
$string['filloutoneanswer'] = '1つ以上の考えられる答えを入力してください。空白の答えは使用されません。「*」はどのような文字にでも合致するワイルドカードとして使用することができます。最初の組み合わせの答えは評点およびフィードバックを決定するため使用されます。';
$string['notenoughanswers'] = 'This type of question requires at least {$a} answers';
$string['pleaseenterananswer'] = 'Please enter an answer.';
$string['pluginname'] = 'NLab Handwriting shortanswer';
$string['pluginname_help'] = 'In response to a question (that may include an image) the respondent types a word or short phrase. There may be several possible correct answers, each with a different grade. If the "Case sensitive" option is selected, then you can have different scores for "Word" or "word".';
$string['pluginname_link'] = 'question/type/hwtestnlab';
$string['pluginnameadding'] = '手書き入力記述問題の追加';
$string['pluginnameediting'] = '手書き入力記述問題の編集';
$string['pluginnamesummary'] = '手書き入力による短答式問題を提供します。「記述問題」qtypeの拡張です。';
$string['privacy:metadata'] = 'Handwriting short answer question type plugin allows question authors to set default options as user preferences.';
$string['privacy:preference:defaultmark'] = 'The default mark set for a given question.';
$string['privacy:preference:penalty'] = 'The penalty for each incorrect try when questions are run using the \'Interactive with multiple tries\' or \'Adaptive mode\' behaviour.';
$string['privacy:preference:usecase'] = 'Whether the answers should be case sensitive.';
$string['recognitionurl'] = '手書き認識URL';
$string['recognitionurl_desc'] = '手書き認識を提供するAPIのURL．';
