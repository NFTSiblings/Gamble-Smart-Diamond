// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**************************************************************\
 * Initialiser contract authored by Sibling Labs
 * Version 0.4.0
 * 
 * This initialiser contract has been written specifically for
 * ERC721A-DIAMOND-TEMPLATE by Sibling Labs
/**************************************************************/

import { GlobalState } from "./libraries/GlobalState.sol";
import { AllowlistLib } from "./libraries/AllowlistLib.sol";
import { CenterFacetLib } from "./libraries/CenterFacetLib.sol";
import { ERC165Lib } from "./libraries/ERC165Lib.sol";
import "erc721a-upgradeable/contracts/ERC721AStorage.sol";
import "erc721a-upgradeable/contracts/ERC721A__InitializableStorage.sol";
import { PaymentSplitterLib } from "./libraries/PaymentSplitterLib.sol";
import { SaleHandlerLib } from "./libraries/SaleHandlerLib.sol";
import { RoyaltiesConfigLib } from "./libraries/RoyaltiesConfigLib.sol";

contract DiamondInit {

    function initAll() public {
        initAdminPrivilegesFacet();
        initAllowlistFacet();
        initCenterFacet();
        initERC165Facet();
        initPaymentSplitterFacet();
        initSaleHandlerFacet();
        initRoyaltiesConfigFacet();
    }

    // AdminPrivilegesFacet //

    function initAdminPrivilegesFacet() public {
        // List of admins must be placed inside this function,
        // as arrays cannot be constant and
        // therefore will not be accessible by the
        // delegatecall from the diamond contract.
        address[] memory admins = new address[](1);
        admins[0] = 0x885Af893004B4405Dc18af1A4147DCDCBdA62b50;

        for (uint256 i; i < admins.length; i++) {
            GlobalState.getState().admins[admins[i]] = true;
        }
    }

    // AllowlistFacet //

    bytes32 private constant merkleRoot = 0x55e8063f883b9381398d8fef6fbae371817e8e4808a33a4145b8e3cdd65e3926;

    function initAllowlistFacet() public {
        AllowlistLib.getState().merkleRoot = merkleRoot;
    }

    // CenterFacet //

    uint256 private constant maxSupply = 10000;
    string private constant baseURI = "https://gateway.pinata.cloud/ipfs/.../?";

    string private constant name = "MyToken";
    string private constant symbol = "MTK";
    uint256 private constant startTokenId = 0;

    function initCenterFacet() public {
        // Variables in array format must be placed inside this
        // function, as arrays cannot be constant and therefore
        // will not be accessible by the delegatecall from the
        // diamond contract.
        uint256[] memory walletCaps = new uint256[](2);
        walletCaps[0] = 5;
        walletCaps[1] = 20;

        uint256[] memory prices = new uint256[](2);
        prices[0] = 0.001 ether;
        prices[1] = 0.001 ether;

        CenterFacetLib.state storage s1 = CenterFacetLib.getState();

        s1.maxSupply = maxSupply;
        s1.walletCap = walletCaps;
        s1.price = prices;
        s1.baseURI = baseURI;

        ERC721AStorage.Layout storage s2 = ERC721AStorage.layout();

        s2._name = name;
        s2._symbol = symbol;
        s2._currentIndex = startTokenId;

        ERC721A__InitializableStorage.layout()._initialized = true;
    }

    // ERC165Facet //

    bytes4 private constant ID_IERC165 = 0x01ffc9a7;
    bytes4 private constant ID_IERC173 = 0x7f5828d0;
    bytes4 private constant ID_IERC2981 = 0x2a55205a;
    bytes4 private constant ID_IERC721 = 0x80ac58cd;
    bytes4 private constant ID_IERC721METADATA = 0x5b5e139f;
    bytes4 private constant ID_IDIAMONDLOUPE = 0x48e2b093;
    bytes4 private constant ID_IDIAMONDCUT = 0x1f931c1c;

    function initERC165Facet() public {
        ERC165Lib.state storage s = ERC165Lib.getState();

        s.supportedInterfaces[ID_IERC165] = true;
        s.supportedInterfaces[ID_IERC173] = true;
        s.supportedInterfaces[ID_IERC2981] = true;
        s.supportedInterfaces[ID_IERC721] = true;
        s.supportedInterfaces[ID_IERC721METADATA] = true;

        s.supportedInterfaces[ID_IDIAMONDLOUPE] = true;
        s.supportedInterfaces[ID_IDIAMONDCUT] = true;
    }

    // PaymentSplitterFacet //

    function initPaymentSplitterFacet() public {
        // Lists of payees and shares must be placed inside this
        // function, as arrays cannot be constant and therefore
        // will not be accessible by the delegatecall from the
        // diamond contract.
        address[] memory payees = new address[](1);
        payees[0] = 0x699a1928EA12D21dd2138F36A3690059bf1253A0;

        uint256[] memory shares = new uint256[](1);
        shares[0] = 1;

        require(payees.length == shares.length, "PaymentSplitter: payees and shares length mismatch");
        require(payees.length > 0, "PaymentSplitter: no payees");

        for (uint256 i = 0; i < payees.length; i++) {
            PaymentSplitterLib._addPayee(payees[i], shares[i]);
        }
    }

    // SaleHandlerFacet //

    uint256 private constant privSaleTimestamp = 1666097506;
    uint256 private constant privSaleLength = 86400;
    uint256 private constant publicSaleLength = 86400;

    function initSaleHandlerFacet() public {
        SaleHandlerLib.state storage s = SaleHandlerLib.getState();

        s.saleTimestamp = privSaleTimestamp;
        s.privSaleLength = privSaleLength;
        s.publicSaleLength = publicSaleLength;
    }

    // RoyaltiesConfigFacet //

    address payable private constant royaltyRecipient = payable(0x699a1928EA12D21dd2138F36A3690059bf1253A0);
    uint256 private constant royaltyBps = 1000;

    function initRoyaltiesConfigFacet() public {
        RoyaltiesConfigLib.state storage s = RoyaltiesConfigLib.getState();

        s.royaltyRecipient = royaltyRecipient;
        s.royaltyBps = royaltyBps;
    }

}