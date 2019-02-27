# Anon Message Board

Microservice project for recording thread style messages, which are included in different boards.
The threads also contain replies. This system of threads is very similar to Reddit's system. Reddit is
a well-known social-media platform used by millions of users. It covers a lot of topics that 
can be discussed. Coming next is a list of endpoints that are available within this microservice.

### Endpoints:

* *POST /api/threads/:board* will create a new thread for the specified board. If the provided board doesn't exist, it will be created and saved in the database. The following is an example of a request body that is needed to successfully make the call to the endpoint:

   ```
    {
      "text": "The Thread",
      "delete_password": "password"
    }
   ```

  The *text* property is the content of the thread that is being created. The *delete_password* property will be used when the user that created thet thread decides that he wants to remove it from the database. To be able to do that, he must re-enter the password that he provided when he created the thread in the first place.

  After this endpoint is executed successfully, a response body like the following is returned: 

   ```
    {
      "_id": "5c7542eb06fd1e2a5a646d09",
      "boardName": "board1",
      "text": "The Thread",
      "created_on": "2019-02-26T12:01:26.119Z",
      "bumped_on": "2019-02-26T12:01:26.119Z",
      "replies": []
    }
   ```
  The *boardName* property has the value "board1" in this case, assuming that is what you provided as a request param.
  The *text* property is the one that the user provides when running the request.
  The *created_on* and *bumped_on* properties contain the timestamp when the request was executed. The *bumped_on*
  property will be updated anytime a new reply is added to the thread.
  Also, an empty array of replies is returned. It can be populated using the next endpoint that is discussed.

  ###### Error Cases

   - If the *text* property is not provided in the request body, or an empty string is used as its value, then the message **"The text of the thread is mandatory and it can't be an an empty string."** will be returned to the user.

   - If the *delete_password* property is not provided in the request body, or an empty string is used as its value, then the message **"The password of the thread is mandatory and it can't be an empty string."** will be returned to the user.


* *POST /api/replies/:board* will create a new reply for a specific thread, which is included in one of the existing boards. The name of the board is specified as a request parameter. The following is an example of a request body that is needed to successfully make the call to the endpoint:

   ```
    {
      "text": "Reply 10",
      "delete_password": "password3",
      "thread_id": "5c752dfc7f1c1c20e7b55811"
    }
   ```

   The *text* property is the content of the reply. The *delete_password* property is used when the user decides in the future that he wants to delete the reply from the thread. The *thread_id* property is used to specify the thread in which the user wants to attach the reply to.

  After this endpoint is executed successfully, a response body like the following is returned: 

   ```
    {
      "_id": "5c7542eb06fd1e2a5a646d09"
      "boardName": "board1",
      "text": "The Thread",
      "created_on": "2019-02-26T12:01:26.119Z",
      "bumped_on": "2019-02-26T12:36:18.449Z",
      "replies": [
        {
          "_id": "5c7543b206fd1e2a5a646d13"
          "text": "Reply 10",
          "created_on": "2019-02-26T12:36:18.449Z"
        }
      ]
    }
   ```
  The first four properties are the same as the ones showed in the previous section. The only difference here is that we added a new reply to the existent thread. The properties *text* and *created_on* are shown for each reply.

  ###### Error Cases

   - If the provided *board* request parameter isn't a name for any existent board from the database, then the message **"The board "board500" doesn't exist."** will be returned to the user. We assume that the user provided the name "board500" for the board as a request parameter, and that board doesn't exist in the database.

   - If the *thread_id* property is not provided in the request body, or an empty string is used as its value, then the message **"The "thread_id" field is mandatory and it can't be an empty string."** will be returned to the user.

   - Here is an example of how the value of the *thread_id* property should look like: "5c752dfc7f1c1c20e7b55811". If the user doesn't provide a value similar to that (for example, the user provides the value "123" for the *thread_id*), then the **"The provided thread id is invalid."** message will be returned to the user.

   - Another error case would be if the user provides a *thread_id* that doesn't belong to any thread in the database. In this case, the following message will be returned to the user: **"A thread with an id of "5c752dfc7f1c1c20e7b55811" doesn't exist."**. We assume that the id included between the quotation marks doesn't really belong to a thread from the database.

   - After going through all the *thread_id* validations, and actually finding an existing thread in the database, we compare the *boardName* property of the thread with the board name provided by the user. If they do not match, the message **"The given thread does not belong to the "board10" board."** will be returned to the user, assuming that the name "board10" is what the user provided when running the request.

   - If the *text* property is not provided in the request body, or an empty string is used as its value, then the **"The text of the reply is mandatory and it can't be an empty string."** message will be returned to the user.

   - If the *delete_password* property is not provided in the request body, or an empty string is used as its value, then the **"The password of the thread is mandatory and it can't be an empty string."** message will be returned to the user.


