const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

describe("test msg params contract", async function () {
	let contractInstance;
	let accounts;

	before("deploy", async function () {
		try {
			const paramsContractFactory = await ethers.getContractFactory("MsgParams");
			contractInstance = await paramsContractFactory.deploy();
			await contractInstance.deployed();
			accounts = await ethers.getSigners();
		} catch (e) {
			assert.fail();
		}
	});

	it("deploys contract", async function () {
		assert.isNotNull(contractInstance);
	});

	it("retrieves accounts", async function () {
		assert.equal(20, accounts.length);
	});

	it("retrieves the correct owner", async function () {
		assert.equal(accounts[0].address, await contractInstance.getOwner());
	});

	it("sets a new owner", async function () {
		const newOwner = accounts[2].address;
		await contractInstance.setNewOwner(newOwner);
		assert.equal(newOwner, await contractInstance.getOwner());
	});

	it("revert owner", async function () {
		const tempContractFactory = await (await ethers.getContractFactory("MsgParams")).connect(accounts[2]);
		const tempContractInstance = await tempContractFactory.deploy();
		const originalOwner = accounts[0].address;
		await tempContractInstance.setNewOwner(originalOwner);
		assert.equal(originalOwner, await tempContractInstance.getOwner());
	});

	it("deposit funds", async function () {
		await contractInstance.deposit({ value: ethers.utils.parseUnits("0.5", "ether") });
		const deposited = await contractInstance.getFunds();
		assert.equal("0.5", ethers.utils.formatEther(deposited).toString());
	});
});
