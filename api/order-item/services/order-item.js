'use strict';
const { isDraft: isDraftFn } = require('strapi-utils').contentTypes;

const calculatePriceWithModifiers = (item, variant, toppings) => {
  let price = item.price;

  if (variant) {
    price += variant.markup;
  }

  if (toppings) {
    toppings.forEach(t => {
      price += t.markup;
    });
  }

  return price;
}

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */

module.exports = {
  async create(data, { files } = {}) {
    const isDraft = isDraftFn(data, strapi.models['order-item']);

    const validData = await strapi.entityValidator.validateEntityCreation(
      strapi.models['order-item'],
      data,
      { isDraft }
    );

    const { item, toppings, variant, quantity } = validData;

    const validatedItem = await strapi.services.item.findOne({
      id: item
    });

    const validatedVariant = variant ? await strapi.services.variant.findOne({
      id: variant
    }) : null;

    const validatedToppings = toppings ? await strapi.services.topping.find({
      id_in: toppings
    }) : null;

    const unitPrice = calculatePriceWithModifiers(validatedItem, validatedVariant, validatedToppings);
    const totalPrice = unitPrice * quantity;

    const entry = await strapi.query('order-item').create({ ...validData, unitPrice, totalPrice });

    if (files) {
      // automatically uploads the files based on the entry and the model
      await strapi.entityService.uploadFiles(entry, files, {
        model: 'order-item',
        // if you are using a plugin's model you will have to add the `source` key (source: 'users-permissions')
      });
      return this.findOne({ id: entry.id });
    }

    return entry;
  },
};
