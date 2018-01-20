'use strict';


module.exports = {
  async logInAsAdmin (agent, url, username, password) {
    const csrfReq  = await agent.get(url + '/csrf');
    const csrf     = csrfReq.body.csrf;
    await agent.post(url + '/admin/login').send({
      user : username,
      password,
      _csrf : csrf,
    });

    return { agent, csrf };
  },
  async createProduct (agent, url, product) {
    return await agent.post(url + '/products').accept('json').send(product);
  }
}
