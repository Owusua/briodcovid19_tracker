import React, { useState, useEffect } from 'react';
import { MenuItem, FormControl, Select, Card, CardContent} from "@material-ui/core";
import InfoBox from './InfoBox';
import Map from "./Map";
import Table from "./Table";
import { sortData, prettyPrintStat } from "./util";
import LineGraph from "./LineGraph";
import "leaflet/dist/leaflet.css";
import './App.css';

function App() {

  //this section is for State management
  const [countries, setCountries] = useState([]);
  //default select item
  const [country, setCountry] = useState('worldwide');
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState("cases");

// STATE = How to write a variable in REACT
//
//USEEFFECT = Runs a piece of code base on a given condition

useEffect(() => {
 fetch("https://disease.sh/v3/covid-19/all")
 .then(response => response.json())
 .then(data => {
   setCountryInfo(data);
 })
}, []);

useEffect(() => {
  //async  -> send a request, wait for it, do something with the info

  const getCountriesData = async () => {
    await fetch ("https://disease.sh/v3/covid-19/countries")
    .then((response) => response.json()) //get response and take the json from it
    .then((data) => {
      const countries = data.map((country) => ({
          name: country.country, //United States, United Kingdom
          value: country.countryInfo.iso2 //UK, USA, FR
        }));

      const sortedData = sortData(data);
      setTableData(sortedData);
      setMapCountries(data);
      setCountries(countries);
  
    });
  };

  getCountriesData();
}, []);  //anytime [countries] is loaded the code in the useEffect is run

const onCountryChange = async (event) => {
  const countryCode = event.target.value;

  const url = countryCode === 'worldwide' 
   ? 'https://disease.sh/v3/covid-19/all'
   : `https://disease.sh/v3/covid-19/countries/${countryCode}`

   await fetch(url)
   .then(response => response.json())
   .then(data => {
      setCountry(countryCode); //update input field
      setCountryInfo(data); //stores response of country's info into a variable
      
      
      setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
      setMapZoom(4);
      
    });
};

console.log("COUNTRY INFO >>>", countryInfo);

  return (
    <div className="app">

      <div className="app__left">
        <div className="app__header">
          <h1>COVID-19 tracker</h1>
          <FormControl className="app__dropdown">
            <Select variant="outlined" onChange={onCountryChange} value={country}>
              <MenuItem value="worldwide">Worldwide</MenuItem>

              {
                countries.map((country) => (
                  <MenuItem value={country.value}>{country.name}</MenuItem>
                ))
              }


            </Select>
          </FormControl>
        </div>

        <div className="app__stats">
          <InfoBox 
          isRed
          active={casesType === "cases"}
          onClick={(e) => setCasesType("cases")}
          title="Coronavirus Cases" cases={prettyPrintStat(countryInfo.todayCases)} total={prettyPrintStat(countryInfo.cases)} />

          <InfoBox 
          active={casesType === "recovered"}
          onClick={(e) => setCasesType("recovered")}
          title="Recovered" cases={prettyPrintStat(countryInfo.todayRecovered)} total={prettyPrintStat(countryInfo.recovered)} />

          <InfoBox
          isRed
          active={casesType === "deaths"}
          onClick={(e) => setCasesType("deaths")} 
          title="Deaths" cases={prettyPrintStat(countryInfo.todayDeaths)} total={prettyPrintStat(countryInfo.deaths)} />
        </div>
        <Map 
        casesType={casesType}
        countries={mapCountries} center={mapCenter} zoom={mapZoom}/>
      </div>
      <Card className="app__right">
        <CardContent>
          <h3>Live Cases by Country</h3>
          <Table countries={tableData} />
          <h3 className="app__graphTitle">Worldwide new {casesType}</h3>
          <LineGraph className="app__graph" casesType={casesType}/>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
