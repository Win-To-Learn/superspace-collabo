/**
 * @license
 * Visual Blocks Editor
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
 * @fileoverview Player blocks for Blockly.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

//goog.provide('Blockly.Blocks.player');

//goog.require('Blockly.Blocks');

/*
Blockly.Blocks['player'] = {
	init: function() {
		this.setHelpUrl('http://www.example.com/');
		this.appendValueInput("SCALE")
			.setCheck("Number")
			.appendField(new Blockly.FieldTextInput("default"), "scale");
		this.setTooltip('');
	}
};
*/

/*
Blockly.Blocks['player'] = {
	init: function() {
		this.setHelpUrl('http://www.example.com/');
		this.appendValueInput("SCALE")
			.appendField(new Blockly.FieldTextInput("scale"), "scale");
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setTooltip('');
	}
};
*/

/*
Blockly.Blocks['player'] = {
	init: function() {
		this.setHelpUrl('http://www.example.com/');
		this.appendValueInput("SCALE")
			.setCheck("Number")
			.appendField(new Blockly.FieldTextInput("scale"), "scale");
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setTooltip('');
	}
};
*/

Blockly.Blocks['timer'] = {
	init: function() {
		this.setHelpUrl('http://www.example.com/');
		this.appendValueInput("MS")
			.setCheck("Number")
			.appendField(new Blockly.FieldTextInput("100"), "ms");
		this.setTooltip('');
	}
};


/*
//Blockly.JavaScript['player'] = function(block) {
Blockly.Blocks['player'] = function(block) {
	var value_scale = Blockly.JavaScript.valueToCode(block, 'SCALE', Blockly.JavaScript.ORDER_ATOMIC);
	var variable_name = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('NAME'), Blockly.Variables.NAME_TYPE);

	//Blockly.Blocks['player'] = {
	init: function() {
		this.setHelpUrl('http://www.example.com/');
		this.appendValueInput("SCALE")
			.setCheck("Number")
			.appendField(new Blockly.FieldVariable("item"), "NAME");
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setTooltip('');
	}
};
*/




