import { HttpClient, HttpHeaders } from "@angular/common/http";
import { LocalStorageService, SessionStorageService } from "src/app/services/storage.service";
import { Injectable } from '@angular/core';
import { ChatEvents } from "./chat-events";
import { Subject, Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { UtilsService } from "src/app/services/utils.service";
import { AppConstants } from "../shared/constants";
import { webSocket } from 'rxjs/webSocket';
@Injectable({
  providedIn: 'root'
})
export class ChatService {
  userOnlineOfflineEvent = new Subject<boolean>();

  mqtt = require("./mqtt.min.js");
  _CLIENT_ADDED = "/clientadded"
  _CLIENT_UPDATED = "/clientupdated"
  _CLIENT_DELETED = "/clientdeleted"
  _CALLBACK_TYPE_ON_MESSAGE_UPDATED_FOR_CONVERSATION = "onMessageUpdatedForConversation"
  _CALLBACK_TYPE_ON_MESSAGE_ADDED_FOR_CONVERSATION = "onMessageAddedForConversation"

  private TILE_DESK_TOKEN_URL = "https://lt3suqvzm22ts7atn4pyo4upni0ifnwd.lambda-url.ap-south-1.on.aws/generate-tiledesk-token";
  private CHAT21_TOKEN_URL = "https://sravqc6xvv6dalsjuu66wyhtvi0iojcy.lambda-url.ap-south-1.on.aws/chat21-authentication";
  private CONVERSATION_URL = environment.TILEDESK_URL + "/chatapi/api/tilechat/";
  private DEPT_DTLS_URL = "https://lt3suqvzm22ts7atn4pyo4upni0ifnwd.lambda-url.ap-south-1.on.aws/departments?projectId=";
  private CHAT_API_URL = environment.CHAT_API_URL;
  private WEBSOCKET_URL = environment.WEBSOCKET_URL;
  private USER_STATUS_WEBSOCKET_URL = environment.USER_STATUS_WEBSOCKET_URL;
  private PROJECT_ID = environment.TILEDESK_PROJECT_ID;
  private CENTRALIZED_CHAT_DETAILS = "https://zbuz4brujg5rfks47lct546o5u0aduge.lambda-url.ap-south-1.on.aws/chat-system-config";
  private CANNED_MESSAGE_LIST = environment.TILEDESK_URL + '/api/' + this.PROJECT_ID + '/canned';
  presenceTopic;
  topicInbox;
  clientId;
  chat21UserID = null;
  chatRequestID = null;
  userFullName = '';
  deptName = '';
  deptID = '';
  departmentNames: string[] = [];
  messageObservable = new Subject<any>();
  centralizedChatDetails: any;
  chatbuddyDeptDetails: any;
  loggedInUserInfo: any;
  roles: any;
  cannedMessageList: any;
  userId: any;
  private deptList: any[] = [];
  private deptListData: any[] = [];



  private newMessageReceived = new Subject<any>();
  newMessageReceived$ = this.newMessageReceived.asObservable();

  private closeFloatingWidgetSubject = new Subject<void>();
  closeFloatingWidgetObservable: Observable<void> = this.closeFloatingWidgetSubject.asObservable();


  closeFloatingWidget() {
    this.closeFloatingWidgetSubject.next();
  }




  lastMessageId: any;
  subject: any;

  constructor(
    public httpClient: HttpClient,
    private localStorageService: LocalStorageService,
    private sessionStorageService: SessionStorageService,
    private utilsService: UtilsService
  ) {
    this.loggedInUserInfo = JSON.parse(sessionStorage.getItem(AppConstants.LOGGED_IN_SME_INFO) || null);
    this.roles = this.loggedInUserInfo ? this.loggedInUserInfo[0]?.roles : null;
  }




  registerMessageReceived(messageReceivedCallback) {
    this.onConversationUpdatedCallbacks.set(0, messageReceivedCallback);
    this.onMessageAddedCallbacks.set(0, messageReceivedCallback);
    this.onMessageUpdatedCallbacks.set(0, messageReceivedCallback);
  }

  initDeptDetails(serviceType?: string) {
    let url = serviceType ? `${this.DEPT_DTLS_URL}${this.PROJECT_ID}&serviceType=${serviceType}`
      : `${this.DEPT_DTLS_URL}${this.PROJECT_ID}`;
    this.httpClient.get(url, this.setHeaders("auth")).subscribe((result: any) => {
      if (result.success && result.data.length > 0) {
        console.log('department result', result);
        this.deptName = result.data[0].name;
        console.log('names', this.deptName)
        this.deptID = result.data[0]._id;
        this.deptList = result.data;
        this.deptListData = result.data;
        this.localStorageService.setItem("CHATBUDDY_DEPT_DETAILS", result.data, true);
        this.centralizedChatDetails = this.localStorageService.getItem('CENTRALIZED_CHAT_CONFIG_DETAILS', true);
        this.deptList = this.deptList.filter((dept) => this.centralizedChatDetails[dept.name] === 'chatbuddy');
        this.onConversationUpdatedCallbacks.forEach((callback, handler, map) => {
          callback(ChatEvents.DEPT_RECEIVED, this.deptList);
        });
      }
    });

  }

  getDeptDetails(): any[] {
    return this.deptListData;
  }

  initChatVariables(requestId) {
    this.chat21UserID = this.localStorageService.getItem('CHAT21_USER_ID');
    this.clientId = this.uuidv4();
    this.presenceTopic = "apps/tilechat/users/" + this.chat21UserID + "/presence/" + this.clientId;
    this.topicInbox = 'apps/tilechat/users/' + this.chat21UserID + '/#';
    this.chatRequestID = requestId;
    this.userFullName = this.localStorageService.getItem('CHAT21_USER_NAME');
  }
  async initTokens(initializeSocket: boolean, service?: string) {

    let tokenPresent: boolean = this.localStorageService.getItem('TILEDESK_TOKEN') ? false : true;
    let request: any = {
      tokenRequired: tokenPresent
    };
    if (service) {
      request = {
        serviceType: service,
        tokenRequired: tokenPresent
      };
    }
    await this.httpClient.post(this.TILE_DESK_TOKEN_URL,
      request,
      this.setHeaders("auth")).subscribe((result: any) => {
        console.log(result);
        if (result.success) {
          if (result?.data?.token) {
            this.localStorageService.setItem("TILEDESK_TOKEN", result.data.token);
          }
          if (result.data?.requestId) {
            this.sessionStorageService.setItem(`${service}_REQ_ID`, result.data.requestId);
          }
          if (tokenPresent) {
            const tiledeskToken = this.localStorageService.getItem('TILEDESK_TOKEN');
            let chat21Request = {
              tiledeskToken: tiledeskToken
            };
            this.httpClient.post(this.CHAT21_TOKEN_URL,
              chat21Request, this.setHeaders("auth")
            ).subscribe((chat21Result: any) => {
              console.log('chat21Token: ', chat21Result);
              if (chat21Result.success) {
                this.localStorageService.setItem("CHAT21_RESULT", chat21Result.data, true);
                this.localStorageService.setItem("CHAT21_TOKEN", chat21Result.data.token);
                this.localStorageService.setItem("CHAT21_USER_ID", chat21Result.data.userid);
                this.localStorageService.setItem("CHAT21_USER_NAME", chat21Result.data.fullname);
                this.initChatVariables(result.data.requestId);
                this.userId = chat21Result.data.userid;
                this.fetchConversationList(0, chat21Result.data.userid);
                this.getCannedMessageList();
                if (initializeSocket) {
                  this.websocketConnection(chat21Result.data.token, '');
                }
              }
            });
          } else {
            let chat21Result = this.localStorageService.getItem("CHAT21_RESULT", true);
            this.initChatVariables(result.requestId);
            this.fetchConversationList(0, chat21Result.userid);
            if (initializeSocket) {
              this.websocketConnection(chat21Result.token, '');
            }
          }
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
          "service": "chat-" + type,
          "environment": environment.lifecycleEnv
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
          "service": "chat-" + type,
          "environment": environment.lifecycleEnv
        })
      };
      return httpOptions;
    }
    if (type == "tileDesk") {
      let TOKEN = this.localStorageService.getItem("TILEDESK_TOKEN");
      httpOptions = {
        headers: new HttpHeaders({
          "Content-Type": "application/json",
          "Authorization": TOKEN,
        })
      };
      return httpOptions;
    }
  }

  fetchConversationList(page, userId: any, departmentId?: any, removeCallback?) {
    // if (!departmentId) {
    //   departmentId = "65e56e777c8dbc0013851f4d";
    // }
    let CONVERSATION_URL = this.CONVERSATION_URL + userId + '/conversations?page=' + page + '&pageSize=20'
    if (departmentId) {
      CONVERSATION_URL += `&departmentId=${departmentId}`
    }
    console.log('conversation url', CONVERSATION_URL);
    this.httpClient.get(CONVERSATION_URL, this.setHeaders("chat21")).subscribe((conversationResult: any) => {
      console.log('conversation result', conversationResult);
      this.conversationList(page, conversationResult.result)
      if (!removeCallback) {
        this.onConversationUpdatedCallbacks.forEach((callback, handler, map) => {
          callback(ChatEvents.CONVERSATION_UPDATED);
        });
      }
    });
  }




  uploadFile(file: File, requestId: string) {
    const url = 'https://6d4ugfehdlpibmogor7ou6ncli0vxoee.lambda-url.ap-south-1.on.aws/tiledesk-file-uplod';
    const UMDtoken = JSON.parse(this.localStorageService.getItem('UMD'));
    let TOKEN = UMDtoken.id_token
    const formData = new FormData();
    formData.append('file', file);
    formData.append('requestId', requestId);

    return this.httpClient.post<any>(url, formData, { headers: { Authorization: `Bearer ${TOKEN}`, environment: environment.lifecycleEnv } })
  }

  fetchMessages(requestId, timeStamp?, pageSize?) {
    let chat21UserId = this.localStorageService.getItem('CHAT21_USER_ID');
    let url = `${this.CHAT_API_URL}/${chat21UserId}/conversations/${requestId}/messages?`;

    if (pageSize) {
      url = url + 'pageSize=' + pageSize;
    } else {
      url = `${this.CHAT_API_URL}/${chat21UserId}/conversations/${requestId}/messages?pageSize=20`;
    }
    if (timeStamp) {
      url = url + '&timeStamp=' + timeStamp;
    }
    this.httpClient.get(url, this.setHeaders("chat21")
    ).subscribe((chat21Result: any) => {
      console.log('fetch messages',chat21Result);
      if (chat21Result.success) {
        if (!timeStamp) {
          this.clearMessagesDB();
        }
        this.updateMessagesDB(chat21Result.result, timeStamp);

        this.onConversationUpdatedCallbacks.forEach((callback, handler, map) => {
          callback(ChatEvents.MESSAGE_RECEIVED);
        });
      }
    });
    let TOKEN = this.localStorageService.getItem("CHAT21_TOKEN");
    this.websocketConnection(TOKEN, requestId);
  }

  conversationList(page, data: any) {

    let transformedData = data.map(message => (
      {
        new: message.is_new,
        name: message.sender_fullname,
        text: message.last_message_text,
        timestamp: message.timestamp,
        request_id: message.conversWith,
        departmentName: message.attributes.departmentName,
        departmentId: message.attributes.departmentId,
        userFullName: message.attributes.userFullname,
        type: message.type,
        recipientFullName: message.recipient_fullname,
        sender: message.sender,
        conversWith: message.conversWith
      })
    );
    if (page != 0) {
      const msgString = this.localStorageService.getItem('conversationList');
      let oldMessageList = JSON.parse(msgString);
      transformedData = [...oldMessageList, ...transformedData];
    }
    this.localStorageService.setItem('conversationList', transformedData, true);


    return transformedData;
  }


  updateConversationList(newMessage: any, conversationLists: any, selectedDepartmentId: any) {
    const shouldUpdate = 
        !selectedDepartmentId || 
        newMessage.attributes.departmentId === selectedDepartmentId;

    if (shouldUpdate) {
        const existingConversationIndex = conversationLists.findIndex(
            (conversation) => conversation.request_id === newMessage.recipient
        );

        const newConversation = {
            image: newMessage.attributes.userFullname[0],
            userFullName: newMessage.attributes.userFullname,
            text: newMessage.text,
            timestamp: newMessage.timestamp,
            request_id: newMessage.recipient,
            type: newMessage.type,
            departmentId: newMessage.attributes.departmentId,
            sender: newMessage.sender,
            recipientFullName: newMessage.recipient_fullname,
        };

        if (existingConversationIndex !== -1) {
            conversationLists[existingConversationIndex] = newConversation;
            conversationLists.unshift(conversationLists.splice(existingConversationIndex, 1)[0]);
        } else {
            conversationLists.unshift(newConversation);
        }

        console.log('Conversation list updated.');
    } else {
        console.log('Message from non-selected department, no update performed.');
    }
}


  clearMessagesDB() {
    this.sessionStorageService.removeItem('fetchedMessages');
  }

  updateMessagesDB(messages: any, timeStamp?: any) {
    let transformedMessages = messages.map(message => ({
      content: message.text,
      sender: message.attributes?.action?.feedback ? "system" : message.sender,
      timestamp: message.timestamp,
      type: message.type,
      senderFullName: (message.sender).startsWith('bot_') ? 'Tax Expert' : message.sender_fullname,
      message_id: message.message_id,
      action: (message?.attributes?.action) ? (message?.attributes?.action) : null,
      subtype: (message?.attributes?.subtype) ? message?.attributes?.subtype : null,
      showOnUI: (message?.attributes?.showOnUI) ? message?.attributes?.showOnUI : null
    }));

    if (timeStamp) {
      const msgString = this.sessionStorageService.getItem('fetchedMessages');
      const oldMessageList = JSON.parse(msgString);
      transformedMessages = [...transformedMessages, ...oldMessageList];
    }

    this.sessionStorageService.setItem('fetchedMessages', transformedMessages, true)
    return transformedMessages;
  }

  addMessageToDB(message: any) {
    let messagesString = this.sessionStorageService.getItem('fetchedMessages');
    let messages = messagesString ? JSON.parse(messagesString) : [];

    let m = {
      content: message.text,
      sender: message.attributes?.action?.feedback ? "system" : message.sender,
      timestamp: message.timestamp,
      type: message.type,
      senderFullName: message.sender.startsWith('bot_') ? 'Tax Expert' : message.sender_fullname,
      message_id: message.message_id,
      action: message.attributes?.action || null,
      subtype: message.attributes?.subtype || null,
      showOnUI: message.attributes?.showOnUI || null,
      conversWith: message.conversWith || message.recipient,
      recipient: message.recipient,
      recipient_fullname: message.recipient_fullname,
      metadata: message.metadata || "",
      channel_type: message.channel_type,
      app_id: message.app_id
    };

    const existingMessageIndex = messages.findIndex(msg => msg.message_id === m.message_id);

    if (existingMessageIndex !== -1) {
      messages[existingMessageIndex] = { ...messages[existingMessageIndex], ...m };
    } else {
      messages.push(m);
    }

    messages.sort((a, b) => a.timestamp - b.timestamp);

    this.sessionStorageService.setItem('fetchedMessages', messages, true);

    return messages;
  }

  uuidv4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      let r = Math.random() * 16 | 0, v = c == "x" ? r : (r & 0x3 | 0x8);
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

    let options = {
      keepalive: 60,
      reconnectPeriod: 1000,
      will: {
        topic: this.presenceTopic,
        payload: "{\"disconnected\":true}",
        qos: 1,
        retain: true,
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

    this.chatClient.on("connect",
      () => {
        if (this.log) {
          console.log("Chat client connected. this.connected:" + this.connected);
        }
        if (!this.connected) {
          if (this.log) {
            console.log("Chat client first connection for:" + this.chat21UserID);
          }


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
                  const messageJson = JSON.parse(message.toString())
                  console.log('message received', messageJson);
                  this.chatbuddyDeptDetails = this.localStorageService.getItem('CHATBUDDY_DEPT_DETAILS', true);
                  this.centralizedChatDetails = this.localStorageService.getItem('CENTRALIZED_CHAT_CONFIG_DETAILS', true);
                  this.loggedInUserInfo = JSON.parse(sessionStorage.getItem(AppConstants.LOGGED_IN_SME_INFO) || null);
                  this.roles = this.loggedInUserInfo ? this.loggedInUserInfo[0]?.roles : null;
                  let receivedMessageDeptName = this.chatbuddyDeptDetails.filter(element => element._id === messageJson?.attributes?.departmentId);
                  if (messageJson?.sender && !messageJson.sender?.startsWith('bot_') && messageJson.sender != 'system' && messageJson.sender != 'metadata' && messageJson.sender != this.chat21UserID && this.centralizedChatDetails[receivedMessageDeptName[0].name] === 'chatbuddy' && this.roles?.includes('ROLE_LEADER') && this.loggedInUserInfo[0]?.serviceEligibility_GST) {
                    this.messageObservable.next(messageJson);
                  }
                  console.log("topic sk :" + topic + "\nmessage payload:" + message);
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
                    if (topic.includes("/conversations/") && topic.endsWith(this._CLIENT_UPDATED)) {
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
                    if (topic.includes("/conversations/") && topic.endsWith(this._CLIENT_DELETED)) {
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
                    if (topic.includes("/archived_conversations/") && topic.endsWith(this._CLIENT_ADDED)) {
                      // map.forEach((value, key, map) =>)
                      this.onArchivedConversationAddedCallbacks.forEach((callback, handler, map) => {
                        callback(JSON.parse(message.toString()), _topic);
                      });
                    }
                  }

                  if (this.onArchivedConversationDeletedCallbacks) {
                    if (topic.includes("/archived_conversations/") && topic.endsWith(this._CLIENT_DELETED)) {
                      // map.forEach((value, key, map) =>)
                      this.onArchivedConversationDeletedCallbacks.forEach((callback, handler, map) => {
                        callback(JSON.parse(message.toString()), _topic);
                      });
                    }
                  }
                  if (topic.includes("/messages/") && topic.endsWith(this._CLIENT_ADDED)) {
                    if (this.onMessageAddedCallbacks) {
                      const messageJson = JSON.parse(message.toString());
                      let fetchedMessages = this.sessionStorageService.getItem('fetchedMessages');
                      fetchedMessages = JSON.parse(fetchedMessages);
                      if (fetchedMessages) {
                        fetchedMessages?.forEach(item => {
                          if (item?.message_id === messageJson?.attributes?.action?.message_id) {
                            item.action = messageJson?.attributes?.action
                          }
                        });
                        this.sessionStorageService.setItem('fetchedMessages', fetchedMessages, true);
                      }


                      if (this.lastMessageId != messageJson.message_id) {
                        this.lastMessageId = messageJson.message_id;
                        this.newMessageReceived.next(message_json);
                        let selectedUser = this.localStorageService.getItem('SELECTED_CHAT', true);
                        if (messageJson.recipient === selectedUser?.request_id) {
                          this.onMessageAddedCallbacks.forEach((callback, handler, map) => {
                            this.addMessageToDB(JSON.parse(message.toString()));
                            callback(ChatEvents.MESSAGE_RECEIVED);
                          });
                        }
                      }
                    }
                    let update_conversation = true;

                    if (message_json.attributes && !message_json.attributes.updateconversation) {
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
                    if (topic.includes("/messages/") && topic.endsWith(this._CLIENT_UPDATED)) {
                      this.onMessageUpdatedCallbacks.forEach((callback, handler, map) => {
                        callback(JSON.parse(message.toString()), _topic);
                      });
                    }
                  }

                  if (this.onGroupUpdatedCallbacks) {
                    if (topic.includes("/groups/") && topic.endsWith(this._CLIENT_UPDATED)) {
                      this.onGroupUpdatedCallbacks.forEach((callback, handler, map) => {
                        callback(JSON.parse(message.toString()), _topic);
                      });
                    }
                  }

                  // // ******* NEW!!
                  this.callbackHandlers.forEach((value, key, map) => {
                    const callback_obj = value;
                    const type = callback_obj.type;
                    if (topic.includes("/messages/") && topic.endsWith(this._CLIENT_ADDED)) {
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
                    if (topic.includes("/messages/") && topic.endsWith(this._CLIENT_UPDATED)) {
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
    );
  }

  initRxjsWebsocket(conversWith) {
    const tiledeskToken = this.localStorageService.getItem('TILEDESK_TOKEN');
    this.subject = webSocket(`${this.USER_STATUS_WEBSOCKET_URL}/?token=${tiledeskToken}`);
    const projectUserMsg = { "action": "subscribe", "payload": { "topic": `/${this.PROJECT_ID}/requests/${conversWith}` } }
    this.subject.next(projectUserMsg);
    let userTopic;
    this.subject.subscribe({
      next: (msg: any) => {
        if (msg.action == "heartbeat") {
          if (msg.payload.message.text == "ping") {
            this.subject.next({ action: "heartbeat", payload: { message: { text: "pong" } } });
          }
          return;
        }
        if (msg.action == "publish") {
          if (msg.payload.topic === projectUserMsg.payload.topic) {
            this.subject.next({ "action": "subscribe", "payload": { "topic": `/${this.PROJECT_ID}/project_users/users/${msg.payload.message.requester.uuid_user}` } });
            userTopic = `/${this.PROJECT_ID}/project_users/users/${msg.payload.message.requester.uuid_user}`;
            this.localStorageService.setItem('USER_ONLINE_OFFLINE_DATA', msg.payload.message.requester, true)
            this.userOnlineOfflineEvent.next(true);
          }
          if (msg.payload.topic === userTopic) {
            this.localStorageService.setItem('USER_ONLINE_OFFLINE_DATA', msg.payload.message, true)
            this.userOnlineOfflineEvent.next(true);
          }
        }
      },
      error: err => console.log('rxjs error ' + err), // Called if at any point WebSocket API signals some kind of error.
      complete: () => console.log('rxjs complete') // Called when connection is closed (for whatever reason).
    });
  }

  unsubscribeRxjsWebsocket() {
    if (this.subject) {
      this.subject.unsubscribe();
    }
  }


  parseTopic(topic) {
    var topic_parts = topic.split("/");
    if (topic_parts.length >= 7) {
      const recipient_id = topic_parts[5];
      const convers_with = recipient_id;
      const parsed = {
        "conversWith": convers_with
      }
      return parsed;
    }
    return null;
  }

  getMessageAttributes(payload: any, notification?: any, isFromPushNotification: boolean = false) {
    let chatToken = this.localStorageService.getItem("CHAT21_TOKEN");
    let user = this.localStorageService.getItem('SELECTED_CHAT', true);
    const departmentId = isFromPushNotification ? notification?.attributes?.departmentId : user?.departmentId;
    const departmentName = isFromPushNotification ? notification?.attributes?.departmentName : user?.departmentName;
    const userFullName = isFromPushNotification ? notification?.attributes?.userFullname : user?.userFullName;

    let attributes = {
      "departmentId": departmentId,
      "departmentName": departmentName,
      "ipAddress": "103.97.240.182",
      "client": "",
      "sourcePage": "",
      "sourceTitle": "Angular web app",
      "projectId": this.PROJECT_ID,
      "widgetVer": "v.5.0.71.3",
      "payload": [],
      "userFullname": userFullName,
      "requester_id": chatToken,
      "lang": "en",
      "tempUID": this.uuidv4()
    }
    
    if (!isFromPushNotification) {
      attributes["action"] = payload;
  }
    return attributes;
  };

  sendMessage(message: string, recipient: string, payloads?: any, notification?: any, isFromPushNotification: boolean = false) {
    // console.log("sendMessage sattributes:", attributes);
    let dest_topic;
    if (recipient) {
      dest_topic = `apps/tilechat/outgoing/users/${this.chat21UserID}/messages/${recipient}/outgoing`;
    } else {
      dest_topic = `apps/tilechat/outgoing/users/${this.chat21UserID}/messages/${this.chatRequestID}/outgoing`;
    }
    let outgoing_message = {
      text: message,
      type: "text",
      recipient_fullname: 'Bot',
      sender_fullname: this.userFullName,
      attributes: this.getMessageAttributes(payloads, notification, isFromPushNotification),
      metadata: "",
      channel_type: "group"
    };

    // console.log("outgoing_message:", outgoing_message)
    const payload = JSON.stringify(outgoing_message);
    this.chatClient.publish(dest_topic, payload, null, (err) => {
      // callback(err, outgoing_message)
      console.log(err);
    });
  }

  botMessage(requestId) {
    const chatToken = this.localStorageService.getItem("CHAT21_TOKEN");
    let user = this.localStorageService.getItem('SELECTED_CHAT', true);
    const departmentId = user?.departmentId;
    const departmentName = user?.departmentName;
    const userFullName = user?.userFullName;
    const url = `${environment.TILEDESK_URL}/api/65e56b0b7c8dbc0013851dcb/requests/${requestId}/messages/`
    let requestBody = {
      "type": "text",
      "text": "CONTINUE_BOT",
      "sender": "system",
      "recipient_fullname": 'Bot',
      "sender_fullname": this.userFullName,
      "metadata": "",
      "channel_type": "group",
      "attributes": {
        "subtype": "info",
        "showOnUI": "BO",
        "departmentId": departmentId,
        "departmentName": departmentName,
        "ipAddress": "103.97.240.182",
        "client": "",
        "sourcePage": "",
        "sourceTitle": "Angular web app",
        "projectId": this.PROJECT_ID,
        "widgetVer": "v.5.0.71.3",
        "payload": [],
        "userFullname": userFullName,
        "requester_id": chatToken,
        "lang": "en",
        "tempUID": this.uuidv4()
      },
    }
    return this.httpClient.post(url, requestBody, this.setHeaders("tileDesk"));
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
          this.chatSubscription = null;
          this.topicInbox = null;
        })
      });
    }
  }

  getCentralizedChatApiDetails() {
    if (!this.localStorageService.getItem("CENTRALIZED_CHAT_CONFIG_DETAILS", true)) {
      let url = `${this.CENTRALIZED_CHAT_DETAILS}`;
      this.httpClient.get(url, this.setHeaders("auth")).subscribe((result: any) => {
        if (result.success) {
          this.centralizedChatDetails = result.data.UI;
          this.localStorageService.setItem("CENTRALIZED_CHAT_CONFIG_DETAILS", result.data.UI, true);
        } else {
          this.utilsService.showSnackBar(result.message);
        }
      },
        error => {
          this.utilsService.showSnackBar('Failed to Save the system config api Details');
        });

    }
  }

  getCannedMessageList() {
    if (!this.localStorageService.getItem("CANNED_MESSAGE_LIST", true)) {
      let url = `${this.CANNED_MESSAGE_LIST}`;
      this.httpClient.get(url, this.setHeaders("tileDesk")).subscribe((result: any) => {
        if (result) {
          this.cannedMessageList = result;
          this.localStorageService.setItem("CANNED_MESSAGE_LIST", result, true);
          this.filterCannedMessages();
        }
      },
        error => {
        });

    }
  }

  filterCannedMessages() {
    this.cannedMessageList = this.localStorageService.getItem("CANNED_MESSAGE_LIST", true);
    let selectedUser = this.localStorageService.getItem('SELECTED_CHAT', true);
    let cannedMessageArray = [];
    let messageArray = [];
    messageArray = this.cannedMessageList.map((message: any) => ({ title: message.title, titleWithSlash: '/' + message.title, text: message.text, allowDept: (message?.attributes) ? message?.attributes?.departments : [] }));
    cannedMessageArray = messageArray.filter(element => element.allowDept.length === 0);
    messageArray.forEach(element => {
      if (element.allowDept.length > 0 && selectedUser && element.allowDept.includes(selectedUser.departmentId)) {
        cannedMessageArray.push(element);
      }
    });
    return cannedMessageArray;
  }

}
