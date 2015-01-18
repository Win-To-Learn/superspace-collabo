/**
 * Created by jay on 1/13/15.
 */

/**
 * @fileoverview Blocks for customizing the shape of the player
 * @author Jay Bloodworth <johnabloodworth3@gmail.com>
 */
'use strict';

/**
 * Block representing an ordered pair of coordinates
 */
Blockly.Blocks['superspace_shape_pair'] = {
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
}

/**
 * Block representing a set of ordered pairs to be used as the player's shape
 */
Blockly.Blocks['superspace_shape_player'] = {
    init: function () {
        this.setColour(300);
        this.appendDummyInput()
            .appendField('player shape');
        this.appendStatementInput('PAIRS')
            .setCheck('Pair');
    }
};