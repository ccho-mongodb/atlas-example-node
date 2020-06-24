const { MongoClient } = require("mongodb");

// Replace the uri string with your MongoDB deployment's connection string.
const uri =
  "mongodb+srv://<user>:<password>@<cluster-url>?retryWrites=true&w=majority";
const client = new MongoClient(uri);

const dbName = "my_atlas_db";
const collectionName = "recipes";

// This function inserts four documents into your collection and prints the result
async function addDocuments(collection) {
  const recipes = [
    { name: "elotes", ingredients: ["corn", "mayonnaise", "cotija cheese", "sour cream", "lime"], prep_minutes: 35 },
    { name: "loco moco", ingredients: ["ground beef", "butter", "onion", "egg", "bread bun", "mushrooms"], prep_minutes: 54 },
    { name: "patatas bravas", ingredients: ["potato", "tomato", "olive oil", "onion", "garlic", "paprika"], prep_minutes: 80 },
    { name: "fried rice", ingredients: ["rice", "soy sauce", "egg", "onion", "pea", "carrot", "sesame oil"], prep_minutes: 40 },
  ];

  const result = await collection.insertMany(recipes);
  console.log(`${result.insertedCount} documents successfully inserted.`);
}

// This function retrieves documents that match the query and prints them
async function retrieveDocuments(collection) {

  console.log("Retrieve documents example");
  const query = { prep_minutes: {  $lt: 45 } };

  const cursor = collection.find(query).sort({ name: 1 });

  if ((await cursor.count()) === 0) {
    console.log("No documents found!");
  }

  await cursor.forEach(console.log);
  console.log("\n");
}

// This function updates your documents that match the query and prints the number updated
async function updateDocuments(collection) {
  console.log("Update documents example");

  const query = { ingredients: "egg" };

  const updateDoc = {
    $inc: {
      prep_minutes: 6
    }
  }

  const result = await collection.updateMany(filter, updateDoc);
  console.log(`Updated ${result.updatedCount} documents\n`);
}

// This function uses an aggregation pipeline to return and modify the matching
// documents without changing the actual documents
async function aggregateDocuments(collection) {
  console.log("Aggregate documents example");

  const aggregatePipeline = ([
    { $match: { prep_minutes: { $lte: 60 }}},
    { $addFields: { description: "Prepare in under an hour" } },
    { $sort: { name: 1 }},
  ]);

  const aggregateResult = await collection.aggregate(aggregatePipeline);
  console.log(await aggregateResult.toArray());
  console.log("\n");
}


// This function deletes documents that match the query and prints the result
async function deleteDocuments(collection) {
  console.log("Delete documents example");

  const query = { prep_minutes: { $gt: 60 }};

  const result = await collection.deleteMany(query);

  console.log(`Deleted ${result.deletedCount} documents\n`);
}

// This function creates a compound index on the name and ingredients fields
async function createIndex(collection) {
  console.log("Create index example");

  const result = await collection.createIndex({ name: 1, ingredients: 1 });

  console.log(`Created index: ${result}\n`);
}

// This function drops the entire "recipes" collection
async function dropCollection(database) {
  console.log("Drop collection example");

  const dropResult = await database.dropCollection(collectionName);
  console.log(`Dropped collection: ${collectionName}`);
}

async function run() {
  try {
    await client.connect();

    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    await addDocuments(collection);
    await retrieveDocuments(collection);
    await aggregateDocuments(collection);
    await createIndex(collection);
    await deleteDocuments(collection);

    await dropCollection(database);

  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

run().catch(console.dir);
