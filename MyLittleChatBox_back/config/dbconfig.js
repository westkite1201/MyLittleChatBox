module.exports = {
    // mysql: {
    //   user      : 'cqmsuser',
    //   password  : 'cqms1234%^&*',
    //   host      : '211.200.94.215',
    //   database  : 'SKBDATA',
    // },
    mysql: {
      user      : 'root',
      password  : 'seo1282*',
      host      : 'localhost',
      database  : 'mydb',
    },
    //local Redis
    // redis: {
    //   host      : '127.0.0.1',
    //   port      : '6379',
    //   password  : '',
    //   db  : 2
    // }

    //skb Redis
    redis: {
      host      : "127.0.0.1",
      port      : '6379',
      password  : '7777',
      database  : 2
    }
    // skb dev redis
    /*
    redis:
      [
        {
          port: 6379,
          host: '172.16.9.198'
        },
        {
          port: 6379,
          host: '172.16.9.218'
        }
      ]
    ,
    */
    // skb prod redis
    // redis:
    //   [
    //     {
    //       port: 6379,
    //       host: '172.16.9.198'
    //     },
    //     {
    //       port: 6379,
    //       host: '172.16.9.218'
    //     }
    //   ]
    //,
    // elasticsearch: {
    //   host: '172.16.9.221:9200',
    //   log: 'error'
    // },
}
