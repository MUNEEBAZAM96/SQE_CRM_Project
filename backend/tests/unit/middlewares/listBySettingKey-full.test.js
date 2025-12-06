const mongoose = require('mongoose');

describe('listBySettingKey - Full Coverage', () => {
  let SettingModel;
  let listBySettingKey;

  beforeAll(async () => {
    const { connectDB, loadModels } = require('../../setup/db.setup');
    loadModels(); // Load models first
    await connectDB();
    SettingModel = mongoose.model('Setting');
    // Require after models are loaded
    listBySettingKey = require('@/middlewares/settings/listBySettingKey');
  });

  afterAll(async () => {
    const { closeDB } = require('../../setup/db.setup');
    await closeDB();
  });

  beforeEach(async () => {
    const { clearDB } = require('../../setup/db.setup');
    await clearDB();
  });

  test('should return settings when found (results.length >= 1)', async () => {
    const setting1 = await SettingModel.create({
      settingKey: 'test_key_1',
      settingValue: 'value1',
      settingCategory: 'test',
    });
    const setting2 = await SettingModel.create({
      settingKey: 'test_key_2',
      settingValue: 'value2',
      settingCategory: 'test',
    });

    const result = await listBySettingKey({
      settingKeyArray: ['test_key_1', 'test_key_2'],
    });

    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result.some(s => s.settingKey === 'test_key_1')).toBe(true);
  });

  test('should return empty array when no results found (results.length < 1)', async () => {
    const result = await listBySettingKey({
      settingKeyArray: ['non_existent_key'],
    });

    expect(result).toEqual([]);
  });
});

