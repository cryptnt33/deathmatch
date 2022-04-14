const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

describe("test game play contract", async function () {
	let contractInstance;

	before("deploy", async function () {
		try {
			const contract = await ethers.getContractFactory("Deathmatch");
			contractInstance = await contract.deploy();
			await contractInstance.deployed();
			assert.isOk(true);
		} catch (e) {
			assert.fail();
		}
	});

	it("allows players to purchase one or more nfts", async function () {
		// await expect(contractInstance.purchaseNfts(0)).to.be.revertedWith("zero requested");
		// await expect(contractInstance.purchaseNfts(1000)).to.be.revertedWith("too many requested");
		// await contractInstance.purchaseNfts(1);
		// expect(await contractInstance.getNfts()).to.equal(1);
		// expect(await contractInstance.purchaseNfts(5)).to.pass(); // pass
	});
});
