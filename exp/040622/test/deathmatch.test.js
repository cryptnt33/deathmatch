const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

describe("test Deathmatch contract", async function () {
	let contractInstance;
	let accounts;

	before("deploy", async function () {
		try {
			const contract = await ethers.getContractFactory("Deathmatch");
			contractInstance = await contract.deploy();
			await contractInstance.deployed();
			accounts = await ethers.getSigners();
			assert.isOk(true);
		} catch (e) {
			assert.fail();
		}
	});

	describe("should start a match", async function () {
		it("only admins can start a match", async function () {
			assert.fail();
		});
		it("only admins can add delegators", async function () {
			assert.fail();
		});
		it("admins or delegators can start a match", async function () {
			assert.fail();
		});
		it("cannot start a match that's in-progress", async function () {
			assert.fail();
		});
		it("with a custom floor price", async function () {
			assert.fail();
		});
	});

	describe("should enter a match", async function () {
		it("any external account can enter a match", async function () {
			assert.fail();
		});
		it("can reserve one or more slots", async function () {
			assert.fail();
		});
		it("deposit ethers in multiples of slots", async function () {
			assert.fail();
		});
		it("can enter a match more than once", async function () {
			assert.fail();
		});
		it("can enter a match only if its in progress", async function () {
			assert.fail();
		});
	});

	describe("should pick a match winner", async function () {
		it("randomly from players in the game", async function () {
			assert.fail();
		});
		it("only once", async function () {
			assert.fail();
		});
		it("only one player", async function () {
			assert.fail();
		});
		it("only from a game in progress", async function () {
			assert.fail();
		});
	});

	describe("should claim a prize", async function () {
		it("equal to 75% of the total pooled ether", async function () {
			assert.fail();
		});
		it("verify 25% of the pooled ether stayed in the treasury", async function () {
			assert.fail();
		});
		it("can only claim once", async function () {
			assert.fail();
		});
		it("only a single winner can claim the prize", async function () {
			assert.fail();
		});
		it("verify the prize is claimed by the winner", async function () {
			assert.fail();
		});
		it("within 7 days", async function () {
			assert.fail();
		});
		it("even after the match has ended", async function () {
			assert.fail();
		});
	});

	describe("should end a match", async function () {
		it("only once", async function () {
			assert.fail();
		});
		it("only after a winner is picked", async function () {
			assert.fail();
		});
		it("even if the prize is not claimed", async function () {
			assert.fail();
		});
		it("verify match has ended", async function () {
			assert.fail();
		});
	});
});
