const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const uuid = require("uuid-random");

describe("test random gen contract", async function () {
	let contractInstance;

	before("deploy", async function () {
		try {
			const contract = await ethers.getContractFactory("RandomGenerator");
			contractInstance = await contract.deploy();
			await contractInstance.deployed();
			assert.isOk(true);
		} catch (e) {
			assert.fail();
		}
	});

	xit("generates a random number on seed", async function () {
		const random = await contractInstance.random(uuid());
		console.log(random);
	});
});
