const useAppSettings = require('@/settings/useAppSettings');

describe('useAppSettings', () => {
  test('should return default app settings', () => {
    const settings = useAppSettings();

    expect(settings).toHaveProperty('idurar_app_email');
    expect(settings).toHaveProperty('idurar_base_url');
    expect(settings.idurar_app_email).toBe('noreply@idurarapp.com');
    expect(settings.idurar_base_url).toBe('https://cloud.idurarapp.com');
  });
});

