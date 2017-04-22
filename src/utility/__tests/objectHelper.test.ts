import objectHelper from '../objectHelper';
import 'should';

describe.only('objectHelper', () => {
  describe('getReference', () => {
    it('should return reference result with undefined values if no target passed', () => {
      const expected = { reference: undefined, key: undefined };
      const result = objectHelper.getReference(null, null);
      result.should.be.eql(expected);
    });

    it('should return reference result with undefined values if no path passed', () => {
      const expected = { reference: {}, key: undefined };
      const result = objectHelper.getReference({}, null);
      result.should.be.eql(expected);
    });

    it('should return reference result with correct reference and key for shallow object', () => {
      const reference = { test: 1 };
      const path = 'test';
      const expected = { reference, key: path };
      const result = objectHelper.getReference(reference, path);
      result.should.be.eql(expected);
    });

    it('should return reference result with correct reference and key for deep object', () => {
      const deepReference = { testB: 1 };
      const reference = { testA: deepReference };
      const path = 'testA|testB';
      const expected = { reference: deepReference, key: 'testB' };
      const result = objectHelper.getReference(reference, path);
      result.should.be.eql(expected);
    });
  });
});
