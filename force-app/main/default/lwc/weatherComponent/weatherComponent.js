import { api, wire, track, LightningElement } from 'lwc';
import SHIPPING_CITY_FIELD from '@salesforce/schema/Account.ShippingCity'
import SHIPPING_COUNTRY_FIELD from '@salesforce/schema/Account.ShippingCountry'
import SHIPPING_STATE_FIELD from '@salesforce/schema/Account.ShippingState'
import WHEATHER_KEY_FIELD from '@salesforce/schema/Account.WeatherKey__c'
import { getFieldValue, getRecord } from 'lightning/uiRecordApi';
import { loadStyle } from 'lightning/platformResourceLoader';
import weather from '@salesforce/resourceUrl/weather';

const fields = [SHIPPING_CITY_FIELD, SHIPPING_COUNTRY_FIELD, SHIPPING_STATE_FIELD, WHEATHER_KEY_FIELD];

export default class WeatherComponent extends LightningElement {
    @api recordId;
    @track weather = {
        temp: 0,
        wind: 0,
        humidity: 0
    }
    @wire(getRecord, {recordId: '$recordId', fields})
    account(result){
        if(result.data){
            fetch("https://api.openweathermap.org/data/2.5/weather?q=" + getFieldValue(result.data, SHIPPING_CITY_FIELD) + "&units=metric"  + "&appid=" + getFieldValue(result.data, WHEATHER_KEY_FIELD),
            {
                method:"GET",
                headers:{
                    "Accept":"application/json"
                }
            })
            .then (response => {
                if(response.ok){                
                    return response.json();
                }
            })
            .then(jsonResponse => {
                this.weather.temp = (jsonResponse['main'].temp);
                this.weather.wind = jsonResponse['wind'].speed;
                this.weather.humidity = jsonResponse['main'].humidity;
                return this.weather;
            }).catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                           title: 'Error!', 
                           message: error.message, 
                           variant: 'error'
                       }),
                  );   
            });
            loadStyle(this, weather);
        }else if(result.error){
            this.dispatchEvent(
                new ShowToastEvent({
                       title: 'Error!', 
                       message: error.message, 
                       variant: 'error'
                   }),
              );   
        }
    }   

    get currentTemp(){
        return Math.round(this.weather.temp) +  '\u2103';
    }

    get currentWindSpeed(){
        return Math.round(this.weather.wind) + "m/s";
    }

    get currentHumidity(){
        return this.weather.humidity + "%";
    }
}