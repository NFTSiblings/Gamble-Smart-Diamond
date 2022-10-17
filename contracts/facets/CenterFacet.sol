// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/**************************************************************\
 * CenterFacet authored by Sibling Labs
 * Version 0.5.0
 * 
 * This facet contract has been written specifically for
 * Gamble-Smart-Diamond by Sibling Labs
/**************************************************************/

import { GlobalState } from "../libraries/GlobalState.sol";
import { CenterFacetLib } from "../libraries/CenterFacetLib.sol";
import { SaleHandlerLib } from "../libraries/SaleHandlerLib.sol";
import { AllowlistLib } from "../libraries/AllowlistLib.sol";

import 'erc721a-upgradeable/contracts/ERC721AUpgradeable.sol';
import 'erc721a-upgradeable/contracts/extensions/ERC721AQueryableUpgradeable.sol';

contract CenterFacet is ERC721AUpgradeable, ERC721AQueryableUpgradeable {

    // EVENTS //
    
    event gambleResult(bool result, uint256 tokenId, uint256 newLevel);

    // VARIABLE GETTERS //

    function maxSupply() external view returns (uint256) {
        return CenterFacetLib.getState().maxSupply;
    }

    function walletCapAL() external view returns (uint256) {
        return CenterFacetLib.getState().walletCap[0];
    }

    function walletCap() external view returns (uint256) {
        return CenterFacetLib.getState().walletCap[1];
    }

    function priceAL() external view returns (uint256) {
        return CenterFacetLib.getState().price[0];
    }

    function price() external view returns (uint256) {
        return CenterFacetLib.getState().price[1];
    }

    function burnStatus() external view returns (bool) {
        return CenterFacetLib.getState().burnStatus;
    }

    function level(uint256 tokenId) external view returns (uint256) {
        require(_exists(tokenId), "Token does not exist");
        return CenterFacetLib.getState().level[tokenId];
    }

    // SETUP & ADMIN FUNCTIONS //

    function setPrices(uint256 _price, uint256 _priceAL) external {
        GlobalState.requireCallerIsAdmin();
        CenterFacetLib.getState().price[0] = _priceAL;
        CenterFacetLib.getState().price[1] = _price;
    }

    function setWalletCaps(uint256 _walletCap, uint256 _walletCapAL) external {
        GlobalState.requireCallerIsAdmin();
        CenterFacetLib.getState().walletCap[0] = _walletCapAL;
        CenterFacetLib.getState().walletCap[1] = _walletCap;
    }

    function toggleBurnStatus() external {
        GlobalState.requireCallerIsAdmin();
        CenterFacetLib.getState().burnStatus = !CenterFacetLib.getState().burnStatus;
    }

    function setBaseURI(string memory URI) external {
        GlobalState.requireCallerIsAdmin();
        CenterFacetLib.getState().baseURI = URI;
    }

    function reserve(uint256 amount) external {
        GlobalState.requireCallerIsAdmin();
        _safeMint(msg.sender, amount);
    }

    // PUBLIC FUNCTIONS //

    function mint(uint256 amount, bytes32[] calldata _merkleProof) external payable {
        GlobalState.requireContractIsNotPaused();

        bool al = SaleHandlerLib.isPrivSaleActive();
        if (al)  {
            AllowlistLib.requireValidProof(_merkleProof);
        } else {
            require(SaleHandlerLib.isPublicSaleActive(), "CenterFacet: token sale is not available now");
        }

        CenterFacetLib.state storage s = CenterFacetLib.getState();

        uint256 _price = al ? s.price[0] : s.price[1];
        require(msg.value == _price * amount, "CenterFacet: incorrect amount of ether sent");

        uint256 _walletCap = al ? s.walletCap[0] : s.walletCap[1];
        require(
            amount + _numberMinted(msg.sender) <= _walletCap,
            string(
                abi.encodePacked(
                    "CenterFacet: maximum tokens per wallet during ",
                    al ? "private" : "public",
                    " sale is ",
                    _toString(_walletCap)
                )
            )
        );

        _safeMint(msg.sender, amount);
    }

    function burn(uint256 tokenId) external {
        GlobalState.requireContractIsNotPaused();
        require(CenterFacetLib.getState().burnStatus, "CenterFacet: token burning is not available now");

        _burn(tokenId, true);
    }

    function gamble(uint256 tokenId) external {
        GlobalState.requireContractIsNotPaused();
        require(
            ownerOf(tokenId) == msg.sender ||
            getApproved(tokenId) == msg.sender ||
            isApprovedForAll(ownerOf(tokenId), msg.sender),
            "Must own token to gamble"
        );

        bool result = getRandom(tokenId);
        if (result){
            CenterFacetLib.getState().level[tokenId]++;
        }
        else {
            _burn(tokenId, true);
        }
        emit gambleResult(result, tokenId, CenterFacetLib.getState().level[tokenId]);
    }

    // METADATA & MISC FUNCTIONS //

    function exists(uint256 tokenId) external view returns (bool) {
        return _exists(tokenId);
    }

    function getRandom(uint256 tokenId) internal view returns (bool) {
        uint256 num = uint256(
            keccak256(
                abi.encodePacked(
                    tokenId, block.number, msg.sender, block.coinbase, block.timestamp
                )
            )
        ) % 2;
        return num > 0 ? true : false;
    }

    function _safeMint(address to, uint256 amount) internal override {
        require(
            _totalMinted() + amount <= CenterFacetLib.getState().maxSupply,
            "CenterFacet: too few tokens remaining"
        );

        super._safeMint(to, amount);
    }

    function _baseURI() internal view override returns (string memory) {
        return CenterFacetLib.getState().baseURI;
    }

    function _beforeTokenTransfers(
        address from,
        address to,
        uint256 startTokenId,
        uint256 quantity
    ) internal view override {
        GlobalState.requireContractIsNotPaused();
    }

}