/**
 * Created by jay on 1/14/15.
 */

/**
 * @fileoverview Domain specific blocks for space battle game
 * @author Jay Bloodworth <johnabloodworth@gmail.com>
 */
'use strict';

/**
 * Block representing a set of ordered pairs to be used as the player's shape
 */
Blockly.Blocks['starcoder_player_shape'] = {
    init: function () {
        this.setColour(300);
        this.appendDummyInput()
            .appendField(Starcoder.getMsg('PLAYER_SHAPE'));
        this.appendStatementInput('PAIRS')
            .setCheck('Pair');
        this.setNextStatement(true);
        this.setPreviousStatement(true);
    }
};

/**
 * Generate code for ordered pair blocks
 * Bypass normal Blockly code generation methods bc our pair values are
 * 'statements' in Blockly-speak
 */
Blockly.JavaScript['starcoder_player_shape'] = function (block) {
    var x, y;
    var pairList = [];
    var pairBlock = block.getInputTargetBlock('PAIRS');
    while (pairBlock) {
        if (pairBlock.type === 'starcoder_shape_pair_field') {
            x = pairBlock.getFieldValue('X');
            y = pairBlock.getFieldValue('Y');
        } else {
            x = Blockly.JavaScript.valueToCode(pairBlock, 'X', Blockly.JavaScript.ORDER_COMMA) || '0';
            y = Blockly.JavaScript.valueToCode(pairBlock, 'Y', Blockly.JavaScript.ORDER_COMMA) || '0';
        }
        pairList.push('[' + x + ',' + y + ']');
        pairBlock = pairBlock.nextConnection && pairBlock.nextConnection.targetBlock();
    }
    if (pairList.length > 1) {
        // Don't generate code for only one point
        return 'player.shape = [' + pairList.join(',') + '];';
    }
    return null;
};

/**
 * Block representing an ordered pair of coordinates (number field version)
 */
Blockly.Blocks['starcoder_shape_pair_field'] = {
    init: function () {
        this.appendDummyInput()
            .appendField('(')
            .appendField(new Blockly.FieldTextInput('0', Blockly.FieldTextInput.numberValidator), 'X')
            .appendField(',')
            .appendField(new Blockly.FieldTextInput('0', Blockly.FieldTextInput.numberValidator), 'Y')
            .appendField(')');
        this.setColour(160);
        this.setNextStatement(true, 'Pair');
        this.setPreviousStatement(true, 'Pair');
    }
};

/**
 * Code generation for pair is a NOOP bc it has no meaning outside of a container
 */
Blockly.JavaScript['starcoder_shape_pair_field'] = function (block) {
    return null;
};

/**
 * Block representing an ordered pair of coordinates (input version)
 */
Blockly.Blocks['starcoder_shape_pair_input'] = {
    init: function () {
        this.appendDummyInput()
            .appendField('(');
        this.appendValueInput('X')
            .setCheck('Number');
        this.appendDummyInput()
            .appendField(',');
        this.appendValueInput('Y')
            .setCheck('Number');
        this.appendDummyInput()
            .appendField(')');
        this.setColour(160);
        this.setNextStatement(true, 'Pair');
        this.setPreviousStatement(true, 'Pair');
        this.setInputsInline(true);
    }
};

/**
 * Code generation for pair is a NOOP bc it has no meaning outside of a container
 */
Blockly.JavaScript['starcoder_shape_pair_input'] = function (block) {
    return null;
};

/**
 * Block to set tree spread
 */
Blockly.Blocks['starcoder_treespread'] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Starcoder.getMsg('TREE_SPREAD'))
			.appendField(new Blockly.FieldTextInput("120"), "TREESPREAD");
		this.setNextStatement(true);
		this.setPreviousStatement(true);
	}
};

/**
 * Code generation for tree spread block
 */
Blockly.JavaScript['starcoder_treespread'] = function (block) {
	return 'player.treeSpread = ' + block.getFieldValue('TREESPREAD') + ';'+ '\n';
};

// treescale
Blockly.Blocks['starcoder_treescale'] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Starcoder.getMsg('TREE_SCALE'))
			.appendField(new Blockly.FieldTextInput("2.7"), "TREESCALE");

		this.setNextStatement(true);
		this.setPreviousStatement(true);
	}
};

