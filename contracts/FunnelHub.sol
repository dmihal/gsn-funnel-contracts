pragma solidity >=0.6.2 <0.7.0;

import "@openzeppelin/contracts/GSN/IRelayHub.sol";
import "./Funnel.sol";

contract FunnelHub {
  mapping(address => address) private funnels;

  IRelayHub relayHub = IRelayHub(0xD216153c06E857cD7f72665E0aF1d7D82172F494);

  function calculateFunnelAddress(address target) external view returns (address) {
    bytes32 salt = bytes32(bytes20(target));

    address predictedAddress = address(uint(keccak256(abi.encodePacked(
      byte(0xff),
      address(this),
      salt,
      keccak256(abi.encodePacked(type(Funnel).creationCode))
    ))));

    return predictedAddress;
  }

  function createFunnel(address target) external payable {
    bytes32 salt = bytes32(bytes20(target));
    Funnel funnel = new Funnel{salt: salt}();

    funnels[address(funnel)] = target;

    if (msg.value > 0) {
      relayHub.depositFor{value: msg.value}(target);
    }
  }

  receive() external payable {
    require(funnels[msg.sender] != address(0));
    relayHub.depositFor{value: msg.value}(funnels[msg.sender]);
  }
}
