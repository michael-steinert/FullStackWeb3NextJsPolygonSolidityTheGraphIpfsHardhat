import "../styles/globals.css";
import {useState} from "react"
import Link from "next/link";
import {css} from "@emotion/css";
import {ethers} from "ethers";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import {AccountContext} from "../context.js";
import {ownerAddress} from "../config";
import "easymde/dist/easymde.min.css";

function MyApp({Component, pageProps}) {
    /* Create local State to save Account Information after Login */
    const [account, setAccount] = useState(null);

    /* Web3Modal Configuration for enabling Wallet Access */
    const getWeb3Modal = async () => {
        return new Web3Modal({
            network: "mainnet",
            cacheProvider: false,
            providerOptions: {
                walletconnect: {
                    package: WalletConnectProvider,
                    options: {
                        infuraId: process.env.NEXT_PUBLIC_INFURA_ID
                    }
                }
            }
        });
    }

    /* Using Web3Modal to connect to the User's Wallet */
    const connect = async () => {
        try {
            const web3Modal = await getWeb3Modal();
            const connection = await web3Modal.connect();
            const provider = new ethers.providers.Web3Provider(connection);
            const accounts = await provider.listAccounts();
            setAccount(accounts[0]);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div>
            <nav className={nav}>
                <div className={header}>
                    <Link href={"/"}>
                        <a>
                            <img
                                src={"/logo.svg"}
                                alt={"Block Logo"}
                                style={{width: "50px"}}
                            />
                        </a>
                    </Link>
                    <Link href={"/"}>
                        <a>
                            <div className={titleContainer}>
                                <h2 className={title}>Full Stack</h2>
                                <p className={description}>WEB3</p>
                            </div>
                        </a>
                    </Link>
                    {
                        !account && (
                            <div className={buttonContainer}>
                                <button className={buttonStyle} onClick={connect}>Connect</button>
                            </div>
                        )
                    }
                    {
                        account && (
                            <p className={accountInfo}>{account}</p>
                        )
                    }
                </div>
                <div className={linkContainer}>
                    <Link href={"/"}>
                        <a className={link}>
                            Home
                        </a>
                    </Link>
                    {
                        /* If the logged-in User is the Smart Contract Owner, then show the Nav Link to create a new Post */
                        (account === ownerAddress) && (
                            <Link href={"/create-post"}>
                                <a className={link}>
                                    Create Post
                                </a>
                            </Link>
                        )
                    }
                </div>
            </nav>
            <div className={container}>
                <AccountContext.Provider value={account}>
                    <Component {...pageProps} connect={connect}/>
                </AccountContext.Provider>
            </div>
        </div>
    );
}

const accountInfo = css(`
  width: 100%;
  display: flex;
  flex: 1;
  justify-content: flex-end;
  font-size: 12px;
`);

const container = css(`
  padding: 40px;
`);

const linkContainer = css(`
  padding: 30px 60px;
  background-color: #fafafa;
`);

const nav = css(`
  background-color: white;
`);

const header = css(`
  display: flex;
  border-bottom: 1px solid rgba(0, 0, 0, .075);
  padding: 20px 30px;
`);

const description = css(`
  margin: 0;
  color: #999999;
`);

const titleContainer = css(`
  display: flex;
  flex-direction: column;
  padding-left: 15px;
`);

const title = css(`
  margin-left: 30px;
  font-weight: 500;
  margin: 0;
`);

const buttonContainer = css(`
  width: 100%;
  display: flex;
  flex: 1;
  justify-content: flex-end;
`);

const buttonStyle = css(`
  background-color: #fafafa;
  outline: none;
  border: none;
  font-size: 18px;
  padding: 16px 70px;
  border-radius: 15px;
  cursor: pointer;
  box-shadow: 7px 7px rgba(0, 0, 0, .1);
`);

const link = css(`
  margin: 0px 40px 0px 0px;
  font-size: 16px;
  font-weight: 400;
`);

export default MyApp;