import { GraphQLServer } from "graphql-yoga";

// Scalar types: ID, String, Int, Boolean, Float
const typeDefs = `
    type Query {
      id: ID!
      name: String!
      age: Int!
      employed: Boolean!
      gpa: Float
    }
`;
const resolvers = {
  Query: {
    id() {
      return 123;
    },
    name() {
      return "lee p";
    },
    age() {
      return 23;
    },
    employed() {
      return true;
    },
    gpa() {
      return null
    }
  }
};

const server = new GraphQLServer({
  typeDefs,
  resolvers
});

server.start(port => {
  console.log(`Server is up and running`);
});
