const useDate = require('@/settings/useDate');

describe('useDate Settings', () => {
  test('should return date format from settings', () => {
    const settings = {
      idurar_app_date_format: 'YYYY-MM-DD',
    };

    const date = useDate({ settings });
    expect(date.dateFormat).toBe('YYYY-MM-DD');
  });

  test('should handle different date formats', () => {
    const settings = {
      idurar_app_date_format: 'MM/DD/YYYY',
    };

    const date = useDate({ settings });
    expect(date.dateFormat).toBe('MM/DD/YYYY');
  });
});

