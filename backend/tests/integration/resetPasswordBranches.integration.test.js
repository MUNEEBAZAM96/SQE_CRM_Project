require('module-alias/register');
const request = require('supertest');
const mongoose = require('mongoose');
const { connectDB, closeDB, clearDB, initApp } = require('./setup/integration.setup');
const { createTestAdmin } = require('../fixtures/admin.fixtures');
const shortid = require('shortid');

describe('Reset Password - Branch Coverage Tests', () => {
  let app;
  let admin;
  let adminPassword;

  beforeAll(async () => {
    await connectDB();
    app = initApp();
  });

  afterAll(async () => {
    await clearDB();
    await closeDB();
  });

  beforeEach(async () => {
    await clearDB();
    
    const Admin = mongoose.model('Admin');
    const AdminPassword = mongoose.model('AdminPassword');
    
    const { admin: createdAdmin, adminPassword: createdPassword } = await createTestAdmin(Admin, AdminPassword);
    admin = createdAdmin;
    adminPassword = createdPassword;
  });

  describe('POST /api/resetpassword - Branch Coverage', () => {
    it('should return 409 when user account is disabled', async () => {
      const Admin = mongoose.model('Admin');
      const AdminPassword = mongoose.model('AdminPassword');
      
      // Disable the admin account
      await Admin.findByIdAndUpdate(admin._id, { enabled: false });

      const resetToken = shortid.generate();
      await AdminPassword.findByIdAndUpdate(adminPassword._id, { resetToken });

      const response = await request(app)
        .post('/api/resetpassword')
        .send({
          userId: admin._id.toString(),
          password: 'newpassword123',
          resetToken: resetToken,
        })
        .expect(409);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('disabled');
    });

    it('should return 500 when user does not exist (controller checks enabled before null)', async () => {
      const AdminPassword = mongoose.model('AdminPassword');
      const fakeId = new mongoose.Types.ObjectId();
      const resetToken = shortid.generate();

      // The controller checks user.enabled before checking if user exists, causing 500
      const response = await request(app)
        .post('/api/resetpassword')
        .send({
          userId: fakeId.toString(),
          password: 'newpassword123',
          resetToken: resetToken,
        })
        .expect(500);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 403 when resetToken is null', async () => {
      const AdminPassword = mongoose.model('AdminPassword');
      await AdminPassword.findByIdAndUpdate(adminPassword._id, { resetToken: null });

      const response = await request(app)
        .post('/api/resetpassword')
        .send({
          userId: admin._id.toString(),
          password: 'newpassword123',
          resetToken: 'some_token',
        })
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Invalid reset token');
    });

    it('should return 403 when resetToken is undefined', async () => {
      const AdminPassword = mongoose.model('AdminPassword');
      await AdminPassword.findByIdAndUpdate(adminPassword._id, { $unset: { resetToken: '' } });

      const response = await request(app)
        .post('/api/resetpassword')
        .send({
          userId: admin._id.toString(),
          password: 'newpassword123',
          resetToken: 'some_token',
        })
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Invalid reset token');
    });

    it('should return 403 when resetToken does not match', async () => {
      const AdminPassword = mongoose.model('AdminPassword');
      const resetToken = shortid.generate();
      await AdminPassword.findByIdAndUpdate(adminPassword._id, { resetToken });

      const response = await request(app)
        .post('/api/resetpassword')
        .send({
          userId: admin._id.toString(),
          password: 'newpassword123',
          resetToken: 'wrong_token',
        })
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Invalid reset token');
    });

    it('should return 403 when resetToken is missing (checked before Joi validation)', async () => {
      const AdminPassword = mongoose.model('AdminPassword');
      const resetToken = shortid.generate();
      await AdminPassword.findByIdAndUpdate(adminPassword._id, { resetToken });

      // ResetToken check happens before Joi validation, so missing resetToken returns 403
      const response = await request(app)
        .post('/api/resetpassword')
        .send({
          userId: admin._id.toString(),
          password: 'newpassword123',
          // Missing resetToken
        })
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should successfully reset password with valid token', async () => {
      const AdminPassword = mongoose.model('AdminPassword');
      const resetToken = shortid.generate();
      await AdminPassword.findByIdAndUpdate(adminPassword._id, { resetToken });

      const response = await request(app)
        .post('/api/resetpassword')
        .send({
          userId: admin._id.toString(),
          password: 'newpassword123',
          resetToken: resetToken,
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.result).toHaveProperty('token');
    });
  });
});

