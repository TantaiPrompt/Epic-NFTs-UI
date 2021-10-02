import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import myEpicNft from './utils/MyEpicNFT.json';
import PacmanLoader from "react-spinners/PacmanLoader";
import { css } from "@emotion/react";

const TWITTER_HANDLE = 'Kaidow';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = '';
const TOTAL_MINT_COUNT = 86;

const CONTRACT_ADDRESS = "0xf73b47C992F9c47d4f5E6e0f84B10111fa6a1ef5";

const override = css`
  padding-right:200px;
`;
const App = () => {

    // const myEpicNft = myEpicNft;
    const [currentAccount, setCurrentAccount] = useState("");
    const [loading, setLoading] = useState(false);
    let [color, setColor] = useState("#F5A623");
    const [currentToken,setCurrentToken] = useState(0);
    const [currentTokenId,setCurrentTokenId] = useState("");  
    
    const checkIfWalletIsConnected = async () => {
      const { ethereum } = window;

      if (!ethereum) {
          console.log("Make sure you have metamask!");
          return;
      } else {
          console.log("We have the ethereum object", ethereum);
          console.log("network :", ethereum.networkVersion);
      }
    
      if(ethereum.networkVersion === '4'){
        const accounts = await ethereum.request({ method: 'eth_accounts' });
          if (accounts.length !== 0) {
              const account = accounts[0];
              console.log("Found an authorized account:", account);
              setCurrentAccount(account)
          } else 
              console.log("No authorized account found");
      }
      else{
        alert("Please change NETWORK to Rinkeby");
      }

  }

  /*
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }


       if(ethereum.networkVersion === '4'){
          const accounts = await ethereum.request({ method: "eth_requestAccounts" });

          /*
          * Boom! This should print out public address once we authorize Metamask.
          */
          console.log("Connected", accounts[0]);
          setCurrentAccount(accounts[0]); 
       }
      else{
        alert("Please change NETWORK to Rinkeby");
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
    getCurrentToken();
  }, [])

  

  /*
  * We added a simple onClick event here.
  */
  const renderNotConnectedContainer = () => (

    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  /*
  * We want the "Connect to Wallet" button to dissapear if they've already connected their wallet!
  */
  const renderMintUI = () => (
    <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
      Mint NFT
    </button>
  )

  const askContractToMintNft = async () => {
    // setLoading(!loading);
      try {
        const { ethereum } = window;

        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

          console.log("Going to pop wallet now to pay gas...")
          setLoading(true);
          let nftTxn = await connectedContract.makeAnEpicNFT();

          console.log("Mining...please wait.")
          await nftTxn.wait();
          console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
        } else {
          console.log("Ethereum object doesn't exist!");
        }
        setLoading(false);
      } catch (error) {
        console.log("err",error)
        setLoading(false);
      }
  }

  const getCurrentToken = async() =>{
    try {
        const { ethereum } = window;

        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);
          
          const tx = await connectedContract.getCurrentToken()
          setCurrentToken(tx.toNumber());

          connectedContract.on("NewEpicNFTMinted", (sender, currentToken) => {
            console.log("NewEpicNFTMinted", sender, currentToken.toNumber());
            setCurrentToken(currentToken.toNumber());
          });
        } else {
          console.log("Ethereum object doesn't exist!");
        }
      } catch (error) {
        console.log("err",error)
      }
  }

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
           <PacmanLoader className ="conter"color={color} loading={loading} css={override} size={50} />
          {currentAccount === ""? renderNotConnectedContainer() :!loading? renderMintUI():null}
        </div>
          <p className="header gradient-text">

            {currentToken}/{TOTAL_MINT_COUNT}
          </p>


        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>

          <img alt="Twitter Logo" className="twitter-logo" src="https://testnets.opensea.io/static/images/logos/opensea.svg"/>

           <a
            className="footer-text"
            href="https://testnets.opensea.io/collection/squarenft-x77ujbjhs4"
            target="_blank"
            rel="noreferrer"
          >View Collection on OpenSea</a>
        </div>
      </div>
    </div>
  );
};

export default App;