import expect from 'expect';
import pos from 'pos';
import * as natural from '../../app/libs/lemmaMatching.js';

describe("Converting a string to its lemmas", () => {
  it("tests new lemma function", () => {
      const generated = natural.test('matter');
      const expected = "h";
      expect(generated).toEqual(expected);
    })
})
//   it("returns the same as the pos speech library when called from getPartsOfSpeech", () => {
//     const input = "Catherine";
//     const words = new pos.Lexer().lex(input);
//     const tagger = new pos.Tagger();
//     const expected = tagger.tag(words);
//     const generated = qpos.getPartsOfSpeech(input);
//     expect(expected).toEqual(generated);
//   })
//
//   it("Correctly identifies adverbs", () => {
//     const input = "She ran quickly after the dog.";
//     const generated = qpos.getPartsOfSpeech(input);
//     const expected = ["quickly","RB"]
//     expect(generated[2]).toEqual(expected);
//   })
//
//   it("can return an array of POS tags", () => {
//     const input = "She ran quickly after the dog.";
//     const generated = qpos.getPartsOfSpeechTags(input);
//     const expected = ["PRP", "VBD", "RB", "IN", "DT", "NN", '.']
//     expect(generated).toEqual(expected);
//   })
//
//   it("can compare two inputs and say id POS is the same",()=>{
//     const input = "She ran quickly after the dog.";
//     const target = "She ran quickly after the cat.";
//     const generated = qpos.checkPOSEquivalancy(input,target);
//     const expected = true;
//     expect(generated).toEqual(expected);
//   })
//
//   it("can compare two inputs and say id POS is the different",()=>{
//     const input = "She ran quickly after the dog.";
//     const target = "She ran quickly after the cats.";
//     const generated = qpos.checkPOSEquivalancy(input,target);
//     const expected = false;
//     expect(generated).toEqual(expected);
//   })
//
//   it("get a list of type list list with POS for two inputs", () => {
//     const input = "She ran after the dog.";
//     const target = "She ran after the dogs.";
//     const generated = qpos.getPOSTagPairs(input,target);
//     const expected = [['PRP','PRP'],['VBD','VBD'],['IN','IN'],['DT','DT'],['NN','NNS'],['.','.']];
//     expect(generated).toEqual(expected);
//   })
//
//   console.log(qpos.getPartsOfSpeech("while"))
//
//   it("returns a list of POS transformations", () => {
//     const input = "She ran after the dog.";
//     const target = "She ran after the dogs.";
//     const generated = qpos.getPOSTransformations(input,target);
//     const expected = ["NN|NNS"];
//     expect(generated).toEqual(expected);
//   })
// })
