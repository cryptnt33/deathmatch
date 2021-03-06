//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.9;

import "./Matchbase.sol";
import "./ArrayUtils.sol";
import "./Rando.sol";
import "./IVrfConsumer.sol";

contract Deathmatch is Matchbase {
	constructor(address payable _wallet, address _vrfContractAddress)
		Matchbase(_wallet, _vrfContractAddress)
	{}

	/**
        external/public functions
    */

	// only owners or partners can start a match
	function startMatch(
		string calldata _gameId,
		uint _floorPrice,
		uint _maxSlots,
		uint _duration
	) external ownerPartnerOrDelegator(_gameId) {
		uint timestamp = Rando.getTimestamp();
		MatchInfo memory info = matches[_gameId];
		require(info.matchStatus == MatchStatus.NotStarted, "match in-progress");
		matches[_gameId] = MatchInfo(
			MatchStatus.Started,
			timestamp,
			_duration,
			_floorPrice,
			_maxSlots,
			msg.sender
		);
		emit MatchStarted(_gameId, timestamp);
	}

	// anyone can deposit fee for a game
	// save deposit info for validation later
	// update the prize pool for this game
	// save wallet address for the game
	// match must be started
	// match is time-bound
	// verify slot limits
	// verify deposit amount
	// ensure only one entry per wallet
	function depositFee(string calldata _gameId, uint _slots) external payable {
		MatchInfo memory info = matches[_gameId];
		require(info.matchStatus == MatchStatus.Started, "match not started");
		require(Rando.getTimestamp() <= info.timeStarted + info.duration, "too late");
		require(_slots >= 1 && _slots <= info.maxSlotsPerWallet, "slot limit exceeded");
		require(msg.value == info.floorPrice * _slots, "incorrect deposit");

		DepositInfo storage depositInfo = deposits[_gameId][msg.sender];
		require(!depositInfo.deposited, "re-entry not allowed");
		deposits[_gameId][msg.sender] = DepositInfo(msg.value, _slots, true);
		prizePools[_gameId] += msg.value;

		emit FeeDeposited(_gameId, msg.sender, msg.value);
	}

	// enter a match one or more times depending on the number of slots purchased
	// anyone can enter a match
	// can't enter a match without depositing fee
	// enter match
	// check for re-entry
	// don't allow if address already exists
	// add players by number of slots
	// match must be started
	// verify if deposit was called before entering
	// deposit should equal floor price * slots
	function enterMatch(string calldata _gameId) external {
		require(wallets[_gameId][msg.sender] == 0, "re-entry not allowed");

		MatchInfo memory matchInfo = matches[_gameId];
		require(matchInfo.matchStatus == MatchStatus.Started, "match not started");

		DepositInfo memory depositInfo = deposits[_gameId][msg.sender];
		require(depositInfo.deposited, "deposit required");
		require(
			depositInfo.depositAmount == depositInfo.slots * matchInfo.floorPrice,
			"incorrect deposit"
		);

		address[] storage _players = players[_gameId];
		for (uint i = 0; i < depositInfo.slots; i++) {
			_players.push(msg.sender);
		}
		wallets[_gameId][msg.sender] = 1;
	}

	// can only be called by the partner or a player
	// can only call once because the match end ended after picking a winner
	function pickWinner(string calldata _gameId) external virtual partnerOrPlayer(_gameId) {
		MatchInfo memory matchInfo = matches[_gameId];
		require(matchInfo.matchStatus == MatchStatus.Started, "match ended");
		require(Rando.getTimestamp() >= matchInfo.timeStarted + matchInfo.duration, "too early");

		uint prizePool = prizePools[_gameId];
		require(prizePool > 0, "pool dry");
		require(getBalance() >= prizePool, "insufficient funds");

		address[] memory _players = players[_gameId];
		uint noOfPlayers = _players.length;
		require(noOfPlayers > 0, "no players");
		ArrayUtils.shuffleAddresses(_players, Rando.getTimestamp());
		uint largeNumber = makeLargeNumber();
		uint index = largeNumber % noOfPlayers;
		require(index >= 0 && index < noOfPlayers, "invalid index");
		address winner = _players[index];

		uint winningAmount = (prizePool * defaultClaimPct.winner) / 100;
		uint rewardAmount = (prizePool * defaultClaimPct.partner) / 100;
		winnings[_gameId][winner] = winningAmount;
		rewards[_gameId][matchInfo.partner] = rewardAmount;

		matchInfo.matchStatus = MatchStatus.Finished;
		matches[_gameId] = matchInfo;
		emit WinnerPicked(_gameId, winner, index, winningAmount);
		// transfer at the end
		externalWallet.transfer((prizePool * defaultClaimPct.protocol) / 100);
	}

	function claimPrize(string calldata _gameId) external payable virtual {
		uint prizeAmount = winnings[_gameId][msg.sender];
		require(prizeAmount > 0, "unauthorized");
		require(claims[_gameId][msg.sender] == 0, "duplicate claim");
		claims[_gameId][msg.sender] = prizeAmount;
		require(getPrizePool(_gameId) >= prizeAmount, "pool dry");
		require(getBalance() >= prizeAmount, "insufficient funds");
		prizePools[_gameId] -= prizeAmount;
		emit PrizeClaimed(_gameId, msg.sender, prizeAmount);
		// transfer at the end
		payable(msg.sender).transfer(prizeAmount);
	}

	function claimReward(string calldata _gameId) external payable virtual {
		uint rewardAmount = rewards[_gameId][msg.sender];
		require(rewardAmount > 0, "unauthorized");
		require(claims[_gameId][msg.sender] == 0, "duplicate claim");
		claims[_gameId][msg.sender] = rewardAmount;
		require(getPrizePool(_gameId) >= rewardAmount, "pool dry");
		require(getBalance() >= rewardAmount, "insufficient funds");
		emit RewardClaimed(_gameId, msg.sender, rewardAmount);
		// transfer at the end
		payable(msg.sender).transfer(rewardAmount);
	}

	function makeLargeNumber() private returns (uint) {
		uint largeNumber = Rando.random(IVrfConsumer(vrfContractAddress).getSeed());
		IVrfConsumer(vrfContractAddress).popSeed();
		return largeNumber;
	}
}
