
/**
* /app/auth/index.js
*  
* This file exposes an object for operations on the Redis data store.
*  
* @author Khalil Stemmler
*/

const config = require('../../config')
const redisClient = config.redisClient
const jwtHashName = 'jwtClients'
const passwordResetCodeHashName = 'passResetCode'
const fbHashName = 'fbAuthTokens'
const auth = {

  // ======================
  // === Redis ============
  // ======================

  // Redis client 
  // - used to maintain JWT tokens in session storage.
  // - used to hold password reset codes

  REDIS: {

    /**
    * addFBAuthToken
    *
    * Adds or overwrites a new FB Auth token for a specific user email key.
    * Adds an expiry time to the token.
    *
    * We use this to retrieve the email of the authenticated FB user later.
    *
    * @param (String) email
    * @param (String) token
    * @param (Number) secondsTillExpires
    * @return (Promise)
    */

    addFBAuthToken: function(email, token, secondsTillExpires) {
      console.log("Adding token " + fbHashName + "." + token + " for the email, " + email)
      return new Promise((resolve, reject) => {
        redisClient.set(fbHashName + "." + token, email, 
          function (error, reply) {
            if(error) {
              reject(error)
            } else {
              redisClient.expire(fbHashName + "." + token, secondsTillExpires)
              resolve(reply)
            }
        });
      })
    },

   /**
    * addJWT
    *
    * Adds or overwrites a new JWT for a specific user email key.
    * Adds an expiry time to the token.
    *
    * @param (String) email
    * @param (String) token
    * @return (Promise)
    */

    addJWT: function(email, token) {
      return new Promise((resolve, reject) => {
        redisClient.set(jwtHashName + "." + email, token, 
          function (error, reply) {
            if(error) {
              reject(error)
            } else {
              redisClient.expire(jwtHashName + "." + email, config.tokenExpiryTime)
              resolve(reply)
            }
        });
      })
    },

   /**
    * addPasswordResetCode
    *
    * Adds or overwrites a new password reset code for the user by unique email.
    * Adds an expiry time to the code.
    *
    * @param (String) email
    * @param (String) code
    * @return (Promise)
    */

    addPasswordResetCode: function(email, code) {
      return new Promise((resolve, reject) => {
        redisClient.set(passwordResetCodeHashName + "." + code, email,
          function(error, reply) {
            if(error) {
              reject(error)
            } else {
              redisClient.expire(passwordResetCodeHashName + "." + code, config.passwordResetTokenExpiryTime)
              resolve(reply)
            }
          })
      })
    },

   /**
    * delJWT
    *
    * Delete a specific key from the hash.
    * @param (String) email
    * @return (Promise)
    */   

    delJWT: function(email) {
      return new Promise((resolve, reject) => {
        redisClient.del(jwtHashName + "." + email,
          function (error, reply) {
            if(error) {
              reject(error)
            } else {
              resolve(reply)
            }
        });
      })
    },

    /**
    * getEmailByFBAuthToken
    *
    * Get a specific key from the hash.
    * @param (String) token
    * @return (Promise)
    */

    getEmailByFBAuthToken: function (token) {
      return new Promise((resolve, reject) => {
        redisClient.get(fbHashName + "." + token,
          function (error, reply) {
            if(error) {
              reject(error)
            } else {
              resolve(reply)
            }
        });
      })
    },

   /**
    * getJWT
    *
    * Get a specific key from the hash.
    * @param (String) email
    * @return (Promise)
    */

    getJWT: function(email) {
      return new Promise((resolve, reject) => {
        redisClient.get(jwtHashName + "." + email,
          function (error, reply) {
            if(error) {
              reject(error)
            } else {
              resolve(reply)
            }
        });
      })
    },

   /**
    * getPasswordResetCode
    *
    * Get a specific password reset code from the hash.
    * @param (String) code
    * @return (Promise)
    */

    getPasswordResetCode: function(code) {
      return new Promise((resolve, reject) => {
        redisClient.get(passwordResetCodeHashName + "." + code,
          function (error, reply) {
            if(error) {
              reject(error)
            } else {
              resolve(reply)
            }
        });
      })
    },


   /**
    * jwtExists
    *
    * Determines if a specific key actually exists or not within the hash.
    * @param (String) email
    * @return (Promise)
    */

    jwtExists: function(email) {
      return new Promise((resolve, reject) => {
        redisClient.exists(jwtHashName + "." + email,
          function (error, reply) {
            if(error) {
              reject(error)
            } else {
              resolve(reply)
            }
        });
      })
    },

   /**
    * testConnection
    *
    * Add something to redis in order to test the connection.
    * @return (Promise)
    */

    testConnection: () => {
      return new Promise((resolve, reject) => {
        redisClient.set('test', 'connected', 
          (err, reply) => {
            if (err) {
              reject();
            } else {
              resolve(true);
            }
        })
      })
    }
    
  }
}

module.exports = auth

