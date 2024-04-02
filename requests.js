const MongoClient = require('mongodb').MongoClient;


// Connection URL
const url = 'mongodb://root:rootpassword@localhost:27018';

const client = new MongoClient(url);


// Database Name
const dbName = 'new_york';

// Collection name
const restaurantsCollection = 'restaurants'



async function executeFind(paramRestaurants, paramQuery, paramOptions) {
  // on appelle la méthode find()
  let result = paramRestaurants.find(paramQuery, paramOptions);
  // on récupere le nombre de document dans le set de résultats
  let docs = await paramRestaurants.countDocuments(paramQuery);
  // Si pas de document dans les résultats
  if(docs === 0) {
    return 'Aucun documnents trouvés...';
  } else {
    console.log('Documents trouvés: ', docs);
  }
  // sinon on boucle sur la liste de docs pour les
  // afficher en console.
  for await(const doc of result) {
    console.dir(doc);
  }
}


async function executeDistinct(collection, filter) {
  const result = await collection.distinct(filter);
  for await(const doc of result) {
    console.dir(doc);
  }
}

async function executeAgregate(collection, arg = []) {
  if(arg.length === 0) {
    return;
  }
  const result = await collection.aggregate(arg);
  for await (const doc of result) {
    console.dir(doc);
  }
}



async function main() {
  // connexion
  await client.connect();
  console.log('Connected successfully to server');


  // selection
  const db = client.db(dbName);

  const restaurants = db.collection(restaurantsCollection);

  // initialisations
  let query = {};
  let options = {};


  // Queries
  // la méthode find du driver mongodb pour nodejs ne fonctionne pas
  // comme la methode find() de mongodb utilisée dasn mongosh
  // dans le driver find prend 2 arguments: un objet requete et un objet d'option.
  // l'objet d'option prend 2 propriétés: 'sort' et 'projections'

  console.log("Selection des restaurants Italiens de Brooklyn de la 5eme Avenue avec une note sup à 12");

  query = {
    "borough": "Brooklyn",
    "cuisine": "Italian",
    "address.street": "5 Avenue",
    "grades.score": {$gt: 12},
  }

  options = {
    "sort": {"name": 1},
    "projection": {
      "name": 1,
      "_id": 0,
      "grades.score": 1,
    }
  }

  await executeFind(restaurants, query, options);


  console.log("Selection des restaurants Italiens de Brooklyn de la 5eme Avenue avec une note inf à 7");

  query = {
    "borough": "Brooklyn",
    "cuisine": "Italian",
    "address.street": "5 Avenue",
    "grades.score": {$lt: 7},
  }

  
  await executeFind(restaurants, query, options);


  console.log('Affichage des quartiers de NYC avec une requete DISTINCT');

  await executeDistinct(restaurants, "borough");


  console.log('Affichage les notes d\'hygiène avec une requete DISTINCT');

  await executeDistinct(restaurants, "grades.grade");

  let match = {};
  let project = {};
  let sort= {};
  let group = {};
  let unwind = {};
  console.log('Affichons tous les restaurants de Manhattan dont la note d\'hygiène est C');


  match = {
    $match: { 
      "grades.grade": "C",
      "borough": "Manhattan"
    }
  }

  project = {
    $project : {
      "name":1,
      "borough":1,
      "_id":0
    }
  };

  sort = {
    $sort: {
      "name": 1
    }
  }



await executeAgregate(restaurants, [match, project, sort]);


  // terminé...
  return 'done.';

}


main()
  .then(console.log)
  .catch(console.error)
  .finally(() => client.close());