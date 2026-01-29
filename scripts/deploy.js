const fs = require("fs");
const path = require("path");
const { ethers } = require("hardhat");

async function main() {
  const [owner, user1] = await ethers.getSigners();

  console.log("Deploy Membership...");
  const Membership = await ethers.getContractFactory("Membership");
  const membership = await Membership.deploy();
  await membership.waitForDeployment();
  const membershipAddress = await membership.getAddress();
  console.log("Membership deployato a:", membershipAddress);

  console.log("Deploy ContentGate...");
  const ContentGate = await ethers.getContractFactory("ContentGate");
  const contentGate = await ContentGate.deploy(membershipAddress);
  await contentGate.waitForDeployment();
  const contentGateAddress = await contentGate.getAddress();
  console.log("ContentGate deployato a:", contentGateAddress);

  // Mint NFT di test
  await membership.mint(owner.address);
  await membership.mint(user1.address);
  console.log("NFT mintati per owner e user1");

  // Aggiungi contenuti di esempio
  await contentGate.addContent(
    "https://upload.wikimedia.org/wikipedia/it/3/3e/Super_Mario_64.jpg",
  );
  await contentGate.addContent(
    "https://upload.wikimedia.org/wikipedia/it/a/aa/Stella_Super_Mario_64.png",
  );
  console.log("Contenuti di esempio aggiunti");

  // ABI
  const membershipAbi =
    require("../artifacts/contracts/Membership.sol/Membership.json").abi;
  const contentGateAbi =
    require("../artifacts/contracts/ContentGate.sol/ContentGate.json").abi;

  const contractInfo = {
    membership: {
      address: membershipAddress,
      abi: membershipAbi,
    },
    contentGate: {
      address: contentGateAddress,
      abi: contentGateAbi,
    },
  };

  fs.writeFileSync(
    path.join(__dirname, "../frontend/contractInfo.js"),
    `export const contractInfo = ${JSON.stringify(contractInfo, null, 2)};\n`,
  );

  console.log("✅ contractInfo.js aggiornato correttamente");
}

main().catch(console.error);
