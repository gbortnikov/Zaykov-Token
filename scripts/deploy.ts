import { ethers } from "hardhat"

async function main() {
    const Zaykov = await ethers.getContractFactory("Token");
    const token = await Zaykov.deploy();
    token.deployed;

    console.log("ZAYA deployed to:", token.address);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });