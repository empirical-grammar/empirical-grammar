import {rethinkDBHost} from '../../src/config/rethinkdb';

describe('rethinkDBHost', () => {

  it("should work as expected", () => {

    // only one host
    expect(rethinkDBHost("one")).toEqual('one');
    expect(rethinkDBHost("one", null)).toEqual('one');
    expect(rethinkDBHost("one", undefined)).toEqual('one');
    expect(rethinkDBHost("one", "web.9")).toEqual('one');

    // spread requests around
    expect(rethinkDBHost("one two three", "web.1")).toEqual('two');
    expect(rethinkDBHost("one two three", "web.2")).toEqual('three');
    expect(rethinkDBHost("one two three", "web.3")).toEqual('one');
    expect(rethinkDBHost("one two three", "web.4")).toEqual('two');

    // random server picked if no dyno
    const randomHost = rethinkDBHost("one two three four", null)
    expect(['one','two','three','four'].includes(randomHost)).toBeTruthy();

    // malform dyno, also pick random
    const malformed = rethinkDBHost("one two three", "weasfasfadsf")
    expect(['one','two','three','four'].includes(malformed)).toBeTruthy();
  });

  // this isn't completely deterministic, but highly likely to be
  it("should spread the randomness around", () => {
    const values = "one two three"
    const fiftyRandom = Array.from({length: 50}, (v,i) => rethinkDBHost(values))

    expect(fiftyRandom.includes('one')).toBeTruthy();
    expect(fiftyRandom.includes('two')).toBeTruthy();
    expect(fiftyRandom.includes('three')).toBeTruthy();
  });

});
