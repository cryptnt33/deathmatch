const chai = require("chai");
const {expect, assert} = chai;
const {ethers} = require("hardhat");
const {v4: uuidv4} = require("uuid");

// any external account can enter a match
// all deposits are made to an external multi-sig wallet
describe("entering a match...", async function () {
	let contractFactory, contractInstance, accounts, externalWallet;
	const pointFiveEther = ethers.utils.parseUnits("0.5", "ether");
	const pointSevenFiveEther = ethers.utils.parseUnits("0.75", "ether");
	const randomSeed = uuidv4().substring(0, 6);

	before("deploy", async function () {
		try {
			accounts = await ethers.getSigners();
			externalWallet = accounts[10];
			contractFactory = await ethers.getContractFactory("Deathmatch");
			contractInstance = await contractFactory.deploy(externalWallet.address);
			await contractInstance.deployed();
			assert.isOk(true);
		} catch (e) {
			console.log(e);
			assert.fail();
		}
	});

	async function depositTest(slots, depositRequired, gameId, tempContractInstance, walletAccount) {
		// assert the floor price
		const fp = await tempContractInstance.getFloorPrice(gameId);
		expect(fp).to.equal(pointFiveEther);
		// deposit more than or equal to the floor price
		const walletBalance = await walletAccount.getBalance();
		const senderBalance = await accounts[0].getBalance();
		// const slots = 1;
		// const depositRequired = pointSevenFiveEther.mul(slots);
		const tx = await (
			await tempContractInstance.depositFee(gameId, slots, {
				value: depositRequired,
			})
		).wait();
		// assert the deposit amount is equal to amount sent
		const depositInfo = await tempContractInstance.getDepositInfo(gameId, accounts[0].address);
		expect(depositInfo.depositAmount).to.equal(depositRequired);
		expect(depositInfo.slots).to.equal(slots);
		// assert event fired contained correct "by" and "amount" values
		expect(tx.events[0].args[1]).to.equal(accounts[0].address);
		expect(tx.events[0].args[2]).to.equal(depositRequired);
		// assert that the amount of ether in wallet increased by the deposited amount
		const newWalletBalance = await walletAccount.getBalance();
		expect(newWalletBalance).to.equal(walletBalance.add(depositRequired));
		// assert that the amount of ether in requester account decreased by the deposited amount
		const gasCost = tx.cumulativeGasUsed.mul(tx.effectiveGasPrice);
		const newSenderBalance = await accounts[0].getBalance();
		expect(newSenderBalance).to.equal(senderBalance.sub(depositRequired).sub(gasCost));
	}

	it("deposit to an owner provided external account address", async function () {
		const gameId = uuidv4();
		const slots = 1;
		await contractInstance.startMatch(gameId, pointFiveEther, 10, randomSeed);
		await depositTest(slots, pointFiveEther.mul(slots), gameId, contractInstance, externalWallet);
	});
	it("only owner can change the external account address", async function () {
		await (await contractInstance.setWallet(accounts[11].address)).wait();
		const tempInstance = await contractInstance.connect(accounts[2]);
		await expect(tempInstance.setWallet(accounts[11].address)).to.be.revertedWith("Ownable: caller is not the owner");
	});
	it("any external account can enter a match", async function () {
		const gameId = uuidv4();
		// start a game
		await contractInstance.startMatch(gameId, pointFiveEther, 10, randomSeed);

		const altAccount = accounts[13];
		// change context to a different account
		const tempInstance = await contractInstance.connect(altAccount);
		// deposit
		const slots = 10;
		const depositRequired = pointFiveEther.mul(slots);
		await tempInstance.depositFee(gameId, slots, {value: depositRequired});
		// enter
		await tempInstance.enterMatch(gameId, randomSeed);
		const players = await tempInstance.getPlayers(gameId);

		expect(players.length).to.equal(slots);
	});
	it("can purchase a limited number of slots/tickets", async function () {
		const gameId = uuidv4();
		const slots = 11;
		const depositRequired = pointSevenFiveEther.mul(slots);
		await contractInstance.startMatch(gameId, pointFiveEther, 10, randomSeed);
		await expect(contractInstance.depositFee(gameId, slots, {value: depositRequired})).to.be.revertedWith("slot limit exceeded");
	});
	it("deposit ethers in multiples of slots", async function () {
		const gameId = uuidv4();
		const slots = 5;
		const depositRequired = pointFiveEther.mul(4);
		await contractInstance.startMatch(gameId, pointFiveEther, 10, randomSeed);
		await expect(contractInstance.depositFee(gameId, slots, {value: depositRequired})).to.be.revertedWith("incorrect deposit");
	});
	it("can enter a match only once", async function () {
		// start match
		const gameId = uuidv4();
		await contractInstance.startMatch(gameId, pointFiveEther, 10, randomSeed);
		// deposit ethers
		const slots = 5;
		const depositRequired = pointFiveEther.mul(slots);
		await contractInstance.depositFee(gameId, slots, {
			value: depositRequired,
		});
		// enter match
		await contractInstance.enterMatch(gameId, randomSeed);
		// expect repeat entries to fail
		await expect(contractInstance.enterMatch(gameId, randomSeed)).to.be.revertedWith("re-entry not allowed");
		await expect(contractInstance.enterMatch(gameId, randomSeed)).to.be.revertedWith("re-entry not allowed");
		const players = await contractInstance.getPlayers(gameId);
		expect(players.length).to.equal(5);
	});
	it("more than one wallet can enter a game", async function () {
		// start match
		const gameId = uuidv4();
		const player1 = await contractInstance.connect(accounts[13]);
		const player2 = await contractInstance.connect(accounts[14]);
		await contractInstance.startMatch(gameId, pointFiveEther, 10, randomSeed);

		// account#1 deposit ethers
		const slots = 5;
		const depositRequired = pointFiveEther.mul(slots);
		await player1.depositFee(gameId, slots, {
			value: depositRequired,
		});
		// account#1 enter match
		await player1.enterMatch(gameId, randomSeed);

		// account#2 deposit ethers
		await player2.depositFee(gameId, slots, {
			value: depositRequired,
		});
		// account#2 enter match
		await player2.enterMatch(gameId, randomSeed);

		// assert total number of slots
		// should be slots times 2 because two players entered the game in this test
		let players = await player1.getPlayers(gameId);
		expect(players.length).to.equal(10);
	});
	xit("calculate approximate gas fee", async function () {
		const gameId = uuidv4();
		const tx1 = await (await contractInstance.startMatch(gameId, pointFiveEther, 10, randomSeed)).wait();
		const slots = 5;
		const depositRequired = pointFiveEther.mul(slots);
		const tx2 = await (
			await contractInstance.depositFee(gameId, slots, {
				value: depositRequired,
			})
		).wait();
		const tx3 = await (await contractInstance.enterMatch(gameId, randomSeed)).wait();
		const tx1cost = tx1.cumulativeGasUsed.mul(tx1.effectiveGasPrice);
		const tx2cost = tx2.cumulativeGasUsed.mul(tx2.effectiveGasPrice);
		const tx3cost = tx3.cumulativeGasUsed.mul(tx3.effectiveGasPrice);
		const averageGwei = 50;
		const averageEthPriceInDollars = 3000;
		const averageAvaxPriceInDollars = 58;
		const totalGasUsed = tx1cost.add(tx2cost.add(tx3cost));
		const costInEth = totalGasUsed * averageGwei * 0.000000001;
		console.log(totalGasUsed);
		// fail test if the gas used exceeds this magic number
		expect(totalGasUsed.toNumber()).to.be.lessThanOrEqual(434130);
		expect(costInEth).to.be.lessThanOrEqual(0.025);
		expect(averageEthPriceInDollars * costInEth).to.be.lessThanOrEqual(65.5);
		expect(averageAvaxPriceInDollars * costInEth).to.be.lessThanOrEqual(1.5);
	});
	it("can't enter match without a deposit", async function () {
		const gameId = uuidv4();
		await contractInstance.startMatch(gameId, pointFiveEther, 10, randomSeed);
		await expect(contractInstance.enterMatch(gameId, randomSeed)).to.be.revertedWith("deposit required");
	});
	it("can deposit fee only if the match in progress", async function () {
		const gameId = uuidv4();
		await expect(contractInstance.depositFee(gameId, 10)).to.be.revertedWith("match not started");
	});
	it("can enter a match only if its in progress", async function () {
		const gameId = uuidv4();
		await expect(contractInstance.enterMatch(gameId, randomSeed)).to.be.revertedWith("match not started");
	});
});
