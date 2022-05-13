const {ethers} = require("hardhat");
async function main() {
	// We get the contract to deploy
	const accounts = await ethers.getSigners();
	const externalWallet = accounts[0];
	const factory = await ethers.getContractFactory("Deathmatch");
	const instance = await factory.deploy(externalWallet.address);

	await instance.deployed();

	console.log("DM deployed to:", instance.address);
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
