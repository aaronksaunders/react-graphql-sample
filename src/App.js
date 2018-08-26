import React, { Component } from 'react';
import './App.css';

import { ApolloProvider,  Query, Mutation  } from "react-apollo";
import gql from "graphql-tag";
import ApolloClient from "apollo-boost";

// create the client, specify the uri from the graph ql
// server you have setup
const client = new ApolloClient({
  uri: "https://r9x8jkr0qn.lp.gql.zone/graphql"
});

// this is the query for getting all of the messages, the object in the 
// data response holding the results will be `messaeges` the properties in
// the array of responses are id,content,author and created
const GET_MESSAGES = gql`
  {
    messages : getAllMessages {
      id,
      content,
      author,
      created
    }
  }
`;

// this is the query for adding a message, the object in the 
// data response holding the results will be `addMessage` the properties in
// the response are id,content,author, created and updated
//
// `MessageInput` is the type for defined for the format of the input
// variables for this mutation
const ADD_MESSAGE = gql`
  mutation add($msgInput: MessageInput!) {
    addMessage : createMessage(input: $msgInput) {
      id
      content
      author
      created
      updated
    }
  }
`;



const Messages = ({ }) => (
  <div  style={{border:'solid', margin : 10, padding : 10, borderWidth :1}}>
    <h2>MessagesComponent</h2>
    <Query query={GET_MESSAGES}> 
      {({ loading, error, data }) => {
        if (loading) return "Loading...";
        if (error) return `Error From GetMessages Query: ${error.message}`;

        return (
          <div>
            {data.messages.map(message => (
              <div key={message.id}>
                <div> {message.id}  {message.content} </div>
                <div> {message.created} </div>   
              </div>         
            ))}
          </div>
        );
      }}
    </Query>
  </div>
);



const AddMessage = () => {
  let input = {
    author : "",
    content : ""
  };

  /**
   * function to update the cache after the mutation is completed
   */
  const cacheUpdate = (cache, { data: { addMessage } }) => {
    // 1) get messages from cache
    const { messages } = cache.readQuery({ query: GET_MESSAGES });

    // 2) add the new message cache
    cache.writeQuery({
      query: GET_MESSAGES,
      data: { messages: messages.concat([addMessage]) }
    });
  }

  /**
   * function to take the input from the input fields and create the object
   * to be passed as the mutation parameters, then clear the input
   * form
   * 
   * @param {*} e 
   * @param {*} addMessage 
   */
  const addMessageBtnClicked = (e, addMessage) => {
    e.preventDefault();
    addMessage({ variables: { 
      msgInput: {
        author : input.author.value,
        content : input.content.value,
        created: new Date() + ""
      }
     } });
    input = {
      author : "",
      content : ""
    };
  }

  return (
    <div style={{
      border:'solid', margin : 10, padding : 10, borderWidth :1
      }}>
      <h2>AddMessageComponent</h2>
      <Mutation mutation={ADD_MESSAGE}
        update={cacheUpdate}
      >
        {(addMessage, { data }) => (
          <div>
            <form onSubmit={
              e =>  addMessageBtnClicked(e,addMessage)
            }>
              <input ref={
                node => { input.content = node; }
              }/>
              <input ref={
                node => { input.author = node; }
              }/>            
              <button type="submit">Add Message</button>
            </form>
          </div>
        )}
      </Mutation>
    </div>
  );
};

class App extends Component {
  render() {
    return (
      <ApolloProvider client={client}>
        <div className="App">
          <header className="App-header">
            <h1 className="App-title">Welcome to React GraphQL Sample</h1>
          </header>
          <div className="App-intro">
            <AddMessage />
          </div>
          <Messages/>
        </div>
      </ApolloProvider>
    );
  }
}

export default App;
