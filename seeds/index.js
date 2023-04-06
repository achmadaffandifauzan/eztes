const mongoose = require('mongoose');
const Post = require('../models/post');
const User = require('../models/user');
const Category = require('../models/category');
const postSeed = require("./postSeed");

mongoose.set('strictQuery', true);
mongoose.connect('mongodb://127.0.0.1:27017/sekawan2');

mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
mongoose.connection.once('open', () => {
    console.log("Database Connected");
})

const seedDB = async () => {
    await Post.deleteMany({});
    await Category.deleteMany({});


    const newCategories = new Category({
        author: "642e6ef081513753e89489ad",
        categoryName: `Seed 1`,
        authorName: `Achmad Affandi Fauzan`,
    });
    const newCategories2 = new Category({
        author: "642e6ef081513753e89489ad",
        categoryName: `Seed 2`,
        authorName: `Achmad Affandi Fauzan`,
    });
    await newCategories.save();
    await newCategories2.save();


    // seeding category Seed 1
    for (let post of postSeed) {
        const newPosts = new Post({
            title: `${post.title}`,
            description: `${post.description}`,
            author: "642e6ef081513753e89489ad",
            type: `${post.type}`,
            options: [...post.options],
            key: `${post.key}`
        })
        const categoryFind = await Category.findOne({ categoryName: 'Seed 1' });
        newPosts.category = categoryFind._id;
        newPosts.postCategory = categoryFind.categoryName;
        // console.log(categoryFind)
        await categoryFind.posts.push(newPosts);
        await newPosts.save();
        await categoryFind.save();
    }

    // seeding category Seed 2 with same posts
    for (let post of postSeed) {
        const newPosts = new Post({
            title: `${post.title}`,
            description: `${post.description}`,
            author: "642e6ef081513753e89489ad",
            type: `${post.type}`,
            options: [...post.options],
            key: `${post.key}`
        })
        const categoryFind = await Category.findOne({ categoryName: 'Seed 2' });
        newPosts.category = categoryFind._id;
        newPosts.postCategory = categoryFind.categoryName;
        await categoryFind.posts.push(newPosts);
        await newPosts.save();
        await categoryFind.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})