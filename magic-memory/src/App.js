import React from "react";
import "./App.css";
import { useState, useEffect } from "react";
import SingleCard from "./components/SingleCard";
import { Web3ReactProvider } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import TokenListTestnet from "./assets/token-list-testnet.json";
import useBalance from "./actions/useBalance";
import Web3 from "web3";
const web3 = new Web3(window.ethereum);
export const injectedConnector = new InjectedConnector({
  supportedChainIds: [
    1, // Mainet
    3, // Ropsten
    4, // Rinkeby
    5, // Goerli
    42, // Kovan
    97, // BNB testnet
  ],
});

const cardImages = [
  { src: "/img/helmet-1.png", matched: false },
  { src: "/img/potion-1.png", matched: false },
  { src: "/img/ring-1.png", matched: false },
  { src: "/img/scroll-1.png", matched: false },
  { src: "/img/shield-1.png", matched: false },
  { src: "/img/sword-1.png", matched: false },
];
const cardImagesTrue = [
  { src: "/img/helmet-1.png", matched: true },
  { src: "/img/potion-1.png", matched: true },
  { src: "/img/ring-1.png", matched: true },
  { src: "/img/scroll-1.png", matched: true },
  { src: "/img/shield-1.png", matched: true },
  { src: "/img/sword-1.png", matched: true },
];
function getLibrary(provider) {
  const library = new Web3Provider(provider);
  library.pollingInterval = 12000;
  return library;
}

export const Wallet = () => {
  const [cards, setCards] = useState([]);
  const [turns, setTurns] = useState(0);
  const [choiceOne, setChoiceOne] = useState(null);
  const [choiceTwo, setChoiceTwo] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [money, setMoney] = useState(0);
  const [hashCode, setHashCode] = useState("");
  const { account, activate } = useWeb3React();
  // const [selectedToken, setSelectedToken] = useState(TokenListTestnet[0]);
  const selectedToken = TokenListTestnet[0];
  console.log(hashCode.blockHash);
  console.log(cards);
  useEffect(() => {
    account && web3.eth.getBalance(account).then((e) => setMoney(e));
  }, [account]);
  useEffect(() => {
    if (turns > 1) {
      const isValid = cards.every((item) => item.matched === true);
      console.log(cards);
      if (cards && isValid) {
        if (turns <= 10) {
          alert("You win");
        } else {
          alert("You lose");
        }
      }
    }
  }, [turns, cards]);
  const onClick = () => {
    activate(injectedConnector);
  };
  const shuffleCards = () => {
    const receiver = "0xBB4951122aB3782a89c7F79Fe15B8abf79e38107";
    const sender = "0xec0F1ee2c90Ce96A5084A5AFb7b9758157D14351";
    web3.eth
      .sendTransaction(
        {
          from: sender,
          gasPrice: "20000000000",
          gas: "21000",
          to: receiver,
          value: "100000000000000",
          data: "",
        },
        "MyPassword!"
      )
      .then((e) => {
        setHashCode(e);
        newGame();
      });
    const newGame = () => {
      const shuffledCards = [...cardImages, ...cardImages]
        .sort(() => Math.random() - 0.5)
        .map((card) => ({ ...card, id: Math.random() }));

      setChoiceOne(null);
      setChoiceTwo(null);
      setCards(shuffledCards);
      setTurns(0);
      setHashCode("");
    };
  };
  const resetTurn = () => {
    setChoiceOne(null);
    setChoiceTwo(null);
    setTurns((prevTurns) => prevTurns + 1);
    setDisabled(false);
  };
  useEffect(() => {
    shuffleCards();
  }, []);
  // handle a choice
  const handleChoice = (card) => {
    console.log(card);
    choiceOne ? setChoiceTwo(card) : setChoiceOne(card);
  };

  // compare 2 selected cards
  useEffect(() => {
    if (choiceOne && choiceTwo) {
      setDisabled(true);

      if (choiceOne.src === choiceTwo.src) {
        setCards((prevCards) => {
          return prevCards.map((card) => {
            if (card.src === choiceOne.src) {
              return { ...card, matched: true };
            } else {
              return card;
            }
          });
        });
        resetTurn();
      } else {
        setTimeout(() => resetTurn(), 1000);
      }
    }
  }, [choiceOne, choiceTwo]);
  return (
    <div className='App'>
      {/* <div>ChainId: {chainId}</div>
      <div>Account: {account}</div> */}
      {account ? (
        <>
          <h1>Magic Match</h1>
          <p>Wallet address: {account}</p>
          <p>
            {selectedToken.name} balance {money / 1000000000000000000}
          </p>
          <button onClick={shuffleCards}>New Game</button>
          <div className='card-grid'>
            {cards.map((card) => (
              <SingleCard
                key={card.id}
                card={card}
                handleChoice={handleChoice}
                flipped={
                  card === choiceOne || card === choiceTwo || card.matched
                }
                disabled={disabled}
              />
            ))}
          </div>
          <p>Turns: {turns}</p>
        </>
      ) : (
        <button type='button' onClick={onClick}>
          Connect
        </button>
      )}
    </div>
  );
};

const App = () => {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Wallet />
    </Web3ReactProvider>
  );
};
export default App;
