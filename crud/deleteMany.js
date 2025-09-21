const { MongoClient } = require('mongodb');
require("dotenv").config(); 

// URI для підключення до MongoDB Atlas
const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function deleteInactiveCustomers() {
  try {
    await client.connect();
    const database = client.db('myDatabase');
    const customers = database.collection('customers');

    // Визначаємо критерій для видалення документів
    const query = { lastLogin: { $lt: new Date('2022-01-01') } };

    // Видаляємо кілька документів, які відповідають критерію
    const result = await customers.deleteMany(query);
    console.log(`Видалено ${result.deletedCount} документ(ів)`);
  } catch (error) {
    console.error('Помилка:', error);
  } finally {
    await client.close();
  }
}

deleteInactiveCustomers();