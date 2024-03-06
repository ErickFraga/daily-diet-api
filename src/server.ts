import { app } from './app'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { env } from './env'

app.register(swagger, {
  swagger: {
    info: { title: 'Transactions API', version: '0.1.0' },
  },
})

app.register(swaggerUi, {
  prefix: '/api',
  theme: {
    css: [
      {
        filename: 'theme.css',
        // dark mode
        content: `
        .swagger-ui a.nostyle span ,
        .swagger-ui .opblock-description-wrapper p ,
        .swagger-ui .tab li button.tablinks ,
        .swagger-ui .parameter__type ,
        .swagger-ui .parameter__in ,
        .swagger-ui .parameter__name ,
        .swagger-ui .parameters-container label ,
        .swagger-ui table thead tr th ,
        .swagger-ui .info .title ,
        .swagger-ui .opblock-tag ,
        .swagger-ui .response-col_status,
        .swagger-ui .response-col_status,
        .swagger-ui table thead tr td,
        .response-col_description__inner,
        .btn.btn-clear.opblock-control__btn,
        .swagger-ui .responses-inner h5,
        .swagger-ui .responses-inner h4,
        .swagger-ui .responses-inner h3,
        .swagger-ui .responses-inner h2,
        .swagger-ui .responses-inner h1,
        div.markdown,
        svg.arrow { color: #f8f8f2 !important; }

        body { background-color:#1e1e1e  ; }
        `,
      },
    ],
  },
})

app.listen({ port: env.PORT }, async (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
  await app.swagger()
  // log all routes
  console.log(`docs available at ${address}/api`)
  console.log(app.printRoutes())
})
