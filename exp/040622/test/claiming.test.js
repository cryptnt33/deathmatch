const chai = require("chai");
const {expect, assert} = chai;
const {ethers} = require("hardhat");
const {v4: uuidv4} = require("uuid");
const {setupMatches} = require("./setup");

describe("claiming a prize...", async function () {
	let contractFactory, contractInstance, accounts, externalWallet;
	const pointFiveEther = ethers.utils.parseUnits("0.5", "ether");
	const randomSeed = uuidv4().substring(0, 6);
	let gameId, players;

	addressToSigner = function (address) {
		for (i = 0; i < accounts.length; i++) {
			if (accounts[i].address == address) {
				return accounts[i];
			}
		}
		throw new Error("not found");
	};

	pickWinner = async function () {
		const tx = await (await contractInstance.pickWinner(gameId, randomSeed)).wait();
		const winner = tx.events[0].args[1];
		const index = tx.events[0].args[2].toNumber();
		const prizeAmount = tx.events[0].args[3];
		return {winner, index, prizeAmount};
	};

	before("deploy", async function () {
		try {
			accounts = await ethers.getSigners();
			externalWallet = accounts[10];
			contractFactory = await ethers.getContractFactory("Deathmatch");
			contractInstance = await contractFactory.deploy(externalWallet.address);
			await contractInstance.deployed();
			players = [
				{
					account: accounts[13],
					slots: 2,
				},
				{
					account: accounts[14],
					slots: 4,
				},
				{
					account: accounts[15],
					slots: 5,
				},
			];
			// console.log(accounts[0]);
			gameId = await setupMatches(contractInstance, players, pointFiveEther, 10, randomSeed);

			assert.isOk(true);
		} catch (e) {
			console.log(e);
			assert.fail();
		}
	});
	it("equal to 75% of the total pooled ether", async function () {
		// find a winner
		const {winner, index, prizeAmount} = await pickWinner();
		// switch context to winner
		const player = await contractInstance.connect(addressToSigner(winner));
		expect(await player.getPrizeAmount(gameId, winner)).to.equal(prizeAmount);
		const walletBalance = await contractInstance.getBalance();
		await player.claimPrize(gameId);
		const newWalletBalance = await contractInstance.getBalance();
		expect(walletBalance).to.equal(newWalletBalance.add(prizeAmount));
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
