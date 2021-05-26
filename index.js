const { ApolloServer } = require('apollo-server-express')
const express = require('express')
const { readFileSync } = require('fs')
const { MongoClient } = require('mongodb')
const resolvers = require('./resolvers')
const expressPlayground = require('graphql-playground-middleware-express').default

const typeDefs = readFileSync('./typeDefs.graphql', 'UTF-8')

// 4f1d99f01481ad2671ab
// c665216e120c6ff02e30a3c1bf7fe166f0ffbab1
const start = async () => {
    const app = express()

    const DB_HOST = 'mongodb://127.0.0.1:27017/'
    MongoClient.connect(DB_HOST, function (err, db) {
        if (err) throw err;
        console.log("Database created!");
        const context = { db:db.db('photoShare') }
        const server = new ApolloServer({
            typeDefs,
            resolvers,
            context
        })

        server.applyMiddleware({ app })

        app.get('/', (req, res) => res.end('Welcome to the PhotoShare API'))
        app.get('/playground', expressPlayground({ endpoint: '/graphql' }))

        app.listen({ port: 4000 },
            () => console.log(`GraphQL server running at http://localhost:4000${server.graphqlPath}`));
        console.log('closing')
    });
    // const client = await MongoClient.connect(DB_HOST,
    //     { useNewUrlParser: true })

    // const db = client.db

}

start()