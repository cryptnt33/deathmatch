const chai = require("chai");
const { expect, assert } = chai;
const { ethers } = require("hardhat");
const { v4: uuidv4 } = require("uuid");

describe("test Deathmatch contract", async function () {
	let contractFactory, contractInstance, accounts, externalWallet;
	const pointFiveEther = ethers.utils.parseUnits("0.5", "ether");
	const pointSevenFiveEther = ethers.utils.parseUnits("0.75", "ether");
	const aGameId = uuidv4();

	before("deploy", async function () {
		try {
			accounts = await ethers.getSigners();
			contractFactory = await ethers.getContractFactory("Deathmatch");
			externalWallet = accounts[10];
			contractInstance = await contractFactory.deploy(externalWallet.address);
			await contractInstance.deployed();
			assert.isOk(true);
		} catch (e) {
			assert.fail();
		}
	});

	describe("starting a match...", async function () {
		it("owners can start a match", async function () {
			await contractInstance.startMatch(aGameId, pointFiveEther, 10);
			expect(await contractInstance.getMatchStatus(aGameId)).to.equal(1);
			expect(await contractInstance.isOwner(accounts[0].address)).to.equal(true);
		});
		it("non-owners cannot start a match", async function () {
			// switch accounts
			const tempInstance = await contractInstance.connect(accounts[2]);
			expect(await tempInstance.isOwner(accounts[0].address)).to.equal(true);
			expect(await tempInstance.isOwner(accounts[2].address)).to.equal(false);
			await expect(tempInstance.startMatch(aGameId, pointFiveEther, 10)).to.be.revertedWith("only owner or delegator");
			// match status hasn't changed
			expect(await contractInstance.getMatchStatus(aGameId)).to.equal(1);
		});
		it("more than one match can start at a time", async function () {
			// wait to capture event emitted
			const g1 = uuidv4();
			const g2 = uuidv4();
			const tx1 = await (await contractInstance.startMatch(g1, pointFiveEther, 10)).wait();
			const tx2 = await (await contractInstance.startMatch(g2, pointFiveEther, 10)).wait();
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
			const tx1 = await (await contractInstance.startMatch(uuidv4(), pointFiveEther, 10)).wait();
			const gameId1 = tx1.events[0].args[0];
			expect(await contractInstance.getMatchStatus(gameId1)).to.equal(1);
			// delegator (added above)
			const tempInstance = await contractInstance.connect(accounts[3]);
			const tx2 = await (await tempInstance.startMatch(uuidv4(), pointFiveEther, 10)).wait();
			const gameId2 = tx2.events[0].args[0];
			expect(await contractInstance.getMatchStatus(gameId1)).to.equal(1);
			expect(await tempInstance.getMatchStatus(gameId2)).to.equal(1);
		});
		it("with a custom floor price", async function () {
			const tx1 = await (await contractInstance.startMatch(uuidv4(), pointFiveEther, 10)).wait();
			const gameId1 = tx1.events[0].args[0];
			expect(await contractInstance.getFloorPrice(gameId1)).to.equal(pointFiveEther);
		});
	});

	// any external account can enter a match
	// all deposits are made to an external multi-sig wallet
	describe("entering a match...", async function () {
		async function depositTest(slots, depositRequired, gameId, tempContractInstance, walletAccount) {
			// assert the floor price
			const fp = await tempContractInstance.getFloorPrice(gameId);
			expect(fp).to.equal(pointFiveEther);
			// deposit more than or equal to the floor price
			const walletBalance = await walletAccount.getBalance();
			const senderBalance = await accounts[0].getBalance();
			// const slots = 1;
			// const depositRequired = pointSevenFiveEther.mul(slots);
			const tx = await (await tempContractInstance.depositFee(gameId, slots, { value: depositRequired })).wait();
			// assert the deposit amount is equal to amount sent
			const depositInfo = await tempContractInstance.getDepositInfo(gameId, accounts[0].address);
			expect(depositInfo.depositAmount).to.equal(depositRequired);
			expect(depositInfo.slots).to.equal(slots);
			// assert event fired contained correct "by" and "amount" values
			expect(tx.events[0].args[0]).to.equal(accounts[0].address);
			expect(tx.events[0].args[1]).to.equal(depositRequired);
			// assert that the amount of ether in wallet increased by the deposited amount
			const newWalletBalance = await walletAccount.getBalance();
			expect(newWalletBalance).to.equal(walletBalance.add(depositRequired));
			// assert that the amount of ether in requester account decreased by the deposited amount
			const gasCost = tx.cumulativeGasUsed.mul(tx.effectiveGasPrice);
			const newSenderBalance = await accounts[0].getBalance();
			expect(newSenderBalance).to.equal(senderBalance.sub(depositRequired).sub(gasCost));
		}

		it("deposit to an owner provided external account address", async function () {
			let slots = 1;
			await depositTest(slots, pointSevenFiveEther.mul(slots), aGameId, contractInstance, externalWallet);
			slots = 5;
			await depositTest(slots, pointFiveEther.mul(slots), aGameId, contractInstance, externalWallet);
		});

		it("only owner can change the external account address", async function () {
			await (await contractInstance.setWallet(accounts[11].address)).wait();
			const tempInstance = await contractInstance.connect(accounts[2]);
			await expect(tempInstance.setWallet(accounts[11].address)).to.be.revertedWith("Ownable: caller is not the owner");
		});

		it("any external account can enter a match", async function () {
			const altAccount = accounts[13];
			// change context to a different account
			const tempInstance = await contractInstance.connect(altAccount);
			// find an in-progress game
			// deposit ethers
			const gameId = aGameId;
			const slots = 10;
			const depositRequired = pointSevenFiveEther.mul(slots);
			await tempInstance.depositFee(gameId, slots, { value: depositRequired });
			// enter
			await tempInstance.enterMatch(gameId);
			const players = await tempInstance.getPlayers(gameId);
			// console.log(players);
			expect(players.length).to.equal(slots);
		});
		it("can purchase a limited number of slots/tickets", async function () {
			const gameId = aGameId;
			const slots = 11;
			const depositRequired = pointSevenFiveEther.mul(slots);
			await expect(contractInstance.depositFee(gameId, slots, { value: depositRequired })).to.be.revertedWith("slot limit exceeded");
		});
		it("deposit ethers in multiples of slots", async function () {
			const gameId = aGameId;
			const slots = 5;
			const depositRequired = pointFiveEther.mul(4);
			await expect(contractInstance.depositFee(gameId, slots, { value: depositRequired })).to.be.revertedWith("insufficient deposit");
		});
		it("require fee deposit each time to enter a match", async function () {
			// start match
			const gameId = uuidv4();
			await contractInstance.startMatch(gameId, pointFiveEther, 10);
			// deposit ethers
			const slots = 5;
			const depositRequired = pointFiveEther.mul(slots);
			await contractInstance.depositFee(gameId, slots, { value: depositRequired });
			// enter match
			await contractInstance.enterMatch(gameId);
			// expect repeat entries without depositing fee to fail
			await expect(contractInstance.enterMatch(gameId)).to.be.revertedWith("re-entry requires deposit");
			await expect(contractInstance.enterMatch(gameId)).to.be.revertedWith("re-entry requires deposit");
			const players = await contractInstance.getPlayers(gameId);
			expect(players.length).to.equal(5);
		});
		it("repeat entry with new deposit", async function () {
			// start match
			const gameId = uuidv4();
			await contractInstance.startMatch(gameId, pointFiveEther, 10);
			// deposit ethers
			const slots = 5;
			const depositRequired = pointFiveEther.mul(slots);
			await contractInstance.depositFee(gameId, slots, { value: depositRequired });
			// enter match
			await contractInstance.enterMatch(gameId);
			// expect repeat entries without depositing fee to fail
			await expect(contractInstance.enterMatch(gameId)).to.be.revertedWith("re-entry requires deposit");
			// deposit fee again
			await contractInstance.depositFee(gameId, slots, { value: depositRequired });
			// allow repeat entry
			await contractInstance.enterMatch(gameId);

			const players = await contractInstance.getPlayers(gameId);
			expect(players.length).to.equal(10);
		});
		it("can deposit fee only if the match in progress", async function () {
			const gameId = uuidv4();
			await expect(contractInstance.depositFee(gameId, 10)).to.be.revertedWith("match not started");
		});
		it("can enter a match only if its in progress", async function () {
			const gameId = uuidv4();
			await expect(contractInstance.enterMatch(gameId)).to.be.revertedWith("match not started");
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
