import React, {useState, useRef, useEffect} from "react";
import {useRouter} from "next/router";
import dynamic from "next/dynamic";
import {css} from "@emotion/css";
import {ethers} from "ethers";
import {create} from "ipfs-http-client";

/* Import Smart Contract Address from local File `config.js` */
import {
    contractAddress
} from "../config";

/* Import Application Binary Interface (ABI) */
import Blog from "../artifacts/contracts/Blog.sol/Blog.json";

/* Define the IPFS Endpoint */
const client = create("https://ipfs.infura.io:5001/api/v0");

/* Configure the Markdown Editor to be Client-side Import */
const SimpleMDE = dynamic(
    () => import("react-simplemde-editor"),
    {ssr: false}
)

const initialState = {
    title: "",
    content: ""
}

function CreatePost() {
    /* Configure initial State to be used in the Component */
    const [post, setPost] = useState(initialState);
    const [image, setImage] = useState(null);
    const [loaded, setLoaded] = useState(false);

    const fileRef = useRef(null);
    const {title, content} = post;
    const router = useRouter();

    useEffect(() => {
        setTimeout(() => {
            /* Delay Rendering of Buttons until dynamic Import is complete */
            setLoaded(true);
        }, 500);
    }, []);

    const onChange = (event) => {
        setPost(() => ({
            ...post,
            [event.target.name]: event.target.value
        }));
    }

    const createNewPost = async () => {
        /* Save Post to IPFS, then anchors it to the Blog Smart Contract */
        if (!title || !content) {
            return;
        }
        const hash = await savePostToIpfs();
        await savePost(hash);
        router.push("/").catch(console.error);
    }

    const savePostToIpfs = async () => {
        /* Save Post's Metadata to IPFS */
        try {
            const addedPost = await client.add(JSON.stringify(post));
            return addedPost.path;
        } catch (error) {
            console.error(error);
        }
    }

    const savePost = async (hash) => {
        /* Anchor Post to Blog Smart Contract */
        if (typeof window.ethereum !== "undefined") {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(contractAddress, Blog.abi, signer);
            console.log("Blog Contract: ", contract);
            try {
                const createdPost = await contract.createPost(post.title, hash);
                /* Waiting for Transaction to be confirmed before Rerouting */
                await provider.waitForTransaction(createdPost.hash);
                console.log("Created Post: ", createdPost);
            } catch (error) {
                console.error("Error: ", error);
            }
        }
    }

    const triggerOnChange = () => {
        /* Trigger Handler `handleFileChange` of hidden File Input */
        fileRef.current.click();
    }

    const handleFileChange = async (event) => {
        /* Upload Cover Image to IPFS and save Hash to State */
        const uploadedFile = event.target.files[0];
        if (!uploadedFile) {
            return;
        }
        const added = await client.add(uploadedFile);
        setPost(state => ({
            ...state,
            coverImage: added.path
        }));
        setImage(uploadedFile);
    }

    return (
        <div className={container}>
            {
                image && (
                    <img
                        className={coverImageStyle}
                        src={URL.createObjectURL(image)}
                        alt={"Cover"}
                    />
                )
            }
            <input
                onChange={onChange}
                name={"title"}
                placeholder={"Update takes some Time"}
                value={post.title}
                className={titleStyle}
            />
            <SimpleMDE
                className={mdEditor}
                placeholder="What's on your mind?"
                value={post.content}
                onChange={value => setPost({
                    ...post,
                    content: value
                })}
            />
            {
                loaded && (
                    <React.Fragment>
                        <button
                            className={button}
                            type={"button"}
                            onClick={createNewPost}
                        >
                            Publish
                        </button>
                        <button
                            onClick={triggerOnChange}
                            className={button}
                        >
                            Add cover image
                        </button>
                    </React.Fragment>
                )
            }
            <input
                id={"selectImage"}
                className={hiddenInput}
                type={"file"}
                onChange={handleFileChange}
                ref={fileRef}
            />
        </div>
    );
}

const hiddenInput = css(`
  display: none;
`);

const coverImageStyle = css(`
  max-width: 800px;
`);

const mdEditor = css(`
  margin-top: 40px;
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

const container = css(`
  width: 800px;
  margin: 0 auto;
`);

const button = css(`
  background-color: #fafafa;
  outline: none;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  margin-right: 10px;
  font-size: 18px;
  padding: 16px 70px;
  box-shadow: 7px 7px rgba(0, 0, 0, .1);
`);

export default CreatePost;
