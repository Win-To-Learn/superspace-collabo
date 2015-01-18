/**
 * Created by jay on 1/13/15.
 */

/**
 * @fileoverview Javascript code generation for player shape blocks
 * @author Jay Bloodworth <johnabloodworth3@gmail.com>
 */
'use strict';

/**
 * Generate code for ordered pair blocks
 * Bypass normal Blockly code generation methods bc our pair values are
 * 'statements' in Blockly-speak
 */
Blockly.JavaScript['superspace_shape_player'] = function (block) {
    var x, y;
    var pairList = [];
    var pairBlock = block.getInputTargetBlock('PAIRS');
    while (pairBlock) {
        x = pairBlock.getFieldValue('X');
        y = pairBlock.getFieldValue('Y');
        pairList.push('[' + x + ',' + y + ']');
        pairBlock = pairBlock.nextConnection && pairBlock.nextConnection.targetBlock();
    }
    if (pairList.length > 1) {
        // Don't generate code for only one point
        return 'player.shape = [' + pairList.join(',') + '];';
    }
    return '';
};

/**
 * Code generation for pair is a NOOP bc it has no meaning outside of a container
 */
Blockly.JavaScript['superspace_shape_pair'] = function (block) {
    return null;
}