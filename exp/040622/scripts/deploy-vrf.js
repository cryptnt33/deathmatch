const {ethers} = require("hardhat");
async function main() {
	// We get the contract to deploy
	const factory = await ethers.getContractFactory("OffchainVrf");
	const instance = await factory.deploy();

	await instance.deployed();

	console.log("OffchainVrf deployed to:", instance.address);
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
