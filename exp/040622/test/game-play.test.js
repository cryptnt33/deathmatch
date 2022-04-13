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

	it("generates a random number on seed", async function () {
		const random = await contractInstance.random(uuid());
		console.log(random);
	});
});
