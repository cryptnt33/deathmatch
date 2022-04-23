# Game NFT

The purpose of this contract is to create an ERC721 compliant NFT. This NFT will be used by the app to let players enter a game. Players are the end customers with a metamask wallet with one or more external accounts. Games are designed by the developers of the app to let players use their game NFTs as tokens to enter a game. A token can be purchased in the app at a pre-determined price through minting or reuse. Tokens that are unused (minted but not used to enter a game) can be traded at the app marketplace. When this token is used to enter the game it is transferred from the player address to the contract address. This general purpose NFT with no unique trait except its token Id proves ownership of a game token and to claim a win (if applicable).

Features:
(public or external functions)

- mint: creates a new token
- transfer: transfers the token to a new address (the new address could be an external account or the contract)
- burn: destroy a token by transferring it to the contract address

Properties:
(getters and setters)

- max supply: limits the number of tokens (uint)
- current supply: counter to keep track of how many tokens are already minted (uint)
- map of owners and tokens: to keep track of the number of tokens created by a player (map(address=>uint))
- list of players: number of addresses that minted a token (uint[])
- token Id: an incrementing numerical ID of the token (uint)
- token metadata: none except the token Id (map(uint=>struct))
