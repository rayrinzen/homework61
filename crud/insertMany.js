const { MongoClient } = require('mongodb');
require("dotenv").config(); 

// URI для підключення до MongoDB Atlas
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function insertManyCustomers() {
  try {
    await client.connect();
    const database = client.db('myDatabase');
    const customers = database.collection('customers');

    // Створюємо масив нових документів
    const newCustomers = [
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '123456789'
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '987654321'
      },
      {
        name: 'Bob Johnson',
        email: 'bob.johnson@example.com',
        phone: '456789012'
      }
    ];

    // Вставляємо нові документи у колекцію
    const result = await customers.insertMany(newCustomers);
    console.log(`Нові документи були вставлені з ID: ${result.insertedIds}`);
  } catch (error) {
    console.error('Помилка:', error);
  } finally {
    await client.close();
  }
}

insertManyCustomers();