import {css} from "@emotion/css";
import {useContext} from "react";
import {useRouter} from "next/router";
import {ethers} from "ethers";
import Link from "next/link";
import {AccountContext} from "../context";

/* Import Smart Contract Address and Owner Address from local File `config.js` */
import {
    contractAddress, ownerAddress
} from "../config";

/* Import Application Binary Interface (ABI) */
import Blog from "../artifacts/contracts/Blog.sol/Blog.json";

const Home = (props) => {
    /* Posts are fetched Server-side and passed in as Props */
    const {posts} = props;
    const account = useContext(AccountContext);

    const router = useRouter();

    const navigate = async() => {
        router.push("/create-post").catch(console.error);
    }

    return (
        <div>
            <div className={postList}>
                {
                    /* Mapping over Posts Array and render a Button with the Post Title */
                    posts.map((post, index) => (
                        <Link href={`/post/${post[2]}`} key={index}>
                            <a>
                                <div className={linkStyle}>
                                    <p className={postTitle}>{post[1]}</p>
                                    <div className={arrowContainer}>
                                        <img
                                            src={"/right-arrow.svg"}
                                            alt={"Right Arrow"}
                                            className={smallArrow}
                                        />
                                    </div>
                                </div>
                            </a>
                        </Link>
                    ))
                }
            </div>
            <div className={container}>
                {
                    (account === ownerAddress) && posts && !posts.length && (
                        /* If logged-in User is the Account Owner, then render a Button to create the first Post */
                        <button className={buttonStyle} onClick={navigate}>
                            Create your first Post
                            <img
                                src={"/right-arrow.svg"}
                                alt={"Right Arrow"}
                                className={arrow}
                            />
                        </button>
                    )
                }
            </div>
        </div>
    );
}

export const getServerSideProps = async() => {
    /* Checking current Environment Variable and render a Provider based on the Environment */
    let provider;
    if (process.env.ENVIRONMENT === "local") {
        provider = new ethers.providers.JsonRpcProvider();
    } else if (process.env.ENVIRONMENT === "testnet") {
        provider = new ethers.providers.JsonRpcProvider("https://rpc-mumbai.matic.today");
    } else {
        provider = new ethers.providers.JsonRpcProvider("https://polygon-rpc.com/");
    }

    /* Create a JavaScript Object to interact with the Smart Contract and fetch the Posts */
    const contract = new ethers.Contract(contractAddress, Blog.abi, provider);
    const data = await contract.fetchPosts();
    /* Setting the fetched Posts as props */
    return {
        props: {
            posts: JSON.parse(JSON.stringify(data))
        }
    }
}

const arrowContainer = css(`
  display: flex;
  flex: 1;
  justify-content: flex-end;
  padding-right: 20px;
`);

const postTitle = css(`
  font-size: 30px;
  font-weight: bold;
  cursor: pointer;
  margin: 0;
  padding: 20px;
`);

const linkStyle = css(`
  border: 1px solid #ddd;
  margin-top: 20px;
  border-radius: 8px;
  display: flex;
`);

const postList = css(`
  width: 700px;
  margin: 0 auto;
  padding-top: 50px;  
`);

const container = css(`
  display: flex;
  justify-content: center;
`);

const buttonStyle = css(`
  margin-top: 100px;
  background-color: #fafafa;
  outline: none;
  border: none;
  font-size: 44px;
  padding: 20px 70px;
  border-radius: 15px;
  cursor: pointer;
  box-shadow: 7px 7px rgba(0, 0, 0, .1);
`);

const arrow = css(`
  width: 35px;
  margin-left: 30px;
`);

const smallArrow = css(`
  width: 25px;
`);

export default Home;
