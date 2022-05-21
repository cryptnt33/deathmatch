const {v4: uuidv4} = require("uuid");
const {ethers} = require("hardhat");
const pointFiveEther = ethers.utils.parseUnits("0.5", "ether");

const vrfAddress = "0xA689c9f709eD11b2C742584Eea2F7Fa615C70f3C";

startMatch = async function (contractInstance, gameId = uuidv4(), floor = pointFiveEther, maxSlots = 10, duration = 5, randomSeed = uuidv4().substring(0, 6)) {
	await contractInstance.startMatch(gameId, floor, maxSlots, duration, randomSeed);
	return gameId;
};

startMatchTx = async function (contractInstance, gameId = uuidv4(), floor = pointFiveEther, maxSlots = 10, duration = 5, randomSeed = uuidv4().substring(0, 6)) {
	return contractInstance.startMatch(gameId, floor, maxSlots, duration, randomSeed);
};

setupMatches = async function (contractInstance, players, randomSeed) {
	const gameId = await startMatch(contractInstance);

	for (i = 0; i < players.length; i++) {
		const player = await contractInstance.connect(players[i].account);
		// deposit fee
		await player.depositFee(gameId, players[i].slots, {
			value: pointFiveEther.mul(players[i].slots),
		});
		// enter match
		await player.enterMatch(gameId, randomSeed);
	}

	return gameId;
};

module.exports = {setupMatches, startMatch, startMatchTx, vrfAddress};
