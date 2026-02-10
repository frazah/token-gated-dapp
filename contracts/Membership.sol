// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title Membership
 * @dev Contratto NFT (ERC721) che rappresenta l'appartenenza a un gruppo.
 * Solo il proprietario del contratto può creare mintare nuovi NFT.
 * Ogni NFT è unico e dà diritto ad accedere ai contenuti premium.
 */
contract Membership is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    constructor() ERC721("MembershipCard", "MBR") Ownable() {}

    /**
     * @dev Crea un nuovo NFT e lo assegna a un indirizzo specificato.
     * Può essere chiamata solo dal proprietario del contratto.
     * @param to L'indirizzo che riceverà il nuovo NFT.
     */
    function mint(address to) public onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
    }
}
