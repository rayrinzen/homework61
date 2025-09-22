const { MongoClient } = require('mongodb');
require("dotenv").config(); 

// URI для підключення до MongoDB Atlas
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function insertCustomer() {
  try {
    await client.connect();
    const database = client.db('myDatabase');
    const customers = database.collection('customers');

    // Створюємо новий документ
    const newCustomer = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '123456789'
    };

    // Вставляємо новий документ у колекцію
    const result = await customers.insertOne(newCustomer);
    console.log(`Новий документ був вставлений з ID: ${result.insertedId}`);
  } catch (error) {
    console.error('Помилка:', error);
  } finally {
    await client.close();
  }
}

insertCustomer();