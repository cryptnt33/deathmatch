const chai = require("chai");
const {expect, assert} = chai;
const {ethers} = require("hardhat");
const {v4: uuidv4} = require("uuid");

describe("claiming a prize...", async function () {
	let contractFactory, contractInstance, accounts, externalWallet;
	const pointFiveEther = ethers.utils.parseUnits("0.5", "ether");
	const randomSeed = uuidv4().substring(0, 6);
	let gameId, players;

	async function setupMatches(players) {
		try {
			gameId = uuidv4();

			// start match
			await contractInstance.startMatch(gameId, pointFiveEther, 10, randomSeed);

			for (i = 0; i < players.length; i++) {
				const player = await contractInstance.connect(players[i].account);
				// deposit fee
				await player.depositFee(gameId, players[i].slots, {
					value: pointFiveEther.mul(players[i].slots),
				});
				// enter match
				await player.enterMatch(gameId, randomSeed);
				assert.isOk(true);
			}
		} catch (e) {
			console.log(e);
			assert.fail();
		}
	}

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

			await setupMatches(players);

			assert.isOk(true);
		} catch (e) {
			console.log(e);
			assert.fail();
		}
	});
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