/**
 * Code generation for tree scale block
 */
Blockly.JavaScript['starcoder_treescale'] = function (block) {
	return 'player.treeScale = ' + block.getFieldValue('TREESCALE') + ';'+ '\n';
};


// treebranch factor
Blockly.Blocks['starcoder_treebranchfactor'] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Starcoder.getMsg('TREE_BRANCH_FACTOR'))
			.appendField(new Blockly.FieldTextInput("3"), "TREEBRANCHFACTOR");

		this.setNextStatement(true);
		this.setPreviousStatement(true);
	}
};

/**
 * Code generation for tree branch factor
 */
Blockly.JavaScript['starcoder_treebranchfactor'] = function (block) {
	return 'player.treeBranchFactor = ' + block.getFieldValue('TREEBRANCHFACTOR') + ';'+ '\n';
};


// treebranch decay
Blockly.Blocks['starcoder_treebranchdecay'] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Starcoder.getMsg('TREE_BRANCH_DECAY'))
			.appendField(new Blockly.FieldTextInput("0.7"), "TREEBRANCHDECAY");

		this.setNextStatement(true);
		this.setPreviousStatement(true);
	}
};



/**
 * Code generation for tree branch decay
 */
Blockly.JavaScript['starcoder_treebranchdecay'] = function (block) {
	return 'player.treeBranchDecay = ' + block.getFieldValue('TREEBRANCHDECAY') + ';'+ '\n';
};

// tree depth
Blockly.Blocks['starcoder_treedepth'] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Starcoder.getMsg('TREE_DEPTH'))
			.appendField(new Blockly.FieldTextInput("7"), "TREEDEPTH");

		this.setNextStatement(true);
		this.setPreviousStatement(true);
	}
};

/**
 * Code generation for tree branch depth
 */
Blockly.JavaScript['starcoder_treedepth'] = function (block) {
	return 'player.treeDepth = ' + block.getFieldValue('TREEDEPTH') + ';' + '\n';
};


/**
 * Block to change ship color
 */
Blockly.Blocks['starcoder_player_color'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Starcoder.getMsg('SHIP_COLOR'))
            .appendField(new Blockly.FieldColour('#ff0000'), 'COLOR');
        this.setColour(300);
        this.setNextStatement(true);
        this.setPreviousStatement(true);
    }
};

/**
 * Code generation for ship color block
 */
Blockly.JavaScript['starcoder_player_color'] = function (block) {
    return 'player.color = "' + hexToRGB(block.getFieldValue('COLOR')) + '";'+ '\n';
};

/**
 * Block to represent a rectangular vector
 */
Blockly.Blocks['starcoder_vector_rectangular'] = {
    init: function () {
        this.appendValueInput('X')
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField('x')
            .setCheck('Number');
        this.appendValueInput('Y')
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField('y')
            .setCheck('Number');
        this.setOutput(true, 'Vector');
        this.setInputsInline(true);
        this.setColour(160);
    },
    toRectPair: function () {
        var x = Blockly.JavaScript.valueToCode(this, 'X', Blockly.JavaScript.ORDER_ATOMIC) || '0';
        var y = Blockly.JavaScript.valueToCode(this, 'Y', Blockly.JavaScript.ORDER_ATOMIC) || '0';
        return [x, y];
    }
};

/**
 * Code generation for rectangular vector. noop bc higher level blocks must parse
 */
Blockly.JavaScript['starcoder_vector_rectangular'] = function (block) {
    return null;
};

/**
 * Block to represent a polar vector
 */
Blockly.Blocks['starcoder_vector_polar'] = {
    init: function () {
        this.appendValueInput('MAG')
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField(Starcoder.getMsg('MAGNITUDE'))
            .setCheck('Number');
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField(Starcoder.getMsg('ANGLE'))
            .appendField(new Blockly.FieldAngle('45'), 'ANGLE');
        this.setOutput(true, 'Vector');
        this.setInputsInline(true);
        this.setColour(160);
    },
    toRectPair: function () {
        var r = Blockly.JavaScript.valueToCode(this, 'MAG', Blockly.JavaScript.ORDER_MULTIPLICATION) || '0';
        var a = this.getFieldValue('ANGLE');
        return [r + '*Math.cos(Math.radians(' + a + '))',
            r + '*Math.sin(Math.radians(' + a + '))'];
    }
};

