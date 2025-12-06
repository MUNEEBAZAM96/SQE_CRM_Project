const mongoose = require('mongoose');

describe('Settings Middleware', () => {
  let SettingModel;
  let increaseBySettingKey;
  let listAllSettings;

  beforeAll(async () => {
    const { connectDB, loadModels } = require('../../setup/db.setup');
    loadModels(); // Load models first
    await connectDB();
    SettingModel = mongoose.model('Setting');
    // Require after models are loaded
    increaseBySettingKey = require('@/middlewares/settings/increaseBySettingKey');
    listAllSettings = require('@/middlewares/settings/listAllSettings');
  });

  afterAll(async () => {
    const { closeDB } = require('../../setup/db.setup');
    await closeDB();
  });

  afterEach(async () => {
    const { clearDB } = require('../../setup/db.setup');
    await clearDB();
  });

  describe('increaseBySettingKey', () => {
    test('should return null when settingKey is not provided', async () => {
      const result = await increaseBySettingKey({});
      expect(result).toBeNull();
    });

    test('should return null when settingKey is null', async () => {
      const result = await increaseBySettingKey({ settingKey: null });
      expect(result).toBeNull();
    });

    test('should return null when setting does not exist', async () => {
      const result = await increaseBySettingKey({ settingKey: 'nonexistent_setting' });
      expect(result).toBeNull();
    });

    test('should increase setting value when setting exists', async () => {
      // Create a setting
      const setting = await new SettingModel({
        settingCategory: 'test',
        settingKey: 'test_counter',
        settingValue: 10,
        removed: false,
      }).save();

      const result = await increaseBySettingKey({ settingKey: 'test_counter' });

      expect(result).not.toBeNull();
      expect(result.settingValue).toBe(11);

      // Verify it was updated in database
      const updatedSetting = await SettingModel.findById(setting._id);
      expect(updatedSetting.settingValue).toBe(11);
    });

    test('should handle errors gracefully', async () => {
      // Mock Model.findOneAndUpdate to throw an error
      const originalFindOneAndUpdate = SettingModel.findOneAndUpdate;
      SettingModel.findOneAndUpdate = jest.fn(() => {
        throw new Error('Database error');
      });

      const result = await increaseBySettingKey({ settingKey: 'test_key' });
      expect(result).toBeNull();

      // Restore original function
      SettingModel.findOneAndUpdate = originalFindOneAndUpdate;
    });
  });

  describe('listAllSettings', () => {
    test('should return empty array when no settings exist', async () => {
      const result = await listAllSettings();
      expect(result).toEqual([]);
    });

    test('should return all settings', async () => {
      await new SettingModel({
        settingCategory: 'test',
        settingKey: 'setting1',
        settingValue: 'value1',
        removed: false,
      }).save();

      await new SettingModel({
        settingCategory: 'test',
        settingKey: 'setting2',
        settingValue: 'value2',
        removed: false,
      }).save();

      const result = await listAllSettings();
      expect(result).toHaveLength(2);
      expect(result[0].settingKey).toBe('setting1');
      expect(result[1].settingKey).toBe('setting2');
    });

    test('should exclude removed settings', async () => {
      await new SettingModel({
        settingCategory: 'test',
        settingKey: 'active_setting',
        settingValue: 'value1',
        removed: false,
      }).save();

      await new SettingModel({
        settingCategory: 'test',
        settingKey: 'removed_setting',
        settingValue: 'value2',
        removed: true,
      }).save();

      const result = await listAllSettings();
      expect(result).toHaveLength(1);
      expect(result[0].settingKey).toBe('active_setting');
    });

    test('should handle errors gracefully', async () => {
      // Mock Model.find to throw an error
      const originalFind = SettingModel.find;
      SettingModel.find = jest.fn(() => {
        throw new Error('Database error');
      });

      const result = await listAllSettings();
      expect(result).toEqual([]);

      // Restore original function
      SettingModel.find = originalFind;
    });
  });
});

