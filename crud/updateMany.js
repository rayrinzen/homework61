const { MongoClient } = require('mongodb');
require("dotenv").config(); 

// URI для підключення до MongoDB Atlas
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function updateInactiveCustomers() {
  try {
    await client.connect();
    const database = client.db('myDatabase');
    const customers = database.collection('customers');

    // Визначаємо критерій для вибору документів
    const query = { lastLogin: { $lt: new Date('2022-01-01') } };

    // Визначаємо нові значення для оновлення
    const update = { $set: { status: 'inactive' } };

    // Оновлюємо кілька документів, які відповідають критерію
    const result = await customers.updateMany(query, update);
    console.log(`Оновлено ${result.modifiedCount} документ(ів)`);
  } catch (error) {
    console.error('Помилка:', error);
  } finally {
    await client.close();
  }
}

updateInactiveCustomers();