/**
 * Code generation for polar vector. noop bc higher level blocks must parse
 */
Blockly.JavaScript['starcoder_vector_polar'] = function (block) {
    return null;
};

/**
 * Block to create a new game object (orb or planetoid)
 */
Blockly.Blocks['starcoder_object_create'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Starcoder.getMsg('CREATE'))
            .appendField(new Blockly.FieldDropdown([[Starcoder.getMsg('ORB'), 'Orb'],
                [Starcoder.getMsg('PLANETOID'), 'Planetoid']]), 'KIND');
        this.appendValueInput('RADIUS')
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField(Starcoder.getMsg('RADIUS'))
            .setCheck('Number');
        this.appendValueInput('VELOCITY')
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField(Starcoder.getMsg('VELOCITY'))
            .setCheck('Vector');
        this.setNextStatement(true);
        this.setPreviousStatement(true);
        this.setColour(30);
    }
};

/**
 * Code generation for object create block
 */
Blockly.JavaScript['starcoder_object_create'] = function (block) {
    var radius = Blockly.JavaScript.valueToCode(block, 'RADIUS', Blockly.JavaScript.ORDER_NONE) || '1';
    var kind = block.getFieldValue('KIND');
    var code = 'new ' + kind + '(' + radius + ')';
    var vBlock = block.getInputTargetBlock('VELOCITY');
    if (vBlock) {
        var v = vBlock.toRectPair();
        code += '.velocity.xyz(' + v[0] + ',' + v[1] + ',0)';
    }
    return code + ';';
};

/**
 * Block to translate player ship
 */
Blockly.Blocks['starcoder_player_translate'] = {
    init: function () {
        this.appendValueInput('DISPLACEMENT')
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField(Starcoder.getMsg('WARP'))
            .setCheck('Vector');
        this.setNextStatement(true);
        this.setPreviousStatement(true);
        this.setColour(180);
    }
};

/**
 * Generate code for translate block
 */
Blockly.JavaScript['starcoder_player_translate'] = function (block) {
    var vBlock = block.getInputTargetBlock('DISPLACEMENT');
    if (vBlock) {
        var v = vBlock.toRectPair();
        return 'player.translateTo(' + v[0] + ',' + v[1] + ',0);';
    }
    return null;
}

/**
 * Block to implement periodic actions
 */
Blockly.Blocks['starcoder_timer_repeating'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Starcoder.getMsg('EVERY'))
            .appendField(new Blockly.FieldTextInput('1', Blockly.FieldTextInput.numberValidator), 'INTERVAL')
            .appendField(Starcoder.getMsg('SECONDS'));
        this.appendValueInput('CONDITION')
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField(Starcoder.getMsg('UNTIL'))
            .setCheck('Boolean');
        this.appendStatementInput('DO')
            .appendField(Starcoder.getMsg('DO'));
        this.setNextStatement(true);
        this.setPreviousStatement(true);
        this.setColour(120);
    }
};

/**
 * Generate code for periodic action block
 */
Blockly.JavaScript['starcoder_timer_repeating'] = function (block) {
    var tempVar = Blockly.JavaScript.variableDB_.getDistinctName('interval_ref', Blockly.Variables.NAME_TYPE);
    var interval = block.getFieldValue('INTERVAL');
    var condition = Blockly.JavaScript.valueToCode(block, 'CONDITION', Blockly.JavaScript.ORDER_NONE) || 'false';
    var statements = Blockly.JavaScript.statementToCode(block, 'DO');
    return 'var ' + tempVar + ' = setInterval(function () {\n' +
            '    if (' + condition + ') {\n' +
            '        clearInterval(' + tempVar + ');\n' +
            '    } else {\n' +
            statements +
            '    }\n' +
            '}, ' + interval + '*1000);';
};

/* Utility functions */

/**
 * Convert a hex color string #rrggbb to rgb() string
 * @param {string} color
 * @returns {string}
 */
function hexToRGB(color) {
    var r = parseInt(color.substring(1,3), 16);
    var g = parseInt(color.substring(3,5), 16);
    var b = parseInt(color.substring(5,7), 16);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
}
