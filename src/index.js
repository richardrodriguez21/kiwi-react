import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import gql from 'graphql-tag';
import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { graphql } from 'react-apollo';

import App from './App';
import registerServiceWorker from './registerServiceWorker';

const client = new ApolloClient({
    link: new HttpLink({ uri: 'https://graphql.kiwi.com/' }),
    cache: new InMemoryCache(),
});

//
// client.query({ query: gql`{
//   allFlights(search:{ from:{location:"BCN"}, to:{location:"MAD"}, date:{from:"2018-03-09", to:"2018-03-09"} }){
//     edges {
//       node {
//         airlines{name}
//       }
//     }
//   }
// }` }).then(data => console.log(data))
//     .catch(error => console.error(error));


// function Flights({ data: { todos, refetch } }) {
//     return (
//         <div>
//             <button onClick={() => refetch()}>Refresh</button>
//             <ul>{todos && todos.map(todo => <li key={todo.name}>{todo.name}</li>)}</ul>
//         </div>
//     );
// }

// export default graphql(gql`
//   query FlightsQuery{
//       allFlights(search:{ from:{location:"BCN"}, to:{location:"MAD"}, date:{from:"2018-03-09", to:"2018-03-09"} }){
//             edges {
//               node {
//                 airlines{name}
//               }
//             }
//           }
//   }
// `)(Flights);


// const client = new ApolloClient({
//     link: new HttpLink({ uri: 'https://q80vw8qjp.lp.gql.zone/graphql' }),
//     cache: new InMemoryCache()
// });

// client.query({ query: gql`{ hello }` }).then(console.log);



// ReactDOM.render(<App />, document.getElementById('root'));
ReactDOM.render(<ApolloProvider client={client}>
    <App/>
</ApolloProvider>, document.getElementById('root'));



registerServiceWorker();

