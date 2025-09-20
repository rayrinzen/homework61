const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://rayushekrin_db_user:aviator0927@cluster0.wgyo1dc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function findDocuments() {
    try {
        await client.connect();
        const database = client.db("test");
        const collection = database.collection('documents');

        // Виконуємо пошук документів, що мають поле 'status' зі значенням 'active'
        const query = { status: 'active' };
        const documents = await collection.find(query).toArray();

        console.log("Знайдені документи:", documents);
    } catch (error) {
        console.error("Помилка при пошуку документів:", error);
    } finally {
        await client.close();
    }
}

findDocuments();