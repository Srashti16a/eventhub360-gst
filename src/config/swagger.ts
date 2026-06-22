import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EventHub360 Premium Concierge API',
      version: '1.0.0',
      description: 'REST API documentation for the EventHub360 Guest Management platform. Serves analytics, guests, events, seating tables, and email marketing campaigns.',
      contact: {
        name: 'Alex Sterling (Premium Concierge Admin)',
        email: 'alex.sterling@eventhub360.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Local development server'
      }
    ],
    components: {
      schemas: {
        Guest: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Jameson Vanderbilt' },
            avatar: { type: 'string', example: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200' },
            email: { type: 'string', format: 'email', example: 'j.vanderbilt@luxmail.com' },
            phone: { type: 'string', example: '+1 (555) 012-3456' },
            status: { type: 'string', enum: ['CONFIRMED', 'PENDING', 'DECLINED'], example: 'CONFIRMED' },
            isVip: { type: 'boolean', example: true },
            isSpeaker: { type: 'boolean', example: true },
            isBridalParty: { type: 'boolean', example: false },
            isPrimaryGuest: { type: 'boolean', example: false },
            assignedHotelId: { type: 'string', format: 'uuid', nullable: true },
            eventId: { type: 'string', format: 'uuid' },
            tableId: { type: 'string', format: 'uuid', nullable: true },
            seatNumber: { type: 'integer', nullable: true, example: 1 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Event: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string', example: 'Executive Forum 2026' },
            category: { type: 'string', example: 'Corporate Gala' },
            date: { type: 'string', format: 'date-time' }
          }
        },
        Hotel: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'The Ritz-Carlton' }
          }
        },
        Table: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Table 1' },
            capacity: { type: 'integer', example: 10 },
            guests: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  name: { type: 'string' },
                  email: { type: 'string' },
                  avatar: { type: 'string' },
                  status: { type: 'string' },
                  isVip: { type: 'boolean' },
                  seatNumber: { type: 'integer', nullable: true }
                }
              }
            }
          }
        }
      }
    },
    paths: {
      '/dashboard/stats': {
        get: {
          summary: 'Retrieve dashboard statistics for summary cards',
          tags: ['Dashboard'],
          responses: {
            200: {
              description: 'Successful response containing guest status counts and metrics',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          totalGuests: {
                            type: 'object',
                            properties: {
                              value: { type: 'integer', example: 1248 },
                              growth: { type: 'string', example: '+4.2%' }
                            }
                          },
                          confirmed: {
                            type: 'object',
                            properties: {
                              value: { type: 'integer', example: 892 },
                              growth: { type: 'string', example: '+12%' }
                            }
                          },
                          pendingRsvp: {
                            type: 'object',
                            properties: {
                              value: { type: 'integer', example: 315 },
                              growth: { type: 'string', example: '-2%' }
                            }
                          },
                          vipStatus: {
                            type: 'object',
                            properties: {
                              value: { type: 'integer', example: 42 },
                              growth: { type: 'string', nullable: true, example: null }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/guests': {
        get: {
          summary: 'List, search, filter, and sort guests',
          tags: ['Guests'],
          parameters: [
            { name: 'search', in: 'query', description: 'Fuzzy search by name, email, or phone', schema: { type: 'string' } },
            { name: 'rsvpStatus', in: 'query', description: 'Filter by RSVP status (CONFIRMED, PENDING, DECLINED, ALL)', schema: { type: 'string', default: 'ALL' } },
            { name: 'eventCategory', in: 'query', description: 'Filter guests by event category name', schema: { type: 'string' } },
            { name: 'vipOnly', in: 'query', description: 'Toggle to list VIPs only', schema: { type: 'boolean', default: false } },
            { name: 'page', in: 'query', description: 'Page number', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', description: 'Records per page', schema: { type: 'integer', default: 10 } },
            { name: 'sortBy', in: 'query', description: 'Sort by field', schema: { type: 'string', enum: ['name', 'status', 'email', 'createdAt'], default: 'name' } },
            { name: 'sortOrder', in: 'query', description: 'Sort order', schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' } }
          ],
          responses: {
            200: {
              description: 'Paginated list of guests',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      meta: {
                        type: 'object',
                        properties: {
                          totalGuests: { type: 'integer', example: 1248 },
                          page: { type: 'integer', example: 1 },
                          limit: { type: 'integer', example: 10 },
                          totalPages: { type: 'integer', example: 125 }
                        }
                      },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Guest' }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          summary: 'Create a new guest',
          tags: ['Guests'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'phone', 'status', 'eventId'],
                  properties: {
                    name: { type: 'string', example: 'Jameson Vanderbilt' },
                    email: { type: 'string', example: 'j.vanderbilt@luxmail.com' },
                    phone: { type: 'string', example: '+1 (555) 012-3456' },
                    status: { type: 'string', enum: ['CONFIRMED', 'PENDING', 'DECLINED'], example: 'CONFIRMED' },
                    isVip: { type: 'boolean', default: false },
                    isSpeaker: { type: 'boolean', default: false },
                    isBridalParty: { type: 'boolean', default: false },
                    isPrimaryGuest: { type: 'boolean', default: false },
                    assignedHotelId: { type: 'string', format: 'uuid', nullable: true },
                    eventId: { type: 'string', format: 'uuid', example: 'event-uuid-here' },
                    tableId: { type: 'string', format: 'uuid', nullable: true },
                    seatNumber: { type: 'integer', nullable: true }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Guest created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Guest' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/guests/{id}': {
        get: {
          summary: 'Get guest details by ID',
          tags: ['Guests'],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }
          ],
          responses: {
            200: {
              description: 'Guest details',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Guest' }
                    }
                  }
                }
              }
            },
            404: { description: 'Guest not found' }
          }
        },
        put: {
          summary: 'Update guest details',
          tags: ['Guests'],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    email: { type: 'string' },
                    phone: { type: 'string' },
                    status: { type: 'string', enum: ['CONFIRMED', 'PENDING', 'DECLINED'] },
                    isVip: { type: 'boolean' },
                    assignedHotelId: { type: 'string', format: 'uuid', nullable: true },
                    tableId: { type: 'string', format: 'uuid', nullable: true },
                    seatNumber: { type: 'integer', nullable: true }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Guest updated successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Guest' }
                    }
                  }
                }
              }
            },
            404: { description: 'Guest not found' }
          }
        },
        delete: {
          summary: 'Delete guest by ID',
          tags: ['Guests'],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }
          ],
          responses: {
            200: {
              description: 'Guest deleted successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Guest deleted successfully' }
                    }
                  }
                }
              }
            },
            404: { description: 'Guest not found' }
          }
        }
      },
      '/guests/export': {
        get: {
          summary: 'Export filtered guest list to CSV',
          tags: ['Guests Bulk Operations'],
          parameters: [
            { name: 'search', in: 'query', schema: { type: 'string' } },
            { name: 'rsvpStatus', in: 'query', schema: { type: 'string' } },
            { name: 'eventCategory', in: 'query', schema: { type: 'string' } },
            { name: 'vipOnly', in: 'query', schema: { type: 'boolean' } }
          ],
          responses: {
            200: {
              description: 'A CSV file containing the list of guests',
              content: {
                'text/csv': {
                  schema: { type: 'string' }
                }
              }
            }
          }
        }
      },
      '/guests/import': {
        post: {
          summary: 'Import guests in bulk via JSON or CSV',
          tags: ['Guests Bulk Operations'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: ['name', 'email', 'phone'],
                    properties: {
                      name: { type: 'string', example: 'John Doe' },
                      email: { type: 'string', example: 'john.doe@example.com' },
                      phone: { type: 'string', example: '+1 (555) 321-4567' },
                      status: { type: 'string', enum: ['CONFIRMED', 'PENDING', 'DECLINED'], default: 'PENDING' },
                      vip: { type: 'boolean', default: false },
                      category: { type: 'string', example: 'Corporate Gala' },
                      assignedhotel: { type: 'string', example: 'Boutique Manor' }
                    }
                  }
                }
              },
              'text/csv': {
                schema: {
                  type: 'string',
                  example: "name,email,phone,status,vip,category,assignedhotel\nJohn Doe,john.doe@example.com,+1 (555) 321-4567,CONFIRMED,YES,Corporate Gala,Boutique Manor"
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Import summary and listing of imported guests',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      summary: {
                        type: 'object',
                        properties: {
                          totalProcessed: { type: 'integer', example: 1 },
                          successfullyImported: { type: 'integer', example: 1 },
                          failed: { type: 'integer', example: 0 }
                        }
                      },
                      imported: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Guest' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/events': {
        get: {
          summary: 'List active events & categories',
          tags: ['Events'],
          responses: {
            200: {
              description: 'List of events',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Event' }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          summary: 'Create a new event',
          tags: ['Events'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title', 'category'],
                  properties: {
                    title: { type: 'string', example: 'Corporate Gala' },
                    category: { type: 'string', example: 'Corporate Gala' },
                    date: { type: 'string', format: 'date-time' }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Event created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Event' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/hotels': {
        get: {
          summary: 'List available hotels',
          tags: ['Hotels'],
          responses: {
            200: {
              description: 'List of hotels',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Hotel' }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          summary: 'Create a new hotel reference',
          tags: ['Hotels'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name'],
                  properties: {
                    name: { type: 'string', example: 'The Ritz-Carlton' }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Hotel created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Hotel' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/seating/tables': {
        get: {
          summary: 'List floor plan tables and seated guests',
          tags: ['Seating Arranger'],
          responses: {
            200: {
              description: 'List of tables with assigned guests',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Table' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/seating/assign': {
        put: {
          summary: 'Assign a guest to a table and seat number',
          tags: ['Seating Arranger'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['guestId'],
                  properties: {
                    guestId: { type: 'string', format: 'uuid' },
                    tableId: { type: 'string', format: 'uuid', nullable: true },
                    seatNumber: { type: 'integer', nullable: true }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Guest assigned successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Guest assigned to Table 1 successfully' },
                      data: { $ref: '#/components/schemas/Guest' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/campaigns/send-rsvp': {
        post: {
          summary: 'Trigger a mock email broadcast campaign',
          tags: ['Marketing Campaigns'],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    campaignType: { type: 'string', enum: ['RSVP_REMINDER', 'ITINERARY'], default: 'RSVP_REMINDER' }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Campaign broadcast simulation successful',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          campaignName: { type: 'string', example: 'RSVP Pending Reminders Campaign' },
                          type: { type: 'string', example: 'RSVP_REMINDER' },
                          recipientCount: { type: 'integer', example: 315 },
                          status: { type: 'string', example: 'SENT' },
                          sentAt: { type: 'string', format: 'date-time' },
                          message: { type: 'string', example: 'Successfully broadcasted campaign to 315 recipients.' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: [] // We explicitly defined paths above for bulletproof OpenAPI accuracy
};

const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
