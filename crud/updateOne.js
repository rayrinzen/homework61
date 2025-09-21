const { MongoClient } = require('mongodb');
require("dotenv").config(); 

// URI для підключення до MongoDB Atlas
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function updateCustomer() {
  try {
    await client.connect();
    const database = client.db('myDatabase');
    const customers = database.collection('customers');

    // Визначаємо критерій для вибору документа
    const query = { email: 'john.doe@example.com' };

    // Визначаємо нові значення для оновлення
    const update = { $set: { phone: '987654321' } };

    // Оновлюємо один документ, який відповідає критерію
    const result = await customers.updateOne(query, update);
    console.log(`Оновлено ${result.modifiedCount} документ(ів)`);
  } catch (error) {
    console.error('Помилка:', error);
  } finally {
    await client.close();
  }
}

updateCustomer();