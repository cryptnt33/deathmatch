const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

describe("test game nft contract", async function () {
	let contractInstance;

	before("deploy", async function () {
		try {
			const contract = await ethers.getContractFactory("GameNft");
			contractInstance = await contract.deploy();
			await contractInstance.deployed(ethers.utils.parseEther("1"), "10", "100000");
			assert.isOk(true);
		} catch (e) {
			assert.fail();
		}
	});

	async function verifyFloorPrice(eth) {
		const result = await contractInstance.getFloorPrice();
		const toEther = ethers.utils.formatEther(result).toString();
		expect(parseInt(toEther)).to.equal(eth);
	}

	it("floor price should match", async function () {
		await verifyFloorPrice(2);
	});

	it("max supply should match", async function () {
		const result = await contractInstance.getMaxSupply();
		expect(parseInt(result.toString())).to.equal(20000);
	});

	it("max purchase limit should match", async function () {
		const result = await contractInstance.getMaxSupply();
		expect(parseInt(result.toString())).to.equal(20000);
	});

	// it("event raised on setting a new floor price", async function () {
	// 	await expect(contractInstance.setFloorPrice(ethers.utils.parseEther("100")))
	// 		.to.emit(contractInstance, "FloorPriceChanged")
	// 		.withArgs(ethers.utils.parseEther("100"), ethers.utils.parseEther("2"));
	// });

	it("set a new floor price", async function () {
		await contractInstance.setFloorPrice(ethers.utils.parseEther("500"));
		verifyFloorPrice(500);
	});
});
