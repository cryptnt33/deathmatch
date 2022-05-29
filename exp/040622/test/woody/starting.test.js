const chai = require("chai");
const {expect, assert} = chai;
const {ethers} = require("hardhat");
const {v4: uuidv4} = require("uuid");
const {startMatch, startMatchTx, vrfAddress} = require("./setup");

describe("starting a match...", async function () {
	let contractFactory, contractInstance, accounts, externalWallet;
	const pointFiveEther = ethers.utils.parseUnits("0.5", "ether");
	const randomSeed = uuidv4().substring(0, 6);

	before("deploy", async function () {
		try {
			accounts = await ethers.getSigners();
			externalWallet = accounts[10];
			contractFactory = await ethers.getContractFactory("Deathmatch");
			contractInstance = await contractFactory.deploy(externalWallet.address, vrfAddress);
			await contractInstance.deployed();
			assert.isOk(true);
		} catch (e) {
			console.log(e);
			assert.fail();
		}
	});

	it("owners can start a match", async function () {
		const gameId = await startMatch(contractInstance);
		expect(await contractInstance.getMatchStatus(gameId)).to.equal(1);
		expect(await contractInstance.isOwner(accounts[0].address)).to.equal(true);
	});
	it("can't start non-unique match", async function () {
		const gameId = uuidv4();
		const tx1 = startMatchTx(contractInstance, gameId);
		const tx2 = startMatchTx(contractInstance, gameId);
		await tx1;
		await expect(tx2).to.be.revertedWith("match in-progress");
	});
	it("non-owners, non-partners cannot start a match", async function () {
		const gameId = uuidv4();
		// switch accounts
		const tempInstance = await contractInstance.connect(accounts[2]);
		expect(await tempInstance.isOwner(accounts[0].address)).to.equal(true);
		expect(await tempInstance.isOwner(accounts[2].address)).to.equal(false);
		await expect(startMatchTx(tempInstance, gameId)).to.be.revertedWith("unauthorized");
	});
	it("more than one match can start at a time", async function () {
		// wait to capture event emitted
		const g1 = uuidv4();
		const g2 = uuidv4();
		const tx1 = await (await startMatchTx(contractInstance, g1)).wait();
		const tx2 = await (await startMatchTx(contractInstance, g2)).wait();
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
		const tx1 = await (await startMatchTx(contractInstance)).wait();
		const gameId1 = tx1.events[0].args[0];
		expect(await contractInstance.getMatchStatus(gameId1)).to.equal(1);
		// delegator (added above)
		const tempInstance = await contractInstance.connect(accounts[3]);
		const tx2 = await (await startMatchTx(tempInstance)).wait();
		const gameId2 = tx2.events[0].args[0];
		expect(await contractInstance.getMatchStatus(gameId1)).to.equal(1);
		expect(await tempInstance.getMatchStatus(gameId2)).to.equal(1);
	});
	it("with a custom floor price", async function () {
		const tx1 = await (await startMatchTx(contractInstance)).wait();
		const gameId1 = tx1.events[0].args[0];
		expect(await contractInstance.getFloorPrice(gameId1)).to.equal(pointFiveEther);
	});
});
