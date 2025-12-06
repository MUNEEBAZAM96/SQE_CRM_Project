const mongoose = require('mongoose');

describe('loadSettings', () => {
  let SettingModel;
  let loadSettings;

  beforeAll(async () => {
    const { connectDB, loadModels } = require('../../setup/db.setup');
    loadModels();
    await connectDB();
    SettingModel = mongoose.model('Setting');
    loadSettings = require('@/middlewares/settings/loadSettings');
  });

  afterAll(async () => {
    const { closeDB } = require('../../setup/db.setup');
    await closeDB();
  });

  afterEach(async () => {
    const { clearDB } = require('../../setup/db.setup');
    await clearDB();
  });

  test('should load all settings into an object', async () => {
    await new SettingModel({
      settingCategory: 'test',
      settingKey: 'key1',
      settingValue: 'value1',
      removed: false,
    }).save();

    await new SettingModel({
      settingCategory: 'test',
      settingKey: 'key2',
      settingValue: 'value2',
      removed: false,
    }).save();

    const settings = await loadSettings();

    expect(settings).toHaveProperty('key1');
    expect(settings).toHaveProperty('key2');
    expect(settings.key1).toBe('value1');
    expect(settings.key2).toBe('value2');
  });

  test('should return empty object when no settings exist', async () => {
    const settings = await loadSettings();
    expect(settings).toEqual({});
  });

  test('should exclude removed settings', async () => {
    await new SettingModel({
      settingCategory: 'test',
      settingKey: 'active_key',
      settingValue: 'active_value',
      removed: false,
    }).save();

    await new SettingModel({
      settingCategory: 'test',
      settingKey: 'removed_key',
      settingValue: 'removed_value',
      removed: true,
    }).save();

    const settings = await loadSettings();
    expect(settings).toHaveProperty('active_key');
    expect(settings).not.toHaveProperty('removed_key');
  });
});

