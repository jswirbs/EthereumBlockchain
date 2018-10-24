const ERCToken = artifacts.require('ERCToken')
const TokenExchange = artifacts.require('TokenExchange')

var token
var exchange
const STARTING_AMOUNT = 1000
const AMOUNT = 100
const PRICE = 2

contract('ERCToken', function (accounts) {

  beforeEach(function () {
    return ERCToken.new(STARTING_AMOUNT, {from: accounts[0]}).then(function(instance) {
      token = instance
      return TokenExchange.new()
    }).then(function (instance) {
      exchange = instance
    })
  })

  it('should allow a user that calls approve on the token to deposit', function () {
    return token.approve(exchange.address, AMOUNT, {from: accounts[0]}).then(function () {
      return exchange.depositToken(token.address, AMOUNT)
    }).then(function () {
      return token.balanceOf.call(accounts[0])
    }).then(function (balance) {
      assert.equal(balance, STARTING_AMOUNT - AMOUNT)
      return exchange.getTokenBalance.call(accounts[0], token.address)
    }).then(function(balance) {
      assert.equal(balance, AMOUNT)
    })
  })

  it('should not allow a user that does not call approve on the token to deposit', function () {
    return token.approve(exchange.address, 0, {from: accounts[0]}).then(function () {
      return exchange.depositToken(token.address, 1)
    }).then(function () {
      assert.isTrue(false, "should have thrown an error above!")
    }).catch((err) => {
      assert.match(err, /invalid opcode/)
    })
  })


  it('should allow a user who deposited tokens to sell them', function () {
    return token.approve(exchange.address, AMOUNT, {from: accounts[0]}).then(function () {
      return exchange.depositToken(token.address, AMOUNT)
    }).then(function () {
      return exchange.sellTokens(token.address, AMOUNT, PRICE)
    }).then(function() {
      //
    })
  })

  it('should not allow a user to sell tokens they didnt deposit', function () {
    return exchange.sellTokens(token.address, AMOUNT, 1).then(function () {
      assert.isTrue(false, "should have thrown an error!")
    }).catch((err) => {
      assert.match(err, /invalid opcode/)
    })
  })

  it('should allow a user to buy tokens that are for sale', function () {
    return token.approve(exchange.address, AMOUNT, {from: accounts[0]}).then(function () {
      return exchange.depositToken(token.address, AMOUNT, {from: accounts[0]})
    }).then(function () {
      return exchange.sellTokens(token.address, AMOUNT, PRICE, {from: accounts[0]})
    }).then(function() {
      return exchange.buyToken(accounts[0], token.address, AMOUNT, {from: accounts[1], value: AMOUNT * PRICE})
    }).then(function() {
      return exchange.getTokenBalance.call(accounts[1], token.address)
    }).then(function(balance) {
      assert.equal(balance, AMOUNT)
    })
  })

  it('should not allow a user to buy tokens that are not for sale', function () {
    return exchange.buyToken(accounts[0], token.address, AMOUNT, {from: accounts[1], value: 100}).then(function () {
      return exchange.getTokenBalance.call(accounts[1], token.address)
    }).catch((err) => {
      assert.match(err, /invalid opcode/)
    })
  })

  it('should allow a user to take out their tokens after buying them', function () {
    return token.approve(exchange.address, AMOUNT, {from: accounts[0]}).then(function () {
      return exchange.depositToken(token.address, AMOUNT, {from: accounts[0]})
    }).then(function () {
      return exchange.sellTokens(token.address, AMOUNT, PRICE, {from: accounts[0]})
    }).then(function() {
      return exchange.buyToken(accounts[0], token.address, AMOUNT, {from: accounts[1], value: AMOUNT * PRICE})
    }).then(function() {
      return exchange.getTokenBalance.call(accounts[1], token.address)
    }).then(function(balance) {
      assert.equal(balance, AMOUNT)
      return exchange.withdrawToken(token.address, AMOUNT, {from: accounts[1]})
    }).then(function () {
      return token.balanceOf.call(accounts[1])
    }).then(function (balance) {
      assert.equal(balance, AMOUNT)
    })
  })

  it('should not allow a user to take out tokens after no purchase', function () {
    return token.approve(exchange.address, AMOUNT, {from: accounts[0]}).then(function () {
      return exchange.depositToken(token.address, AMOUNT, {from: accounts[0]})
    }).then(function () {
      return exchange.sellTokens(token.address, AMOUNT, PRICE, {from: accounts[0]})
    }).then(function() {
      return exchange.getTokenBalance.call(accounts[1], token.address)
    }).then(function(balance) {
      assert.equal(balance, 0)
      return exchange.withdrawToken(token.address, AMOUNT, {from: accounts[1]})
    }).catch((err) => {
      assert.match(err, /invalid opcode/)
    })
  })

  it('should not allow a user to take out tokens after failed purchase', function () {
    var errorThrown = false
    return token.approve(exchange.address, AMOUNT, {from: accounts[0]}).then(function () {
      return exchange.depositToken(token.address, AMOUNT, {from: accounts[0]})
    }).then(function () {
      return exchange.sellTokens(token.address, AMOUNT, PRICE, {from: accounts[0]})
    }).then(function() {
      return exchange.buyToken(accounts[0], token.address, AMOUNT + 1, {from: accounts[1], value: AMOUNT * PRICE})
    }).catch((err) => {
      errorThrown = true
      assert.match(err, /invalid opcode/)
    }).then(function() {
      assert.isTrue(errorThrown)
      return exchange.getTokenBalance.call(accounts[1], token.address)
    }).then(function(balance) {
      assert.equal(balance, 0)
      return exchange.withdrawToken(token.address, AMOUNT, {from: accounts[1]})
    }).catch((err) => {
      assert.match(err, /invalid opcode/)
    })
  })

  it('should allow a seller to withdraw tokens that are for sale', function () {
    return token.approve(exchange.address, AMOUNT, {from: accounts[0]}).then(function () {
      return exchange.depositToken(token.address, AMOUNT, {from: accounts[0]})
    }).then(function () {
      return exchange.sellTokens(token.address, AMOUNT, PRICE, {from: accounts[0]})
    }).then(function() {
      return exchange.withdrawToken(token.address, AMOUNT, {from: accounts[0]})
    }).then(function () {
      return exchange.getTokenBalance.call(accounts[0], token.address)
    }).then(function (balance) {
      assert.equal(balance, 0)
      return token.balanceOf.call(accounts[0])
    }).then(function (balance) {
      assert.equal(balance.toNumber(), STARTING_AMOUNT)
    })
  })

  it('should not allow a user to buy tokens if they dont pay for them', function () {
    var errorThrown
    return token.approve(exchange.address, AMOUNT, {from: accounts[0]}).then(function () {
      return exchange.depositToken(token.address, AMOUNT, {from: accounts[0]})
    }).then(function () {
      return exchange.sellTokens(token.address, AMOUNT, PRICE, {from: accounts[0]})
    }).then(function() {
      return exchange.buyToken(accounts[0], token.address, AMOUNT, {from: accounts[1], value: AMOUNT * PRICE - 1})
    }).catch((err) => {
      errorThrown = true
      assert.match(err, /invalid opcode/)
    }).then(function() {
      assert.isTrue(errorThrown)
      return exchange.getTokenBalance.call(accounts[1], token.address)
    }).then(function(balance) {
      assert.equal(balance, 0)
    })
  })
})
