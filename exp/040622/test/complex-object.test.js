const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const crypto = require("crypto");

describe("test complex object contract", async function () {
	let contractInstance;
	let accounts;

	before("deploy", async function () {
		try {
			const contract = await ethers.getContractFactory("ComplexObject");
			contractInstance = await contract.deploy();
			await contractInstance.deployed();
			accounts = await ethers.getSigners();
			assert.isOk(true);
		} catch (e) {
			assert.fail();
		}
	});

	it("should save and retrieve NFTs", async function () {
		const ts = Date.now();
		const tx = await contractInstance.setNft("bayc #3124", ts);
		const reciept = await tx.wait();
		// console.log(reciept.gasUsed, reciept.cumulativeGasUsed);
		const ob = await contractInstance.getAsset();
		assert.equal(1, ob.nfts.length);
		assert.equal(ts, ob.nfts[0].timeAdded);
		assert.equal("bayc #3124", ob.nfts[0].nftId);
		assert.equal(0, ob.consoles.length);
	});

	it("should save and retrieve Consoles", async function () {
		const ts = Date.now();
		const tx = await contractInstance.setConsole("whatever", ts);
		const reciept = await tx.wait();
		// console.log(reciept.gasUsed, reciept.cumulativeGasUsed);
		const ob = await contractInstance.getAsset();
		assert.equal(1, ob.consoles.length);
		assert.equal(ts, ob.consoles[0].timeCreated);
		assert.equal("whatever", ob.consoles[0].consoleId);
	});

	xit("gas used is same even if you insert 500 items", async function () {
		this.timeout(100 * 1000);
		let gasUsed = [];
		const len = 500;
		for (i = 0; i < len; i++) {
			const ts = Date.now();
			const tx = await contractInstance.setNft(crypto.randomUUID(), ts);
			const reciept = await tx.wait();
			gasUsed.push(reciept.gasUsed);
			process.stdout.write(".");
		}
		const ob = await contractInstance.getAsset();
		assert.equal(len + 1, ob.nfts.length);
		assert.equal(gasUsed[0].toString(), gasUsed[crypto.randomInt(1, len - 2)].toString());
		assert.equal(gasUsed[len - 1].toString(), gasUsed[crypto.randomInt(1, len - 2)].toString());
	});

	it("should return empty if not found", async function () {
		const tempContractFactory = await (await ethers.getContractFactory("ComplexObject")).connect(accounts[2]);
		const tempContractInstance = await tempContractFactory.deploy();
		const ob = await tempContractInstance.getAsset();
		assert.equal(0, ob.nfts.length);
	});
});
