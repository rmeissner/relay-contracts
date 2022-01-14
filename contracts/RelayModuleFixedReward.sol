// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity >=0.8.0 <0.9.0;

import "./interfaces/Safe.sol";

/// @title Relay Module with fixed Reward
/// @author Richard Meissner - @rmeissner
contract RelayModuleFixedReward {

    string public constant VERSION = "1.0.0";

    error RewardPaymentFailure();

    error RewardPaymentMissing();

    error RelayExecutionFailure();

    error InvalidRelayData();

    uint256 public immutable reward;
    bytes4 public immutable relayMethod;

    constructor(uint256 _reward, bytes4 _relayMethod) {
        reward = _reward;
        relayMethod = _relayMethod;
    }

    function payReward(address relayTarget, address rewardReceiver) internal {
        uint256 receiverBalance = rewardReceiver.balance;

        // Transfer reward before execution to make sure that reward can be paid, revert otherwise
        if (!Safe(relayTarget).execTransactionFromModule(rewardReceiver, reward, "", 0)) revert RewardPaymentFailure();

        // Check that reward transfer really happened
        if (rewardReceiver.balance < receiverBalance + reward) revert RewardPaymentMissing();
    }

    function relayCall(
        address relayTarget,
        bytes calldata relayData
    ) internal {
        // Check relay data to avoid that module can be abused for arbitrary interactions
        if (bytes4(relayData[:4]) != relayMethod) revert InvalidRelayData();

        // Perform relay call and require success to avoid that user paid for failed transaction
        (bool success, ) = relayTarget.call(relayData);
        if (!success) revert RelayExecutionFailure();
    }

    function relayTransaction(
        address relayTarget,
        bytes calldata relayData,
        address rewardReceiver
    ) public {
        payReward(relayTarget, rewardReceiver);

        relayCall(relayTarget, relayData);
    }

    function relayTransactionOptimistic(
        address relayTarget,
        bytes calldata relayData,
        address rewardReceiver
    ) public {
        relayCall(relayTarget, relayData);
        
        payReward(relayTarget, rewardReceiver);
    }
}
