# -*- coding: utf-8 -*-
#
# Copyright (C) 2010-2016 PPMessage.
# Guijin Ding, dingguijin@gmail.com.
# All rights reserved.
#
# backend/ppconfigapp.py
#

from ppmessage.core.constant import SQL
from ppmessage.core.constant import API_LEVEL
from ppmessage.core.constant import REDIS_HOST
from ppmessage.core.constant import REDIS_PORT
from ppmessage.core.constant import USER_STATUS
from ppmessage.core.constant import CONFIG_STATUS
from ppmessage.core.constant import PP_WEB_SERVICE
from ppmessage.core.main import AbstractWebService
from ppmessage.core.singleton import singleton

from ppmessage.core.utils.config import _get_config
from ppmessage.core.utils.config import _dump_config
from ppmessage.core.utils.getipaddress import get_ip_address
from ppmessage.core.utils.randomidenticon import random_identicon
from ppmessage.core.utils.randomidenticon import download_random_identicon

from ppmessage.db.create import create_pgsql_db
from ppmessage.db.create import create_mysql_db
from ppmessage.db.create import create_mysql_tables
from ppmessage.db.create import create_pgsql_tables
from ppmessage.db.create import create_sqlite_tables

import os
import json
import uuid
import redis
import errno
import logging
import traceback

import tornado.web
from tornado.ioloop import IOLoop

def _insert_into(_row):
    from ppmessage.db.dbinstance import getDBSessionClass
    _class = getDBSessionClass()
    _session = _class()
    try:
        _session.add(_row)
        _session.commit()
    except:
        _session.rollback()
        traceback.print_exc()
    finally:
        _class.remove()
    return

def _return(_handler, _code):
    if _code >= 0:
        _handler.write({"error_code": _code})
        _handler.flush()
    else:
        _handler.send_error(404)
    return

def _mkdir_p(_path):
    try:
        os.makedirs(_path)
    except OSError as exc:  # Python >2.5
        if exc.errno == errno.EEXIST and os.path.isdir(_path):
            pass
        else:
            raise
    return

def _cur_dir():
    return os.path.dirname(__file__)

class PPConfigHandler(tornado.web.RequestHandler):
    def get(self, id=None):
        if _get_config() != None and _get_config().get("config_status") == CONFIG_STATUS.RESTART:
            self.redirect("/ppkefu/")
            return

        _dir = os.path.dirname(os.path.abspath(__file__))
        _html_path = _dir + "/../resource/html/ppconfig-index.html"
        _html_file = open(_html_path, "rb")
        _html = _html_file.read()
        _html_file.close()
        self.write(_html)
        self.flush()

class ConfigStatusHandler(tornado.web.RequestHandler):
    def post(self, id=None):
        _status = {"status": CONFIG_STATUS.NONE, "ip": get_ip_address()}
        if _get_config() != None:
            _status["status"] = _get_config().get("config_status")

        if _status["status"] == CONFIG_STATUS.RESTART:
            logging.error("should not request config for PPMessage already configed.")
            return

        self.write(_status)
        self.flush()
        return

class ServerHandler(tornado.web.RequestHandler):
    def _dump_server_config(self, _server_config):
        """
        server config is first
        """

        _url = _server_config.get("url")

        _server_config.update({"ssl":"off"})
        if _url.startswith("https"):
            _server_config.update({"ssl":"on"})

        _host = _url[_url.index("//")+2:]
        _host = _host.split(":")

        if len(_host) == 1:
            _server_config.update({"name": _host[0]})
            if _server_config.get("ssl") == "on":
                _server_config.update({"port": 443})
            else:
                _server_config.update({"port": 80})

        if len(_host) == 2:
            _server_config.update({"name": _host[0], "port": int(_host[1])})

        _config = {
            "config_status": CONFIG_STATUS.SERVER,
            "server": _server_config
        }
        _dump_config(_config)
        return

    def _create_server_stores(self, _request):
        _generic_store = _request.get("generic_store")
        _identicon_store = _request.get("identicon_store")

        if _generic_store == None:
            _generic_store = "/usr/local/opt/ppmessage/generic"
        if _identicon_store == None:
            _identicon_store = "/usr/local/opt/ppmessage/identicon"

        try:
            _mkdir_p(_generic_store)
            _mkdir_p(_identicon_store)
        except:
            return False

        return True

    def post(self, id=None):
        _request = json.loads(self.request.body.decode("utf-8"))

        _config = _get_config()
        if _config != None and _config.get("config_status") == CONFIG_STATUS.SERVER:
            logging.error("server config already existed.")
            return _return(self, -1)

        # SERVER
        _server = _request
        if _server == None or _server.get("url") == None:
            logging.error("config server wrong for request: %s." % _server)
            return _return(self, -1)

        if not self._create_server_stores(_server):
            logging.error("config server not run for wrong request: %s." % _server)
            return _return(self, -1)

        self._dump_server_config(_server)
        return _return(self, 0)

