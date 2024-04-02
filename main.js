const { MongoClient } = require('mongodb');
// console.log(MongoClient);

// Connection URL
const url = 'mongodb+srv://admin:WMkMOUOHp4aW8LMy@cluster0.liuuprm.mongodb.net/';
const client = new MongoClient(url);

// Database Name
const dbName = 'ma_db';

async function main() {
  // Use connect method to connect to the server
  await client.connect();
  console.log('Connected successfully to server');

  // On recupere la collection user
  const db = client.db(dbName);
  const collectionUser = db.collection('user');

  // on affiche a la console le premier enregistrement trouvé.
  console.log(await collectionUser.findOne());


  // on se connecte/crée une nouvelle collection
  const bookCollection = db.collection('book');

//   on compte le nombre de documents dans la collection book
  const bookCount = await bookCollection.countDocuments();

//   si des documents sont présents on supprime la collection
if(bookCount> 0) {
    await db.dropCollection('book');
}

  // on insere des enregistrements
  await bookCollection.insertMany([

    { title: "The Great Gatsby", author: "F. Scott Fitzgerald", genre: "Fiction", year: 1925 },

    { title: "To Kill a Mockingbird", author: "Harper Lee", genre: "Fiction", year: 1960 },

    { title: "1984", author: "George Orwell", genre: "Dystopian", year: 1949 }

  ]);


  return 'done.';
}

main()
  .then(console.log)
  .catch(console.error)
  .finally(() => client.close());