import { dataOrDefault } from './dataOrDefault';

describe('dataOrDefault', () => {
    test('should return data if data passed in', () => {
        // Arrange
        const data = 'data';
        const defaultData = 'default';

        // Act
        const dataOrDefaultData = dataOrDefault(defaultData, data);

        // Assert
        expect(dataOrDefaultData).toEqual(data);
    });

    test('should return default if no data passed in', () => {
        // Arrange
        const defaultData = 'default';

        // Act
        const dataOrDefaultData = dataOrDefault(defaultData);

        // Assert 
        expect(dataOrDefaultData).toEqual(defaultData);
    });
}); 