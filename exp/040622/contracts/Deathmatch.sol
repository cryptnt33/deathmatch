//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./Matchbase.sol";
import "./ArrayUtils.sol";

contract Deathmatch is Matchbase {
	ArrayUtils private arrayUtils;

	constructor(address payable _wallet) Matchbase(_wallet) {
		arrayUtils = new ArrayUtils();
	}

	/**
        external/public functions
    */

	// only owners or delegators can start a match
	function startMatch(
		string calldata _gameId,
		uint _floorPrice,
		uint _maxSlots,
		uint duration,
		string calldata randomSeed
	) public ownerOrDelegator seedLength(randomSeed) {
		uint timestamp = block.timestamp;
		MatchInfo memory info = matches[_gameId];
		require(info.matchStatus == MatchStatus.NotStarted, "match in-progress");
		matches[_gameId] = MatchInfo(MatchStatus.Started, timestamp, duration, _floorPrice, _maxSlots, msg.sender);
		randomSeeds[_gameId] = randomSeed;
		emit MatchStarted(_gameId, timestamp);
	}

	// anyone can deposit fee for a game
	function depositFee(string calldata _gameId, uint _slots) public payable {
		MatchInfo memory info = matches[_gameId];
		DepositInfo storage depositInfo = deposits[_gameId][msg.sender];

		// match must be started
		require(info.matchStatus == MatchStatus.Started, "match not started");

		// match is time-bound
		require(block.timestamp <= info.timeStarted + info.duration, "too late");

		// verify slot limits
		require(_slots >= 1 && _slots <= info.maxSlotsPerWallet, "slot limit exceeded");

		// verify deposit amount
		require(msg.value == info.floorPrice * _slots, "incorrect deposit");

		// ensure only one entry per wallet
		require(!depositInfo.deposited, "re-entry not allowed");

		// save deposit info for validation later
		deposits[_gameId][msg.sender] = DepositInfo(msg.value, _slots, true);

		// update the prize pool for this game
		prizePools[_gameId] += msg.value;

		// save wallet address for the game
		emit FeeDeposited(_gameId, msg.sender, msg.value);
	}

	// enter a match one or more times depending on the number of slots purchased
	// anyone can enter a match
	// can't enter a match without depositing fee
	function enterMatch(string calldata _gameId, string calldata randomSeed) public seedLength(randomSeed) {
		MatchInfo memory matchInfo = matches[_gameId];
		DepositInfo memory depositInfo = deposits[_gameId][msg.sender];

		// match must be started
		require(matchInfo.matchStatus == MatchStatus.Started, "match not started");

		// verify if deposit was called before entering
		require(depositInfo.deposited, "deposit required");

		// deposit should equal floor price * slots
		require(depositInfo.depositAmount == depositInfo.slots * matchInfo.floorPrice, "incorrect deposit");

		// enter match
		address[] storage _players = players[_gameId];

		// check for re-entry
		// don't allow if address already exists
		require(wallets[_gameId][msg.sender] == 0, "re-entry not allowed");

		// add players by number of slots
		for (uint i = 0; i < depositInfo.slots; i++) {
			_players.push(msg.sender);
		}
		players[_gameId] = _players;
		wallets[_gameId][msg.sender] = 1;
		randomSeeds[_gameId] = rando.concat(randomSeeds[_gameId], randomSeed);
	}

	// only by the contract owner or the one that started this match
	// can only call once because the match end ended after picking a winner
	function pickWinner(string calldata _gameId, string calldata _randomSeed) public virtual ownerOrStarter(_gameId) {
		MatchInfo memory matchInfo = matches[_gameId];
		// the current match must be in progress
		require(matchInfo.matchStatus == MatchStatus.Started, "match ended");
		// check if its too early to pick a winner
		require(block.timestamp >= matchInfo.timeStarted + matchInfo.duration, "too early");
		// check if there are players in the game
		address[] memory _players = players[_gameId];
		require(_players.length > 0, "no players");
		// generate a random large number from the distributed random seed
		uint largeNumber = rando.random(rando.concat(randomSeeds[_gameId], _randomSeed));
		uint index = largeNumber % _players.length;
		// ensure the index is within the range
		require(index >= 0 && index < _players.length, "invalid index");
		// shuffle addresses because slots insert sequentially
		arrayUtils.shuffleAddresses(_players);
		// pick the winner from the randomly selected index
		address winner = _players[index];
		// set aside the winning amount
		require(prizePools[_gameId] > 0, "pool dry");
		// 80% goes to the winner
		uint winningAmount = (prizePools[_gameId] * 4) / 5;
		winnings[_gameId][winner] = winningAmount;
		// finish the match
		matchInfo.matchStatus = MatchStatus.Finished;
		// set the state
		matches[_gameId] = matchInfo;
		// transfer the remaining amount to external wallet
		externalWallet.transfer(prizePools[_gameId] - winningAmount);
		emit WinnerPicked(_gameId, winner, index, winningAmount);
	}

	function claimPrize(string calldata _gameId) public payable virtual {
		// forbid smart contracts from calling this function
		// require(msg.sender != tx.origin, "forbidden");
		uint prizeAmount = winnings[_gameId][msg.sender];
		// ensure caller is the winner
		require(prizeAmount > 0, "unauthorized");
		// ensure this prize hasn't been claimed before
		require(claims[_gameId][msg.sender] == 0, "duplicate claim");
		claims[_gameId][msg.sender] = prizeAmount;
		// transfer from the contract to the winner address
		require(getPrizePool(_gameId) >= prizeAmount, "pool dry");
		require(address(this).balance >= prizeAmount, "insufficient funds");
		prizePools[_gameId] -= prizeAmount;
		payable(msg.sender).transfer(prizeAmount);
		emit PrizeClaimed(_gameId, msg.sender, prizeAmount);
	}
}
