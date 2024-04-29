import { HttpClient, HttpHeaders } from "@angular/common/http";
import { LocalStorageService, SessionStorageService } from "src/app/services/storage.service";
import { AppConstants } from "../shared/constants";
import { Injectable } from '@angular/core';
import { ChatEvents } from "./chat-events";
@Injectable({
  providedIn: 'root'
})
export class ChatService {

  mqtt = require("./mqtt.min.js");
  _CLIENTADDED = "/clientadded"
  _CLIENTUPDATED = "/clientupdated"
  _CLIENTDELETED = "/clientdeleted"
  _CALLBACK_TYPE_ON_MESSAGE_UPDATED_FOR_CONVERSATION = "onMessageUpdatedForConversation"
  _CALLBACK_TYPE_ON_MESSAGE_ADDED_FOR_CONVERSATION = "onMessageAddedForConversation"

  private TILEDESK_TOKEN_URL = "https://lt3suqvzm22ts7atn4pyo4upni0ifnwd.lambda-url.ap-south-1.on.aws/generate-tiledesk-token";
  private CHAT21_TOKEN_URL = "https://sravqc6xvv6dalsjuu66wyhtvi0iojcy.lambda-url.ap-south-1.on.aws/chat21-authentication";
  private CONVERSATION_URL = "https://tiledesk.taxbuddy.com/chatapi/api/tilechat/659f70587e6a8d00122fb149/conversations";
  private DEPT_DTLS_URL = "https://lt3suqvzm22ts7atn4pyo4upni0ifnwd.lambda-url.ap-south-1.on.aws/departments?projectId=";
  private CHAT_API_URL = "https://tiledesk.taxbuddy.com/chatapi/api/tilechat";
  private WEBSOCKET_URL = "wss://tiledesk.taxbuddy.com/mqws/ws";
  private PROJECT_ID = "65e56b0b7c8dbc0013851dcb";

  presenceTopic;
  topicInbox;
  clientId;
  chat21UserID = null;
  chatRequestID = null;
  userFullName = '';
  deptName = '';
  deptID = '';
  departmentNames: string[] = [];

  constructor(public httpClient: HttpClient,
    private localStorageService: LocalStorageService,
    private sessionStorageService: SessionStorageService,
  ) {
  }

  registerMessageReceived(messageReceivedCallback) {
    this.onConversationUpdatedCallbacks.set(0, messageReceivedCallback);
    this.onMessageAddedCallbacks.set(0, messageReceivedCallback);
    this.onMessageUpdatedCallbacks.set(0, messageReceivedCallback);
  }

  initDeptDetails(serviceType?: string) {
    let url = serviceType ? `${this.DEPT_DTLS_URL}${this.PROJECT_ID}&serviceType=${serviceType}`
      : `${this.DEPT_DTLS_URL}${this.PROJECT_ID}`;
    let deptList = [];
    this.httpClient.get(url, this.setHeaders("auth")).subscribe((result: any) => {
      console.log('fetch departments result', result);
      if (result.success && result.data.length > 0) {
        this.deptName = result.data[0].name;
        console.log('names', this.deptName)
        this.deptID = result.data[0]._id;
        deptList = result.data;

        this.onConversationUpdatedCallbacks.forEach((callback, handler, map) => {
          callback(ChatEvents.DEPT_RECEIVED, deptList);
        });
      }
    });

  }

