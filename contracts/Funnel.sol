pragma solidity >=0.6.2 <0.7.0;
import "./FunnelHub.sol";

contract Funnel {
  address payable private hub;

  constructor() public {
    hub = payable(msg.sender);
  }

  receive() external payable {
    hub.call{value: address(this).balance}("");
  }
}
