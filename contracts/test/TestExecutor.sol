// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity >=0.8.0;

import "../interfaces/Safe.sol";

contract TestExecutor is Safe {
    address public module;

    receive() external payable {}

    function enableModule(address _module) external {
        module = _module;
    }

    function execTransaction(
        address to,
        uint256 value,
        bytes calldata data,
        uint8 operation,
        uint256,
        uint256,
        uint256,
        address,
        address payable,
        bytes memory
    ) external payable returns (bool success) {
        exec(payable(to), value, data, operation);
        return true;
    }

    function exec(address payable to, uint256 value, bytes calldata data, uint operation) public {
        bool success;
        bytes memory response;
        if (operation == 0)
            (success,response) = to.call{value: value}(data);
        else 
            (success,response) = to.delegatecall(data);
        if(!success) {
            assembly {
                revert(add(response, 0x20), mload(response))
            }
        }
    }

    function execTransactionFromModule(
        address to,
        uint256 value,
        bytes calldata data,
        uint8 operation
    ) external returns (bool success) {
        require(msg.sender == module, "TestExecutor: Not authorized");
        if (operation == 1) (success, ) = to.delegatecall(data);
        else (success, ) = payable(to).call{value: value}(data);
    }
}