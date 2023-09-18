const express = require('express');
const path = require('path');
const { ApolloServer } = require('appollo-server-express');
const { typeDefs, resolvers } = require("./schemas");
const { authMiddleware } = require ("./utils/auth")
const db = require('./config/connection');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3001;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});

server.applyMiddleware({ app });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const _dirname = path.dirname("");
const buildPath = path.join(_dirname, "../client/build");
app.use(express.static(buildPath));

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// app.use(routes);

app.get("*", (req, res) => {
  res.sendFile(path.join(_dirname, "../client/build/index.html"));
});

db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`🌍 Now listening on localhost:${PORT}`);
    console.log(`Use graphQL at http://localhost:${PORT}${server.graphqlPath}`);
  });
});
