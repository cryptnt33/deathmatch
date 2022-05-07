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
		string calldata randomSeed
	) external ownerOrDelegator seedLength(randomSeed) {
		uint timestamp = block.timestamp;
		MatchInfo memory info = matches[_gameId];
		require(info.matchStatus == MatchStatus.NotStarted, "match in-progress");
		matches[_gameId] = MatchInfo(MatchStatus.Started, timestamp, 0, _floorPrice, _maxSlots, msg.sender);
		randomSeeds[_gameId] = randomSeed;
		emit MatchStarted(_gameId, timestamp);
	}

	// anyone can deposit fee
	function depositFee(string calldata _gameId, uint _slots) external payable {
		MatchInfo memory info = matches[_gameId];
		DepositInfo memory depositInfo = deposits[_gameId][msg.sender];
		require(info.matchStatus == MatchStatus.Started, "match not started");
		require(_slots >= 1 && _slots <= info.maxSlotsPerWallet, "slot limit exceeded");
		require(msg.value == info.floorPrice * _slots, "incorrect deposit");
		require(!depositInfo.deposited, "re-entry not allowed");

		// transfer to the wallet address
		deposits[_gameId][msg.sender] = DepositInfo(msg.value, _slots, true);
		prizePools[_gameId] += msg.value;
		// externalWallet.transfer(msg.value);
		emit FeeDeposited(_gameId, msg.sender, msg.value);
	}

	// enter a match one or more times depending on the number of slots purchased
	// anyone can enter a match
	// can't enter a match without depositing fee
	function enterMatch(string calldata _gameId, string calldata randomSeed) external seedLength(randomSeed) {
		MatchInfo storage matchInfo = matches[_gameId];
		DepositInfo storage depositInfo = deposits[_gameId][msg.sender];

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
	function pickWinner(string calldata _gameId, string calldata _randomSeed) external virtual ownerOrStarter(_gameId) {
		MatchInfo memory matchInfo = matches[_gameId];
		require(matchInfo.matchStatus == MatchStatus.Started, "match ended");
		address[] memory _players = players[_gameId];
		require(_players.length > 0, "no players");
		uint largeNumber = rando.random(rando.concat(randomSeeds[_gameId], _randomSeed));
		uint index = largeNumber % _players.length;
		require(index >= 0 && index < _players.length, "invalid index");
		// shuffle addresses
		arrayUtils.shuffleAddresses(_players);
		address winner = _players[index];
		// set aside the winning amount
		require(prizePools[_gameId] > 0, "prize pool is empty");
		uint winningAmount = (prizePools[_gameId] * 4) / 5;
		winnings[_gameId][winner] = winningAmount;
		matchInfo.matchStatus = MatchStatus.Finished;
		matchInfo.timeEnded = block.timestamp;
		matches[_gameId] = matchInfo;
		// transfer the remaining amount to external wallet
		externalWallet.transfer(prizePools[_gameId] - winningAmount);
		emit WinnerPicked(_gameId, winner, index, winningAmount);
	}

	function claimPrize(string calldata _gameId) external payable {
		// forbid smart contracts from calling this function
		// require(msg.sender != tx.origin, "forbidden");
		uint prizeAmount = winnings[_gameId][msg.sender];
		// ensure caller is the winner
		require(prizeAmount > 0, "unauthorized");
		// ensure this prize hasn't been claimed before
		require(claims[_gameId][msg.sender] == 0, "duplicate claim");
		claims[_gameId][msg.sender] = prizeAmount;
		// transfer from the contract to the winner address
		address payer = address(this);
		require(payer.balance >= prizeAmount, "insufficient funds");
		address payable winner = payable(msg.sender);
		winner.transfer(prizeAmount);
		emit PrizeClaimed(_gameId, msg.sender, prizeAmount);
	}
}
