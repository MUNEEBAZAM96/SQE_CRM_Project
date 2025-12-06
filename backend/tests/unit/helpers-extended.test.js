const { icon, image, timeRange, moment } = require('@/helpers');
const fs = require('fs');

describe('Helper Functions - Extended', () => {
  describe('icon', () => {
    test('should return null when icon file does not exist', () => {
      const result = icon('nonexistent-icon');
      expect(result).toBeNull();
    });

    test('should handle error when reading icon file', () => {
      // Mock fs.readFileSync to throw an error
      const originalReadFileSync = fs.readFileSync;
      fs.readFileSync = jest.fn(() => {
        throw new Error('File not found');
      });

      const result = icon('test-icon');
      expect(result).toBeNull();

      // Restore original function
      fs.readFileSync = originalReadFileSync;
    });
  });

  describe('image', () => {
    test('should read image file', () => {
      // Mock fs.readFileSync
      const originalReadFileSync = fs.readFileSync;
      const mockBuffer = Buffer.from('test image data');
      fs.readFileSync = jest.fn(() => mockBuffer);

      const result = image('test-image');
      expect(result).toBe(mockBuffer);
      expect(fs.readFileSync).toHaveBeenCalledWith('./public/images/photos/test-image.jpg');

      // Restore original function
      fs.readFileSync = originalReadFileSync;
    });
  });

});

