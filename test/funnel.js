const { deployRelayHub } = require('@openzeppelin/gsn-helpers');
const FunnelHub = artifacts.require('FunnelHub');
const IRelayHub = artifacts.require('IRelayHub');

const RELAYHUB_ADDRESS = '0xD216153c06E857cD7f72665E0aF1d7D82172F494';

contract('FunnelHub', function([user1]) {
  before(() => deployRelayHub(web3, { from: user1 }));

  it('Should load GSN with the funnel', async () => {
    const { address } = web3.eth.accounts.create();

    const relayHub = await IRelayHub.at(RELAYHUB_ADDRESS);
    const hub = await FunnelHub.new();
    const funnelAddress = await hub.calculateFunnelAddress(address);

    await hub.createFunnel(address);

    assert.notEqual(await web3.eth.getCode(funnelAddress), '0x');

    assert.equal(await relayHub.balanceOf(address), '0');

    const value = web3.utils.toWei('0.01', 'ether');

    await web3.eth.sendTransaction({
      from: user1,
      to: funnelAddress,
      value,
      gas: '1000000',
    });

    assert.equal(await relayHub.balanceOf(address), value);
  });

  it('Should load GSN with existing funds', async () => {
    const { address } = web3.eth.accounts.create();

    const relayHub = await IRelayHub.at(RELAYHUB_ADDRESS);
    const hub = await FunnelHub.new();
    const funnelAddress = await hub.calculateFunnelAddress(address);

    await web3.eth.sendTransaction({
      from: user1,
      to: funnelAddress,
      value: web3.utils.toWei('0.02', 'ether'),
      gas: '1000000',
    });

    await hub.createFunnel(address);

    assert.notEqual(await web3.eth.getCode(funnelAddress), '0x');

    assert.equal(await relayHub.balanceOf(address), '0');

    await web3.eth.sendTransaction({
      from: user1,
      to: funnelAddress,
      value: web3.utils.toWei('0.01', 'ether'),
      gas: '1000000',
    });

    assert.equal(await relayHub.balanceOf(address), web3.utils.toWei('0.03', 'ether'));
  });

  it('Should load funds during creation', async () => {
    const { address } = web3.eth.accounts.create();

    const relayHub = await IRelayHub.at(RELAYHUB_ADDRESS);
    const hub = await FunnelHub.new();
    const funnelAddress = await hub.calculateFunnelAddress(address);

    const value = web3.utils.toWei('0.01', 'ether');
    await hub.createFunnel(address, { value });

    assert.notEqual(await web3.eth.getCode(funnelAddress), '0x');

    assert.equal(await relayHub.balanceOf(address), value);
  });
});
