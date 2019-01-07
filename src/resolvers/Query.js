const Query = {
  me: () => {
    return {
      id: 1,
      name: "lee",
      email: "lee@gmail.com",
      age: 20
    };
  },
  posts(parent, argx, ctx) {
    return ctx.db.posts;
  },
  users(parent, argx, ctx) {
    if (argx.query) {
      return ctx.db.users.filter(user => {
        return user.name.toLowerCase().includes(argx.query.toLowerCase());
      });
    }
    return ctx.db.users;
  },
  sum(parent, argx, ctx, info) {
    if (argx.numbers.length === 0) {
      return 0;
    }
    return argx.numbers.reduce((a, b) => a + b, 0);
  },
  comments(parent, argx, ctx, info) {
    return ctx.db.comments;
  }
};

export { Query };
