'use strict';


module.exports = {
  async logInAsAdmin (agent, url, username, password) {
    const csrf = await this.getCsrf(agent, url);
    await agent.post(url + '/admin/login').send({
      user : username,
      password,
      _csrf : csrf,
    });

    return { agent, csrf };
  },
  async getCsrf (agent, url) {
    const csrfReq  = await agent.get(url + '/csrf');
    return csrfReq.body.csrf;
  },
  async createProduct (agent, url, product) {
    return await agent.post(url + '/products').accept('json').send(product);
  },
  async loginAndCreateProduct (args) {
    const { csrf } = await this.logInAsAdmin(args.agent, args.url, args.username, args.password);
    const productToCreate = args.agentproduct || {
      name : `x`,
    };
    const res = await this.createProduct(args.agent, args.url, {
      _csrf : csrf,
      ...productToCreate,
    });


    return {
      product : res.body,
    }
  }
}
