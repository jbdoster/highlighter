// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
import * as assert from 'assert';
import * as CONST from './const';
import * as DEFINITIONS from '../def';
import * as jsonfile from 'jsonfile';
suite("Units", function () {
    let highlighter_instance: DEFINITIONS.Highlighter = new DEFINITIONS.Highlighter();
    test("Highlighter instance has all required methods?", function() {
        assert.equal(typeof highlighter_instance.highlight_selection, typeof  Function);
        assert.equal(typeof highlighter_instance.find_highlight, typeof  Function);
        assert.equal(typeof highlighter_instance.remove_highlight, typeof  Function);
        assert.equal(typeof highlighter_instance.remove_all_highlights, typeof  Function);
    });
    test("Package.json has all required commands??", function() {
        let file: any = jsonfile.readFileSync('package.json');
        let commands: Array<object> = file.contributes.commands;
        commands.forEach((command, index) => {
            assert.deepEqual(command, CONST.commands[index]);
        });
    });
});
// suite("Behaviors", function () {
//     let highlighter_instance: DEFINITIONS.Highlighter = new DEFINITIONS.Highlighter();
//     test("Create a highlight", function() {

//     });
// });