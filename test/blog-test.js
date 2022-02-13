const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Blog Test Suite", async function () {
  it("Should create a Post", async function () {
    /* Given */
    const Blog = await ethers.getContractFactory("Blog");
    const blog = await Blog.deploy("My Blog about Bruno");
    await blog.deployed();
    await blog.createPost("My first Post about Bruno", "42");

    /* When */
    const posts = await blog.fetchPosts();

    /* Then */
    expect(posts[0].title).to.equal("My first Post about Bruno");
  });

  it("Should edit a post", async function () {
    /* Given */
    const Blog = await ethers.getContractFactory("Blog");
    const blog = await Blog.deploy("My Blog about Bruno");
    await blog.deployed();
    await blog.createPost("My first Post about Bruno", "42");

    /* When */
    await blog.updatePost(1, "My updated Post about Bruno", "42", true);
    const posts = await blog.fetchPosts();

    /* Then */
    expect(posts[0].title).to.equal("My updated Post about Bruno");
  });

  it("Should add update the name", async function () {
    /* Given */
    const Blog = await ethers.getContractFactory("Blog");
    const blog = await Blog.deploy("My Blog about Bruno");
    await blog.deployed();

    /* When */
    expect(await blog.name()).to.equal("My Blog about Bruno")
    await blog.updateName("My new Blog about Bruno");

    /* Then */
    expect(await blog.name()).to.equal("My new Blog about Bruno");
  });
});
