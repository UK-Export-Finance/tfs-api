import { AxiosResponse } from 'axios';

import { getObligationIds } from '.';

describe('modules/gift/helpers/get-obligation-ids', () => {
  const mockResponse = (id: number) => ({ data: { id } }) as AxiosResponse<{ id: number }>;

  const mockObligationsResponse = [mockResponse(1), mockResponse(2), mockResponse(3)];

  it('should return an array of obligation IDs', () => {
    // Act
    const result = getObligationIds(mockObligationsResponse);

    // Assert
    const expected = [1, 2, 3];

    expect(result).toStrictEqual(expected);
  });

  describe('when obligations is an empty array', () => {
    it('should return an empty array', () => {
      // Act
      const result = getObligationIds([]);

      // Assert
      expect(result).toStrictEqual([]);
    });
  });
});
