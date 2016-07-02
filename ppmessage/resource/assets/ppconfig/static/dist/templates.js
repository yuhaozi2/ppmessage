angular.module("this_app").run(["$templateCache", function($templateCache) {$templateCache.put("templates/app.html","<!-- Header BEGIN -->\n<div class=\"header\" layout=\"row\">\n  <div class=\"nav\">\n	<div class=\"nav_main\">\n	  <div class=\"logo\" ng-click=\"ppmessage()\">\n	  </div>\n	</div>\n  </div>\n</div>\n<!-- Header END -->\n<div class=\"fix-header-padding\"></div>\n\n\n<md-content md-scroll-y layout=\"column\" flex>\n  <ui-view layout-padding flex=\"noshrink\"></ui-view>\n\n  <div layout=\"row\" flex=\"noshrink\" layout-align=\"center center\">\n    <p ng-if=\"!is_lang_english()\"><a style=\"cursor:pointer; color: white; font-weight: bold;\" ng-click=\"switch_to_english()\"> Switch to English </a></p>\n    <p ng-if=\"is_lang_english()\"><a style=\"cursor:pointer; color: white; font-weight: bold;\" ng-click=\"switch_to_chinese()\">转换到中文</a></p>\n    <div id=\"license-footer\" flex>\n      Proudly use <a href=\"https://ppmessage.com\">PPMessage</a> &copy;2010&#8211;{{thisYear}}.\n      Code licensed under <a href=\"http://www.apache.org/licenses/LICENSE-2.0\"  target=\"_blank\" class=\"md-default-theme md-accent\">Apache License Version 2.0</a>.\n    </div>\n  </div>\n</md-content>\n\n");
$templateCache.put("templates/config.html","<md-content>\n  <div layout=\"column\" flex=\"noshrink\" layout-align=\"center center\">\n\n    <md-toolbar class=\"md-whiteframe-glow-z1 site-content-toolbar\">\n      <div class=\"md-toolbar-tools docs-toolbar-tools\" tabIndex=\"-1\">\n        <div layout=\"row\" flex class=\"fill-height\">\n          <h2 class=\"md-toolbar-item md-breadcrumb md-headline\">\n            <span>\n              <span>Config PPMessage</span>\n            </span>\n          </h2>\n          <span flex></span> <!-- use up the empty space -->        \n        </div>\n      </div>\n    </md-toolbar>\n\n    <div style=\"width:100%;\">\n      <md-card class=\"md-whiteframe-z2\" flex=\"66\">\n\n        <div class=\"md-padding\" layout=\"column\" style=\"width:100%;\" ng-cloak>\n\n          <md-content class=\"md-no-momentum config-buttons\">\n\n            <section layout=\"row\" layout-sm=\"column\" layout-align=\"center center\" layout-wrap>\n              <md-button class=\"md-raised\" ng-disabled=\"should_disable_config_server()\" ng-click=\"config_server(event)\">\n                Config Server\n              </md-button>\n              <span flex></span>\n              <div class=\"label\" style=\"padding-left: 15px;\">{{ get_server_status() }}</div>\n            </section>\n\n            <section layout=\"row\" layout-sm=\"column\" layout-align=\"center center\" layout-wrap>\n              <md-button class=\"md-raised\" ng-disabled=\"should_disable_config_database()\" ng-click=\"config_database(event)\">\n                Config Database\n              </md-button>\n              <span flex></span>\n              <div class=\"label\" style=\"padding-left: 15px;\">{{ get_database_status() }}</div>\n            </section>\n\n            <section layout=\"row\" layout-sm=\"column\" layout-align=\"center center\" layout-wrap>\n              <md-button class=\"md-raised\" ng-disabled=\"should_disable_create_first()\" ng-click=\"create_first(event)\">\n                Create First User And Team\n              </md-button>\n              <span flex></span>\n              <div class=\"label\" style=\"padding-left: 15px;\">{{ get_first_status() }}</div>\n            </section>\n\n            <section layout=\"row\" layout-sm=\"column\" layout-align=\"center center\" layout-wrap>\n              <md-button class=\"md-raised\" ng-disabled=\"should_disable_restart()\" ng-click=\"restart_ppmessage(event)\">\n                Restart PPMessage with configed data\n              </md-button>\n            </section>\n\n          </md-content>\n        </div>\n      </md-card>\n\n    </div>\n  </div>\n  \n</md-content>\n\n");
$templateCache.put("templates/dialog/config-android.tmpl.html","<md-dialog aria-label=\"Config Android Device Push\"  ng-cloak>\n  <form ng-submit=\"confirm()\">\n\n    <md-toolbar>\n      <div class=\"md-toolbar-tools\">\n        <h2>Config Android Device Push</h2>\n        <span flex></span>\n        <md-button class=\"md-icon-button\" ng-click=\"cancel()\">\n          <md-icon md-svg-src=\"static/img/icons/ic_close_24px.svg\" aria-label=\"Close dialog\"></md-icon>\n        </md-button>\n      </div>\n    </md-toolbar>\n\n    <md-dialog-content>\n      <div class=\"md-dialog-content\">\n        <h2>Config Android Device Push</h2>\n\n        <p style=\"padding-bottom: 20px;\">\n          For Android device, since Google GCM is not always work in China, so that you may choose an alternative way to push message to Android device. MQTT push is embedded in PPMessage so that it does not need any parameter.\n        </p>\n\n        <md-input-container class=\"md-block\" flex-gt-sm>\n          <label>Android Push Type</label>\n          <md-select ng-model=\"android.type\">\n            <md-option ng-repeat=\"push_type in android.types\" value=\"{{push_type}}\">\n              {{push_type}}\n            </md-option>\n          </md-select>\n        </md-input-container>\n\n        <div ng-if=\"should_show(\'GCM\')\" style=\"padding-top:20px;\">\n          <md-input-container class=\"md-block\">\n            <label>GCM API Key</label>\n            <input ng-model=\"android.gcm.api_key\" required>\n          </md-input-container>\n        </div>\n\n        <div ng-if=\"should_show(\'JPUSH\')\" style=\"padding-top:20px;\">\n          <md-input-container class=\"md-block\">\n            <label>JPUSH Master Secert</label>\n            <input ng-model=\"android.jpush.master_secret\" required>\n          </md-input-container>\n        </div>\n        \n        <p></p>\n      </div>\n    </md-dialog-content>\n    \n    <md-dialog-actions layout=\"row\">\n      \n      <md-button ng-click=\"pass()\">\n        No Android Push, Please Pass\n      </md-button>\n\n      <span flex></span>\n\n      <md-button ng-click=\"cancel()\">\n        Cancel\n      </md-button>\n\n      \n      <md-button type=\"submit\">\n        Confirm\n      </md-button>\n      \n    </md-dialog-actions>\n    \n  </form>\n</md-dialog>\n");
$templateCache.put("templates/dialog/config-database.tmpl.html","<md-dialog aria-label=\"Config PPMessage Database\"  ng-cloak>\n  <form ng-submit=\"confirm()\">\n\n    <md-toolbar>\n      <div class=\"md-toolbar-tools\">\n        <h2>Config PPMessage Database</h2>\n        <span flex></span>\n        <md-button class=\"md-icon-button\" ng-click=\"cancel()\">\n          <md-icon md-svg-src=\"static/img/icons/ic_close_24px.svg\" aria-label=\"Close dialog\"></md-icon>\n        </md-button>\n      </div>\n    </md-toolbar>\n\n    <md-dialog-content>\n      <div class=\"md-dialog-content\">\n        <h2>Config Database</h2>\n\n        <p style=\"padding-bottom: 20px;\">\n          Config database for PPMessage. If not sure what you should do here, choose default and confirm.\n        </p>\n\n        <md-card class=\"md-whiteframe-z2\" flex=\"66\">\n          \n          <md-input-container class=\"md-block\" flex-gt-sm>\n            <label>Database Type</label>\n            <md-select ng-model=\"database.type\">\n              <md-option ng-repeat=\"db_type in database.types\" value=\"{{db_type}}\">\n                {{db_type}}\n              </md-option>\n            </md-select>\n          </md-input-container>\n\n          <div ng-if=\"should_show_sqlite()\" style=\"padding-top:20px;\">\n            <md-input-container class=\"md-block\">\n              <label>Database File Path</label>\n              <input ng-model=\"database.sqlite.db_file_path\" required>\n            </md-input-container>\n          </div>\n          \n          <div ng-if=\"should_show_mysql()\" style=\"padding-top:20px;\">\n            <md-input-container class=\"md-block\">\n              <label>Database Name</label>\n              <input ng-model=\"database.mysql.db_name\" required>\n            </md-input-container>\n\n            <md-input-container class=\"md-block\">\n              <label>Database Host</label>\n              <input ng-model=\"database.mysql.db_host\" required>\n            </md-input-container>\n\n            <md-input-container class=\"md-block\">\n              <label>Database Port</label>\n              <input ng-model=\"database.mysql.db_port\" required>\n            </md-input-container>\n            \n            <md-input-container class=\"md-block\">\n              <label>Database User</label>\n              <input ng-model=\"database.mysql.db_user\" required>\n            </md-input-container>\n\n            <md-input-container class=\"md-block\">\n              <label>Database User Password</label>\n              <input ng-model=\"database.mysql.db_pass\">\n            </md-input-container>\n          </div>\n\n          <div ng-if=\"should_show_pgsql()\" style=\"padding-top:20px;\">\n            <md-input-container class=\"md-block\">\n              <label>Database Name</label>\n              <input ng-model=\"database.pgsql.db_name\" required>\n            </md-input-container>\n\n            <md-input-container class=\"md-block\">\n              <label>Database Host</label>\n              <input ng-model=\"database.pgsql.db_host\" required>\n            </md-input-container>\n\n            <md-input-container class=\"md-block\">\n              <label>Database Port</label>\n              <input ng-model=\"database.pgsql.db_port\" required>\n            </md-input-container>\n            \n            <md-input-container class=\"md-block\">\n              <label>Database User</label>\n              <input ng-model=\"database.pgsql.db_user\" required>\n            </md-input-container>\n\n            <md-input-container class=\"md-block\">\n              <label>Database User Password</label>\n              <input ng-model=\"database.pgsql.db_pass\">\n            </md-input-container>          \n          </div>\n        </md-card>\n        \n        <p></p>\n      </div>\n    </md-dialog-content>\n    \n    <md-dialog-actions layout=\"row\">\n      <span flex></span>\n\n      <md-button ng-click=\"cancel()\">\n        Cancel\n      </md-button>\n      \n      <md-button type=\"submit\" ng-disabled=\"database.disable_submit\">\n        Confirm\n      </md-button>\n      \n    </md-dialog-actions>\n    \n  </form>\n</md-dialog>\n");
$templateCache.put("templates/dialog/config-ios.tmpl.html","<md-dialog aria-label=\"Config Apple Push Network Service\"  ng-cloak>\n  <form ng-submit=\"confirm()\">\n\n    <md-toolbar>\n      <div class=\"md-toolbar-tools\">\n        <h2>Config Apple Push Network Service</h2>\n        <span flex></span>\n        <md-button class=\"md-icon-button\" ng-click=\"cancel()\">\n          <md-icon md-svg-src=\"static/img/icons/ic_close_24px.svg\" aria-label=\"Close dialog\"></md-icon>\n        </md-button>\n      </div>\n    </md-toolbar>\n\n    <md-dialog-content>\n      <div class=\"md-dialog-content\">\n        <h2>Initialize Database</h2>\n\n        <p style=\"padding-bottom: 20px;\">\n          To push message to your iOS app, you should upload your Apple Push Network Service certificates.\n        </p>\n\n        <md-input-container class=\"md-block\">\n          <label>Developer Certificate (.p12) </label>\n          <input type=\"file\" accept=\"application/x-pkcs12\"  onchange=\"angular.element(this).scope().getFileDetails(this, \'dev_cert\')\" required>\n        </md-input-container>\n\n        <md-input-container class=\"md-block\">\n          <label>Developer Certificate Password</label>\n          <input ng-model=\"ios.passwords.dev_cert_password\">\n        </md-input-container>\n\n        <md-input-container class=\"md-block\">\n          <label>Production Certificate (.p12) </label>\n          <input type=\"file\" accept=\"application/x-pkcs12\" onchange=\"angular.element(this).scope().getFileDetails(this, \'pro_cert\')\" required>\n        </md-input-container>\n\n        <md-input-container class=\"md-block\">\n          <label>Production Certificate Password</label>\n          <input ng-model=\"ios.passwords.pro_cert_password\">\n        </md-input-container>\n\n        <md-input-container class=\"md-block\">\n          <label>Combination Certificate (.p12) </label>\n          <input type=\"file\" accept=\"application/x-pkcs12\"  onchange=\"angular.element(this).scope().getFileDetails(this, \'com_cert\')\">\n        </md-input-container>\n\n        <md-input-container class=\"md-block\">\n          <label>Combination Certificate Password</label>\n          <input ng-model=\"ios.passwords.com_cert_password\">\n        </md-input-container>\n\n        <p></p>\n      </div>\n    </md-dialog-content>\n    \n    <md-dialog-actions layout=\"row\">\n\n      <md-button ng-click=\"pass()\">\n        No iOS Push, Please Pass\n      </md-button>\n\n      <span flex></span>\n\n      <md-button ng-click=\"cancel()\">\n        Cancel\n      </md-button>\n\n      <md-button type=\"submit\">\n        Confirm\n      </md-button>\n      \n    </md-dialog-actions>\n    \n  </form>\n</md-dialog>\n");
$templateCache.put("templates/dialog/config-server.tmpl.html","<md-dialog aria-label=\"Config PPMessage Server\"  ng-cloak>\n  <form ng-submit=\"confirm()\">\n\n    <md-toolbar>\n      <div class=\"md-toolbar-tools\">\n        <h2>Config PPMessage Server</h2>\n        <span flex></span>\n        <md-button class=\"md-icon-button\" ng-click=\"cancel()\">\n          <md-icon md-svg-src=\"static/img/icons/ic_close_24px.svg\" aria-label=\"Close dialog\"></md-icon>\n        </md-button>\n      </div>\n    </md-toolbar>\n\n    <md-dialog-content>\n      <div class=\"md-dialog-content\">\n        <h2>Config Server</h2>\n\n        <p style=\"padding-bottom: 20px;\">\n          Config PPMessage server. If not sure what you should do here, choose default and confirm.\n        </p>\n\n        <md-card class=\"md-whiteframe-z2\" flex=\"66\">\n\n          <md-content layout-padding>\n\n            <md-input-container class=\"md-block\" >\n              <label>Server Language</label>\n              <md-select ng-model=\"server.language\">\n                <md-option ng-repeat=\"language in server.languages\" ng-value=\"language\">\n                  {{language.name}}\n                </md-option>\n              </md-select>\n            </md-input-container>\n            \n            <md-switch ng-model=\"server.enable_ssl\" ng-true-value=\"on\" ng-false-value=\"off\">\n              Enable SSL ({{sever.ssl}})\n            </md-switch>\n\n            <md-input-container class=\"md-block\">\n              <label>Server Name</label>\n              <input ng-model=\"server.name\" required>\n            </md-input-container>\n            \n            <md-input-container class=\"md-block\">\n              <label>Server Port</label>\n              <input ng-model=\"server.port\" required>\n            </md-input-container>\n\n            <md-input-container class=\"md-block\">\n              <label>Identicon Store Directory</label>\n              <input ng-model=\"server.identicon_store\" required>\n            </md-input-container>\n\n            <md-input-container class=\"md-block\">\n              <label>Generic Store Directory</label>\n              <input ng-model=\"server.generic_store\" required>\n            </md-input-container>\n\n          </md-content>\n        </md-card>\n        \n      </div>\n    </md-dialog-content>\n    \n    <md-dialog-actions layout=\"row\">\n      <span flex></span>\n\n      <md-button ng-click=\"cancel()\">\n        Cancel\n      </md-button>\n      \n      <md-button type=\"submit\" ng-disabled=\"server.disable_submit\">\n        Confirm\n      </md-button>\n      \n    </md-dialog-actions>\n    \n  </form>\n</md-dialog>\n");
$templateCache.put("templates/dialog/create-first.tmpl.html","<md-dialog aria-label=\"Create First User\"  ng-cloak>\n  <form ng-submit=\"confirm()\">\n\n    <md-toolbar>\n      <div class=\"md-toolbar-tools\">\n        <h2>Create First User</h2>\n        <span flex></span>\n        <md-button class=\"md-icon-button\" ng-click=\"cancel()\">\n          <md-icon md-svg-src=\"static/img/icons/ic_close_24px.svg\" aria-label=\"Close dialog\"></md-icon>\n        </md-button>\n      </div>\n    </md-toolbar>\n\n    <md-dialog-content>\n      <div class=\"md-dialog-content\">\n        <h2>Create First User</h2>\n\n        \n        <p style=\"padding-bottom: 20px;\">\n          Here will create service team and first user of the team, and the user is the leader of the team.\n        </p>\n\n        <md-card class=\"md-whiteframe-z2\" flex=\"66\">\n          <md-content layout-padding>\n            <md-input-container class=\"md-block\">\n              <label>Team Name</label>\n              <input ng-model=\"user.team_name\" required md-no-asterisk>\n            </md-input-container>\n            \n            <md-input-container class=\"md-block\">\n              <label>User Full Name</label>\n              <input ng-model=\"user.user_fullname\" required md-no-asterisk>\n            </md-input-container>\n\n            <md-input-container class=\"md-block\">\n              <label>User Email</label>\n              <input ng-model=\"user.user_email\" type=\"email\" required md-no-asterisk>\n            </md-input-container>\n\n            <md-input-container class=\"md-block md-icon-float md-icon-right\" style=\"padding-left:0px !important;\">\n              <label>User Password</label>\n              <input type=\"{{ user.password_input_type }}\" ng-model=\"user.user_password\" required>\n              <md-icon md-font-set=\"material-icons\" ng-if=\"!user.user_password_is_visible\" ng-click=\"show_user_password(true)\" style=\"cursor:pointer;\"> visibility </md-icon>\n              <md-icon md-font-set=\"material-icons\" ng-if=\"user.user_password_is_visible\" ng-click=\"show_user_password(false)\" style=\"cursor:pointer;\"> visibility_off </md-icon>\n            </md-input-container>\n\n          </md-content>\n        </md-card>\n        \n        <p></p>\n      </div>\n    </md-dialog-content>\n    \n    <md-dialog-actions layout=\"row\">\n      <span flex></span>\n\n      <md-button ng-click=\"cancel()\">\n        Cancel\n      </md-button>\n      \n      <md-button type=\"submit\" ng-disabled=\"user.disable_submit\">\n        Confirm\n      </md-button>\n      \n    </md-dialog-actions>\n    \n  </form>\n</md-dialog>\n");
$templateCache.put("templates/dialog/restart-ppmessage.tmpl.html","<md-dialog aria-label=\"Restart PPMessage with Configuration \"  ng-cloak>\n  <form ng-submit=\"confirm()\">\n\n    <md-toolbar>\n      <div class=\"md-toolbar-tools\">\n        <h2>Restart PPMessage With Configuration</h2>\n        <span flex></span>\n        <md-button class=\"md-icon-button\" ng-click=\"cancel()\">\n          <md-icon md-svg-src=\"static/img/icons/ic_close_24px.svg\" aria-label=\"Close dialog\"></md-icon>\n        </md-button>\n      </div>\n    </md-toolbar>\n\n    <md-dialog-content>\n\n      <div class=\"md-dialog-content\">\n        <h2>Restart PPMessage With Configuration</h2>\n\n        <p style=\"padding-bottom: 20px;\">\n          Now you have configed PPMessage completely. After you restart PPMessage, refresh current page will redirect to PPConsole which is PPMessage management UI.\n        </p>\n\n        <md-card class=\"md-whiteframe-z2\" flex=\"66\">\n          <md-content layout-padding>\n            <md-input-container class=\"md-block md-icon-float md-icon-right\" style=\"padding-left:0px !important;\">\n              <label>User Password</label>\n              <input type=\"{{ user.password_input_type }}\" ng-model=\"user.user_password\" required>\n              <md-icon md-font-set=\"material-icons\" ng-if=\"!user.user_password_is_visible\" ng-click=\"show_user_password(true)\" style=\"cursor:pointer;\"> visibility </md-icon>\n              <md-icon md-font-set=\"material-icons\" ng-if=\"user.user_password_is_visible\" ng-click=\"show_user_password(false)\" style=\"cursor:pointer;\"> visibility_off </md-icon>\n            </md-input-container>\n          </md-content>\n        </md-card>\n      </div>\n      \n    </md-dialog-content>\n    \n    <md-dialog-actions layout=\"row\">\n      <span flex></span>\n\n      <md-button ng-click=\"cancel()\">\n        Cancel\n      </md-button>\n      \n      <md-button type=\"submit\" ng-disabled=\"user.disabled_submit\">\n        Restart\n      </md-button>\n      \n    </md-dialog-actions>\n    \n  </form>\n</md-dialog>\n");}]);