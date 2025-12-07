require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });
const { generate: uniqueId } = require('shortid');
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE);

async function createUser() {
  try {
    const Admin = require('../models/coreModels/Admin');
    const AdminPassword = require('../models/coreModels/AdminPassword');
    const newAdminPassword = new AdminPassword();

    const email = 'i233045@isb.nu.edu.pk';
    const password = 'i233045@isb.nu.edu.pk';

    // Check if user already exists
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      console.log('❌ User already exists with email:', email);
      process.exit(1);
    }

    const salt = uniqueId();
    const passwordHash = newAdminPassword.generateHash(salt, password);

    const newAdmin = {
      email: email.toLowerCase(),
      name: 'User',
      surname: 'NU',
      enabled: true,
      role: 'owner',
    };
    
    const result = await new Admin(newAdmin).save();

    const AdminPasswordData = {
      password: passwordHash,
      emailVerified: true,
      salt: salt,
      user: result._id,
    };
    
    await new AdminPassword(AdminPasswordData).save();

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('👍 User ID:', result._id);
    
    process.exit(0);
  } catch (e) {
    console.log('\n🚫 Error! The Error info is below');
    console.log(e);
    process.exit(1);
  }
}

createUser();