  initChatVariables(requestId) {
    this.chat21UserID = this.localStorageService.getItem('CHAT21_USER_ID');
    this.clientId = this.uuidv4();
    this.presenceTopic = "apps/tilechat/users/" + this.chat21UserID + "/presence/" + this.clientId;
    this.topicInbox = 'apps/tilechat/users/' + this.chat21UserID + '/#';
    this.chatRequestID = requestId;
    this.userFullName = this.localStorageService.getItem('CHAT21_USER_NAME');
  }
  async initTokens(service?: string) {
    //curl --location 'https://lt3suqvzm22ts7atn4pyo4upni0ifnwd.lambda-url.ap-south-1.on.aws/generate-tiledesk-token' \
    // --header 'Authorization: Bearer eyJraWQiOiJHVHdqQ3RJXC9mOEg0R25YM1FWMU1VaE1hZWNFUFhSY1N5eFY1bWFUemJaST0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJjNzY3NTkzYS0xZmQyLTQ0OGEtYjE5Mi1jZjA1NzcwZTQ3YTUiLCJldmVudF9pZCI6IjQwNTNmOTIzLWIxZGYtNGYxYy04NmJlLWE2ZWE3ZjAxZWQ3YiIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiYXdzLmNvZ25pdG8uc2lnbmluLnVzZXIuYWRtaW4iLCJhdXRoX3RpbWUiOjE3MDkyODgyMjAsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC5hcC1zb3V0aC0xLmFtYXpvbmF3cy5jb21cL2FwLXNvdXRoLTFfN0dIRVNoOXJiIiwiZXhwIjoxNzA5Mzc0NjIwLCJpYXQiOjE3MDkyODgyMjAsImp0aSI6IjI4ZGY2MzZhLWIwY2UtNDgyNS1hZjNiLWE5ZGUyMDc0OGMwMSIsImNsaWVudF9pZCI6InBkdHBlb2duOGEydmlpbW9uZDF1MGRlYmkiLCJ1c2VybmFtZSI6ImM3Njc1OTNhLTFmZDItNDQ4YS1iMTkyLWNmMDU3NzBlNDdhNSJ9.KaQ0BNQtLKiona0GI0sIgto0u3FfVUsF--MWXQz7jedbACxsG9NX4GSr79TIjnrFwZLU5YBp73vJTP5oXi5JsbR37voKCGb5GgfrmdwEDOKpvPqbK2eUFXZ65c9pjWQ1-jNRVZ89QTA--E9FTWVVJF-nVRisVN7FIrGdl4wyZl14T9LrYBnunBiWoEygpwFZtaXwTXjl2GxXmysSngSqVg1HdMSXTGuHX4t7T5pNxTwp72ahBx7y8ofNbjH1liwYcC9HqGJ3HFlYu5IWhVkD16Tpn4UziaKa6iFN-pbsAcarMWzzsTPKzMX3zsy6QI98sfYt6WYlaMC_eS9S7llIuQ' \
    // --header 'environment: qa' \
    // --header 'Content-Type: application/json' \
    // --data '{"serviceType":"ITR"}'
    let request = null;
    if (service) {
      request = { serviceType: service };
    }
    this.httpClient.post(this.TILEDESK_TOKEN_URL,
      request,
      this.setHeaders("auth")).subscribe((result: any) => {
        console.log(result);
        if (result.success) {
          this.localStorageService.setItem("TILEDESK_TOKEN", result.data.token);
          console.log("tiledesk token: ", result.data.token);
          if (result.data.requestId) {
            this.sessionStorageService.setItem(`${service}_REQ_ID`, result.data.requestId);
          }
          let chat21Request = {
            tiledeskToken: result.data.token
          };
          this.httpClient.post(this.CHAT21_TOKEN_URL,
            chat21Request, this.setHeaders("auth")
          ).subscribe((chat21Result: any) => {
            console.log('chat21Token: ', chat21Result);
            if (chat21Result.success) {
              this.localStorageService.setItem("CHAT21_TOKEN", chat21Result.data.token);
              this.localStorageService.setItem("CHAT21_USER_ID", chat21Result.data.userid);
              this.localStorageService.setItem("CHAT21_USER_NAME", chat21Result.data.userid);

              // let chat21Token = {
              //   chat21token: chat21Result.data.token
              // };
              // this.fetchConversationList(chat21Result.data.userid);

              // if (service) {
                this.initChatVariables(result.data.requestId);
                console.log('req',result.data.requestId);
                this.fetchConversationList(chat21Result.data.userid);

                // this.fetchMessages(result.data.requestId);
              // }
            }
          });
        }
      });
  }


