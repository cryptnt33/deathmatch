const chai = require("chai");
const { expect, assert } = chai;
const { ethers } = require("hardhat");
const { v4: uuidv4 } = require("uuid");

describe("test Deathmatch contract", async function () {
	let contractFactory, contractInstance, accounts, walletAccount;
	const pointFiveEther = ethers.utils.parseUnits("0.5", "ether");
	const pointSevenFiveEther = ethers.utils.parseUnits("0.75", "ether");
	const aGameId = uuidv4();

	before("deploy", async function () {
		try {
			accounts = await ethers.getSigners();
			contractFactory = await ethers.getContractFactory("Deathmatch");
			walletAccount = accounts[10];
			contractInstance = await contractFactory.deploy(walletAccount.address);
			await contractInstance.deployed();
			assert.isOk(true);
		} catch (e) {
			assert.fail();
		}
	});

	describe("starting a match...", async function () {
		it("owners can start a match", async function () {
			await contractInstance.startMatch(aGameId, pointFiveEther);
			expect(await contractInstance.getMatchStatus(aGameId)).to.equal(1);
			expect(await contractInstance.isOwner(accounts[0].address)).to.equal(true);
		});
		it("non-owners cannot start a match", async function () {
			// switch accounts
			const tempInstance = await contractInstance.connect(accounts[2]);
			expect(await tempInstance.isOwner(accounts[0].address)).to.equal(true);
			expect(await tempInstance.isOwner(accounts[2].address)).to.equal(false);
			await expect(tempInstance.startMatch(aGameId, pointFiveEther)).to.be.revertedWith("only owner or delegator");
			// match status hasn't changed
			expect(await contractInstance.getMatchStatus(aGameId)).to.equal(1);
		});
		it("more than one match can start at a time", async function () {
			// wait to capture event emitted
			const g1 = uuidv4();
			const g2 = uuidv4();
			const tx1 = await (await contractInstance.startMatch(g1, pointFiveEther)).wait();
			const tx2 = await (await contractInstance.startMatch(g2, pointFiveEther)).wait();
			// event data
			const gameId1 = tx1.events[0].args[0];
			const ts1 = tx1.events[0].args[1].toNumber();
			const gameId2 = tx2.events[0].args[0];
			expect(gameId1).to.equal(g1);
			expect(gameId2).to.equal(g2);
			// some random timestamp to compare against
			// to test that the returned timestamp is not older than 1s
			expect(ts1).to.greaterThan(Date.now() / 1000 - 1000);
			expect(await contractInstance.getMatchStatus(gameId1)).to.equal(1);
			expect(await contractInstance.getMatchStatus(gameId2)).to.equal(1);
		});
		it("default match status on invalid match id", async function () {
			expect(await contractInstance.getMatchStatus("invalid")).to.equal(0);
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
			const tx1 = await (await contractInstance.startMatch(uuidv4(), pointFiveEther)).wait();
			const gameId1 = tx1.events[0].args[0];
			expect(await contractInstance.getMatchStatus(gameId1)).to.equal(1);
			// delegator (added above)
			const tempInstance = await contractInstance.connect(accounts[3]);
			const tx2 = await (await tempInstance.startMatch(uuidv4(), pointFiveEther)).wait();
			const gameId2 = tx2.events[0].args[0];
			expect(await contractInstance.getMatchStatus(gameId1)).to.equal(1);
			expect(await tempInstance.getMatchStatus(gameId2)).to.equal(1);
		});
		it("with a custom floor price", async function () {
			const tx1 = await (await contractInstance.startMatch(uuidv4(), pointFiveEther)).wait();
			const gameId1 = tx1.events[0].args[0];
			expect(await contractInstance.getFloorPrice(gameId1)).to.equal(pointFiveEther);
		});
	});

	// any external account can enter a match
	// all deposits are made to an external multi-sig wallet
	describe("entering a match...", async function () {
		it("deposit to an owner-set external account address", async function () {
			// assert the floor price
			const fp = await contractInstance.getFloorPrice(aGameId);
			expect(fp).to.equal(pointFiveEther);
			// deposit more than or equal to the floor price
			const walletBalance = await walletAccount.getBalance();
			const senderBalance = await accounts[0].getBalance();
			const tx = await (await contractInstance.depositFee(aGameId, 1, { value: pointSevenFiveEther })).wait();
			// assert the deposit amount is equal to amount sent
			expect(await contractInstance.getDepositAmount(aGameId, accounts[0].address)).to.equal(pointSevenFiveEther);
			// assert event fired contained correct "by" and "amount" values
			expect(tx.events[0].args[0]).to.equal(accounts[0].address);
			expect(tx.events[0].args[1]).to.equal(pointSevenFiveEther);
			// assert that the amount of ether in wallet increased by the deposited amount
			const newWalletBalance = await walletAccount.getBalance();
			expect(newWalletBalance).to.equal(walletBalance.add(pointSevenFiveEther));
			// assert that the amount of ether in requester account decreased by the deposited amount
			const newSenderBalance = await accounts[0].getBalance();
			assert(newSenderBalance < senderBalance.sub(pointSevenFiveEther));
		});

		it("only owner can change the external account address", async function () {
			await (await contractInstance.setWallet(accounts[11].address)).wait();
			const tempInstance = await contractInstance.connect(accounts[2]);
			await expect(tempInstance.setWallet(accounts[11].address)).to.be.revertedWith("Ownable: caller is not the owner");
		});

		it("any external account can enter a match", async function () {
			// await contractInstance.enterMatch(gameId);
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