class DatabaseHandler(tornado.web.RequestHandler):

    def _dump_db_config(self, _db_config):
        _config = _get_config()
        _config["config_status"] = CONFIG_STATUS.DATABASE
        _config["db"] = _db_config
        _dump_config(_config)
        return

    def _sqlite(self, _request):
        _db_file_path = _request.get(SQL.SQLITE.lower())
        if _db_file_path == None:
            logging.error("%s not in %s" % (SQL.SQLITE.lower(), str(_request)))
            return _return(self, -1)

        _db_file_path = _db_file_path.get("db_file_path")
        if _db_file_path == None or len(_db_file_path) == 0:
            logging.error("db_file_path is required for sqlite")
            return _return(self, -1)

        try:
            _dir = os.path.dirname(_db_file_path)
            _mkdir_p(_dir)
            open(_db_file_path, "w").close()
        except:
            logging.error("sqlite: can not create %s" % _db_file_path)
            return _return(self, -1)

        _config = {
            "type": SQL.SQLITE.lower(),
            "sqlite": {
                "db_file_path": _db_file_path
            }
        }

        if create_sqlite_tables(_config):
            self._dump_db_config(_config)
            return _return(self, 0)
        return _return(self, -1)

    def _mysql(self, _request):
        logging.info(_request)
        _request = _request.get(SQL.MYSQL.lower())
        logging.info(_request)

        _db_name = _request.get("db_name")
        _db_host = _request.get("db_host")
        _db_port = _request.get("db_port")
        _db_user = _request.get("db_user")
        _db_pass = _request.get("db_pass")

        if _db_name == None or _db_host == None or _db_port == None\
           or _db_user == None or _db_pass == None:
            logging.error("mysql required db paramters not provided.")
            return _return(self, -1)

        _config = {
            "type": SQL.MYSQL.lower(),
            "mysql": {
                "db_name": _db_name,
                "db_host": _db_host,
                "db_port": _db_port,
                "db_user": _db_user,
                "db_pass": _db_pass
            }
        }

        if create_mysql_db(_config):
            if create_mysql_tables(_config):
                self._dump_db_config(_config)
                return _return(self, 0)

        return _return(self, -1)

    def _pgsql(self, _request):

        _request = _request.get(SQL.PGSQL.lower())

        _db_name = _request.get("db_name")
        _db_host = _request.get("db_host")
        _db_port = _request.get("db_port")
        _db_user = _request.get("db_user")
        _db_pass = _request.get("db_pass")

        if _db_name == None or _db_host == None or _db_port == None\
           or _db_user == None or _db_pass == None:
            logging.error("mysql required db paramters not provided.")
            _return(self, -1)

        _config = {
            "type": SQL.PGSQL.lower(),
            "pgsql": {
                "db_name": _db_name,
                "db_host": _db_host,
                "db_port": _db_port,
                "db_user": _db_user,
                "db_pass": _db_pass
            }
        }

        if create_pgsql_db(_config):
            if create_pgsql_tables(_config):
                self._dump_db_config(_config)
                return _return(self, 0)

        return _return(self, -1)

    def post(self, id=None):
        _request = json.loads(self.request.body.decode("utf-8"))

        _config = _get_config()
        if _config == None or _config.get("config_status") != CONFIG_STATUS.SERVER:
            logging.error("not correct status to config database.")
            return _return(self, -1)

        _db = _request
        _type = _db.get("type")
        if _type == None or len(_type) == 0:
            logging.error("type is required.")
            return _return(self, -1)

        _type = _type.upper()
        if _type == SQL.SQLITE:
            return self._sqlite(_db)
        if _type == SQL.MYSQL:
            return self._mysql(_db)
        if _type == SQL.PGSQL:
            return self._pgsql(_db)

        return _return(self, -1)

