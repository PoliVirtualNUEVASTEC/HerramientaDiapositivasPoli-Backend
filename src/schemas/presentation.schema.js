const presentationSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['title', 'description', 'theme', 'slides'],
  properties: {
    title: {
      type: 'string'
    },
    description: {
      type: 'string'
    },
    theme: {
      type: 'object',
      additionalProperties: false,
      required: ['background', 'fontFamily', 'primaryColor'],
      properties: {
        background: {
          type: 'string'
        },
        fontFamily: {
          type: 'string'
        },
        primaryColor: {
          type: 'string'
        }
      }
    },
    slides: {
      type: 'array',
      minItems: 3,
      maxItems: 12,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['title', 'slideOrder', 'elements'],
        properties: {
          title: {
            type: 'string'
          },
          slideOrder: {
            type: 'number'
          },
          elements: {
            type: 'array',
            maxItems: 4,
            items: {
              type: 'object',
              additionalProperties: false,
              required: [
                'type',
                'content',
                'positionX',
                'positionY',
                'width',
                'height',
                'styles',
                'order'
              ],
              properties: {
                type: {
                  type: 'string',
                  enum: ['title', 'text', 'list', 'image']
                },
                content: {
                  type: 'object',
                  additionalProperties: false,
                  required: ['text', 'items', 'image'],
                  properties: {
                    text: {
                      type: ['string', 'null']
                    },
                    items: {
                      type: ['array', 'null'],
                      items: {
                        type: 'string'
                      }
                    },
                    image: {
                      anyOf: [
                        {
                          type: 'object',
                          additionalProperties: false,
                          required: ['query', 'style', 'orientation'],
                          properties: {
                            query: {
                              type: 'string'
                            },
                            style: {
                              type: 'string'
                            },
                            orientation: {
                              type: 'string',
                              enum: ['horizontal', 'vertical', 'square']
                            }
                          }
                        },
                        {
                          type: 'null'
                        }
                      ]
                    }
                  }
                },
                positionX: {
                  type: 'number',
                  minimum: 0,
                  maximum: 960
                },
                positionY: {
                  type: 'number',
                  minimum: 0,
                  maximum: 540
                },
                width: {
                  type: 'number',
                  minimum: 20,
                  maximum: 960
                },
                height: {
                  type: 'number',
                  minimum: 20,
                  maximum: 540
                },
                styles: {
                  type: 'object',
                  additionalProperties: false,
                  required: [
                    'fontSize',
                    'fontWeight',
                    'color',
                    'textAlign',
                    'lineHeight',
                    'borderRadius'
                  ],
                  properties: {
                    fontSize: {
                      type: ['number', 'null']
                    },
                    fontWeight: {
                      type: ['string', 'null']
                    },
                    color: {
                      type: ['string', 'null']
                    },
                    textAlign: {
                      type: ['string', 'null'],
                      enum: ['left', 'center', 'right', null]
                    },
                    lineHeight: {
                      type: ['number', 'null']
                    },
                    borderRadius: {
                      type: ['number', 'null']
                    }
                  }
                },
                order: {
                  type: 'number'
                }
              }
            }
          }
        }
      }
    }
  }
}

export default presentationSchema
