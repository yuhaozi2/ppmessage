# -*- coding: utf-8 -*-
#
# Copyright (C) 2010-2016 PPMessage.
# Guijin Ding, dingguijin@gmail.com
#
#

from .basehandler import BaseHandler

from mdm.db.models import ConversationInfo
from mdm.db.models import ConversationUserData

from mdm.core.redis import redis_hash_to_dict
from mdm.api.error import API_ERR

import uuid
import json
import logging

class PPGetConversationInfoHandler(BaseHandler):
    """
    every user has own conversation data related the conversation
    the conversation_name conversation_icon is different for every user
    even the user name (alias in conversation)
    """

    def _get(self):
        _redis = self.application.redis
        _conv = redis_hash_to_dict(_redis, ConversationInfo, self._conv_uuid)
        if _conv == None:
            logging.error("no such conversation: %s" % self._conv_uuid)
            self.setErrorCode(API_ERR.NO_CONVERSATION)
            return
        
        _key = ConversationUserData.__tablename__ + \
               ".app_uuid." + self._app_uuid + \
               ".user_uuid." + self._user_uuid + \
               ".conversation_uuid." + self._conv_uuid
        _data_uuid = _redis.get(_key)
        if _data_uuid == None:
            logging.error("no such conversation data uuid")
            self.setErrorCode(API_ERR.NO_CONVERSATION)
            return

        _data = redis_hash_to_dict(_redis, ConversationUserData, _data_uuid)
        if _data == None:
            logging.error("no such conversation data hash")
            self.setErrorCode(API_ERR.NO_CONVERSATION)
            return
        
        _rdata = self.getReturnData()
        for _i in _conv:
            _rdata[_i] = _conv.get(_i)

        _rdata["conversation_data"] = _data
        return

    def _Task(self):
        super(PPGetConversationInfoHandler, self)._Task()
        _request = json.loads(self.request.body)
        self._app_uuid = _request.get("app_uuid")
        self._user_uuid = _request.get("user_uuid")
        self._conv_uuid = _request.get("conversation_uuid")

        if self._conv_uuid == None or \
           self._user_uuid == None or \
           self._app_uuid == None:
            self.setErrorCode(API_ERR.NO_PARA)
            return
        self._get()
        return

