require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    // Rimuoviamo la configurazione di mining che non è più necessaria
    hardhat: {
      chainId: 1337 // Usiamo un chainId standard per coerenza
    },
    // Configuriamo localhost per puntare a Ganache
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337
    }
  },
};