  setHeaders(type: any = "auth") {
    let httpOptions: any = {};

    if (type == "auth") {
      const UMDtoken = JSON.parse(this.localStorageService.getItem('UMD'));
      let TOKEN = UMDtoken.id_token
      httpOptions = {
        headers: new HttpHeaders({
          "Content-Type": "application/json",
          "Authorization": "Bearer " + TOKEN,
          "service": "chat-" + type
        })
      };
      return httpOptions;
    }
    if (type == "chat21") {
      let TOKEN = this.localStorageService.getItem("CHAT21_TOKEN");
      httpOptions = {
        headers: new HttpHeaders({
          "Content-Type": "application/json",
          "Authorization": TOKEN,
          "service": "chat-" + type
        })
      };
      return httpOptions;
    }
  }

  fetchConversationList(userId: any) {
    const CONVERSATION_URL = `https://tiledesk.taxbuddy.com/chatapi/api/tilechat/${userId}/conversations`
    this.httpClient.get(CONVERSATION_URL, this.setHeaders("chat21")).subscribe((conversationResult: any) => {
      console.log('conversation result', conversationResult);
      const newarrays = this.conversationList(conversationResult.result);
      // for (const conversation of newarrays) {
      //   console.log('request_id ', conversation.request_id);
      //   this.fetchMessages(conversation.request_id);
      // }
      this.onConversationUpdatedCallbacks.forEach((callback, handler, map) => {
        callback(ChatEvents.CONVERSATION_UPDATED);
      });
      console.log('newarray', newarrays);
    });
  }


  uploadFile(file: File, requestId: string) {
    const url = 'https://6d4ugfehdlpibmogor7ou6ncli0vxoee.lambda-url.ap-south-1.on.aws/tiledesk-file-uplod';
    const UMDtoken = JSON.parse(this.localStorageService.getItem('UMD'));
    let TOKEN = UMDtoken.id_token
    const formData = new FormData();
    formData.append('file', file);
    formData.append('requestId', requestId);

    return this.httpClient.post<any>(url, formData, { headers: { Authorization: `Bearer ${TOKEN}` } })
  }

  fetchMessages(requestId) {
    let url = `${this.CHAT_API_URL}/${this.chat21UserID}/conversations/${requestId}/messages?pageSize=30`;
    this.httpClient.get(url, this.setHeaders("chat21")
    ).subscribe((chat21Result: any) => {
      console.log('fetch messages result', chat21Result);
      if (chat21Result.success) {
        console.log('new result', chat21Result.result);
        this.clearMessagesDB();
        let transformedMessages = this.updateMessagesDB(chat21Result.result);

        this.onConversationUpdatedCallbacks.forEach((callback, handler, map) => {
          callback(ChatEvents.MESSAGE_RECEIVED);
        });
      }
    });
    let TOKEN = this.localStorageService.getItem("CHAT21_TOKEN");
    this.websocketConnection(TOKEN, requestId);
  }

  conversationList(data: any) {

    const transformedData = data.map(message => ({

      new: message.is_new,
      name: message.recipient_fullname,
      text: message.last_message_text,
      timestamp: message.timestamp,
      request_id: message.conversWith

    }))
    this.localStorageService.setItem('conversationList', JSON.stringify(transformedData), true)
    return transformedData;
  }


  clearMessagesDB() {
    this.sessionStorageService.removeItem('fetchedMessages');
  }

  updateMessagesDB(messages: any) {
    const transformedMessages = messages.map(message => ({
      content: message.text,
      sender: message.sender,
      timestamp: message.timestamp,
      type: message.type
    }));

    this.sessionStorageService.setItem('fetchedMessages', transformedMessages, true)
    console.log('transformed array', transformedMessages);
    return transformedMessages;
  }

  addMessageToDB(message: any) {
    const messagesString = sessionStorage.getItem("fetchedMessages");

    if (messagesString) {
      const messages = JSON.parse(messagesString);
      const transformedMessages = messages.map(message => ({
        content: message.content,
        sender: message.sender,
        timestamp: message.timestamp,
        type: message.type
      }));
      let m = {
        content: message.text,
        sender: message.sender,
        timestamp: message.timestamp,
        type: message.type
      };
      transformedMessages.push(m);
      this.sessionStorageService.setItem('fetchedMessages', transformedMessages, true)
      return transformedMessages;
    }
  }

