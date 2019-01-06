import { GraphQLServer } from "graphql-yoga";
import uuidv4 from "uuid/v4";

// Scalar types: ID, String, Int, Boolean, Float

const users = [
  {
    id: "1",
    name: "lee",
    email: "x@gmail.com",
    age: 20
  },
  {
    id: "2",
    name: "james",
    email: "leo@gmail.com",
    age: 22
  },
  {
    id: "3",
    name: "HienP",
    email: "leo@gmail.com",
    age: 22
  }
];

let posts = [
  {
    id: "1",
    title: "react with graphql",
    body: "xyz",
    published: true,
    author: "1"
  },
  {
    id: "2",
    title: "react with docker",
    body: "xyz",
    published: false,
    author: "1"
  },
  {
    id: "3",
    title: "GraphQL 101",
    body: "2312312",
    published: false,
    author: "2"
  }
];

let comments = [
  {
    id: "1",
    post: "1",
    content: "cool i like it!",
    author: "3"
  },
  {
    id: "2",
    post: "2",
    content: "where are you?",
    author: "3"
  }
];
let typeDefs = `
    type Query {
      users(query: String): [User!]!
      posts(query: String): [Post!]!
      comments(query: String): [Comment!]!
      me: User!
      sum(numbers: [Float!]): Float!
    }

    type Mutation{
      createUser(data: createUserInput): User!
      createPost(title: String!, body: String!, published: Boolean!, author: ID!): Post!
      createComment(post: String!, content: String!, author: String): Comment!
      deleteUser(id: String!): User!
    }

    # input type
    input createUserInput{
      name: String!
      email: String!
      age: Int
    }

    type User{
      id: ID!
      name: String!
      email: String!
      age: Int
      posts: [Post!]!
      comments: [Comment!]!
    }

    type Post{
      id: ID!
      title: String!
      body: String!
      published: Boolean!
      author: User!
      comments: [Comment!]!
    }
    
    type Comment{
      id: ID!
      content: String!
      author: User!
      post: Post!
    }
`;
const resolvers = {
  Query: {
    me: () => {
      return {
        id: 1,
        name: "lee",
        email: "lee@gmail.com",
        age: 20
      };
    },
    posts(parent, argx) {
      return posts;
    },
    users(parent, argx) {
      if (argx.query) {
        return users.filter(user => {
          return user.name.toLowerCase().includes(argx.query.toLowerCase());
        });
      }
      return users;
    },
    sum(parent, argx, ctx, info) {
      if (argx.numbers.length === 0) {
        return 0;
      }
      return argx.numbers.reduce((a, b) => a + b, 0);
    },
    comments() {
      return comments;
    }
  },
  Mutation: {
    createUser(parent, agrs, ctx, info) {
      const emailTaken = users.some(u => u.email === agrs.data.email);
      if (emailTaken) {
        throw new Error("Email has taken");
      }

      const user = {
        id: uuidv4(),
        ...agrs.data
      };

      users.push(user);
      return user;
    },
    deleteUser(parent, agrs) {
      const userIndex = users.findIndex(x => x.id === agrs.id);

      if (userIndex === -1) {
        throw new Error("User not existed");
      }

      const deletedUser = users.splice(userIndex, 1);
      posts = psots.filter(c => {
        const match = c.author === agrs.id;

        if (match) {
          comments = comments.filter(c => c.post !== c.id);
        }

        return !match;
      });
      comments = comments.filter(p => p.author !== agrs.id);

      return deletedUser[0];
    },
    createPost(parent, agrs, ctx, info) {
      const existedUser = users.some(u => u.id === agrs.author);
      if (!existedUser) {
        throw new Error("User not existed");
      }

      const post = {
        id: uuidv4(),
        ...agrs
      };

      posts.push(post);
      return post;
    },
    createComment(parent, agrs) {
      const existedUser = users.some(u => u.id === agrs.author);
      if (!existedUser) {
        throw new Error("User not existed");
      }

      const postExists = posts.some(
        p => p.id === agrs.post && p.published === true
      );

      if (!postExists) {
        throw new Error("Post not existed");
      }

      const comment = {
        id: uuidv4(),
        ...agrs
      };

      comments.push(comment);
      return comment;
    }
  },
  Post: {
    author(parent, argx, ctx, info) {
      return users.find(x => x.id === parent.author);
    },
    comments(parent) {
      return comments.filter(x => x.post === parent.id);
    }
  },
  User: {
    posts(parent, argx) {
      return posts.filter(p => p.author === parent.id);
    },
    comments(parent) {
      return comments.filter(c => c.author === parent.id);
    }
  },
  Comment: {
    author(parent) {
      return users.find(x => x.id === parent.author);
    },
    post(parent) {
      return posts.find(p => p.id === parent.post);
    }
  }
};

const server = new GraphQLServer({
  typeDefs,
  resolvers
});

server.start(({ url }) => {
  console.log(`Server is up and running !`);
});