class FirstHandler(tornado.web.RequestHandler):
    def __init__(self, *args, **kwargs):
        self._user_uuid = str(uuid.uuid1())
        self._app_uuid = str(uuid.uuid1())
        super(self.__class__, self).__init__(*args, **kwargs)

    def _check_request(self, _request):
        if _request.get("user_fullname") == None or \
           _request.get("user_email") == None or \
           _request.get("user_password") == None or \
           _request.get("team_name") == None:
            logging.info("check request false: %s" % _request)
            return False
        return True

    def _create_user(self, _request):
        from ppmessage.db.models import DeviceUser

        _user_email = _request.get("user_email")
        _user_fullname = _request.get("user_fullname")
        _user_password = _request.get("user_password")
        _user_icon = random_identicon(_user_email)

        IOLoop.current().spawn_callback(download_random_identicon, _user_icon)

        _row = DeviceUser(
            uuid=self._user_uuid,
            user_email=_user_email,
            user_icon=_user_icon,
            user_status=USER_STATUS.OWNER_2,
            user_fullname=_user_fullname,
            user_password=_user_password,
            is_removed_user=False,
            is_owner_user=True,
            is_service_user=True,
            is_anonymous_user=False
        )

        _row.create_redis_keys(self.application.redis)
        _insert_into(_row)
        self._user_fullname = _user_fullname
        return True

    def _create_team(self, _request):
        from ppmessage.db.models import AppInfo

        _app_name = _request.get("team_name")
        _app_uuid = self._app_uuid
        _app_key = str(uuid.uuid1())
        _app_secret = str(uuid.uuid1())

        _row = AppInfo(uuid=_app_uuid,
                       app_name=_app_name,
                       app_key=_app_key,
                       app_secret=_app_secret)
        _row.create_redis_keys(self.application.redis)
        _insert_into(_row)
        return True

    def _create_api(self, _request):
        from ppmessage.db.models import ApiInfo
        import hashlib
        import base64
        _user_uuid = self._user_uuid

        def _encode(_key):
            _key = hashlib.sha1(_key.encode("utf-8")).hexdigest()
            _key = base64.b64encode(_key.encode("utf-8"))
            _key = _key.decode("utf-8")
            return _key

        def _info(_type):
            _uuid = str(uuid.uuid1())
            _key = _encode(str(uuid.uuid1()))
            _secret = _encode(str(uuid.uuid1()))
            _row = ApiInfo(uuid=_uuid,
                           user_uuid=_user_uuid,
                           api_level=_type,
                           api_key=_key,
                           api_secret=_secret)
            _row.create_redis_keys(self.application.redis)
            _insert_into(_row)
            return {"uuid":_uuid, "key":_key, "secret":_secret}

        _config = {
            API_LEVEL.PPCOM.lower(): _info(API_LEVEL.PPCOM),
            API_LEVEL.PPKEFU.lower(): _info(API_LEVEL.PPKEFU),
            API_LEVEL.PPCONSOLE.lower(): _info(API_LEVEL.PPCONSOLE),
            API_LEVEL.PPCONSOLE_BEFORE_LOGIN.lower(): _info(API_LEVEL.PPCONSOLE_BEFORE_LOGIN),
            API_LEVEL.THIRD_PARTY_KEFU.lower(): _info(API_LEVEL.THIRD_PARTY_KEFU),
            API_LEVEL.THIRD_PARTY_CONSOLE.lower(): _info(API_LEVEL.THIRD_PARTY_CONSOLE)
        }
        self._api = _config
        return True

    def _dist_ppcom(self, _request):
        from ppmessage.ppcom.config.config import config
        _d = {
            "ssl": _get_config().get("server").get("ssl"),
            "server_name": _get_config().get("server").get("name"),
            "server_port": _get_config().get("server").get("port"),
            "key": self._api.get(API_LEVEL.PPCOM.lower()).get("key"),
            "secret": self._api.get(API_LEVEL.PPCOM.lower()).get("secret"),
        }
        config(_d)
        return True

    def _dist_ppkefu(self, _request):
        _d = {
            "key": self._api.get(API_LEVEL.PPKEFU.lower()).get("key"),
            "server_url": _get_config().get("server").get("url")
        }
        dirname = os.path.dirname(os.path.abspath(__file__))
        src_head_js = dirname + "/../ppkefu/src/js/head.js"
        dist_head_js = dirname + "/../ppkefu/dist/js/head.js"

        with open(src_head_js, 'r') as f:
            content = f.read()
            content = content.replace("{{api_key}}", _d.get("key"))
            content = content.replace("{{server_url}}", _d.get("server_url"))

        with open(dist_head_js, 'w') as f:
            f.write(content)

        return True

    def _dist(self, _request):
        if not self._dist_ppcom(_request):
            return False
        if not self._dist_ppkefu(_request):
            return False
        return True

    def _dump_config(self, _request):
        _config = _get_config()
        _config["config_status"] = CONFIG_STATUS.FIRST
        _config["api"] = self._api
        _config["team"] = {
            "app_uuid": self._app_uuid,
            "name": _request.get("team_name")
        }
        _config["user"] = {
            "user_uuid": self._user_uuid,
            "user_email": _request.get("user_email"),
            "user_fullname": _request.get("user_fullname"),
            "user_password": _request.get("user_password")
        }
        _config["configed"] = True
        _dump_config(_config)
        return True

    def post(self, id=None):
        _request = json.loads(self.request.body.decode("utf-8"))

        logging.info("firstrequest: %s" % _request)

        if not self._check_request(_request):
            return _return(self, -1)

        if not self._create_user(_request):
            return _return(self, -1)

        if not self._create_team(_request):
            return _return(self, -1)

        if not self._create_api(_request):
            return _return(self, -1)

        if not self._dist(_request):
            return _return(self, -1)

        self._dump_config(_request)

        return _return(self, 0)

