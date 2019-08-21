
const oauth2orize = require('oauth2orize');
const passport = require('`passport`');
const login = require('connect-ensure-login');
const db = require('../models/oauth.model');
const utils = require('../utils');

// Create OAuth 2.0 server
const server = oauth2orize.createServer();

server.serializeClient((client, done) => done(null, client.id));

server.deserializeClient((id, done) => {
  //db.getClient(id)
  db.clients.findById(id, (error, client) => {
    if (error) return done(error);
    return done(null, client);
  });
});

server.grant(oauth2orize.grant.code((client, redirectUri, user, ares, done) => {
  const code = utils.getUid(16);
  db.authorizationCodes.save(code, client.id, redirectUri, user.id, (error) => {
    if (error) return done(error);
    return done(null, code);
  });
}));

server.grant(oauth2orize.grant.token((client, user, ares, done) => {
  const token = utils.getUid(256);
  db.accessTokens.save(token, user.id, client.clientId, (error) => {
    if (error) return done(error);
    return done(null, token);
  });
}));

server.exchange(oauth2orize.exchange.code((client, code, redirectUri, done) => {
  db.authorizationCodes.find(code, (error, authCode) => {
    if (error) return done(error);
    if (client.id !== authCode.clientId) return done(null, false);
    if (redirectUri !== authCode.redirectUri) return done(null, false);
    
    const token = utils.getUid(256);
    db.accessTokens.save(token, authCode.userId, authCode.clientId, (error) => {
      if (error) return done(error);
      return done(null, token);
    });
  });
}));

server.exchange(oauth2orize.exchange.password((client, username, password, scope, done) => {
  // Validate the client
  db.clients.findByClientId(client.clientId, (error, localClient) => {
    if (error) return done(error);
    if (!localClient) return done(null, false);
    if (localClient.clientSecret !== client.clientSecret) return done(null, false);
    // Validate the user
    db.users.findByUsername(username, (error, user) => {
      if (error) return done(error);
      if (!user) return done(null, false);
      if (password !== user.password) return done(null, false);
      // Everything validated, return the token
      const token = utils.getUid(256);
      db.accessTokens.save(token, user.id, client.clientId, (error) => {
        if (error) return done(error);
        return done(null, token);
      });
    });
  });
}));

server.exchange(oauth2orize.exchange.clientCredentials((client, scope, done) => {
  // Validate the client
  db.clients.findByClientId(client.clientId, (error, localClient) => {
    if (error) return done(error);
    if (!localClient) return done(null, false);
    if (localClient.clientSecret !== client.clientSecret) return done(null, false);
    // Everything validated, return the token
    const token = utils.getUid(256);
    // Pass in a null for user id since there is no user with this grant type
    db.accessTokens.save(token, null, client.clientId, (error) => {
      if (error) return done(error);
      return done(null, token);
    });
  });
}));

module.exports.authorization = [
  login.ensureLoggedIn(),
  server.authorization((clientId, redirectUri, done) => {
    db.clients.findByClientId(clientId, (error, client) => {
      if (error) return done(error);
      // WARNING: For security purposes, it is highly advisable to check that
      //          redirectUri provided by the client matches one registered with
      //          the server. For simplicity, this example does not. You have
      //          been warned.
      return done(null, client, redirectUri);
    });
  }, (client, user, done) => {
    // Check if grant request qualifies for immediate approval
    
    // Auto-approve
    if (client.isTrusted) return done(null, true);
    
    db.accessTokens.findByUserIdAndClientId(user.id, client.clientId, (error, token) => {
      // Auto-approve
      if (token) return done(null, true);
      
      // Otherwise ask user
      return done(null, false);
    });
  }),
  (request, response) => {
    response.render('dialog', { transactionId: request.oauth2.transactionID, user: request.user, client: request.oauth2.client });
  },
];
exports.decision = [
  login.ensureLoggedIn(),
  server.decision(),
];

exports.token = [
  passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
  server.token(),
  server.errorHandler(),
];