//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.9;

import "./Matchbase.sol";
import "./ArrayUtils.sol";
import "./Rando.sol";

contract Deathmatch is Matchbase {
	constructor(address payable _wallet) Matchbase(_wallet) {}

	/**
        external/public functions
    */

	// only owners or delegators can start a match
	function startMatch(
		string calldata _gameId,
		uint _floorPrice,
		uint _maxSlots,
		uint _duration,
		string calldata _randomSeed
	) external ownerOrDelegator seedLength(_randomSeed) {
		uint timestamp = Rando.getTimestamp();
		MatchInfo memory info = matches[_gameId];
		require(info.matchStatus == MatchStatus.NotStarted, "match in-progress");
		matches[_gameId] = MatchInfo(MatchStatus.Started, timestamp, _duration, _floorPrice, _maxSlots, msg.sender);
		randomSeeds[_gameId] = _randomSeed;
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
		DepositInfo storage depositInfo = deposits[_gameId][msg.sender];
		require(info.matchStatus == MatchStatus.Started, "match not started");
		require(Rando.getTimestamp() <= info.timeStarted + info.duration, "too late");
		require(_slots >= 1 && _slots <= info.maxSlotsPerWallet, "slot limit exceeded");
		require(msg.value == info.floorPrice * _slots, "incorrect deposit");
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
	function enterMatch(string calldata _gameId, string calldata randomSeed) external seedLength(randomSeed) {
		MatchInfo memory matchInfo = matches[_gameId];
		DepositInfo memory depositInfo = deposits[_gameId][msg.sender];
		require(matchInfo.matchStatus == MatchStatus.Started, "match not started");
		require(depositInfo.deposited, "deposit required");
		require(depositInfo.depositAmount == depositInfo.slots * matchInfo.floorPrice, "incorrect deposit");
		address[] storage _players = players[_gameId];
		require(wallets[_gameId][msg.sender] == 0, "re-entry not allowed");
		for (uint i = 0; i < depositInfo.slots; i++) {
			_players.push(msg.sender);
		}
		wallets[_gameId][msg.sender] = 1;
		randomSeeds[_gameId] = Rando.concat(randomSeeds[_gameId], randomSeed);
	}

	// only by the contract owner or the one that started this match
	// can only call once because the match end ended after picking a winner
	function pickWinner(string calldata _gameId, string calldata _randomSeed) external virtual ownerOrStarter(_gameId) {
		MatchInfo memory matchInfo = matches[_gameId];
		address[] memory _players = players[_gameId];
		uint noOfPlayers = _players.length;
		require(noOfPlayers > 0, "no players");
		ArrayUtils.shuffleAddresses(_players, Rando.getTimestamp());
		uint largeNumber = Rando.random(Rando.concat(randomSeeds[_gameId], _randomSeed));
		require(matchInfo.matchStatus == MatchStatus.Started, "match ended");
		require(Rando.getTimestamp() >= matchInfo.timeStarted + matchInfo.duration, "too early");
		uint index = largeNumber % noOfPlayers;
		require(index > 0 && index <= noOfPlayers, "invalid index");
		address winner = _players[index];
		uint prizePool = prizePools[_gameId];
		require(prizePool > 0, "pool dry");
		uint winningAmount = (prizePool * 4) / 5;
		winnings[_gameId][winner] = winningAmount;
		matchInfo.matchStatus = MatchStatus.Finished;
		matches[_gameId] = matchInfo;
		emit WinnerPicked(_gameId, winner, index, winningAmount);
		// transfer at the end
		externalWallet.transfer(prizePool - winningAmount);
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
}
