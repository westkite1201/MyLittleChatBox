var express = require('express');
var router = express.Router();
const userRedis = require('../../model/redis/redisDao');


router.post('/addMessage', async (req, res) => {
    try {
      const userId = req.body.user_id;
      const pageNumber = req.body.page_number;
      const componentList = req.body.component_list;
  
      await userRedis.deleteUserComponent({
        user_id: userId,
        page_number: pageNumber
      });
  
      await userRedis.setUserComponents({
        user_id: userId,
        page_number: pageNumber,
        component_list: componentList
      });
  
      return res.json({
        message: 'success',
        api: 'setUserComponents',
        code: 100
      });
    }
    catch (error) {
      console.error(error);
      return res.json({
        message: 'fail',
        api: 'setUserComponents',
        code: 200,
        error: error
      });
    }
});