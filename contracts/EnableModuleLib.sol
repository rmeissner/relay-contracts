// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity >=0.8.0 <0.9.0;

import "./interfaces/Safe.sol";

/// @title Library to enable an module
/// @notice Can be used during Safe createion and should be called via deletegate call
/// @author Richard Meissner - @rmeissner
contract EnableModuleLib {

    string public constant VERSION = "1.0.0";

    constructor() {
    }

    function enableModule(
        address module
    ) public {
        Safe(address(this)).enableModule(module);
    }
}