class RestartHandler(tornado.web.RequestHandler):
    def _dump_restart_config(self):
        _config = _get_config()
        _config["config_status"] = CONFIG_STATUS.RESTART
        _dump_config(_config)
        return

    def _restart(self):
        from ppmessage.core.utils.restart import restart
        return restart("main.py")

    def post(self, id=None):
        _request = json.loads(self.request.body.decode("utf-8"))

        _config = _get_config()
        if _config == None or _config.get("config_status") != CONFIG_STATUS.FIRST:
            logging.error("can not restart for config_status: %s." % _config.get("config_status"))
            return _return(self, -1)

        if _request.get("user_password") != _config.get("user").get("user_password"):
            logging.error("can not restart PPMessage for user_password not match.")
            return _return(self, -1)

        self._dump_restart_config()
        _return(self, 0)
        self._restart()

@singleton
class PPConfigDelegate():
    def __init__(self, app):
        return
    def run_periodic(self):
        return

class PPConfigWebService(AbstractWebService):

    @classmethod
    def name(cls):
        return PP_WEB_SERVICE.PPCONFIG

    @classmethod
    def get_handlers(cls):
        _a_settings = {
            "path": os.path.join(os.path.dirname(__file__), "../resource/assets/ppconfig/static"),
        }

        handlers=[
            (r"/", PPConfigHandler),
            (r"/status", ConfigStatusHandler),
            (r"/server", ServerHandler),
            (r"/database", DatabaseHandler),
            (r"/first", FirstHandler),
            (r"/restart", RestartHandler),
            (r"/static/(.*)", tornado.web.StaticFileHandler, _a_settings),
        ]

        return handlers

    @classmethod
    def get_delegate(cls, app):
        return PPConfigDelegate(app)

class PPConfigApp(tornado.web.Application):

    def __init__(self):
        self.redis = redis.Redis(REDIS_HOST, REDIS_PORT, db=1)
        settings = {
            "debug": True,
            "cookie_secret": "24oETzKXQAGaYdkL5gEmGeJJFuYh7EQnp2XdTP1o/Vo="
        }
        tornado.web.Application.__init__(self, PPConfigWebService.get_handlers(), **settings)

    def get_delegate(self, name):
        return PPConfigDelegate(self)


