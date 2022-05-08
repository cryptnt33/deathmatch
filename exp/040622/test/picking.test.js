const chai = require("chai");
const {expect, assert} = chai;
const {ethers} = require("hardhat");
const {v4: uuidv4} = require("uuid");
const {setupMatches} = require("./setup");

describe("picking a match winner...", async function () {
	let contractFactory, contractInstance, accounts, externalWallet;
	const pointFiveEther = ethers.utils.parseUnits("0.5", "ether");
	const randomSeed = uuidv4().substring(0, 6);
	let gameId, players;

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

			gameId = await setupMatches(contractInstance, players, randomSeed);

			assert.isOk(true);
		} catch (e) {
			console.log(e);
			assert.fail();
		}
	});

	it("calculate total prize pool", async function () {
		const prizePool = await contractInstance.getPrizePool(gameId);
		expect(prizePool).to.equal(pointFiveEther.mul(11));
		// console.log(ethers.utils.formatEther(prizePool));
	});
	it("randomly from players in the game", async function () {
		const tx = await (await contractInstance.pickWinner(gameId, randomSeed)).wait();
		const winner = tx.events[0].args[1];
		const index = tx.events[0].args[2].toNumber();
		const prizeAmount = tx.events[0].args[3];
		// console.log(tx.cumulativeGasUsed.mul(tx.effectiveGasPrice));
		const playerAddresses = [players[0].account.address, players[1].account.address, players[2].account.address];
		const totalSlots = await contractInstance.getPlayers(gameId);
		assert(playerAddresses.indexOf(winner) > -1);
		// console.log(index, totalSlots.length);
		assert(index > -1 && index <= totalSlots.length);
		expect(prizeAmount).to.equal(pointFiveEther.mul(11).mul(4).div(5));
		// console.log(ethers.utils.formatEther(prizeAmount));
		// remaining balance is sent to the external wallet each time pickWinner is called
		const walletBalance = await externalWallet.getBalance();
		const prizePool = await contractInstance.getPrizePool(gameId);
		// the wallet already contains 10K Ethers
		// console.log(ethers.utils.formatEther(prizePool), ethers.utils.formatEther(walletBalance), ethers.utils.formatEther(prizeAmount));
		assert(walletBalance.sub(ethers.utils.parseUnits("10000", "ether")) >= prizePool.sub(prizeAmount));
	});
	it("only by owner or starter", async function () {
		// change the context to some account other than the one that started
		const tempPlayer = await contractInstance.connect(players[0].account);
		await expect(tempPlayer.pickWinner(gameId, randomSeed)).to.be.revertedWith("only owner or starter");
	});
	it("only once after the match has started", async function () {
		await expect(contractInstance.pickWinner(gameId, randomSeed)).to.be.revertedWith("match ended");
	});
	xit("shuffle", async function () {
		const preShuffle1 = [1, 1, 1, 2, 3, 3, 3, 4, 4, 4, 4, 5, 6, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 7, 7];
		const preShuffle2 = [1];
		const preShuffle3 = [];
		postShuffle = await contractInstance.shuffle(preShuffle1);
		expect(postShuffle).to.not.equal(preShuffle1);
		postShuffle = await contractInstance.shuffle(preShuffle2);
		expect(postShuffle).to.not.equal(preShuffle2);
		try {
			postShuffle = await contractInstance.shuffle(preShuffle3);
			assert.fail();
		} catch {
			assert.isOk(true);
		}
	});
});
