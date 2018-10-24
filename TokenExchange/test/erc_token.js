const ERCToken = artifacts.require('ERCToken')

let ERC

contract('ERCToken', function (accounts) {

  it('creation: should create an initial balance of 10000 for the creator', function () {
    ERCToken.new(10000, {from: accounts[0]}).then(function (ctr) {
      return ctr.balanceOf.call(accounts[0])
    }).then(function (result) {
      assert.strictEqual(result.toNumber(), 10000)
    }).catch((err) => { throw new Error(err) })
  })

  it('transfers: should transfer 10000 to accounts[1] with accounts[0] having 10000', function () {
    var ctr
    return ERCToken.new(10000, {from: accounts[0]}).then(function (result) {
      ctr = result
      return ctr.transfer(accounts[1], 10000, {from: accounts[0]})
    }).then(function (result) {
      return ctr.balanceOf.call(accounts[1])
    }).then(function (result) {
      assert.strictEqual(result.toNumber(), 10000)
    }).catch((err) => { throw new Error(err) })
  })

  it('transfers: should fail when trying to transfer 10001 to accounts[1] with accounts[0] having 10000', function () {
    var ctr
    return ERCToken.new(10000, {from: accounts[0]}).then(function (result) {
      ctr = result
      return ctr.transfer.call(accounts[1], 10001, {from: accounts[0]})
    }).then(function (result) {
      assert.isFalse(true)
    }).catch((err) => {
      assert.match(err, /invalid opcode/)
    })
  })

// APPROVALS

  it('approvals: msg.sender should approve 100 to accounts[1]', function () {
    var ctr = null
    return ERCToken.new(10000, {from: accounts[0]}).then(function (result) {
      ctr = result
      return ctr.approve(accounts[1], 100, {from: accounts[0]})
    }).then(function (result) {
      return ctr.allowance.call(accounts[0], accounts[1])
    }).then(function (result) {
      assert.strictEqual(result.toNumber(), 100)
    }).catch((err) => { throw new Error(err) })
  })

  it('approvals: msg.sender approves accounts[1] of 100 & withdraws 20 once.', function () {
    var ctr = null
    return ERCToken.new(10000, {from: accounts[0]}).then(function (result) {
      ctr = result
      return ctr.balanceOf.call(accounts[0])
    }).then(function (result) {
      assert.strictEqual(result.toNumber(), 10000)
      return ctr.approve(accounts[1], 100, {from: accounts[0]})
    }).then(function (result) {
      return ctr.balanceOf.call(accounts[1])
    }).then(function (result) {
      assert.strictEqual(result.toNumber(), 0)
      return ctr.allowance.call(accounts[0], accounts[1])
    }).then(function (result) {
      assert.strictEqual(result.toNumber(), 100)
      return ctr.transferFrom.call(accounts[0], accounts[1], 20, {from: accounts[1]})
    }).then(function (result) {
      return ctr.transferFrom(accounts[0], accounts[1], 20, {from: accounts[1]})
    }).then(function (result) {
      return ctr.allowance.call(accounts[0], accounts[1])
    }).then(function (result) {
      assert.strictEqual(result.toNumber(), 80)
      return ctr.balanceOf.call(accounts[1])
    }).then(function (result) {
      assert.strictEqual(result.toNumber(), 20)
      return ctr.balanceOf.call(accounts[0])
    }).then(function (result) {
      assert.strictEqual(result.toNumber(), 9980)
    }).catch((err) => { throw new Error(err) })
  })

    // should approve 100 of msg.sender & withdraw 50, twice. (should succeed)
  it('approvals: msg.sender approves accounts[1] of 100 & withdraws 20 twice.', function () {
    var ctr = null
    return ERCToken.new(10000, {from: accounts[0]}).then(function (result) {
      ctr = result
      return ctr.approve(accounts[1], 100, {from: accounts[0]})
    }).then(function (result) {
      return ctr.allowance.call(accounts[0], accounts[1])
    }).then(function (result) {
      assert.strictEqual(result.toNumber(), 100)
      return ctr.transferFrom(accounts[0], accounts[1], 20, {from: accounts[1]})
    }).then(function (result) {
      return ctr.allowance.call(accounts[0], accounts[1])
    }).then(function (result) {
      assert.strictEqual(result.toNumber(), 80)
      return ctr.balanceOf.call(accounts[1])
    }).then(function (result) {
      assert.strictEqual(result.toNumber(), 20)
      return ctr.balanceOf.call(accounts[0])
    }).then(function (result) {
      assert.strictEqual(result.toNumber(), 9980)
            // FIRST tx done.
            // onto next.
      return ctr.transferFrom(accounts[0], accounts[1], 20, {from: accounts[1]})
    }).then(function (result) {
      return ctr.allowance.call(accounts[0], accounts[1])
    }).then(function (result) {
      assert.strictEqual(result.toNumber(), 60)
      return ctr.balanceOf.call(accounts[1])
    }).then(function (result) {
      assert.strictEqual(result.toNumber(), 40)
      return ctr.balanceOf.call(accounts[0])
    }).then(function (result) {
      assert.strictEqual(result.toNumber(), 9960)
    }).catch((err) => { throw new Error(err) })
  })

    // should approve 100 of msg.sender & withdraw 50 & 60 (should fail).
  it('approvals: msg.sender approves accounts[1] of 100 & withdraws 50 & 60 (2nd tx should fail)', function () {
    var ctr = null
    return ERCToken.new(10000, {from: accounts[0]}).then(function (result) {
      ctr = result
      return ctr.approve(accounts[1], 100, {from: accounts[0]})
    }).then(function (result) {
      return ctr.allowance.call(accounts[0], accounts[1])
    }).then(function (result) {
      assert.strictEqual(result.toNumber(), 100)
      return ctr.transferFrom(accounts[0], accounts[1], 50, {from: accounts[1]})
    }).then(function (result) {
      return ctr.allowance.call(accounts[0], accounts[1])
    }).then(function (result) {
      assert.strictEqual(result.toNumber(), 50)
      return ctr.balanceOf.call(accounts[1])
    }).then(function (result) {
      assert.strictEqual(result.toNumber(), 50)
      return ctr.balanceOf.call(accounts[0])
    }).then(function (result) {
      assert.strictEqual(result.toNumber(), 9950)
            // FIRST tx done.
            // onto next.
      return ctr.transferFrom.call(accounts[0], accounts[1], 60, {from: accounts[1]})
    }).then(function (result) {
      assert.isFalse(true)
    }).catch((err) => {
      assert.match(err, /invalid opcode/)
    })
  })

  it('approvals: attempt withdrawal from acconut with no allowance (should fail)', function () {
    var ctr = null
    return ERCToken.new(10000, {from: accounts[0]}).then(function (result) {
      ctr = result
      return ctr.transferFrom.call(accounts[0], accounts[2], 60, {from: accounts[1]})
    }).then(function (result) {
      assert.isFalse(true)
    }).catch((err) => {
      assert.match(err, /invalid opcode/)
    })
  })

  it('approvals: allow accounts[1] 100 to withdraw from accounts[0]. Withdraw 60 and then approve 0 & attempt transfer.', function () {
    var ctr = null
    return ERCToken.new(10000, {from: accounts[0]}).then(function (result) {
      ctr = result
      return ctr.approve(accounts[1], 100, {from: accounts[0]})
    }).then(function (result) {
      return ctr.transferFrom(accounts[0], accounts[2], 60, {from: accounts[1]})
    }).then(function (result) {
      return ctr.approve(accounts[1], 0, {from: accounts[0]})
    }).then(function (result) {
      return ctr.transferFrom.call(accounts[0], accounts[2], 10, {from: accounts[1]})
    }).then(function (result) {
      assert.isFalse(true)
    }).catch((err) => {
      assert.match(err, /invalid opcode/)
    })
  })
})
