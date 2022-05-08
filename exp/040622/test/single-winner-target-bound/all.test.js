class BaseArgs {
	gameId = "";
}

class SingleWinnerTargetBoundStartArgs extends BaseArgs {
	constructor(args) {
		super(args);
	}
}

class SingleWinnerTargetBoundDepositArgs extends BaseArgs {
	constructor(args) {
		super(args);
	}
}

class SingleWinnerTargetBoundEntryArgs extends BaseArgs {
	constructor(args) {
		super(args);
	}
}

class SingleWinnerTargetBoundWinArgs extends BaseArgs {
	constructor(args) {
		super(args);
	}
}

class SingleWinnerTargetBoundClaimArgs extends BaseArgs {
	constructor(args) {
		super(args);
	}
}

class BaseStrategy {
	_args;
	constructor(args) {
		this._args = args;
	}
	execute = async function () {
		console.log(this._args);
	};
}

class SingleWinnerTargetBoundStartStrategy extends BaseStrategy {
	constructor(args) {
		super(args);
	}
}

class SingleWinnerTargetBoundDepositStrategy extends BaseStrategy {
	constructor(args) {
		super(args);
	}
}

class SingleWinnerTargetBoundEntryStrategy extends BaseStrategy {
	constructor(args) {
		super(args);
	}
}

class SingleWinnerTargetBoundWinStrategy extends BaseStrategy {
	constructor(args) {
		super(args);
	}
}

class SingleWinnerTargetBoundClaimStrategy extends BaseStrategy {
	constructor(args) {
		super(args);
	}
}

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

// annotation-like for grep-testing
describe("[class-design-test] single winner in a target bound game", async function () {
	try {
		// args
		const startArgs = new SingleWinnerTargetBoundStartArgs();
		const depositFeeArgs = new SingleWinnerTargetBoundDepositArgs();
		const entryArgs = new SingleWinnerTargetBoundEntryArgs();
		const winArgs = new SingleWinnerTargetBoundWinArgs();
		const claimArgs = new SingleWinnerTargetBoundClaimArgs();
		// strategies
		const startStrategy = new SingleWinnerTargetBoundStartStrategy(startArgs);
		const depositStrategy = new SingleWinnerTargetBoundDepositStrategy(depositFeeArgs);
		const entryStrategy = new SingleWinnerTargetBoundEntryStrategy(entryArgs);
		const winStrategy = new SingleWinnerTargetBoundWinStrategy(winArgs);
		const claimStrategy = new SingleWinnerTargetBoundClaimStrategy(claimArgs);
		// game
		const game = new GamePlayer(startStrategy, depositStrategy, entryStrategy, winStrategy, claimStrategy);
		it("starts a match", async function () {
			await game.start();
		});
	} catch (e) {
		console.log("describe failed to init", e);
	}
});
