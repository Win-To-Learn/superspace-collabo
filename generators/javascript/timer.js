/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Generating JavaScript for math blocks.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

//goog.provide('Blockly.JavaScript.player');

//goog.require('Blockly.JavaScript');

/*
Blockly.JavaScript['player'] = function(block) {
  // Numeric value.
  //var code = parseFloat(block.getFieldValue('SCALE'));
	var argument0 = block.getFieldValue('scale') || 1;
	var code = 'player.scaleTo(' + argument0 + ',' + argument0 + ',' + argument0 + ');';
	//return [code, Blockly.JavaScript.ORDER_ADDITION];
	//return ['player.scaleTo(' + code + ',' + code + ',' + code + ');'];
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};
*/

Blockly.JavaScript['timer'] = function(block) {
	// Print statement.
	var value_ms = Blockly.JavaScript.valueToCode(block, 'MS', Blockly.JavaScript.ORDER_ATOMIC);
	var text_ms = block.getFieldValue('ms');

	return 'setTimeout(function(){},' + value_ms + ');';
};

/*
Blockly.JavaScript['variables_set'] = function(block) {
	// Variable setter.
	var argument0 = Blockly.JavaScript.valueToCode(block, 'VALUE',
		Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
	var varName = Blockly.JavaScript.variableDB_.getName(
		block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
	return varName + ' = ' + argument0 + ';\n';
};
*/