  uuidv4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == "x" ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  chatClient = null;
  log = true;
  connected = false;
  onConversationAddedCallbacks = new Map();
  onConversationUpdatedCallbacks = new Map();
  onConversationDeletedCallbacks = new Map();
  onArchivedConversationAddedCallbacks = new Map();
  onArchivedConversationDeletedCallbacks = new Map();
  onMessageAddedCallbacks = new Map();
  onMessageUpdatedCallbacks = new Map();
  onGroupUpdatedCallbacks = new Map();
  callbackHandlers = new Map();

  chatSubscription = null;
  websocketConnection(chat21Token, requestId) {

    this.initChatVariables(requestId);
    // this.presenceTopic = "apps/tilechat/users/" + this.chat21UserID + "/presence/" + this.clientId;

    let options = {
      keepalive: 60,
      // protocolId: 'MQTT',
      // protocolVersion: 4,
      ////clean: true,
      reconnectPeriod: 1000,
      // connectTimeout: 30 * 1000,
      will: {
        topic: this.presenceTopic,
        payload: "{\"disconnected\":true}",
        qos: 1,
        retain: true,
        ////message: 'willMessage'
      },
      clientId: this.clientId,
      username: "JWT",
      password: chat21Token,
      rejectUnauthorized: false
    };
    if (this.log) {
      console.log("starting mqtt connection with LWT on:", this.presenceTopic, this.WEBSOCKET_URL);
    }

    this.chatClient = this.mqtt.connect(this.WEBSOCKET_URL, options);

    this.chatClient.on("connect", // TODO if token is wrong it must reply with an error!
      () => {
        if (this.log) {
          console.log("Chat client connected. this.connected:" + this.connected);
        }
        if (!this.connected) {
          if (this.log) {
            console.log("Chat client first connection for:" + this.chat21UserID);
          }
         
          this.connected = true;
          this.chatClient.publish(
              this.presenceTopic,
              JSON.stringify({ connected: true }),
              null, (err) => {
                if (err) {
                  console.error("Error con presence publish:", err);
                }
              }
          );

          if (this.log) {
            console.log("subscribing to:", this.chat21UserID, "topic", this.topicInbox);
          }
          if (!this.chatSubscription) {
            this.chatSubscription = this.chatClient.subscribe(this.topicInbox, (err) => {
              if (err) {
                console.error("An error occurred while subscribing user", this.chat21UserID, "on topic:", this.topicInbox, "Error:", err);
              }
              if (this.log) {
                console.log("subscribed to:", this.topicInbox, " with err", err);
              }
              this.chatClient.on("message", (topic, message) => {
                if (this.log) {
                  console.log("topic:" + topic + "\nmessage payload:" + message);
                }
                const _topic = this.parseTopic(topic);
                if (!_topic) {
                  if (this.log) {
                    console.log("Invalid message topic:", topic);
                  }
                  return;
                }
                const conversWith = _topic.conversWith;
                try {
                  const message_json = JSON.parse(message.toString());

                  if (this.onConversationUpdatedCallbacks) {
                    // example topic: apps.tilechat.users.ME.conversations.CONVERS-WITH.clientdeleted
                    if (topic.includes("/conversations/") && topic.endsWith(this._CLIENTUPDATED)) {
                      if (this.log) {
                        console.log("conversation updated! /conversations/, topic:", topic);
                      }
                      // map.forEach((value, key, map) =>)
                      this.onConversationUpdatedCallbacks.forEach((callback, handler, map) => {
                        callback(JSON.parse(message.toString()), _topic);
                      });
                    }
                  }

                  if (this.onConversationDeletedCallbacks) {
                    if (topic.includes("/conversations/") && topic.endsWith(this._CLIENTDELETED)) {
                      // map.forEach((value, key, map) =>)
                      if (this.log) {
                        console.log("conversation deleted! /conversations/, topic:", topic, message.toString());
                      }
                      this.onConversationDeletedCallbacks.forEach((callback, handler, map) => {
                        callback(JSON.parse(message.toString()), _topic);
                      });
                    }
                  }

                  if (this.onArchivedConversationAddedCallbacks) {
                    if (topic.includes("/archived_conversations/") && topic.endsWith(this._CLIENTADDED)) {
                      // map.forEach((value, key, map) =>)
                      this.onArchivedConversationAddedCallbacks.forEach((callback, handler, map) => {
                        callback(JSON.parse(message.toString()), _topic);
                      });
                    }
                  }

                  if (this.onArchivedConversationDeletedCallbacks) {
                    if (topic.includes("/archived_conversations/") && topic.endsWith(this._CLIENTDELETED)) {
                      // map.forEach((value, key, map) =>)
                      this.onArchivedConversationDeletedCallbacks.forEach((callback, handler, map) => {
                        callback(JSON.parse(message.toString()), _topic);
                      });
                    }
                  }
                  if (topic.includes("/messages/") && topic.endsWith(this._CLIENTADDED)) {
                    if (this.onMessageAddedCallbacks) {
                      this.onMessageAddedCallbacks.forEach((callback, handler, map) => {
                        // console.log("DEBUG: MESSAGE:", message)
                        let messages = this.addMessageToDB(JSON.parse(message.toString()));
                        callback(ChatEvents.MESSAGE_RECEIVED);

                      });
                    }
                    // Observing conversations added from messages
                    // console.log("Observing conversations added from messages", message_json);
                    // if (this.onConversationAddedCallbacks) {
                    let update_conversation = true;

                    if (message_json.attributes && message_json.attributes.updateconversation == false) {
                      update_conversation = false;
                    }
                    if (update_conversation && this.onConversationAddedCallbacks) {
                      this.onConversationAddedCallbacks.forEach((callback, handler, map) => {
                        message_json.is_new = true;
                        const message_for_conv_string = JSON.stringify(message_json);
                        callback(JSON.parse(message_for_conv_string), _topic);
                      });
                    }
                    // }
                  }
                  // }

                  if (this.onMessageUpdatedCallbacks) {
                    if (topic.includes("/messages/") && topic.endsWith(this._CLIENTUPDATED)) {
                      this.onMessageUpdatedCallbacks.forEach((callback, handler, map) => {
                        callback(JSON.parse(message.toString()), _topic);
                      });
                    }
                  }

                  if (this.onGroupUpdatedCallbacks) {
                    if (topic.includes("/groups/") && topic.endsWith(this._CLIENTUPDATED)) {
                      this.onGroupUpdatedCallbacks.forEach((callback, handler, map) => {
                        callback(JSON.parse(message.toString()), _topic);
                      });
                    }
                  }

                  // // ******* NEW!!
                  this.callbackHandlers.forEach((value, key, map) => {
                    const callback_obj = value;
                    // callback_obj = {
                    //     "type": "onMessageUpdatedForConversation",
                    //     "conversWith": conversWith,
                    //     "callback": callback
                    // }
                    const type = callback_obj.type;
                    if (topic.includes("/messages/") && topic.endsWith(this._CLIENTADDED)) {
                      if (this.log) {
                        console.log("/messages/_CLIENTADDED");
                      }
                      if (type === this._CALLBACK_TYPE_ON_MESSAGE_ADDED_FOR_CONVERSATION) {
                        if (conversWith === callback_obj.conversWith) {
                          if (this.log) {
                            console.log("/messages/_CLIENTADDED on: ", conversWith);
                          }
                          callback_obj.callback(JSON.parse(message.toString()), _topic);
                        }
                      }
                    }
                    if (topic.includes("/messages/") && topic.endsWith(this._CLIENTUPDATED)) {
                      if (this.log) {
                        console.log("/messages/_CLIENTUPDATED");
                      }
                      if (type === this._CALLBACK_TYPE_ON_MESSAGE_UPDATED_FOR_CONVERSATION) {
                        if (conversWith === callback_obj.conversWith) {
                          if (this.log) {
                            console.log("/messages/_CLIENTUPDATED on: ", conversWith);
                          }
                          callback_obj.callback(JSON.parse(message.toString()), _topic);
                        }
                      }
                    }
                  });

                } catch (err) {
                  console.error("ERROR:", err);
                }
              });
            });
          }
        }

        // this.chatClient.publish(
        //   /// this.presence_topic,
        //   JSON.stringify({ connected: true }),
        //   null, (err) => {
        //     if (err) {
        //       console.error("Error con presence publish:", err);
        //     }
        //   }
        // );

      }
    );
    this.chatClient.on("reconnect",
      () => {
        if (this.log) {
          console.log("Chat client reconnect event");
        }
      }
    );
    this.chatClient.on("close",
      () => {
        this.connected = false;
        if (this.log) {
          console.log("Chat client close event");
        }
        //TODO: here, all previous registered callbacks must be unregistered & cleared to avoid memory leaks
      }
    );
    this.chatClient.on("offline",
      () => {
        if (this.log) {
          console.log("Chat client offline event");
        }
      }
    );
    this.chatClient.on("error",
      (error) => {
        console.error("Chat client error event", error);
      }
      //TODO: here, all previous registered callbacks must be unregistered & cleared to avoid memory leaks
    );



  }

