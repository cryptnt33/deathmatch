const {v4: uuidv4} = require("uuid");

setupMatches = async function (contractInstance, players, pointFiveEther, maxSlots, randomSeed) {
	const gameId = uuidv4();

	// start match
	await contractInstance.startMatch(gameId, pointFiveEther, maxSlots, randomSeed);

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

module.exports = {setupMatches};
