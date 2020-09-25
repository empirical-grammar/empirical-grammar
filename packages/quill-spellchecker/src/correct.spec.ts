import { assert } from 'chai';

import { Dictionary } from './dictionary';

import { correct } from '../src/main';

describe('The correct function', () => {

    const dictionary: Dictionary = {
      "misspelled": 1,
      "forked": 1,
    }

    it('Should take a word and correct it if appropriate.', () => {
        const correctWord = correct(dictionary, "mispeled");
        assert.equal(correctWord, 'misspelled');
    });

    it('Should take take a word correct it if appropriate.', () => {
        const correctWord = correct(dictionary, "mspeled");;
        assert.equal(correctWord, 'mspeled');
    });
});
