import {useEffect, useState} from "react";
import {useRouter} from "next/router";
import ReactMarkdown from "react-markdown";
import {css} from "@emotion/css";
import dynamic from "next/dynamic";
import {ethers} from "ethers";
import {create} from "ipfs-http-client";

/* Import Smart Contract Address from local File `config.js` */
import {contractAddress} from "../../config";

/* Import Application Binary Interface (ABI) */
import Blog from "../../artifacts/contracts/Blog.sol/Blog.json";

const ipfsURI = "https://ipfs.io/ipfs/";
const client = create("https://ipfs.infura.io:5001/api/v0");

const SimpleMDE = dynamic(
    () => import("react-simplemde-editor"),
    { ssr: false }
)

const Post = () => {
    const [post, setPost] = useState(null);
    const [editing, setEditing] = useState(true);
    const router = useRouter();
    const { id } = router.query;

    useEffect(() => {
        fetchPost().catch(console.error);
    }, [id]);

    const fetchPost = async() => {
        /* Fetching individual Post by IPFS Hash from the Network */
        if (!id) {
            return;
        }
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
        const fetchedPost = await contract.fetchPost(id);
        const postId = fetchedPost[0].toNumber();

        /* Fetching the IPFS Metadata from the Network */
        const ipfsUrl = `${ipfsURI}/${id}`;
        const response = await fetch(ipfsUrl);
        const data = await response.json();
        if(data.coverImage) {
            data.coverImagePath = `${ipfsURI}/${data.coverImage}`;
        }
        /* Appending the Post ID to the Post's Data */
        /* ID is needed to make Updates to the Post */
        data.id = postId;
        setPost(data);
    }

    const savePostToIpfs = async() => {
        try {
            const addedPost = await client.add(JSON.stringify(post));
            return addedPost.path;
        } catch (error) {
            console.error(error);
        }
    }

    const updatePost = async() => {
        const hash = await savePostToIpfs();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, Blog.abi, signer);
        await contract.updatePost(post.id, post.title, hash, true);
        router.push("/").catch(console.error);
    }

    if (!post) {
        return null;
    }

    return (
        <div className={container}>
            {
                /* Editing State will allow the User to toggle between a Markdown Editor and a Markdown Renderer */
                editing && (
                    <div>
                        <input
                            onChange={event => setPost({
                                ...post,
                                title: event.target.value
                            })}
                            name={"title"}
                            placeholder={"Update take some Time"}
                            value={post.title}
                            className={titleStyle}
                        />
                        <SimpleMDE
                            className={mdEditor}
                            placeholder={"Post your Idea"}
                            value={post.content}
                            onChange={value => setPost({
                                ...post,
                                content: value
                            })}
                        />
                        <button className={button} onClick={updatePost}>Update Post</button>
                    </div>
                )
            }
            {
                !editing && (
                    <div>
                        {
                            post.coverImagePath && (
                                <img
                                    src={post.coverImagePath}
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
            <button
                className={button}
                onClick={() => setEditing(!editing)}
            >
                { editing ? "View Post" : "Edit Post"}
            </button>
        </div>
    );
}

const button = css(`
  background-color: #fafafa;
  outline: none;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  margin-right: 10px;
  margin-top: 15px;
  font-size: 18px;
  padding: 16px 70px;
  box-shadow: 7px 7px rgba(0, 0, 0, .1);
`);

const titleStyle = css(`
  margin-top: 40px;
  border: none;
  outline: none;
  background-color: inherit;
  font-size: 44px;
  font-weight: 600;
  &::placeholder {
    color: #999999;
  }
`);

const mdEditor = css(`
  margin-top: 40px;
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
