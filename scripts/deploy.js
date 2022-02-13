const hre = require("hardhat");
const fs = require("fs");

async function main() {
    /* Deploy the Smart Contract to the chosen Network */
    const Blog = await hre.ethers.getContractFactory("Blog");
    const blog = await Blog.deploy("My Blog about Bruno");

    await blog.deployed();
    console.log("Blog deployed to:", blog.address);

    /* Writing the Smart Contract Addresses to a File named `config.js` that the App can use */
    fs.writeFileSync("./config.js", `
    export const contractAddress = "${blog.address}"
    export const ownerAddress = "${blog.signer.address}"
    `);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
