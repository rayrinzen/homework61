const { MongoClient } = require('mongodb');

// URI для підключення до MongoDB Atlas
const uri = 'mongodb+srv://rayushekrin_db_user:aviator0927@cluster0.wgyo1dc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

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