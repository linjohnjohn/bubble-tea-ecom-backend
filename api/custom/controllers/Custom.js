"use strict";

module.exports = {
  async logout(ctx) {
    ctx.cookies.set("token", null, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      domain: process.env.NODE_ENV === "development" ? "localhost" : process.env.API_DOMAIN,
      sameSite: "none",
    });
    ctx.send({
      authorized: true,
      message: "Successfully destroyed session",
    });
  },

  async failure(ctx) {
    const { id } = ctx.params;

    if (id == 400) {
      return ctx.badRequest("This is a bad request")
    } else if (id == 401) {
      return ctx.unauthorized("This is a unauthorized")
    } else if (id == 403) {
      return ctx.forbidden("This is a forbidden")
    } else if (id == 500) {
      return ctx.badImplementation("This is a bad implementation")
    }
  }
}