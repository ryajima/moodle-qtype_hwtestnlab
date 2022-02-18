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
 * Short answer question renderer class.
 *
 * @package    qtype
 * @subpackage hwtestnlab
 * @copyright  2021 Ryo Yajima <escaryo21work@gmail.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */


defined('MOODLE_INTERNAL') || die();


/**
 * Generates the output for short answer questions.
 *
 * @copyright  2021 Ryo Yajima <escaryo21work@gmail.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class qtype_hwtestnlab_renderer extends qtype_renderer {
    public function formulation_and_controls(question_attempt $qa,
            question_display_options $options) {
        
        global $CFG;
        global $PAGE;

        $question = $qa->get_question();
        $currentanswer = $qa->get_last_qt_var('answer');

        $inputname = $qa->get_qt_field_name('answer');
        $inputattributes = array(
            'type' => 'hidden',
            'name' => $inputname,
            'value' => $currentanswer,
            'id' => $inputname,
            'size' => 80,
            'class' => 'form-control d-inline',
        );

        $config = get_config('qtype_hwtestnlab');
        $api = $config->recognitionurl;

        if ($options->readonly) {
            $inputattributes['readonly'] = 'readonly';
        }

        $feedbackimg = '';
        if ($options->correctness) {
            $answer = $question->get_matching_answer(array('answer' => $currentanswer));
            if ($answer) {
                $fraction = $answer->fraction;
            } else {
                $fraction = 0;
            }
            $inputattributes['class'] .= ' ' . $this->feedback_class($fraction);
            $feedbackimg = $this->feedback_image($fraction);
        }

        $questiontext = $question->format_questiontext($qa);
        $placeholder = false;
        if (preg_match('/_____+/', $questiontext, $matches)) {
            $placeholder = $matches[0];
            $inputattributes['size'] = round(strlen($placeholder) * 1.1);
        }
        $input = html_writer::empty_tag('input', $inputattributes) . $feedbackimg;

        // hand-writing answer box
        //$input .= html_writer::empty_tag('br');
        $input .= html_writer::start_tag('div', array('class' => 'qanda'));
        
        // srcdoc="<canvas id=&quot;myCanvas&quot; class=&quot;qanda&quot;></canvas>" width="800" height="100"></iframe>';
        //$input .= html_writer::start_tag('div', array('width' => '400', 'height' => '100', 'style' => 'overflow: scroll;'));
        $input .= html_writer::start_tag('div', array('style' => 'overflow: hidden;'));
        
        $input .= html_writer::start_tag('canvas', array('id' => 'myCanvas' ,'class' => 'qanda'));
        $input .= html_writer::end_tag('canvas');
        
        $input .= html_writer::end_tag('div');
        //$input .= html_writer::end_tag('div');
        

        $input .= html_writer::end_tag('div');
        // action buttons of action for strokes
        $input .= html_writer::empty_tag('br');
        $input .= html_writer::start_tag('div', array('class' => 'my-2'));
        $input .= html_writer::tag('button', '消去', array('id' => 'clrBtn', 'type' => 'button', 'class' => 'btn btn-primary'));
        $input .= html_writer::tag('button', '戻す', array('id' => 'undoBtn', 'type' => 'button', 'class' => 'btn btn-secondary'));
        $input .= html_writer::tag('button', '認識', array('id' => 'sendBtn', 'type' => 'button', 'class' => 'btn btn-danger'));
        $input .= html_writer::end_tag('div');

        // display recognition-resluts with MathJAX
        $input .= '<script type="text/javascript" id="MathJax-script" async src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.0/MathJax.js?config=TeX-AMS_CHTML">
        MathJax.Hub.Config({
            extensions: ["tex2jax.js"],
            jax: ["input/TeX","output/HTML-CSS"],
            tex2jax: {inlineMath: [["$","$"],["\\(","\\)"]]}
          });
        </script> '; 
        // $input .= "<script src='https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML'>
        // MathJax.Hub.Config({
        //   tex2jax: {inlineMath: [['$','$'], ['\\(','\\)']]}
        // });
        // </script>" ;      
        $input .= html_writer::tag('div', '${}$', array('id' => 'ptnDisp', 'display' => 'inline-block', 'width' => '400px', 'height' => '80px', 'background' => 'gray'));

        // js読み込み
        $this->page->requires->js( new moodle_url($CFG->wwwroot . '/question/type/hwtestnlab/module.js'));       
        // init関数呼び出し
        $PAGE->requires->js_init_call('init', array(array('boxId' => $inputname, 'recognitionurl' => $api)), true);
        
        // 解答欄
        if ($placeholder) {
            $inputinplace = html_writer::tag('label', get_string('answer'),
                    array('for' => $inputattributes['id'], 'class' => 'accesshide'));
            $inputinplace .= $input;
            $questiontext = substr_replace($questiontext, $inputinplace,
                    strpos($questiontext, $placeholder), strlen($placeholder));
        }


        $result = html_writer::tag('div', $questiontext, array('class' => 'qtext'));

        if (!$placeholder) {
            $result .= html_writer::start_tag('div', array('class' => 'ablock form-inline'));
            $result .= html_writer::tag('label', get_string('answer', 'qtype_hwtestnlab',
                    html_writer::tag('span', $input, array('class' => 'answer'))),
                    array('for' => $inputattributes['id']));
            $result .= html_writer::end_tag('div');
        }

        if ($qa->get_state() == question_state::$invalid) {
            $result .= html_writer::nonempty_tag('div',
                    $question->get_validation_error(array('answer' => $currentanswer)),
                    array('class' => 'validationerror'));
        }

        return $result;
    }

    public function specific_feedback(question_attempt $qa) {
        $question = $qa->get_question();

        $answer = $question->get_matching_answer(array('answer' => $qa->get_last_qt_var('answer')));
        if (!$answer || !$answer->feedback) {
            return '';
        }

        return $question->format_text($answer->feedback, $answer->feedbackformat,
                $qa, 'question', 'answerfeedback', $answer->id);
    }

    public function correct_response(question_attempt $qa) {
        $question = $qa->get_question();

        $answer = $question->get_matching_answer($question->get_correct_response());
        if (!$answer) {
            return '';
        }

        return get_string('correctansweris', 'qtype_hwtestnlab',
                s($question->clean_response($answer->answer)));
    }
}
