const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

describe("test Deathmatch contract", async function () {
	let contractFactory, contractInstance;
	let accounts;
	let pointFiveEther = ethers.utils.parseUnits("0.5", "ether");

	before("deploy", async function () {
		try {
			contractFactory = await ethers.getContractFactory("Deathmatch");
			contractInstance = await contractFactory.deploy();
			await contractInstance.deployed();
			accounts = await ethers.getSigners();
			assert.isOk(true);
		} catch (e) {
			assert.fail();
		}
	});

	describe("starting a match...", async function () {
		it("owners can start a match", async function () {
			await contractInstance.startMatch(pointFiveEther);
			expect(await contractInstance.getMatchStatus(1)).to.equal(1);
			expect(await contractInstance.isOwner(accounts[0].address)).to.equal(true);
		});
		it("non-owners cannot start a match", async function () {
			// switch accounts
			const tempInstance = await contractInstance.connect(accounts[2]);
			expect(await tempInstance.isOwner(accounts[0].address)).to.equal(true);
			expect(await tempInstance.isOwner(accounts[2].address)).to.equal(false);
			await expect(tempInstance.startMatch(pointFiveEther)).to.be.revertedWith("only owner or delegator");
			// match status hasn't changed
			expect(await contractInstance.getMatchStatus(1)).to.equal(1);
		});
		it("more than one match can start at a time", async function () {
			// wait to capture event emitted
			const tx1 = await (await contractInstance.startMatch(pointFiveEther)).wait();
			const tx2 = await (await contractInstance.startMatch(pointFiveEther)).wait();
			// event data
			const gameId1 = tx1.events[0].args[0].toNumber();
			const ts1 = tx1.events[0].args[1].toNumber();
			const gameId2 = tx2.events[0].args[0].toNumber();
			expect(gameId1).to.equal(2);
			expect(gameId2).to.equal(3);
			// some random timestamp to compare against
			// to test that the returned timestamp is not older than 1s
			expect(ts1).to.greaterThan(Date.now() / 1000 - 1000);
			expect(await contractInstance.getMatchStatus(gameId1)).to.equal(1);
			expect(await contractInstance.getMatchStatus(gameId2)).to.equal(1);
		});
		it("default match status on invalid match id", async function () {
			expect(await contractInstance.getMatchStatus(4)).to.equal(0);
			expect(await contractInstance.getMatchStatus(0)).to.equal(0);
		});
		it("only admins can add delegators", async function () {
			await contractInstance.addDelegator(accounts[3].address);
		});
		it("non-admins can't add delegators", async function () {
			// switch to a different account
			const tempInstance = await contractInstance.connect(accounts[2]);
			await expect(tempInstance.addDelegator(accounts[4].address)).to.be.revertedWith("Ownable: caller is not the owner");
		});
		it("admins or delegators can start a match", async function () {
			// admin
			const tx1 = await (await contractInstance.startMatch(pointFiveEther)).wait();
			const gameId1 = tx1.events[0].args[0].toNumber();
			expect(await contractInstance.getMatchStatus(gameId1)).to.equal(1);
			// delegator (added above)
			const tempInstance = await contractInstance.connect(accounts[3]);
			const tx2 = await (await tempInstance.startMatch(pointFiveEther)).wait();
			const gameId2 = tx2.events[0].args[0].toNumber();
			expect(await contractInstance.getMatchStatus(gameId1)).to.equal(1);
			expect(await tempInstance.getMatchStatus(gameId2)).to.equal(1);
		});
		it("with a custom floor price", async function () {
			const tx1 = await (await contractInstance.startMatch(pointFiveEther)).wait();
			const gameId1 = tx1.events[0].args[0].toNumber();
			expect(await contractInstance.getFloorPrice(gameId1)).to.equal(pointFiveEther);
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
