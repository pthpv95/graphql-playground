const Subscription = {
  count: {
    subscribe(parent, agrs, { pubSub }, info) {
      let count = 0;
      setInterval(() => {
        count++;

        pubSub.publish("count", { count });
      }, 1000);

      // return specific channel
      return pubSub.asyncIterator("count");
    }
  },
  comment: {
    subscribe(parent, { postId }, { db, pubSub }, info) {
      const postExists = db.posts.find(p => p.id === postId && p.published);
      if (!postExists) throw new Error("Post not found");
      
      return pubSub.asyncIterator(`comment ${postId}`);
    }
  }
};

export { Subscription };
