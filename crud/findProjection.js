const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://rayushekrin_db_user:aviator0927@cluster0.wgyo1dc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function findUsersWithProjection() {
    try {
        await client.connect();
        const database = client.db("test");
        const users = database.collection('users');

        // Встановлюємо projection для отримання лише імені та email кожного користувача
        const query = {}; // Пустий об'єкт означає, що ми не застосовуємо жодних фільтрів до нашого пошуку
        const projection = { name: 1, email: 1, _id: 0 }; // Включаємо name і email, виключаємо _id

        const usersList = await users.find(query, { projection }).toArray();

        console.log("Користувачі з лише іменем та email:", usersList);
    } catch (error) {
        console.error("Помилка при отриманні користувачів з проекцією:", error);
    } finally {
        await client.close();
    }
}

findUsersWithProjection();