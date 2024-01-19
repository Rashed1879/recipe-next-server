const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());

//checking if server is running
app.get('/', (req, res) => {
	res.send('Server IS Running');
});

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.PASSWORD}@cluster0.obhsxav.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

async function run() {
	try {
		// Connect the client to the server	(optional starting in v4.7)
		await client.connect();

		// created the collection for storing recipes
		const recipesCollection = client
			.db('recipeNextDB')
			.collection('recipes');

		// search recipe by title
		app.get('/search-recipe/:text', async (req, res) => {
			const searchedName = req.params.text;
			const result = await recipesCollection
				.find({
					title: { $regex: searchedName, $options: 'i' },
				})
				.toArray();
			res.send(result);
		});

		// inserting recipe into the collection
		app.post('/recipes', async (req, res) => {
			const recipe = req.body;
			const result = await recipesCollection.insertOne(recipe);
			res.send(result);
		});

		// getting all the recipes from the collection
		app.get('/allrecipes', async (req, res) => {
			const result = await recipesCollection.find().toArray();
			res.send(result);
		});

		// finding single recipe according to id from the collection
		app.get('/recipe/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };
			const result = await recipesCollection.findOne(query);
			console.log(result);
			res.send(result);
		});

		// updating single recipe according to id into the collection
		app.put('/recipe/:id', async (req, res) => {
			const id = req.params.id;
			const recipe = req.body;
			const query = { _id: new ObjectId(id) };
			const option = { upsert: true };
			const updateRecipe = {
				$set: {
					title: recipe.updatedTitle,
					ingredients: recipe.updatedIngredients,
					instruction: recipe.updatedInstruction,
					optionalMedia: recipe.updatedOptionalMedia,
				},
			};
			const result = await recipesCollection.updateOne(
				query,
				updateRecipe,
				option
			);
			res.send(result);
		});

		// delete a recipe according to id from the collection
		app.delete('/recipe/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };
			const result = await recipesCollection.deleteOne(query);
			res.send(result);
		});

		// Send a ping to confirm a successful connection
		await client.db('admin').command({ ping: 1 });
		console.log(
			'Pinged your deployment. You successfully connected to MongoDB!'
		);
	} finally {
		// Ensures that the client will close when you finish/error
		// await client.close();
	}
}
run().catch(console.dir);

//listening to port
app.listen(port, () => {
	console.log(`Server is running on port, ${port}`);
});
