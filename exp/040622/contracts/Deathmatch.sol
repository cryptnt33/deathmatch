//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./Matchbase.sol";
import "./ArrayUtils.sol";
import "./Rando.sol";
import "./MatchLib.sol";

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
		uint duration,
		string calldata randomSeed
	) public ownerOrDelegator seedLength(randomSeed) {
		uint timestamp = block.timestamp;
		MatchLib.MatchInfo memory info = matches[_gameId];
		require(info.matchStatus == MatchLib.MatchStatus.NotStarted, "match in-progress");
		matches[_gameId] = MatchLib.MatchInfo(MatchLib.MatchStatus.Started, timestamp, duration, _floorPrice, _maxSlots, msg.sender);
		randomSeeds[_gameId] = randomSeed;
		emit MatchStarted(_gameId, timestamp);
	}

	// anyone can deposit fee for a game
	// save deposit info for validation later
	// update the prize pool for this game
	// save wallet address for the game
	function depositFee(string calldata _gameId, uint _slots) public payable {
		MatchLib.MatchInfo memory info = matches[_gameId];
		MatchLib.DepositInfo storage depositInfo = deposits[_gameId][msg.sender];
		MatchLib.validateDeposit(info, depositInfo, _slots, block.timestamp, msg.value);
		deposits[_gameId][msg.sender] = MatchLib.DepositInfo(msg.value, _slots, true);
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
	function enterMatch(string calldata _gameId, string calldata randomSeed) public seedLength(randomSeed) {
		MatchLib.MatchInfo memory matchInfo = matches[_gameId];
		MatchLib.DepositInfo memory depositInfo = deposits[_gameId][msg.sender];
		MatchLib.validateEntry(matchInfo, depositInfo);
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
	function pickWinner(string calldata _gameId, string calldata _randomSeed) public virtual ownerOrStarter(_gameId) {
		MatchLib.MatchInfo memory matchInfo = matches[_gameId];
		address[] memory _players = players[_gameId];
		uint largeNumber = Rando.random(Rando.concat(randomSeeds[_gameId], _randomSeed));
		uint index = MatchLib.getWinnerIndex(matchInfo, block.timestamp, _players.length, largeNumber);
		address winner = _players[index];
		require(prizePools[_gameId] > 0, "pool dry");
		uint winningAmount = (prizePools[_gameId] * 4) / 5;
		winnings[_gameId][winner] = winningAmount;
		matchInfo.matchStatus = MatchLib.MatchStatus.Finished;
		matches[_gameId] = matchInfo;
		externalWallet.transfer(prizePools[_gameId] - winningAmount);
		emit WinnerPicked(_gameId, winner, index, winningAmount);
	}

	function claimPrize(string calldata _gameId) public payable virtual {
		uint prizeAmount = MatchLib.getPrizeAmount(_gameId, winnings, claims, address(this).balance, getPrizePool(_gameId));
		prizePools[_gameId] -= prizeAmount;
		payable(msg.sender).transfer(prizeAmount);
		emit PrizeClaimed(_gameId, msg.sender, prizeAmount);
	}
}
