const Payday = artifacts.require("Payday");

require('chai')
    .use(require('chai-as-promised'))
    .should();

contract('Payday', ([deployer, seller, buyer]) => {
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
            assert.equal(name, 'Payday marketplace');
        });
    });

    describe('products', async () => {
        let result, productCount;

        before (async () => {
            result = await payday.createProduct('MacBook Pro', web3.utils.toWei('1', 'ether'), { from: seller });
            productCount = await payday.productCount();
        });

        it('create product', async () => {
            // SUCCESS
            assert.equal(productCount, 1);
            const event = result.logs[0].args;
            assert.equal(event.id.toNumber(), productCount.toNumber(), "id is correct");
            assert.equal(event.name, 'MacBook Pro', "name is correct");
            assert.equal(event.price, web3.utils.toWei('1', 'ether'), "price is correct");
            assert.equal(event.owner, seller, "owner is correct");
            assert.equal(event.purchased, false, "purchased is correct");

            // FAILURE
            await payday.createProduct('', web3.utils.toWei('1', 'ether'), { from: seller }).should.be.rejected;
            await payday.createProduct('MacBook Pro', 0, { from: seller }).should.be.rejected;
        });
    });
});