const {ethers} = require("hardhat");

async function deployGame() {
	// We get the contract to deploy
	const accounts = await ethers.getSigners();
	const externalWallet = accounts[0];
	const factory = await ethers.getContractFactory("Deathmatch");
	console.log(`VrfAccountAddress: ${process.env.VrfAccountAddress}`);
	const instance = await factory.deploy(externalWallet.address, process.env.VrfAccountAddress);

	await instance.deployed();

	console.log("DM deployed to:", instance.address);
}

async function deployVrf() {
	// We get the contract to deploy
	const factory = await ethers.getContractFactory("OffchainVrf");
	const instance = await factory.deploy();

	await instance.deployed();

	process.env.VrfAccountAddress = instance.address;

	console.log(`OffchainVrf deployed to: ${instance.address}`);
}

async function main() {
	await deployVrf();
	await deployGame();
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
