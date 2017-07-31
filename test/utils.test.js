var utils = require('../src/utils');

describe('utils', function () {
  describe('.merge', function () {
    it('should not mess with initial object', function () {
      var init = { a: 1 };

      utils.merge(init, { a: 2, b: 2 });

      expect(init.a).to.be.equal(1);
      expect(init).to.not.have.keys('b');
    });

    it('should override properties, last wins', function () {
      var result = utils.merge({ a: 1 }, { a: 3, b: 0 }, { a: 7, c: 5 }, { b: 1 });

      expect(result).to.include({ a: 7, b: 1, c: 5 });
    });
  });

  describe('.push', function () {
    it('should not mutate the first array', function () {
      var arr = [1, 2];

      utils.push(arr, [4, 2]);

      expect(arr).to.be.like([1, 2]);
    });

    it('should return a new array', function () {
      expect(utils.push([1, 2], [11, 12])).to.be.like([1, 2, 11, 12]);
    });
  });

  describe('.copyProp', function () {
    it('should not mutate the destination', function () {
      var dest = { a: 2 };

      utils.copyProp({ a: 3 }, dest, 'a');

      expect(dest.a).to.be.equal(2);
    });

    it('overrides on property name colision', function () {
      var result = utils.copyProp({ a: 1 }, { a: 7 }, 'a');

      expect(result.a).to.be.equal(1);
    });

    it('adds the property from source', function () {
      var result = utils.copyProp({ b: 8 }, { a: 1 }, 'b');

      expect(result).to.include({ a: 1, b: 8 });
    });
  });
});
