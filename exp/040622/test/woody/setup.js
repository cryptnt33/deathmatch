const {v4: uuidv4} = require("uuid");
const {ethers} = require("hardhat");
const pointFiveEther = ethers.utils.parseUnits("0.5", "ether");
// fuji vrf contract address: 0xA689c9f709eD11b2C742584Eea2F7Fa615C70f3C
const vrfAddress = process.env.VrfAccountAddress ? process.env.VrfAccountAddress : "0x5FbDB2315678afecb367f032d93F642f64180aa3";

startMatch = async function (contractInstance, gameId = uuidv4(), floor = pointFiveEther, maxSlots = 10, duration = 5) {
	await contractInstance.startMatch(gameId, floor, maxSlots, duration);
	return gameId;
};

startMatchTx = async function (contractInstance, gameId = uuidv4(), floor = pointFiveEther, maxSlots = 10, duration = 5) {
	return contractInstance.startMatch(gameId, floor, maxSlots, duration);
};

setupMatches = async function (contractInstance, players) {
	const gameId = await startMatch(contractInstance);

	for (i = 0; i < players.length; i++) {
		const player = await contractInstance.connect(players[i].account);
		// deposit fee
		await player.depositFee(gameId, players[i].slots, {
			value: pointFiveEther.mul(players[i].slots),
		});
		// enter match
		await player.enterMatch(gameId);
	}

	return gameId;
};

module.exports = {setupMatches, startMatch, startMatchTx, vrfAddress};