* *GET /api/threads/:board* returns a list of all the threads included in the specified board (it is specified as a request parameter). The information about the replies of each thread is minimal, displaying the *text* and *created_on* properties. After this endpoint is executed successfully, a response body like the following is returned:

   ```
    [ 
      {
        "_id": "5c7542eb06fd1e2a5a646d09",
        "boardName": "board1",
        "text": "The Thread",
        "created_on": "2019-02-26T12:35:05.585Z",
        "bumped_on": "2019-02-26T13:48:33.955Z",
        "replies": [
          {
            "_id": "5c7543b206fd1e2a5a646d13",
            "text": "Reply 100",
            "created_on": "2019-02-26T13:48:33.955Z"
          },
          {
            "_id": "5c7543ae06fd1e2a5a646d12",
            "text": "Reply 90",
            "created_on": "2019-02-26T13:48:30.033Z"
          }
        ]
      },
      {
        "boardName": "board1",
        "text": "The Thread 2",
        "created_on": "2019-02-26T12:15:56.139Z",
        "bumped_on": "2019-02-26T12:16:55.277Z",
        "replies": [
          {
            "_id": "5c75436106fd1e2a5a646d0b",
            "text": "Reply 1",
            "created_on": "2019-02-26T12:16:55.277Z"
          },
          {
            "_id": "5c75435406fd1e2a5a646d0a",
            "text": "Reply 5",
            "created_on": "2019-02-26T12:16:33.832Z"
          }
        ]
      }
    ]
   ```
  The threads are sorted by the *bumped_on* property in descending order. This timestamp property is updated each time a new reply is added to the thread. The replies displayed for each thread are sorted by the *created_on* property in descending order. Only the most recent three replies are displayed after running this request (a thread could contain more than three replies). If no threads exist in the database, then an empty array will be returned.

  There is only one error case for this particular request. If the user provides as a request parameter a name of a board that doesn't exist in the database, a message like **"The board 'board500' doesn't exist."** will be returned to the user (assuming that "board500" was used as a request param).


* *GET /api/replies/:board* returns the details of a single thread with all its available replies. The information about the replies of each thread is minimal, displaying the *text* and *created_on* properties. After this endpoint is executed successfully, a response body like the following is returned:

   ```
    {
      "_id": "5c7542eb06fd1e2a5a646d09",
      "boardName": "board1",
      "text": "The Thread",
      "created_on": "2019-02-26T12:35:05.585Z",
      "bumped_on": "2019-02-26T12:47:04.658Z",
      "replies": [
        {
          "_id": "5c7543b206fd1e2a5a646d13",
          "text": "Reply 100",
          "created_on": "2019-02-26T13:48:33.955Z"
        },
        {
          "_id": "5c7543ae06fd1e2a5a646d12",
          "text": "Reply 90",
          "created_on": "2019-02-26T13:48:30.033Z"
        },
        {
          "_id": "5c7543a806fd1e2a5a646d11",
          "text": "Reply 80",
          "created_on": "2019-02-26T13:48:23.991Z"
        },
        {
          "_id": "5c7543a306fd1e2a5a646d10",
          "text": "Reply 70",
          "created_on": "2019-02-26T13:48:19.747Z"
        },
        {
          "_id": "5c7543a006fd1e2a5a646d0f",
          "text": "Reply 60",
          "created_on": "2019-02-26T13:48:16.336Z"
        }
      ]
    }
   ```

  The replies displayed for each thread are sorted by the *created_on* property in descending order.

  ###### Error Cases

   - The first error case is if the user provides a name for a board that does not exist in the database. In this case, the message **"The board "board3" doesn't exist."** will be returned to the user ("board3" is just an example).

   - The next error case is when the user doesn't provide a *thread_id* as a request param, or he provides it as an empty string. In that case, the message **"The "thread_id" field is mandatory and it can\'t be an empty string."** will be returned to the user.

   - If the user provides an invalid *thread_id* value, the message **"The provided thread id is invalid."** is returned to the user.

   - If the user provides a *thread_id* that doesn't belong to any thread from the database, then a message like
  **"A thread with an id of "5c7542eb06fd1e2a5a646d09" doesn't exist."** will be returned to the user (the id displayed in the message is an example).

   - The final error that can occur for this endpoint would be when the retrieved thread from the database doesn't have a *boardName* property equal to the provided board name as a request parameter. If this is the case, then a message like **"The given thread does not belong to the "board10" board."** will be returned to the user.

