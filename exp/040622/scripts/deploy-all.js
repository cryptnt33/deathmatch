const assert = require("assert");
const {ethers} = require("hardhat");

async function deployGame() {
	const factory = await ethers.getContractFactory("Deathmatch");

	if (!process.env.GameExternalWalletAddress) throw new Error("missing external wallet env");
	if (!process.env.VrfAccountAddress) throw new Error("missing vrf contract env");

	const instance = await factory.deploy(process.env.GameExternalWalletAddress, process.env.VrfAccountAddress);
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
