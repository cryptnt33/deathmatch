SingleWinnerTargetBoundStartStrategy = function (args) {
	execute = async function () {
		console.log(args);
	};
	return {execute};
};

SingleWinnerTargetBoundDepositStrategy = function (args) {
	execute = async function () {
		console.log(args);
	};
	return {execute};
};

SingleWinnerTargetBoundEntryStrategy = function (args) {
	execute = async function () {
		console.log(args);
	};
	return {execute};
};

SingleWinnerTargetBoundWinStrategy = function (args) {
	execute = async function () {
		console.log(args);
	};
	return {execute};
};

SingleWinnerTargetBoundClaimStrategy = function (args) {
	execute = async function () {
		console.log(args);
	};
	return {execute};
};

GamePlayer = function (startStrategy, depositStrategy, entryStrategy, winStrategy, claimStrategy) {
	start = async function () {
		await startStrategy.execute();
	};
	deposit = async function () {
		await depositStrategy.execute();
	};
	entry = async function () {
		await entryStrategy.execute();
	};
	win = async function () {
		await winStrategy.execute();
	};
	claim = async function () {
		await claimStrategy.execute();
	};
	return {start, deposit, entry, win, claim};
};

describe("single winner in a target bound game", async function () {
	try {
		const startArgs = {};
		const depositFeeArgs = {};
		const entryArgs = {};
		const winArgs = {};
		const claimArgs = {};
		const startStrategy = SingleWinnerTargetBoundStartStrategy(startArgs);
		const depositStrategy = SingleWinnerTargetBoundDepositStrategy(depositFeeArgs);
		const entryStrategy = SingleWinnerTargetBoundEntryStrategy(entryArgs);
		const winStrategy = SingleWinnerTargetBoundWinStrategy(winArgs);
		const claimStrategy = SingleWinnerTargetBoundClaimStrategy(claimArgs);
		const game = GamePlayer(startStrategy, depositStrategy, entryStrategy, winStrategy, claimStrategy);
		it("starts a match", async function () {
			await game.start();
		});
	} catch (e) {
		console.log("describe failed to init", e);
	}
});
