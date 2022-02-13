//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Blog {
    string public name;
    address public owner;

    using Counters for Counters.Counter;
    Counters.Counter private _postIds;

    struct Post {
        uint id;
        string title;
        string content;
        bool published;
    }

    /* Using Mappings as Lookups for Posts by ID and Posts by IPFS Hash */
    mapping(uint => Post) private idToPost;
    mapping(string => Post) private hashToPost;

    /* Events facilitate Communication between Smart Contracts and their User Interfaces  */
    /* IT is possible to create Listeners for Events in the Client and also use them in TheGraph Protocol */
    event PostCreated(uint id, string title, string hash);
    event PostUpdated(uint id, string title, string hash, bool published);

    /* When the Smart Contract is deployed, a Name and the Creator as the Owner of the Smart Contract is set */
    constructor(string memory _name) {
        console.log("Deploying Smart Contract Blog with Name:", _name);
        name = _name;
        owner = msg.sender;
    }

    /* Updates the Blog Name */
    function updateName(string memory _name) public {
        name = _name;
    }

    /* Transfers Ownership of the Smart Contract to another Address */
    function transferOwnership(address newOwner) public onlyOwner {
        owner = newOwner;
    }

    /* Creates a new Post */
    function createPost(string memory title, string memory hash) public onlyOwner {
        _postIds.increment();
        uint postId = _postIds.current();
        /* Variable `post` is stored in the Blockchain with Keyword `storage` */
        Post storage post = idToPost[postId];
        post.id = postId;
        post.title = title;
        post.published = true;
        post.content = hash;
        hashToPost[hash] = post;
        emit PostCreated(postId, title, hash);
    }

    /* Updates an existing Post */
    function updatePost(uint postId, string memory title, string memory hash, bool published) public onlyOwner {
        Post storage post = idToPost[postId];
        post.title = title;
        post.published = published;
        post.content = hash;
        idToPost[postId] = post;
        hashToPost[hash] = post;
        emit PostUpdated(post.id, title, hash, published);
    }

    /* Fetches an individual Post by the Content Hash */
    function fetchPost(string memory hash) public view returns (Post memory){
        return hashToPost[hash];
    }

    /* Fetches all Posts */
    function fetchPosts() public view returns (Post[] memory) {
        uint itemCount = _postIds.current();
        uint currentIndex = 0;

        /* Variable `post` is stored during Execution and not in Blockchain with Keyword `memory` */
        Post[] memory posts = new Post[](itemCount);
        for (uint i = 0; i < itemCount; i++) {
            uint currentId = i + 1;
            Post storage currentItem = idToPost[currentId];
            posts[currentIndex] = currentItem;
            currentIndex += 1;
        }
        return posts;
    }

    /* Modifier allows only the Contract Owner to invoke the Function */
    modifier onlyOwner() {
        require(msg.sender == owner);
        /* `_` represents the remaining Code after the Modifier */
        _;
    }
}
