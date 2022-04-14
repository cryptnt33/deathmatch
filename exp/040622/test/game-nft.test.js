const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

describe("test game nft contract", async function () {
	let contractInstance;
	let accounts;

	before("deploy", async function () {
		try {
			const contract = await ethers.getContractFactory("GameNft");
			contractInstance = await contract.deploy();
			await contractInstance.deployed();
			accounts = await ethers.getSigners();
			assert.isOk(true);
		} catch (e) {
			console.log(e);
			assert.fail();
		}
	});

	async function verifyFloorPrice(eth) {
		const result = await contractInstance.getFloorPrice();
		const toEther = ethers.utils.formatEther(result).toString();
		expect(parseInt(toEther)).to.equal(eth);
	}

	it("set and get max supply", async function () {
		await contractInstance.setMaxSupply(BigInt("10000"));
		const result = await contractInstance.getMaxSupply();
		expect(parseInt(result.toString())).to.equal(10000);
	});

	it("set and get mint limit", async function () {
		await contractInstance.setMintLimit(BigInt("5"));
		const result = await contractInstance.getMintLimit();
		expect(parseInt(result.toString())).to.equal(5);
	});

	it("verify contract owner", async function () {
		const acc1 = await contractInstance.isContractOwner(accounts[0].address);
		expect(acc1).to.equal(true);
		const acc2 = await contractInstance.isContractOwner(accounts[1].address);
		expect(acc2).to.equal(false);
	});

	it("set a new floor price", async function () {
		await contractInstance.setFloorPrice(ethers.utils.parseEther("500"));
		verifyFloorPrice(500);
		await contractInstance.setFloorPrice(ethers.utils.parseEther("1"));
		verifyFloorPrice(1);
	});

	it("mints 5 new nfts for 5 ether", async function () {
		const tx = await contractInstance.mintNfts(5, { value: ethers.utils.parseEther("5") });
		const { events } = await tx.wait();
		expect(events.length).to.equal(5);
		expect(events[0].event).to.equal("Transfer");
		expect(await contractInstance.balanceOf(accounts[0].address)).to.equal(5);
	});

	it("mint fails on invalid count", async function () {
		await expect(contractInstance.mintNfts(0, { value: ethers.utils.parseEther("0") })).to.be.revertedWith("zero requested");
		await expect(contractInstance.mintNfts(4, { value: ethers.utils.parseEther("0") })).to.be.revertedWith("insufficient ether");
		await expect(contractInstance.mintNfts(6, { value: ethers.utils.parseEther("6") })).to.be.revertedWith("too many requested");
	});
});
