/**
 * Seed script to create test users for AppsTV
 * Run with: node seed-users.mjs
 */

import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const connection = await mysql.createConnection({
  host: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'localhost',
  user: process.env.DATABASE_URL?.split('://')[1]?.split(':')[0] || 'root',
  password: process.env.DATABASE_URL?.split(':')[2]?.split('@')[0] || '',
  database: process.env.DATABASE_URL?.split('/')[3] || 'appstv',
});

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function seedUsers() {
  try {
    console.log('🌱 Seeding test users...\n');

    // Admin User
    const adminPassword = await hashPassword('admin123');
    await connection.execute(
      'INSERT INTO users (username, password, name, role, status) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE password = VALUES(password)',
      ['admin', adminPassword, 'Administrator', 'admin', 'active']
    );
    console.log('✅ Admin user created');
    console.log('   Username: admin');
    console.log('   Password: admin123\n');

    // Reseller User
    const resellerPassword = await hashPassword('reseller123');
    await connection.execute(
      'INSERT INTO users (username, password, name, role, status) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE password = VALUES(password)',
      ['reseller', resellerPassword, 'Reseller User', 'reseller', 'active']
    );
    console.log('✅ Reseller user created');
    console.log('   Username: reseller');
    console.log('   Password: reseller123\n');

    // Customer User
    const customerPassword = await hashPassword('customer123');
    await connection.execute(
      'INSERT INTO users (username, password, name, role, status) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE password = VALUES(password)',
      ['customer', customerPassword, 'Customer User', 'customer', 'active']
    );
    console.log('✅ Customer user created');
    console.log('   Username: customer');
    console.log('   Password: customer123\n');

    // Create Reseller profile for reseller user
    const [resellerUser] = await connection.execute(
      'SELECT id FROM users WHERE username = ?',
      ['reseller']
    );

    if (resellerUser.length > 0) {
      await connection.execute(
        'INSERT INTO resellers (userId, companyName, creditBalance, totalCreditsUsed, status) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE companyName = VALUES(companyName)',
        [resellerUser[0].id, 'Test Reseller Company', '1000.00', '0.00', 'active']
      );
      console.log('✅ Reseller profile created with 1000 credits\n');
    }

    // Create Customer profile for customer user
    const [customerUser] = await connection.execute(
      'SELECT id FROM users WHERE username = ?',
      ['customer']
    );

    if (customerUser.length > 0) {
      await connection.execute(
        'INSERT INTO customers (userId, status) VALUES (?, ?) ON DUPLICATE KEY UPDATE status = VALUES(status)',
        [customerUser[0].id, 'active']
      );
      console.log('✅ Customer profile created\n');
    }

    console.log('📊 Access Information:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🔐 ADMIN PANEL');
    console.log('   URL: /dashboard/admin');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   Access: Manage all users, resellers, credits, and logs\n');

    console.log('🏢 RESELLER PANEL');
    console.log('   URL: /dashboard/reseller');
    console.log('   Username: reseller');
    console.log('   Password: reseller123');
    console.log('   Access: Generate codes, manage clients, view analytics\n');

    console.log('👤 CUSTOMER PANEL');
    console.log('   URL: /dashboard/customer');
    console.log('   Username: customer');
    console.log('   Password: customer123');
    console.log('   Access: Activate codes, manage devices, view subscriptions\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('✨ Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seedUsers();
