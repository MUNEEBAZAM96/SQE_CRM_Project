/**
 * Generate test client data
 */
const generateClient = (overrides = {}) => {
  return {
    name: 'Test Client',
    email: 'client@test.com',
    phone: '+1234567890',
    address: '123 Test St, Test City, Test State, 12345, USA',
    country: 'USA',
    enabled: true,
    removed: false,
    ...overrides,
  };
};

/**
 * Create and save test client
 */
const createTestClient = async (ClientModel, overrides = {}) => {
  const clientData = generateClient(overrides);
  const client = await new ClientModel(clientData).save();
  return client;
};

/**
 * Create multiple test clients
 */
const createTestClients = async (ClientModel, count = 5) => {
  const clients = [];
  for (let i = 0; i < count; i++) {
    const client = await createTestClient(ClientModel, {
      name: `Test Client ${i + 1}`,
      email: `client${i + 1}@test.com`,
    });
    clients.push(client);
  }
  return clients;
};

module.exports = {
  generateClient,
  createTestClient,
  createTestClients,
};

