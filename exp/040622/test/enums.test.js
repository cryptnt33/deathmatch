const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

describe("test enums contract", async function () {
	let contractInstance;

	before("deploy", async function () {
		try {
			const EnumsContract = await ethers.getContractFactory("SolEnums");
			contractInstance = await EnumsContract.deploy();
			await contractInstance.deployed();
			assert.isOk(true);
		} catch (e) {
			assert.fail();
		}
	});

	it("sets a valid state", async function () {
		const result = await contractInstance.getState();
		assert.notEqual("2", result);
		assert.equal("0", result);
		await (await contractInstance.setState(2)).wait();
		const newResult = await contractInstance.getState();
		assert.equal("2", newResult);
	});

	it("fails to set an invalid state", async function () {
		try {
			const tx = await contractInstance.setState(3);
			await tx.wait();
			const result = await contractInstance.getState();
			assert("3", result);
			assert.fail();
		} catch (e) {
			assert.isOk(true);
		}
	});
});
