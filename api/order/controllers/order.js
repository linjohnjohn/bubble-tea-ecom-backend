'use strict';

const { sanitizeEntity } = require('strapi-utils');
const stripe = require('stripe')(process.env.STRIPE_SK)


/**
 * Given a dollar amount number, convert it to it's value in cents
 * @param number 
 */
const fromDecimalToInt = (number) => parseInt(number * 100)

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */
const simpleOrderPopulate = ['order_items.item', 'order_items.item.image']
const detailedOrderPopulate = ['order_items.item', 'order_items.item.image', 'order_items.toppings', 'order_items.variant'];
module.exports = {
  /**
   * Only send back orders from you
   * @param {*} ctx 
   */
  async find(ctx) {
    const { user } = ctx.state
    let entities;
    if (ctx.query._q) {
      entities = await strapi.services.order.search({ ...ctx.query, user: user.id, status: 'paid' }, simpleOrderPopulate);
    } else {
      entities = await strapi.services.order.find({ ...ctx.query, user: user.id, status: 'paid' }, simpleOrderPopulate);
    }

    return entities.map(entity => sanitizeEntity(entity, { model: strapi.models.order }));
  },
  /**
   * Retrieve an order by id, only if it belongs to the user
   */
  async findOne(ctx) {
    const { id } = ctx.params;
    const { user } = ctx.state

    const entity = await strapi.services.order.findOne({ id, user: user.id }, detailedOrderPopulate);
    return sanitizeEntity(entity, { model: strapi.models.order });
  },

  /**
   * Initiate Stripe Checkout
   */
  async initiateCheckout(ctx) {
    const { user } = ctx.state
    const { cart } = ctx.request.body;
    let validatedCart = []

    for (const orderItem of cart) {
      const oi = await strapi.services['order-item'].create(orderItem);
      validatedCart.push(oi);
    }

    const orderItemsIds = validatedCart.map(orderItem => orderItem.id);
    const total = validatedCart.reduce((total, orderItem) => {
      total += orderItem.totalPrice;
      return total;
    }, 0);

    const order = await strapi.services['order'].create({ order_items: orderItemsIds, total, status: 'unpaid', user });
    const populatedOrder = await strapi.services['order'].findOne({ id: order.id }, detailedOrderPopulate)

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: total * 100,
        currency: 'usd',
        payment_method_types: ['card'],
        metadata: {
          order: order.id
        }
      });
      return {
        paymentIntent,
        order: sanitizeEntity(populatedOrder, { model: strapi.models.order })
      }
    } catch (error) {
      return ctx.badImplementation(error)
    }
  },

  async confirmPayment(ctx) {
    const { paymentIntent } = ctx.request.body;

    const validatedPaymentIntent = await stripe.paymentIntents.retrieve(paymentIntent.id);

    const { metadata: { order } } = validatedPaymentIntent;
    const paidOrder = await strapi.services['order'].update({ id: order }, { status: 'paid' });

    return paidOrder;
  }
};
