const { MongoClient } = require('mongodb');

// URI для підключення до MongoDB Atlas
const uri = 'mongodb+srv://rayushekrin_db_user:aviator0927@cluster0.wgyo1dc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function deleteCustomer() {
  try {
    await client.connect();
    const database = client.db('myDatabase');
    const customers = database.collection('customers');

    // Визначаємо критерій для видалення документа
    const query = { email: 'john.doe@example.com' };

    // Видаляємо один документ, який відповідає критерію
    const result = await customers.deleteOne(query);
    console.log(`Видалено ${result.deletedCount} документ(ів)`);
  } catch (error) {
    console.error('Помилка:', error);
  } finally {
    await client.close();
  }
}

deleteCustomer();