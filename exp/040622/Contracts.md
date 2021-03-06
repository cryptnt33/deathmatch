# Game NFT contract

The purpose of this contract is to create an ERC721 compliant NFT. This NFT will be used by the app to let players enter a game. Players are the end customers with a metamask wallet with one or more external accounts. Games are designed by the developers of the app to let players use their game NFTs as tokens to enter a game. A token can be purchased in the app at a pre-determined price through minting or reuse. Tokens that are unused (minted but not used to enter a game) can be traded at the app marketplace. When this token is used to enter the game it is transferred from the player address to the contract address. This general purpose NFT with no unique trait except its token Id proves ownership of a game token and to claim a win (if applicable).

Features:
(external or public functions unless otherwise specified)

- mint: creates a new token and transfers the ethers to the treasury
- transfer: transfers the token to a new address. The new address could be an external account or the contract
- burn: destroy a token by transferring it to the contract address

Properties:
(public getters and owner only setters unless otherwise specified)

- max supply: limits the number of tokens (uint)
- current supply: counter to keep track of how many tokens are already minted (uint)
- map of owners and tokens: to keep track of the number of tokens created by a player (map(address=>uint))
- list of players: number of addresses that minted a token (uint[])
- token Id: an incrementing numerical ID of the token (uint)
- token metadata: none except the token Id (map(uint=>struct))
- floor price: the current price of each token (uint)
- mint limit: limit on how many tokens can be minted at a time

Events:

- minted
- transferred
- burned
- floor price changed
- new player joined

# Deathmatch game contract

The purpose of this contract is to start, enter, end, and pick a winner for a game. Game mechanics: Ethers pooled from all players while the game is in progress. At the end of the game 75% of the pooled ether is awarded to a randomly picked winner. The protocol keeps 25% of the pooled ether. A new game is started by the contract owner or a delegated address each day. Players can purchase game tokens and then they play by depositing one or more tokens. A winner is picked by token not by account address - it means that by entering with more than one token a player can increase its chances to win.

UX to create a game (admins or delegated addresses only):

- button: start a game

UX to enter a game (public):

- step 1: pick a game to enter from a list of active games
- step 2: deposit ethers
  - show floor price
  - dropdown: 1..10 count of tickets
  - button: deposit (count x floor)
- step 4: enter the game

Features:
(external or public functions unless otherwise specified)

- deposit platform tokens (AVAX, FTM, etc.) to enter a game
- start
  - generate a non-intuitive game Id
  - set start time
- enter
  - use the game Id to enter
  - populate game map with tokens
  - verify token Id and ether map exists in treasury
- end
- pick a winner
- claim prize

Properties:
(public getters and setters)

- floor price
- map of game and players (map(uint=>struct))
  - tokens (struct[])
    - address
    - token Id (uint)
  - start time (uint)
  - end time (uint)
  - winner (address)
  - tokens (uint[])

Events:

- game started
- player entered
- game ended
- winner chosen
- prize claimed

Validation checks:

- transfer the tokens to game contract
- verify token Id and ether deposited in the treasury

Game basic functions:

- start
- deposit fee
- enter
- pick winner
- claim prize

Game execution stratgies:

- time strategy e.g. match ends in 3 days
- target prize strategy e.g. win 1 BTC or 1 Otherside deed. This requires a target amount e.g. 100 AVAX
- giveaways for promotion: 0 floor prize, 1 max slot, starting a match requires hydrating the prize pool

Game winning strategies:

- only 1 winner
  - max slots greater than 1
  - lower floor
  - 1 winner with a fixed share of the prize pool e.g. winner gets 75% of the prize pool
- multiple winners
  - max slots equal to 1
  - higher floor
  - fixed number
    - x winners with a variable share of the prize pool e.g. gold wins 35% of the prize pool, silver gets 25%, and bronze gets 15%
    - y winners with a fixed share of the prize pool e.g. 3 winners; each get 1 NFT or 25% of the prize pool
  - percentage
    - 10% of all players with a fixed share of the prize pool e.g. top 10% players get 35% of the prize pool, next 10% get 25%, next 10% get 15%

Contract design:

- MatchBase
  - Args
    - MatchArgs () //abstract or interface
    - DepositArgs (uint slots) //abstract or interface
    - StartArgs (string gameId, MatchArgs args)
    - EnterArgs (string gameId, DepositArgs args)
    - PickArgs (string gameId)
    - ClaimArgs (string gameId)
  - functions
    - startMatch(StartArgs args)
    - depositFee(DepositArgs args)
    - enter(EnterArgs args)
    - pickWinner(PickArgs args)
    - claim(ClaimArgs args)
