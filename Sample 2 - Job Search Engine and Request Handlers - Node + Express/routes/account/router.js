
 /*
  * app/routes/account/router.js
  *
  * Defines the API routes for /api/account
  */

  const models = require('../../models');
  const requestHelpers = require('../requestHelpers')
  const crypto = require('crypto');
  const Redis = require('../../auth').REDIS

  const accountRouter = require('express').Router()
  const AccountHandler = require('./accountHandler')
  const AccountHandlerInstance = new AccountHandler(models, requestHelpers, crypto, Redis);

  accountRouter.get('/',  AccountHandlerInstance.handleGetAccountDetails.bind(AccountHandlerInstance))
  accountRouter.post('/', AccountHandlerInstance.handleUpdateAccountDetails.bind(AccountHandlerInstance))
  accountRouter.post('/password/code/generate', AccountHandlerInstance.handleGeneratePasswordResetCode.bind(AccountHandlerInstance))
  accountRouter.post('/deactivate', AccountHandlerInstance.handleDeactivateAccount.bind(AccountHandlerInstance))
  accountRouter.delete('/', AccountHandlerInstance.handleDeleteAccount.bind(AccountHandlerInstance))
  
  module.exports = accountRouter;
  