* *DELETE /api/threads/:board* will delete a specific thread and all its related replies from the database. If the request is successful, the message **success** will be returned. The following is an example of a request body that is needed to successfully make the call to the endpoint:

   ```
    {
      "thread_id": "5c755498d78e600c6ecf5472",
      "delete_password": "password2"
    }
   ```

  ###### Error cases

   - The first error case is if the user provides a name for a board that does not exist in the database. In this case, the message **"The board "board3" doesn't exist."** will be returned to the user ("board3" is just an example).

   - The next error case is when the user doesn't provide a *thread_id* as a request param, or he provides it as an empty string. In that case, the message **"The "thread_id" field is mandatory and it can't be an empty string."** will be returned to the user.

   - If the user provides an invalid *thread_id* value, the message **"The provided thread id is invalid."** is returned to the user.

   - If the user provides a *thread_id* that doesn't belong to any thread from the database, then a message like
  **"A thread with an id of "5c7542eb06fd1e2a5a646d09" doesn't exist."** will be returned to the user (the id displayed in the message is an example).

   - If the retrieved thread from the database doesn't have a *boardName* property equal to the provided board name as a request parameter, then a message like **"The given thread does not belong to the "board10" board."** will be returned to the user.

   - If the user doesn't provide the *delete_password* property, or if the value of the property is an empty string, then the message **"The password property is mandatory and it can't be an empty string."** will be returned to the user.
  
   - The last error that can occur is if the user provided thread password doesn't match the one from the database. If this is the case, the message **"incorrect password"** will be returned to the user.

  
* *DELETE /api/replies/:board* will "delete" a reply from a thread. When I say delete in this case, I mean that the text of the reply will be replaced with "[deleted]". The message *success* is returned to the user if the request doesn't encounter any errors. The reply will still be present in the database. The following is an example of a request body that is needed to successfully make the call to the endpoint:

   ```
    {
      "thread_id": "5c755498d78e600c6ecf5472",
      "reply_id": "5c714e592b2bd63544d4896d",
      "delete_password": "password2"
    }
   ```
   You need to specify the *thread_id* property, in order to know in what thread the reply is contained in. Then we have the *reply_id* property, in order to decide which of the thread's replies we want to delete. And finally we have the *delete_password* property, which, if it is the correct one,enables the user to remove the reply from the database.

   ###### Error Cases

    - The first error case is if the user provides a name for a board that does not exist in the database. In this case, the message **"The board "board3" doesn't exist."** will be returned to the user ("board3" is just an example).

    - The next error case is when the user doesn't provide a *thread_id* as a request param, or he provides it as an empty string. In that case, the message **"The "thread_id" field is mandatory and it can't be an empty string."** will be returned to the user.

    - If the user provides an invalid *thread_id* value, the message **"The provided thread id is invalid."** is returned to the user.

    - If the user provides a *thread_id* that doesn't belong to any thread from the database, then a message like **"A thread with an id of "5c7542eb06fd1e2a5a646d09" doesn't exist."** will be returned to the user (the id displayed in the message is an example).

    - If the retrieved thread from the database doesn't have a *boardName* property equal to the provided board name as a request parameter, then a message like **"The given thread does not belong to the "board10" board."** will be returned to the user.

    - The next error is thrown if the user doesn't provide a *reply_id*, or the value that was provided is an empty string. In this case, the message **"The "reply_id" field is mandatory and it can't be an empty string."** will be returned to the user.

    - Other errors that concern the *reply_id* property is when the value provided for it is invalid, or it doesn't belong to any reply from the database. In those cases messages like **"The provided reply id is invalid."** and **"A reply with an id of "5c714e592b2bd63544d4896d" doesn't exist."** respectively will be returned to the user.

    - The final errors regarding the *DELETE /api/replies/:board* endpoint target the *delete_password* property. The first error regarding this property is thrown when the user doesn't provide a value for that property, or just sends an empty string for it. In this case, the message **"The password property is mandatory and it can't be an empty string."** will be returned to the user.
   In the last case, when the input and database passwords don't match, the message **"incorrect password"** is returned.

