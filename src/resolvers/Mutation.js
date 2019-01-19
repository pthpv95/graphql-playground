import uuidv4 from "uuid/v4";

const Mutation = {
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
  createComment(parent, agrs, { db, pubSub }) {
    const existedUser = db.users.some(u => u.id === agrs.author);
    if (!existedUser) {
      throw new Error("User not existed");
    }

    const postExists = db.posts.some(
      p => p.id === agrs.post && p.published === true
    );

    if (!postExists) {
      throw new Error("Post not existed");
    }

    const comment = {
      id: uuidv4(),
      ...agrs
    };

    db.comments.push(comment);
    pubSub.publish(`comment ${agrs.post}`, {
      comment:{
        mutation: 'CREATEE',
        data: comment
      }
    });
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
};

export { Mutation };
