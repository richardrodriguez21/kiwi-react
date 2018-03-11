import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import Autocomplete from 'react-autocomplete';
import Datepicker from 'react-datepicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';


const CitiesQuery = gql`{
  allLocations(options:{locationType:city}){
    edges{
      node{
        name,
        locationId,
        country {
          name
        }
      }
    }
  }
}`;

const FlightsQuery = gql`
query FlightsQuery($from_city: String!, $to_city: String!, $date: Date!)
{
     allFlights(search:{from:{location:$from_city}, to:{location:$to_city}, date:{exact:$date}})
  {
    edges{
      node{
        
        duration,
        price{
          amount,
          currency,
        },
        airlines{
          name
        },
        departure{
          localTime,
          airport{
            name,
            city {
              name,
            },
            country{
              name
            }
          }
        },
        arrival{
          localTime,
          airport{
            name,
            city {
              name,
            },
            country{
              name
            }
          }
        }
      }
    }
  }
}
`;


class CityAutocomplete extends Component{
    constructor(props){
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
    }

    handleChange(e){
        this.props.onCityChange({id: e.target.value, label:e.target.value} );
    }

    handleSelect(label, city){
        this.props.onCityChange(city);
    }

    render(){

        if(this.props.data.loading){
            return <div>Loading Cities ..</div>;
        }

        if(this.props.data.error){
            return <div>Error!</div>
        }

        let cities = this.props.data.allLocations.edges.map(
            node => {
                return { label: node.node.name + ', ' + node.node.country.name , id: node.node.locationId};
            }
        );

      return (
          <Autocomplete items={cities}
                        shouldItemRender={(item, value) => item.label.toLowerCase().indexOf(value.toLowerCase()) > -1}
                        getItemValue={item => item.label}
                        renderItem={(item, highlighted) =>
                            <div
                                key={item.id}
                                style={{ backgroundColor: highlighted ? '#eee' : 'transparent'}}
                            >
                                {item.label}
                            </div>
                        }
                        value={this.props.value.label}
                        // onChange={e => this.setState({ value: e.target.value })}
                        onChange= {this.handleChange}
                        // onSelect={value => this.setState({ value })}
                        onSelect={ (value, item ) => this.handleSelect(value, item)}
          />
      );
    };
}

class DateComponet extends  Component{

    constructor(props){
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(date) {
        this.props.onDateChange(date);
    }

    render(){
        return (
            <Datepicker
                selected={this.props.value}
                onChange={this.handleChange}
            />
        );
    }

}


const FromCityAutocomplete = graphql(CitiesQuery)(CityAutocomplete);
const ToCityAutocomplete = graphql(CitiesQuery)(CityAutocomplete);


class SearchBar extends Component{

    constructor(props){
        super(props);
    }

    render(props){
       return(
           <div className="search-form">
           <div className="from-input">
               <label>From: </label>
               <FromCityAutocomplete value={this.props.from} onCityChange={this.props.onFromChange}/>
           </div>

           <div className="to-input">
               <label htmlFor="">To: </label>
               <ToCityAutocomplete value={this.props.to} onCityChange={this.props.onToChange}/>
           </div>

           <div className="date-input">
               <label htmlFor="">Date: </label>
               <DateComponet value={this.props.startDate} onDateChange={this.props.onStartDateChange} className="test"/>
           </div>

           {/*<DateComponet value={this.props.endDate} onDateChange={this.props.onEndDateChange}/>*/}
        </div>
       )
    }
}


function FlightsTable(props){

    if(props.data.loading){
        return <div>Loading Flights ..</div>;
    }

    if(props.data.error){
        return <div></div>
    }


    let flights = props.data.allFlights.edges.map(
        node => {
            return node.node  ;
        }
    );

    return <div className="flights">{flights.map( flight => <FlightInfoBox flight={flight} /> )}</div>;

}

function FlightInfoBox(props){

    let flight = props.flight;

    return (<article className="flight">
        <header>
            <div className="arlines">
                <label htmlFor="">Airlines(s):</label>
                <div>
                    {
                        flight.airlines.map(
                            airline => {
                                return airline.name + ', '
                            }
                        )
                    }
                </div>
            </div>
        </header>

        <div className="flight-info">
            <div className="departure">
                <header>
                    <h3>Departure</h3>
                </header>
                <div className="airport-info">
                    <label htmlFor="">Airport:</label>
                    <span className="airport-name">{flight.departure.airport.name}</span>
                </div>

                <div className="city-info">
                    <label htmlFor="">City:</label>
                    <span className="city-name">{flight.departure.airport.city.name}</span>
                </div>

                <div className="time">
                    <label htmlFor="">Departure at:</label>
                    <div>{moment(flight.departure.localTime).format('YYYY-MM-DD HH:mm')}</div>
                </div>

            </div>

            <div className="arrival">
                <header>
                    <h3>Arrival</h3>
                </header>
                <div className="airport-info">
                    <label htmlFor="">Airport:</label>
                    <span className="airport-name">{flight.departure.airport.name}</span>
                </div>

                <div className="city-info">
                    <label htmlFor="">City:</label>
                    <span className="city-name">{flight.departure.airport.city.name}</span>
                </div>

                <div className="time">
                    <label htmlFor="">Arrival at:</label>
                    <div>{moment(flight.arrival.localTime).format('YYYY-MM-DD HH:mm')}</div>
                </div>

            </div>

            <div className="price-info">
                <label htmlFor="">Price</label>
                <div className="price"><div className="amount">{flight.price.amount}</div> <div className="currency">{flight.price.currency}</div></div>
            </div>
        </div>



    </article>);

    // return props.flight.airlines[0].name;


}

class FlightSelector extends Component{

    constructor(props){
        super(props);
        this.state = {
            from: {},
            to: '',
            startDate: moment(),
            endDate: '',
            flights: [],
        }

        this.handleFromChange = this.handleFromChange.bind(this);
        this.handleToChange = this.handleToChange.bind(this);
        this.handleStartDateChange = this.handleStartDateChange.bind(this);
        this.handleEndDateChange = this.handleEndDateChange.bind(this);
    }

    handleFromChange(city){
        this.setState({ from: city });
    }

    handleToChange(city){
        this.setState({ to: city });
    }


    handleStartDateChange(start_date){
        this.setState({ startDate: start_date });
    }

    handleEndDateChange(end_date){
        this.setState({ endDate: end_date });
    }

    render(props){

        const FlightsTableWithData = graphql(FlightsQuery, {options: {variables:{from_city: this.state.from.id , to_city: this.state.to.id, date: this.state.startDate.format('YYYY-MM-DD')}  } })(FlightsTable);

        return (
            <div>
                <SearchBar
                    from={this.state.from}
                    onFromChange={this.handleFromChange}
                    to={this.state.to}
                    onToChange = {this.handleToChange}
                    startDate={this.state.startDate}
                    onStartDateChange={this.handleStartDateChange}
                    endDate={this.state.endDate}
                    onEndDateChange={this.handleEndDateChange}
                />
                <FlightsTableWithData flights = {this.state.flights}/>
            </div>
        )
    };

}



class App extends Component {
  render(props) {

    return (
      <div className="App">
          <h1 className="App-title">Flights</h1>
          <FlightSelector/>
      </div>
    );
  }
}



export default App;
