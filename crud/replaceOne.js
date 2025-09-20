const { MongoClient } = require('mongodb');

// URI для підключення до MongoDB Atlas
const uri = 'mongodb+srv://rayushekrin_db_user:aviator0927@cluster0.wgyo1dc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function replaceCustomer() {
  try {
    await client.connect();
    const database = client.db('myDatabase');
    const customers = database.collection('customers');

    // Визначаємо критерій для вибору документа
    const query = { email: 'john.doe@example.com' };

    // Визначаємо новий документ для заміни
    const replacement = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '987654321',
      address: '123 Main St, City'
    };

    // Замінюємо один документ, який відповідає критерію
    const result = await customers.replaceOne(query, replacement);
    console.log(`Замінено ${result.modifiedCount} документ(ів)`);
  } catch (error) {
    console.error('Помилка:', error);
  } finally {
    await client.close();
  }
}

replaceCustomer();