  parseTopic(topic) {
    var topic_parts = topic.split("/");
    // /apps/tilechat/users/(ME)/messages/RECIPIENT_ID/ACTION
    if (topic_parts.length >= 7) {
      const app_id = topic_parts[1];
      const sender_id = topic_parts[3];
      const recipient_id = topic_parts[5];
      const convers_with = recipient_id;
      const me = sender_id;
      const parsed = {
        "conversWith": convers_with
      }
      return parsed;
    }
    return null;
  }

  getMessageAttributes() {
    let chatToken = this.sessionStorageService.getItem("CHAT21_TOKEN");
    return {
      "departmentId": this.deptID,
      "departmentName": this.deptName,
      "ipAddress": "103.97.240.182",
      "client": "",
      "sourcePage": "",
      "sourceTitle": "Angular web app",
      "projectId": this.PROJECT_ID,
      "widgetVer": "v.5.0.71.3",
      "payload": [],
      "userFullname": this.userFullName,
      "requester_id": chatToken,
      "lang": "en",
      "tempUID": this.uuidv4()
    }
  };

  sendMessage(message: string) {
    // console.log("sendMessage sattributes:", attributes);
    let dest_topic = `apps/tilechat/outgoing/users/${this.chat21UserID}/messages/${this.chatRequestID}/outgoing`;
    console.log(dest_topic);
    // console.log("dest_topic:", dest_topic)
    let outgoing_message = {
      text: message,
      type: "text",
      recipient_fullname: 'Bot',
      sender_fullname: this.userFullName,
      attributes: this.getMessageAttributes(),
      metadata: "",
      channel_type: "group"
    };
    // console.log("outgoing_message:", outgoing_message)
    const payload = JSON.stringify(outgoing_message);
    console.log('payload',payload)
    this.chatClient.publish(dest_topic, payload, null, (err) => {
      // callback(err, outgoing_message)
      console.log(err);
    });
  }

  closeWebSocket() {
    if (this.topicInbox) {
      this.chatClient.unsubscribe(this.topicInbox, (err) => {
        if (this.log) { console.log("unsubscribed from", this.topicInbox); }
        this.chatClient.end(() => {
          this.connected = false
          // reset all subscriptions
          this.onConversationAddedCallbacks = new Map();
          this.onConversationUpdatedCallbacks = new Map();
          this.onConversationDeletedCallbacks = new Map();
          this.onArchivedConversationAddedCallbacks = new Map();
          this.onArchivedConversationDeletedCallbacks = new Map();
          this.onMessageAddedCallbacks = new Map();
          this.onMessageUpdatedCallbacks = new Map();
          this.onGroupUpdatedCallbacks = new Map();
          this.callbackHandlers = new Map();
          // this.on_message_handler = null
          this.topicInbox = null;
          // if (callback) {
          //   callback();
          // }
        })
      });
    }
  }

}
