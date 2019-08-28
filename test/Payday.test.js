const Payday = artifacts.require("Payday");

contract('Payday', (accounts) => {
    let payday;

    before (async () => {
        payday = await Payday.deployed();
    });

    describe('deployment', async () => {
        it('deploys successfully', async () => {
            const address = await payday.address;
            assert.notEqual(address, 0x0);
            assert.notEqual(address, '');
            assert.notEqual(address, null);
            assert.notEqual(address, undefined);
        });

        it('has a name', async () => {
            const name = await payday.name();
            assert.equal(name, 'Payday marketplace')
        });
    });
});