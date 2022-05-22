const chai = require("chai");
const {expect, assert} = chai;
const {ethers} = require("hardhat");
const axios = require("axios").default;

describe("[random.org] generating a true random string...", async function () {
	let contractFactory, contractInstance, accounts;
	const query = "https://www.random.org/strings/?num=100&len=16&digits=on&upperalpha=on&loweralpha=on&unique=on&format=plain&rnd=new";

	before("deploy", async function () {
		try {
			accounts = await ethers.getSigners();
			contractFactory = await ethers.getContractFactory("OffchainVrf");
			contractInstance = await contractFactory.deploy();
			const tx = await contractInstance.deployed();
			process.env.VrfAccountAddress = tx.address;
			console.log(process.env.VrfAccountAddress);
			assert.isOk(true);
		} catch (e) {
			console.log(e);
			assert.fail();
		}
	});

	it("set seeds", async function () {
		// const {data} = await axios.get(query);
		const data = "abcdefghijklmnop ".split("").join("\n");
		const seeds = data.split("\n").slice(0, -1);
		await contractInstance.overwriteSeeds(seeds);
		const seed = await contractInstance.getSeed();
		expect(seeds[seeds.length - 1]).to.equal(seed);
		await contractInstance.popSeed();
		expect(await contractInstance.getSeedsLength()).to.equal(15);
	});

	it("get limited number of seeds", async function () {
		const limit = 2;
		const seeds = await contractInstance.getSeeds(limit);
		expect(seeds.length).to.equal(limit);
		await contractInstance.popSeeds(limit);
		expect(await contractInstance.getSeedsLength()).to.equal(13);
	});

	it("append seeds", async function () {
		// const {data} = await axios.get(query);
		const data = "qrstuvwxyz123456789 ".split("").join("\n");
		const seeds = data.split("\n").slice(0, -1);
		await contractInstance.appendSeeds(seeds);
		const seed = await contractInstance.getSeed();
		expect(seeds[seeds.length - 1]).to.equal(seed);
		expect(await contractInstance.getSeedsLength()).to.equal(32);
	});
});
