# Multithreaded async stack processing using Node and Mongo
__The aim of this package is to allow people to process information using child scripts that are instantiated using events sent via mongodb and handled by worker farm__

## Possible applications
1. Web scraping
2. On-Page SEO Analysis (see example)
3. Complex mathematics functions and expressions that benefit from multithreaded computation
4. Access multiple API's and combine all of the information into a single response
5. On-damand transcoding workers for any type of data streams that are supported by node
6. Instantiate any other script by commandline
7. Process lots of stuff at once (-\.\.o)

## Requirements
1. MongoDB installed on your system
2. Some experience with mongoose (basic)
3. NodeJS (obviously)

## Usage
__Listener__
The listener will check for changes in the DB at a certain interval within the `processStacks` collection that is in the `data_processor` database.
1. Configure your database and farm options (check src/config folder)
2. Configure the Child class so you can process whatever you want
3. Instantiate the App class with appropriate config (see index.js - there are examples included)
4. Within the callback you will be able to parse the result of the callback. The format of the output is:
    ```
    {
        processor: {
            counter: {number}
            input: {Object}
        },
        output: {} | [] | ""
    }
    ```
5. Start your listener by using `node index.js`

__Processor__
1. In order to add processes to the queue you must insert in the database `data_processor` an entry in the processStacks collection with the following format:
    ```
    {
        input: {
            ...
        },
        status: "queued"
    }
    ```
2. The input data will be sent to the child script that is sent to the App class (see index.js)
3. All of the entries will be added to the stack by `StackHandler` and will begin processing immediately
4. The output is handled in the callback sent to App.js (check __Listener__ section)

## Examples
### On-Page SEO  
```cd examples/OnPageSEO```  
```npm install```

This particular example is used just to illustrate a basic usage of this application, nothing really usefull here, just some counts.

This application is separated within 2 parts:
1. Listener (simply outputs using console.log the data of the processor)
2. Enqueuer - adds websites to the queue

__Listener__
1. Does nothing but logs the output of the processor
2. Command  
    ```node analysisListener.js```
3. You will se a log whenever a website has been processed

__Processor__
1. Handles the input of multiple websites using arguments
2. Command   
    ```node analysis.js -w="https://facebook.com" -w="https://www.apple.com"```