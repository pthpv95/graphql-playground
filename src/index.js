import { GraphQLServer, PubSub } from "graphql-yoga";
import db from "./db";
import { Query } from "./resolvers/Query";
import { Subscription } from "./resolvers/Subscription";
import { Mutation } from "./resolvers/Mutation";

const pubSub = new PubSub();

const resolvers = {
  Query,
  Subscription,
  Mutation,
  Post: {
    author(parent, argx, ctx, info) {
      return ctx.db.users.find(x => x.id === parent.author);
    },
    comments(parent, args, ctx) {
      return ctx.db.comments.filter(x => x.post === parent.id);
    }
  },
  User: {
    posts(parent, argx, ctx) {
      return ctx.db.posts.filter(p => p.author === parent.id);
    },
    comments(parent, args, ctx) {
      return ctx.db.comments.filter(c => c.author === parent.id);
    }
  },
  Comment: {
    author(parent, args, ctx) {
      return ctx.db.users.find(x => x.id === parent.author);
    },
    post(parent, args, ctx) {
      return ctx.db.posts.find(p => p.id === parent.post);
    }
  }
};

const server = new GraphQLServer({
  typeDefs: "./src/schema.graphql",
  resolvers,
  context: {
    db,
    pubSub
  }
});

// const options = {
//   port: 4000,
//   endpoint: "/graphql",
//   subscriptions: "/subscriptions",
//   playground: "/playground"
// };

server.start(() => {
  console.log(`Server is up and running on port!`);
});
