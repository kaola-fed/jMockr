const dec = require('./dec');

test('adds 1 - 2 to equal -1', () => {
    console.info('this is out from beforeAll');
    expect(dec(1, 2)).toBe(-1);
});
