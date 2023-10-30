import { MongoClient } from "mongodb";

async function connectDB(uri) {
    const client = new MongoClient(uri);

    try{
        await client.connect();
        await listDB(client);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }

}

async function listDB(client){
    const databaseList = await client.db().admin().listDatabases();
    console.log("Databases List: ");
    databaseList.databases.forEach(db => {
        console.log(`-${db.name}`);
    });
} 
export default connectDB;