const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

describe("test game nft contract", async function () {
	let contractInstance;
	let accounts;

	before("deploy", async function () {
		try {
			const contract = await ethers.getContractFactory("GameNft");
			contractInstance = await contract.deploy();
			await contractInstance.deployed();
			accounts = await ethers.getSigners();
			assert.isOk(true);
		} catch (e) {
			console.log(e);
			assert.fail();
		}
	});

	async function verifyFloorPrice(eth) {
		const result = await contractInstance.getFloorPrice();
		const toEther = ethers.utils.formatEther(result).toString();
		expect(parseInt(toEther)).to.equal(eth);
	}

	it("set and get max supply", async function () {
		await contractInstance.setMaxSupply(BigInt("10000"));
		const result = await contractInstance.getMaxSupply();
		expect(parseInt(result.toString())).to.equal(10000);
	});

	it("verify contract owner", async function () {
		const acc1 = await contractInstance.isContractOwner(accounts[0].address);
		expect(acc1).to.equal(true);
		const acc2 = await contractInstance.isContractOwner(accounts[1].address);
		expect(acc2).to.equal(false);
	});

	it("set a new floor price", async function () {
		await contractInstance.setFloorPrice(ethers.utils.parseEther("500"));
		verifyFloorPrice(500);
	});
});
