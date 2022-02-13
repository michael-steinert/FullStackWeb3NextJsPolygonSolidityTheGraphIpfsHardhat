import ReactMarkdown from "react-markdown";
import {useContext} from "react";
import {useRouter} from "next/router";
import Link from "next/link";
import {css} from "@emotion/css";
import {ethers} from "ethers";
import {AccountContext} from "../../context";

/* Import Smart Contract Address and Owner Address from local File `config.js` */
import {contractAddress, ownerAddress} from "../../config";

/* Import Application Binary Interface (ABI) */
import Blog from "../../artifacts/contracts/Blog.sol/Blog.json"

const ipfsURI = "https://ipfs.io/ipfs/";

const Post = ({post}) => {
    const account = useContext(AccountContext);
    const router = useRouter();
    const {id} = router.query;

    if (router.isFallback) {
        return (
            <div>Loading Site</div>
        );
    }

    return (
        <div>
            {
                post && (
                    <div className={container}>
                        {
                            /* If the Owner is the User, then render an edit the Button */
                            ownerAddress === account && (
                                <div className={editPost}>
                                    <Link href={`/edit-post/${id}`}>
                                        <a>
                                            Edit post
                                        </a>
                                    </Link>
                                </div>
                            )
                        }
                        {
                            /* If the Post has a Cover Image, then render it */
                            post.coverImage && (
                                <img
                                    src={post.coverImage}
                                    className={coverImageStyle}
                                    alt={"Cover"}
                                />
                            )
                        }
                        <h1>{post.title}</h1>
                        <div className={contentContainer}>
                            <ReactMarkdown>{post.content}</ReactMarkdown>
                        </div>
                    </div>
                )
            }
        </div>
    );
}

/* Using Server-side Data Fetching */
export const getStaticPaths = async() => {
    /* Fetching the Posts from the Network */
    let provider;
    if (process.env.ENVIRONMENT === "local") {
        provider = new ethers.providers.JsonRpcProvider()
    } else if (process.env.ENVIRONMENT === "testnet") {
        provider = new ethers.providers.JsonRpcProvider("https://rpc-mumbai.matic.today");
    } else {
        provider = new ethers.providers.JsonRpcProvider("https://polygon-rpc.com/");
    }

    /* Create a JavaScript Object to interact with the Smart Contract and fetch the Posts */
    const contract = new ethers.Contract(contractAddress, Blog.abi, provider);
    const data = await contract.fetchPosts();

    /* Mapping over the Posts and create a `params` Object passing the property `id` to `getStaticProps` which will run for each Post in the Array and generate a new Page */
    const paths = data.map(d => ({
        params: {id: d[2]}
    }));

    return {
        paths,
        fallback: true
    }
}

/* Creating these Pages at Build Time using the Array of Posts queried from the Network */
export async function getStaticProps({params}) {
    /* Using the Property `id` passed in through the Object `params` */
    const {id} = params;
    const ipfsUrl = `${ipfsURI}/${id}`;
    /* Fetching Data from IPFS and pass the Post data into the Page as props */
    const response = await fetch(ipfsUrl);
    const data = await response.json();
    if (data.coverImage) {
        data.coverImage = `${ipfsURI}/${data.coverImage}`;
    }

    return {
        props: {
            post: data
        }
    }
}

const editPost = css(`
  margin: 20px 0px;
`);

const coverImageStyle = css(`
  width: 900px;
`);

const container = css(`
  width: 900px;
  margin: 0 auto;
`);

const contentContainer = css(`
  margin-top: 60px;
  padding: 0px 40px;
  border-left: 1px solid #e7e7e7;
  border-right: 1px solid #e7e7e7;
  & img {
    max-width: 900px;
  }
`);

export default Post;
