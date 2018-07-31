
  /*
  * app/routes/middleware.js
  *
  * This file contains middleware that is to be used express connect style.
  *
  */

  const jwt = require('jsonwebtoken')
  const config = require('../../config')
  const redis = require('../auth').REDIS

  var middleware = {

  /**
    * authenticateRequests
    * 
    * Ensures that all subsequent requests contain an 'Authorization' header containing
    * a valid JWT. Can also be included within the body, query or cookies as univjobsaccesstoken.
    */

    authenticateRequests:  function (req, res, next) {    
        
      // Allow for token to be passed either via POST parameters, URL parameters, or HTTP header
      var token = req.body.univjobsaccesstoken || req.query.univjobsaccesstoken || req.headers['authorization'] || req.cookies.univjobsaccesstoken;
        
        // Confirm that the token was signed with our signature.
        if (token) {
          jwt.verify(token, config.secret, function(err, decoded) {
            if (err) {
              return res.status(403).send({ // 403 - forbidden
                success: false,
                message: 'Token signature failed.'
               });
            } else {

              // Lookup session token by email.
              var email = decoded.email

              redis.getJWT(email)
                .then((result) => {
                  if(result !== null) {
                    // Found token.
                    // If token in redis matches the one supplied, continue
                    if (result == token) {
                      // Set attribute on the request object so that when we pass this request through,
                      // any Request will be able to tell if it is authenticated via if req.decoded != undefined
                      req.decoded = decoded;
                       
                      next();

                    // Token is not valid with our redis token
                    } else {
                      return res.status(403).send({ // 403 - forbidden
                        success: false,
                        message: 'Token doesnt match saved session token.'
                      });

                    }
                  } else {
                    console.log("token not found!!!")
                    // Token not found in saved tokens. (May have expired)
                    return res.status(403).send({ // 403 - forbidden
                      success: false,
                      message: 'Session token not found.'
                    });
                  }
                })
             }
          });
        } else {
          return res.status(403).send({ // 403 - forbidden
            success: false,
            message: 'No access token provided'
          });
        }
    },

    handleVerifyAdminUser: (req, res) => {
     /*
      * If we get this far in the request, it means that the token signature is valid.
      * We just want to go a step further and verify that the user is an admin.
      */

      const isAdmin = req.decoded.adminUser;

      if (isAdmin) {
        res.status(200).json({
          message: 'Authenticated with admin scope'
        })
      }

      else {
        res.status(403).json({
          message: 'Not authenticated with admin scope'
        })
      }
    },

    allowCrossDomainFromAll (req, res, next) {

      res.header("Access-Control-Allow-Origin", '*');
      res.header("Access-Control-Allow-Headers", "X-Requested-With");
      res.header("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Requested-With, X-CSRFToken");
      res.header("Access-Control-Allow-Methods", "PUT, PATCH, GET, POST, DELETE")


      if (req.method === "OPTIONS") 
        res.sendStatus(200);
      else {
        next();
      }
    },

   /*
    * allowCrossDomainFromProdUrl
    * 
    */

    allowCrossDomainFromProdUrl (req, res, next) {

      var legalPorts = ['80', '8080', '8888', '8000'];
      var legalOrigins = [
        'https://univjobs.ca', 
        'https://www.univjobs.ca',
        'https://app.univjobs.ca',
        'https://www.app.univjobs.ca',
        'https://www.squeaky.univjobs.ca', 
        'https://squeaky.univjobs.ca', 
        'http://138.197.171.254', 
        'https://138.197.171.254', 
        'http://138.197.171.254:8000', 
        'https://app.01-staging.univjobs.ca',
        'https://www.app.01-staging.univjobs.ca',
        process.env.APP_DOMAIN_NAME,
        'https://staging-01.univjobs.ca', 
        'https://www.staging-01.univjobs.ca'
      ];

      var requestedOrigin = req.headers.origin;

      // If the request origin is one of the specified legal origins, then we'll use the 
      // requested origin as the Access-Control-Allow-Origin header. 

      var originAllowed = false;

      legalOrigins.forEach((origin) => {
        if (origin === requestedOrigin) originAllowed = true;
      })
	
      console.log("Is origin allowed?", originAllowed);
      console.log("Origin: " + requestedOrigin);
	
      if (originAllowed) {
        res.header("Access-Control-Allow-Origin", requestedOrigin)
      }

      res.header("Access-Control-Allow-Headers", "X-Requested-With");
      res.header("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Requested-With, X-CSRFToken");
      res.header("Access-Control-Allow-Methods", "PUT, PATCH, GET, POST, DELETE")

      if (req.method === "OPTIONS") 
        res.sendStatus(200);
      else {
        next();
      }
    },

   /*
    * sanitizeRequests
    *
    * Able to sanitize all bad javascript inside of the body, params, query of a request.
    */

    sanitizeRequests (req, res, next) {

     /*
      * Sanitize all keys in body
      */

      var bodyKeys = Object.keys(req.body);

      bodyKeys.forEach((key) => {
        req.body[key] = req.sanitize(req.body[key])
      })

     /*
      * Sanitize all keys in routeparams
      */

      var paramKeys = Object.keys(req.params);
      
      paramKeys.forEach((key) => {
        req.params[key] = req.sanitize(req.params[key])
      })

     /*
      * Sanitize all keys in query
      */

      var queryKeys = Object.keys(req.query);
      
      queryKeys.forEach((key) => {
        req.query[key] = req.sanitize(req.query[key])
      })

      next()
    }
  }

  module.exports = middleware
