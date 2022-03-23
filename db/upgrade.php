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
 * Short-answer question type upgrade code.
 *
 * @package    qtype
 * @subpackage hwtestnlab
 * @copyright  2021 Ryo Yajima <yajima.leonad@gmail.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

/**
 * Upgrade code for the essay question type.
 * @param int $oldversion the version we are upgrading from.
 */
function xmldb_qtype_hwtestnlab_upgrade($oldversion) {
    global $CFG, $DB;

    // Automatically generated Moodle v3.6.0 release upgrade line.
    // Put any upgrade step following this.

    // Automatically generated Moodle v3.7.0 release upgrade line.
    // Put any upgrade step following this.

    // Automatically generated Moodle v3.8.0 release upgrade line.
    // Put any upgrade step following this.

    // Automatically generated Moodle v3.9.0 release upgrade line.
    // Put any upgrade step following this.

    // Automatically generated Moodle v3.10.0 release upgrade line.
    // Put any upgrade step following this.

    // Automatically generated Moodle v3.11.0 release upgrade line.
    // Put any upgrade step following this.

    $result = TRUE;
    $dbman = $DB->get_manager();

    if ($oldversion < 2021110800) {

        // Define table qtype_hwtestnlab_options to be created.
        $table_options = new xmldb_table('qtype_hwtestnlab_options');

        // Adding fields to table qtype_hwtestnlab_options.
        $table_options->add_field('id', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, XMLDB_SEQUENCE, null);
        $table_options->add_field('questionid', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, '0');
        $table_options->add_field('usecase', XMLDB_TYPE_INTEGER, '2', null, XMLDB_NOTNULL, null, '0');

        // Adding keys to table qtype_hwtestnlab_options.
        $table_options->add_key('primary', XMLDB_KEY_PRIMARY, ['id']);
        $table_options->add_key('questionid', XMLDB_KEY_FOREIGN_UNIQUE, ['questionid'], 'question', ['id']);

        // Conditionally launch create table for qtype_hwtestnlab_options.
        if (!$dbman->table_exists($table_options)) {
            $dbman->create_table($table_options);
        }

        // Hwtestnlab savepoint reached.
        upgrade_plugin_savepoint(true, 2021110800, 'qtype', 'hwtestnlab');
    }

    if ($oldversion < 2022032302) {

        // Define table qtype_hwtestnlab_strokes to be created.
        $table_strokes = new xmldb_table('qtype_hwtestnlab_strokes');

        // Adding fields to table qtype_hwtestnlab_strokes.
        $table_strokes->add_field('id', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, XMLDB_SEQUENCE, null);
        $table_strokes->add_field('answerid', XMLDB_TYPE_INTEGER, '10', null, null, null, null);
        $table_strokes->add_field('strokes', XMLDB_TYPE_TEXT, null, null, null, null, null);

        // Adding keys to table qtype_hwtestnlab_strokes.
        $table_strokes->add_key('primary', XMLDB_KEY_PRIMARY, ['id']);

        // Conditionally launch create table for qtype_hwtestnlab_strokes.
        if (!$dbman->table_exists($table_strokes)) {
            $dbman->create_table($table_strokes);
        }

        // Hwtestnlab savepoint reached.
        upgrade_plugin_savepoint(true, 2022032302, 'qtype', 'hwtestnlab');
    }

    if ($oldversion < 2022032400) {

        // Changing type of field answerid on table qtype_hwtestnlab_strokes to text.
        $table = new xmldb_table('qtype_hwtestnlab_strokes');
        $field = new xmldb_field('answerid', XMLDB_TYPE_TEXT, null, null, XMLDB_NOTNULL, null, null, 'id');

        // Launch change of type for field answerid.
        $dbman->change_field_type($table, $field);

        // Hwtestnlab savepoint reached.
        upgrade_plugin_savepoint(true, 2022032400, 'qtype', 'hwtestnlab');
    }


    return $result;
}
