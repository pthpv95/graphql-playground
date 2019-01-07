import { GraphQLServer } from "graphql-yoga";
import uuidv4 from "uuid/v4";
import db from "./db";
import { Query } from "./resolvers/Query";

const resolvers = {
  Query,
  Mutation: {
    createUser(parent, agrs, ctx, info) {
      const emailTaken = ctx.db.users.some(u => u.email === agrs.data.email);
      if (emailTaken) {
        throw new Error("Email has taken");
      }

      const user = {
        id: uuidv4(),
        ...agrs.data
      };

      ctx.db.users.push(user);
      return user;
    },
    deleteUser(parent, agrs, ctx) {
      const userIndex = ctx.db.users.findIndex(x => x.id === agrs.id);

      if (userIndex === -1) {
        throw new Error("User not existed");
      }

      const deletedUser = ctx.db.users.splice(userIndex, 1);
      ctx.db.posts = ctx.db.posts.filter(c => {
        const match = c.author === agrs.id;

        if (match) {
          ctx.db.comments = ctx.db.comments.filter(c => c.post !== c.id);
        }

        return !match;
      });
      ctx.db.comments = ctx.db.comments.filter(p => p.author !== agrs.id);

      return deletedUser[0];
    },
    updateUser(parent, { id, data }, ctx) {
      let user = ctx.db.users.find(u => u.id === id);
      if (!user) {
        throw new Error("User not found");
      }

      if (typeof data.email === "string") {
        const emailTaken = ctx.db.users.some(
          u => u.email === data.email && u.id !== id
        );
        if (emailTaken) {
          throw new Error("Email is taken");
        }
        user.email = data.email;
      }
      if (typeof data.name === "string") {
        user.name = data.name;
      }

      if (typeof data.age !== "undefined") {
        user.age = data.age;
      }
      return user;
    },
    createPost(parent, agrs, ctx, info) {
      const existedUser = ctx.db.users.some(u => u.id === agrs.author);
      if (!existedUser) {
        throw new Error("User not existed");
      }

      const post = {
        id: uuidv4(),
        ...agrs
      };

      ctx.db.posts = ctx.db.psots.filter(c => {
        const match = c.author === agrs.id;

        if (match) {
          comments = ctx.db.comments.filter(c => c.post !== c.id);
        }

        return !match;
      });
      return post;
    },
    createComment(parent, agrs, ctx) {
      const existedUser = ctx.db.users.some(u => u.id === agrs.author);
      if (!existedUser) {
        throw new Error("User not existed");
      }

      const postExists = ctx.db.posts.some(
        p => p.id === agrs.post && p.published === true
      );

      if (!postExists) {
        throw new Error("Post not existed");
      }

      const comment = {
        id: uuidv4(),
        ...agrs
      };

      ctx.db.comments.push(comment);
      return comment;
    },
    deteleComment(parent, agrs, ctx) {
      const commentIndex = ctx.db.comments.findIndex(c => c.id === agrs.id);

      if (commentIndex === -1) {
        throw new Error("Comment not existed");
      }

      const deletedComment = ctx.db.comments.splice(commentIndex, 1);
      return deletedComment[0];
    },
    detelePost(parent, agrs, ctx) {
      const postIndex = ctx.db.posts.findIndex(p => p.id === agrs.id);

      if (postIndex === -1) {
        throw new Error("Post not existed");
      }

      const deletedPost = ctx.db.posts.splice(postIndex, 1);
      ctx.db.comments = ctx.db.comments.filter(c => c.post !== agrs.id);
      return deletedPost[0];
    }
  },
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
    post(parent) {
      return ctx.db.posts.find(p => p.id === parent.post);
    }
  }
};

const server = new GraphQLServer({
  typeDefs: "./src/schema.graphql",
  resolvers,
  context: {
    db
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