* *PUT /api/threads/:board* will mark a thread as reported. This means that the *reported* property will be set to true. This is the only value that is being changed after the request is finished. The following is an example of a request body that is needed to successfully make the call to the endpoint:

   ```
    {
      "thread_id": "5c755498d78e600c6ecf5472"
    }
   ```
   After the validation process, the specific thread will be taken from the database. The *reported* property will be set to "true". After that, the new thread will be saved in the database. If everything goes well, the message **"success"** will be sent back to the user.

   ###### Error Cases

    - The first error case is if the user provides a name for a board that does not exist in the database. In this case, the message **"The board "board3" doesn't exist."** will be returned to the user ("board3" is just an example).

    - The next error case is when the user doesn't provide a *thread_id* as a request param, or he provides it as an empty string. In that case, the message **"The "thread_id" field is mandatory and it can't be an empty string."** will be returned to the user.

    - If the user provides an invalid *thread_id* value, the message **"The provided thread id is invalid."** is returned to the user.

    - If the user provides a *thread_id* that doesn't belong to any thread from the database, then a message like **"A thread with an id of "5c7542eb06fd1e2a5a646d09" doesn't exist."** will be returned to the user (the id displayed in the message is an example).

    - If the retrieved thread from the database doesn't have a *boardName* property equal to the provided board name as a request parameter, then a message like **"The given thread does not belong to the "board10" board."** will be returned to the user.


* *PUT /api/replies/:board* will mark a reply as reported. This means that the *reported* property will be set to true. This is the only value that is being changed after the request is finished. The following is an example of a request body that is needed to successfully make the call to the endpoint:

   ```
    {
      "thread_id": "5c755498d78e600c6ecf5472",
      "reply_id": "5c714e592b2bd63544d4896d"
    }
   ```

   After the validation process, the specific thread will be taken from the database using the *thread_id* property. Then, the program will iterate through the array of replies from that thread, and find the specific reply, using the *reply_id* property. If it is found, its *reported* property will be set to "true". The thread will be saved in the database along with the modification made to the reply. If everything goes well, the message **"success"** will be sent back to the user.

   ###### Error Cases

    - The first error case is if the user provides a name for a board that does not exist in the database. In this case, the message **"The board "board3" doesn't exist."** will be returned to the user ("board3" is just an example).

    - The next error case is when the user doesn't provide a *thread_id* as a request param, or he provides it as an empty string. In that case, the message **"The "thread_id" field is mandatory and it can\'t be an empty string."** will be returned to the user.

    - If the user provides an invalid *thread_id* value, the message **"The provided thread id is invalid."** is returned to the user.

    - If the user provides a *thread_id* that doesn't belong to any thread from the database, then a message like **"A thread with an id of "5c7542eb06fd1e2a5a646d09" doesn't exist."** will be returned to the user (the id displayed in the message is an example).

    - If the retrieved thread from the database doesn't have a *boardName* property equal to the provided board name as a request parameter, then a message like **"The given thread does not belong to the "board10" board."** will be returned to the user.

    - The next error is thrown if the user doesn't provide a *reply_id*, or the value that was provided is an empty string. In this case, the message **"The "reply_id" field is mandatory and it can't be an empty string."** will be returned to the user.

    - Other errors that concern the *reply_id* property is when the value provided for it is invalid, or it doesn't belong to any reply from the database. In those cases messages like **"The provided reply id is invalid."** and **"A reply with an id of "5c714e592b2bd63544d4896d" doesn't exist."** respectively will be returned to the user.


## Getting Started

These instructions will get you a copy of the project up and running on your local machine.

### Prerequisites

You need to have ***git***, ***yarn***, ***nodejs*** and ***mongodb*** installed on your computer.

### Installation steps

```
> cd {your_local_path}/mongodb/bin
> ./mongod --dbpath {path_of_mongo_data_folder}
> git clone git@github.com:narcisneacsu194/anon-message-board.git
> cd {your_local_path}/anon-message-board
> npm install
> node server.js
```

You can then access the application with any browser or with software like Postman, using the following URL:

```
localhost:3000
```
