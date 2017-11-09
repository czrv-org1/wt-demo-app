import React from 'react';
import {Link} from "react-router";
import ReactModal from "react-modal";

import moment from 'moment';

import Web3 from 'web3';
var web3 = new Web3(new Web3.providers.HttpProvider(window.localStorage.web3Provider));

import Select from 'react-select';
var _ = require('lodash');

export default class App extends React.Component {

    constructor() {
      super();
      this.state = {
        indexAddress: '0x0000000000000000000000000000000000000000',
        hotels: [],
        hotelOptions: [],
        hotel: {
          name: '',
          address: '',
          units: []
        },
        newUnitType: {},
        newUnit: {},
        editUnit: {},
        editHotelUnitFunction: 'setActive',
        createNewUnitType: false,
        showPassword: false,
        hotelSelected: '',
        txs: [],
        bookings: [],
        transaction: {},
        importKeystore: JSON.parse(window.localStorage.wallet) || '',
        loading: false,
        section: 'hotels',
        userType: 'unknown',
        hotelSection: 'list',
        hotelManager: {}
      }
    }

    componentWillMount(){
      if (
        window.localStorage.wtIndexAddress
        && window.localStorage.wtIndexAddress.length > 0
        && web3.eth.getCode(window.localStorage.wtIndexAddress) != '0x0'
        // && window.localStorage.userType == 'Hotel'
        // && window.localStorage.wallet.length > 0
      )
        {
        let hotelManager = new HotelManager({
          indexAddress: window.localStorage.wtIndexAddress,
          owner: JSON.parse(window.localStorage.wallet).address,
          web3: web3,
          gasMargin: 1.5
        })
        console.log(hotelManager);
        console.log(web3);
        hotelManager.setWeb3(web3);
        //hotelManager.WTIndex.setProvider(web3.currentProvider);
        this.setState({hotelManager: hotelManager}, ()=>{this.getHotels()});
        // wtHotelLib.setIndex(window.localStorage.indexAddress);
        // wtHotelLib.wallet.setKeystore(window.localStorage.wallet);
        // this.setState({indexAddress: window.localStorage.indexAddress});
        // this.updateData();
      } else
        window.location.replace(window.location.origin+'/#/');
    }

    // logout(){
    //   wtHotelLib.wallet.closeWallet();
    //   window.localStorage.userType = "";
    //   window.location.replace(window.location.origin+'/#/');
    //   window.location.reload();
    // }

    async createHotel(){
      var self = this;
      self.setState({loading: true, createHotelError: false});
      try {
        web3.eth.accounts.wallet.decrypt([self.state.importKeystore], self.state.password);
        let newHotel = await self.state.hotelManager.createHotel(self.state.newHotelName, self.state.newHotelDescription);
        console.log(newHotel);
        await self.getHotels();
        self.setState({loading: false, hotelSection: "list"});
        //self.selectHotel(newHotel.address);
        // await self.updateData();
        // self.selectHotel(newHotel.address);
        // self.setState({wtHotel: { address: newHotel.address, name: await newHotel.name(), unitTypes:[] },
        //   loading: false,
        //   section: 'hotels',
        //   hotelSection: 'list',
        //   newHotelName: '',
        //   newHotelDescription: '',
        //   password: ''});
      }
      catch(e) {
        console.log("Error creating the hotel", e);
        self.setState({loading: false, createHotelError: true});
      }
    }

    // async editHotel(){
    //   var self = this;
    //   self.setState({loading: true, editHotelError: false});

    //   try {
    //     // Edit wtHotel address
    //     await wtHotelLib.changeHotelInfo(
    //       self.state.password,
    //       self.state.hotel.address,
    //       self.state.hotel.name,
    //       self.state.hotel.description
    //     );

    //     // Edit wtHotel address
    //     await wtHotelLib.changeHotelAddress(
    //       self.state.password,
    //       self.state.hotel.address,
    //       self.state.hotel.lineOne,
    //       self.state.hotel.lineTwo,
    //       self.state.hotel.zip,
    //       self.state.hotel.country
    //     );

    //     // Edit hotel location
    //     // To represent 40.426371, -3.703578 GPS position
    //     // (90 + 40.426371)*10^5, (180 + (-3.703578))*10^5 = 13042637, 17629642
    //     // Timezone is represented from 0 to 23, being 0 = UTC and 23 = +22UTC
    //     await wtHotelLib.changeHotelLocation(
    //       self.state.password,
    //       self.state.hotel.address,
    //       parseInt(self.state.hotel.timezone),
    //       self.state.hotel.latitude,
    //       self.state.hotel.longitude
    //     );
    //     await self.updateData();
    //     self.setState({
    //       loading: false,
    //       hotelSection: 'list',
    //       password: ''
    //     });
    //   }
    //   catch(e) {
    //     console.log("Error updating the hotel", e);
    //     self.setState({loading: false, editHotelError: true});
    //   }

    // }

    // async addHotelUnitType(){
    //   var self = this;
    //   self.setState({loading: true, addHotelUnitTypeError: false});

    //   try {
    //     if (_.findIndex(self.state.hotel.units,{ type: self.state.newUnitType.type}) < 0)
    //       await wtHotelLib.addUnitType(self.state.password, self.state.hotel.address, self.state.newUnitType.type);

    //     await wtHotelLib.addUnit(
    //       self.state.password,
    //       self.state.hotel.address,
    //       self.state.newUnitType.type,
    //       self.state.newUnitType.name,
    //       self.state.newUnitType.description,
    //       1,
    //       self.state.newUnitType.maxGuests,
    //       self.state.newUnitType.price+' '+self.state.newUnitType.currency
    //     );
    //     await self.updateData();
    //     // select hotel again, so it uses the fresh version (that includes the just created room)
    //     self.selectHotel(self.state.hotel.address);
    //     self.setState({section: 'hotels', hotelSection: 'list', loading: false, password: ''});
    //   }
    //   catch(e) {
    //     console.log("Error adding hotel room", e);
    //     self.setState({loading: false, addHotelUnitTypeError: true});
    //   }
    // }

    async addUnit(){
      var self = this;
      self.setState({loading: true, addHotelUnitTypeError: false});

      try {
        web3.eth.accounts.wallet.decrypt([self.state.importKeystore], self.state.password);
        let tx = await self.state.hotelManager.addUnit(self.state.hotel.address, self.state.unitType);
        console.log(tx);

        await self.getHotels();
        // select hotel again, so it uses the fresh version (that includes the just created room)
        self.selectHotel(self.state.hotel.address);
        self.setState({section: 'hotels', hotelSection: 'list', loading: false});
      }
      catch(e) {
        console.log("Error adding hotel room", e);
        self.setState({loading: false, addHotelUnitTypeError: true});
      }
    }

    async addUnitType(){
      var self = this;
      self.setState({loading: true, addHotelUnitTypeError: false});

      try {
        web3.eth.accounts.wallet.decrypt([self.state.importKeystore], self.state.password);
        let tx = await self.state.hotelManager.addUnitType(self.state.hotel.address, self.state.newUnitType.type);
        console.log(tx);

        await self.getHotels();
        // select hotel again, so it uses the fresh version (that includes the just created room)
        self.selectHotel(self.state.hotel.address);
        self.setState({section: 'hotels', hotelSection: 'list', loading: false});
      }
      catch(e) {
        console.log("Error adding hotel room", e);
        self.setState({loading: false, addHotelUnitTypeError: true});
      }
    }

    async editUnitType() {
      var self = this;
      self.setState({loading: true, addHotelUnitTypeError: false});

      try {
        web3.eth.accounts.wallet.decrypt([self.state.importKeystore], self.state.password);

        await self.state.hotelManager.editUnitType(
          self.state.hotel.address,
          self.state.unitType,
          (self.state.newUnitType.description || self.state.unitTypeInfo.description),
          (self.state.newUnitType.minGuests || self.state.unitTypeInfo.minGuests),
          (self.state.newUnitType.maxGuests || self.state.unitTypeInfo.maxGuests),
          (self.state.newUnitType.price || self.state.unitTypeInfo.price)
        );

        await self.getHotels();
        // select hotel again, so it uses the fresh version (that includes the just created room)
        self.selectHotel(self.state.hotel.address);
        self.setState({section: 'hotels', hotelSection: 'list', loading: false, newUnitType: {}});

      } catch(e) {
        console.log("Error adding hotel room", e);
        self.setState({loading: false, addHotelUnitTypeError: true});
      }
    }

    async editHotelUnit() {
      var self = this;
      self.setState({loading: true, addHotelUnitError: false});

      let args = [
        self.state.hotel.address,
        self.state.unit
      ]
      //async setCurrencyCode(hotelAddress: Address, unitAddress: Address, code: Number, converter: Function, convertStart: Date, convertEnd: Date)
      //async setDefaultLifPrice(hotelAddress: Address, unitAddress: Address, price: String | Number | BN)
      //async setDefaultPrice(hotelAddress: Address, unitAddress: Address, price: Number)
      //async setUnitActive(hotelAddress: Address, unitAddress: Address, active: Boolean)
      //async setUnitSpecialLifPrice(hotelAddress: Address, unitAddress: Address, price: String | Number | BN, fromDate: Date, amountDays: Number)
      //async setUnitSpecialPrice(hotelAddress: Address, unitAddress: Addres, price: Number, fromDate: Date, amountDays: Number)
      switch(self.state.editHotelUnitFunction) {
        case 'setUnitActive':
          args.push(self.state.unitInfo.active);
          break;
      }

      try {
        web3.eth.accounts.wallet.decrypt([self.state.importKeystore], self.state.password);

        await self.state.hotelManager[self.state.editHotelUnitFunction](...args);

        await self.getHotels();
        // select hotel again, so it uses the fresh version (that includes the just created room)
        self.selectHotel(self.state.hotel.address);
        self.setState({section: 'hotels', hotelSection: 'list', loading: false, newUnitType: {}});
      } catch(e) {
        console.log("Error adding hotel room", e);
        self.setState({loading: false, addHotelUnitError: true});
      }
    }

    // starteditHotelUnitType(val) {
    //   var self = this;
    //   var editUnit = self.state.editUnit;
    //   editUnit.index = val.index;
    //   editUnit.label = val.label;
    //   editUnit.name = val.name;
    //   editUnit.description = val.description;
    //   editUnit.maxGuests = val.maxGuests;
    //   editUnit.price = val.price.split(' ')[0];
    //   editUnit.currency = val.price.split(' ')[1] || 'USD';
    //   editUnit.type = val.type.replace(/\W+/g, "");
    //   self.setState({editUnit: editUnit, section: 'editHotelUnitType'});
    // }

    // loadBookings(){
    //   var self = this;
    //   self.setState({
    //     bookings: wtHotelLib.getBookings(),
    //     loading: false,
    //     section: 'hotelBookings'
    //   });
    // }

    // async editHotelUnitType(){
    //   var self = this;
    //   self.setState({loading: true, editHotelUnitTypeError: false});

    //   try {
    //     await wtHotelLib.editUnit(
    //       self.state.password,
    //       self.state.hotel.address,
    //       self.state.editUnit.type,
    //       self.state.editUnit.index,
    //       self.state.editUnit.name,
    //       self.state.editUnit.description,
    //       1,
    //       self.state.editUnit.maxGuests,
    //       self.state.editUnit.price+' '+self.state.editUnit.currency
    //     );
    //     // load data & select hotel again, so it uses the fresh version (that includes the just edited room)
    //     await self.updateData();
    //     self.selectHotel(self.state.hotel.address);
    //     self.setState({section: 'hotels', hotelSection: 'list', loading: false, password: ''});
    //   }
    //   catch(e) {
    //     console.log("Error updating the hotel room", e);
    //     self.setState({loading: false, editHotelUnitTypeError: true});
    //   }
    // }

    selectHotel(address) {
      var selectedHotel = this.state.hotels[address];
      selectedHotel.address = address;
      let unitTypeOptions = [];
      Object.entries(selectedHotel.unitTypes).forEach(([key, value]) => {
        unitTypeOptions.push({ value: key, label: key})
      });
      console.log('selectedHotel');
      console.log(selectedHotel);

      this.setState({
        hotel: selectedHotel,
        createNewUnitType: selectedHotel.unitTypeNames.length == 0,
        unitType: unitTypeOptions[0] ? unitTypeOptions[0].value: '',
        unitTypeInfo: unitTypeOptions[0] ? selectedHotel.unitTypes[unitTypeOptions[0].value].info : '',
        unitTypeOptions: unitTypeOptions
      });
    }

    async loadHotel(address){
      await this.setState({loading: true});
      //await this.updateData();
      this.selectHotel(address);
      await this.setState({loading: false});
    }

    // loadTxs(){
    //   var self = this;
    //   this.setState({loading: true});
    //   var txs = wtHotelLib.wallet.getTxs();
    //   function decodeData(params){
    //     for (var i = 0; i < params.length; i++) {
    //       if (params[i].name == 'data' && params[i].type == 'bytes'){
    //         params[i].decoded = wtHotelLib.abiDecoder.decodeMethod(params[i].value);
    //         decodeData(params[i].decoded.params);
    //       }
    //     }
    //     return params;
    //   }
    //   for (var i = 0; i < txs.length; i++) {
    //     txs[i].decoded = wtHotelLib.abiDecoder.decodeMethod(txs[i].input);
    //     if (txs[i].decoded)
    //       txs[i].decoded.params = decodeData(txs[i].decoded.params);
    //   }
    //   self.setState({
    //     txs: txs,
    //     loading: false,
    //     section: 'blockchain'
    //   });
    // }

    // async updateData(){
    //   this.setState({loading: true});
    //   wtHotelLib.updateHotels();
    //   var hotels = [];
    //   for (var addr in wtHotelLib.hotels) {
    //     hotels.push({value: addr, label: wtHotelLib.hotels[addr].name});
    //   }
    //   this.setState({hotels: hotels, loading: false});
    // }

    async getHotels() {
      this.setState({loading: true});
      let hotels = await this.state.hotelManager.getHotels();
      console.log(hotels);
      let hotelOptions = [];
      if(hotels) {
        Object.entries(hotels).forEach(([key, value]) => {
          hotelOptions.push({ value: key, label: value.name})
        });
      }
      this.setState({hotels: hotels, hotelOptions: hotelOptions, loading: false});
    }

    render() {
      var self = this;

      var actions =
        <div>
          <ul class="list-unstyled" id="actions">
            <li><button class={"btn btn-default btn-action" + (self.state.section == 'hotels' ? " btn-success" : "")} onClick={() => self.setState({section: 'hotels'})}>Hotels</button> </li>
            <li><button class={"btn btn-default btn-action" + (self.state.section == 'hotelBookings' ? " btn-success" : "")} onClick={() => self.loadBookings()}>Hotel Bookings</button> </li>
            <li><button class={"btn btn-default btn-action" + (self.state.section == 'blockchain' ? " btn-success" : "")} onClick={() => self.loadTxs()}>Blockchain Txs</button> </li>
            <li><a href="/wallet" class="btn btn-default btn-action">My Wallet</a> </li>
            <li><button class="btn btn-default btn-link" onClick={() => self.logout()}>Logout</button> </li>
          </ul>
        </div>

      var createHotel =
        <form class="box" onSubmit={(e) => {e.preventDefault(); self.createHotel()}}>
          <h3>
            New Hotel
            <div class="pull-right">
              <input type="button" class="btn btn-link" onClick={() => self.setState({section: 'hotels', hotelSection: 'list'})} value="Back to hotels" />
            </div>
          </h3>
          <div class="form-group">
            <label>Hotel Name</label>
            <input
              type="text"
              autoFocus="true"
              class="form-control"
              value={self.state.newHotelName}
              onChange={(event) => {
                self.setState({ newHotelName: event.target.value, createHotelError: false });
              }}
            />
          </div>
          <div class="form-group">
            <label>Hotel Description</label>
            <input
              type="text"
              class="form-control"
              value={self.state.newHotelDescription}
              onChange={(event) => {
                self.setState({ newHotelDescription: event.target.value, createHotelError: false });
              }}
            />
          </div>
          <div class="form-group">
            <label>Your Wallet Password</label>
            <div class="input-group">
              <input
                type={self.state.showPassword ? "text" : "password"}
                class="form-control"
                defaultValue={self.state.password}
                onChange={(event) => {
                  self.setState({ password: event.target.value, createHotelError: false });
                }}
              />
              <span class="input-group-addon">
                {self.state.showPassword ?
                  <span class="fa fa-eye" onClick={() => self.setState({showPassword: false})}></span>
                :
                  <span class="fa fa-eye-slash" onClick={() => self.setState({showPassword: true})}></span>
                }
              </span>
            </div>
          </div>
          <input type="submit" class="btn btn-primary btn-block" value="Create hotel" />
          {self.state.createHotelError
            ? <p class="bg-danger" style={{padding: "10px", marginTop: "5px"}}>There was an error creating the hotel, is that the correct wallet password?</p>
            : null}
        </form>

      var editHotel =
        <form class="box" onSubmit={(e) => {e.preventDefault(); self.editHotel()}}>
          <h3>
            Edit Hotel
            <div class="pull-right">
              <button type="button" class="btn btn-link" onClick={() => self.setState({section: 'hotels', hotelSection: 'list'})}>Back to hotels</button>
            </div>
          </h3>
          <div class="form-group">
            <label>Choose a hotel</label>
            <Select
              name="Hotels"
              clearable={false}
              options={self.state.hotelOptions}
              value={self.state.hotel.address}
              onChange={ (val) => self.loadHotel(val.value)}
            />
          </div>
          {(self.state.hotel.address != "") ?
          <div>
            <hr></hr>
            {self.state.editHotelError
              ? <p class="bg-danger" style={{padding: "10px", marginTop: "5px"}}>There was an error editing the hotel, is that the correct wallet password?</p>
              : null}
            <div class="form-group">
              <label>Name</label>
              <input
                type="text"
                autoFocus="true"
                class="form-control"
                value={self.state.hotel.name}
                onChange={(event) => {
                  var newEditHotel = self.state.hotel;
                  newEditHotel.name = event.target.value
                  self.setState({ hotel: newEditHotel });
                }}
              />
            </div>
            <div class="form-group">
              <label>Description</label>
              <input
                type="text"
                class="form-control"
                value={self.state.hotel.description}
                onChange={(event) => {
                  var newEditHotel = self.state.hotel;
                  newEditHotel.description = event.target.value
                  self.setState({ hotel: newEditHotel });
                }}
              />
            </div>
            <div class="form-group">
              <label>Address One</label>
              <input
                type="text"
                class="form-control"
                value={self.state.hotel.lineOne}
                onChange={(event) => {
                  var newEditHotel = self.state.hotel;
                  newEditHotel.lineOne = event.target.value
                  self.setState({ hotel: newEditHotel });
                }}
              />
            </div>
            <div class="form-group">
              <label>Address Two</label>
              <input
                type="text"
                class="form-control"
                value={self.state.hotel.lineTwo}
                onChange={(event) => {
                  var newEditHotel = self.state.hotel;
                  newEditHotel.lineTwo = event.target.value
                  self.setState({ hotel: newEditHotel });
                }}
              />
            </div>
            <div class="form-group">
              <label>Zip Code</label>
              <input
                type="text"
                class="form-control"
                value={self.state.hotel.zip}
                onChange={(event) => {
                  var newEditHotel = self.state.hotel;
                  newEditHotel.zip = event.target.value
                  self.setState({ hotel: newEditHotel });
                }}
              />
            </div>
            <div class="form-group">
              <label>Country</label>
              <input
                type="text"
                class="form-control"
                value={self.state.hotel.country}
                onChange={(event) => {
                  var newEditHotel = self.state.hotel;
                  newEditHotel.country = event.target.value
                  self.setState({ hotel: newEditHotel });
                }}
              />
            </div>
            <div class="form-group">
              <label>Timezone</label>
              <input
                type="number"
                min="0"
                max="24"
                step="1"
                class="form-control"
                value={self.state.hotel.timezone}
                onChange={(event) => {
                  var newEditHotel = self.state.hotel;
                  newEditHotel.timezone = event.target.value
                  self.setState({ hotel: newEditHotel });
                }}
              />
            </div>
            <div class="form-group">
              <label>Latitude</label>
              <input
                type="text"
                class="form-control"
                value={self.state.hotel.latitude}
                onChange={(event) => {
                  var newEditHotel = self.state.hotel;
                  newEditHotel.latitude = event.target.value
                  self.setState({ hotel: newEditHotel });
                }}
              />
            </div>
            <div class="form-group">
              <label>Longitude</label>
              <input
                type="text"
                class="form-control"
                value={self.state.hotel.longitude}
                onChange={(event) => {
                  var newEditHotel = self.state.hotel;
                  newEditHotel.longitude = event.target.value
                  self.setState({ hotel: newEditHotel });
                }}
              />
            </div>
            <div class="form-group">
              <label>Your Wallet Password</label>
              <div class="input-group">
                <input
                  type={self.state.showPassword ? "text" : "password"}
                  class="form-control"
                  defaultValue={self.state.password}
                  onChange={(event) => {
                    self.setState({ password: event.target.value, editHotelError: false });
                  }}
                />
                <span class="input-group-addon">
                  {self.state.showPassword ?
                    <span class="fa fa-eye" onClick={() => self.setState({showPassword: false})}></span>
                  :
                    <span class="fa fa-eye-slash" onClick={() => self.setState({showPassword: true})}></span>
                  }
                </span>
              </div>
            </div>
            <button type="submit" class="btn btn-primary btn-block">Update hotel details</button>
            {self.state.editHotelError
              ? <p class="bg-danger" style={{padding: "10px", marginTop: "5px"}}>There was an error editing the hotel, is that the correct wallet password?</p>
              : null}
          </div>
          : null}
        </form>

      var addHotelUnit =
      <div>
          <h3>
            Add Room
            <div class="pull-right">
              <button type="button" class="btn btn-link" onClick={() => self.setState({section: 'hotels', hotelSection: 'list'})}>Back to hotel details</button>
            </div>
          </h3>
          <h4>{self.state.hotel.name}</h4>
          <hr></hr>
          {(self.state.addHotelUnitError)
            ? <p class="bg-danger" style={{padding: "10px", marginTop: "5px"}}>An error occurred adding the hotel room, is that the correct password?</p>
            : null}
            <form class="box" onSubmit={(e) => {e.preventDefault(); self.addUnit()}}>
              <div class="form-group">
                <label>Room Type</label>
                <Select
                  name="Room Types"
                  clearable={false}
                  value={self.state.unitType}
                  autoFocus="true"
                  placeholder="Double Room"
                  options={self.state.unitTypeOptions}
                  onChange={(e) => {
                    self.setState({ unitType: e.value, unitTypeInfo: self.state.hotel.unitTypes[e.value].info });
                  }}
                />
                <button type="button" class="btn btn-link" onClick={() => self.setState({createNewUnitType: true})}>
                  Or create a new room type
                </button>
              </div>
              <div class="form-group">
                <label>Your Wallet Password</label>
                <div class="input-group">
                  <input
                    type={self.state.showPassword ? "text" : "password"}
                    class="form-control"
                    defaultValue={self.state.password}
                    required
                    onChange={(event) => {
                      self.setState({ password: event.target.value, addHotelUnitTypeError: false });
                    }}
                  />
                  <span class="input-group-addon">
                    {self.state.showPassword ?
                      <span class="fa fa-eye" onClick={() => self.setState({showPassword: false})}></span>
                    :
                      <span class="fa fa-eye-slash" onClick={() => self.setState({showPassword: true})}></span>
                    }
                  </span>
                </div>
              </div>
              <button type="submit" class="btn btn-primary btn-block">Add Room</button>
              {(self.state.addHotelUnitError)
                ? <p class="bg-danger" style={{padding: "10px", marginTop: "5px"}}>An error occurred adding the hotel room, is that the correct password?</p>
                : null}
            </form>
          </div>


      var addHotelUnitType =
      <div>
          <h3>
            Add/Edit Room Type
            <div class="pull-right">
              <button type="button" class="btn btn-link" onClick={() => self.setState({section: 'hotels', hotelSection: 'list'})}>Back to hotel details</button>
            </div>
          </h3>
          <h4>{self.state.hotel.name}</h4>
          <hr></hr>
          {(self.state.addHotelUnitTypeError)
            ? <p class="bg-danger" style={{padding: "10px", marginTop: "5px"}}>An error occurred adding the hotel room, is that the correct password?</p>
            : null}
          {self.state.createNewUnitType ?
            <form class="box" onSubmit={(e) => {e.preventDefault(); self.addUnitType()}}>
              <div class="form-group">
                <label>New Room Type</label>
                <input
                  type="text"
                  autoFocus="true"
                  class="form-control"
                  value={self.state.newUnitType.type}
                  onChange={(event) => {
                    var newUnitType = self.state.newUnitType;
                    newUnitType.type = event.target.value
                    self.setState({ newUnitType: newUnitType });
                  }}
                />
                {self.state.unitTypeOptions[0] &&
                <button type="button" class="btn btn-link" onClick={() => self.setState({createNewUnitType: false})}>
                  Or edit an existing room type
                </button>}
              </div>
              <div class="form-group">
                <label>Your Wallet Password</label>
                <div class="input-group">
                  <input
                    type={self.state.showPassword ? "text" : "password"}
                    class="form-control"
                    defaultValue={self.state.password}
                    required
                    onChange={(event) => {
                      self.setState({ password: event.target.value, addHotelUnitTypeError: false });
                    }}
                  />
                  <span class="input-group-addon">
                    {self.state.showPassword ?
                      <span class="fa fa-eye" onClick={() => self.setState({showPassword: false})}></span>
                    :
                      <span class="fa fa-eye-slash" onClick={() => self.setState({showPassword: true})}></span>
                    }
                  </span>
                </div>
              </div>
              <button type="submit" class="btn btn-primary btn-block">Add Room Type</button>
              {(self.state.addHotelUnitTypeError)
                ? <p class="bg-danger" style={{padding: "10px", marginTop: "5px"}}>An error occurred adding the hotel room, is that the correct password?</p>
                : null}
            </form>
          :
            <form class="box" onSubmit={(e) => {e.preventDefault(); self.editUnitType()}}>
            <div class="form-group">
              <label>Room Type</label>
              <Select
                name="Room Types"
                clearable={false}
                value={self.state.unitType}
                autoFocus="true"
                placeholder="Double Room"
                options={self.state.unitTypeOptions}
                onChange={(e) => {
                  self.setState({ unitType: e.value, unitTypeInfo: self.state.hotel.unitTypes[e.value].info, newUnitType: {} });
                }}
              />
              <button type="button" class="btn btn-link" onClick={() => self.setState({createNewUnitType: true})}>
                Or create a new room type
              </button>
            </div>
            <hr></hr>
            {self.state.unitTypeInfo &&
            <div>
            {/* <div class="form-group">
              <label>Room name</label>
              <input
                type="text"
                class="form-control"
                placeholder="Privilege Double Room with Balcony"
                value={self.state.unitTypeInfo.name}
                onChange={(event) => {
                  var newUnitType = self.state.newUnitType;
                  newUnitType.name = event.target.value
                  self.setState({ newUnitType: newUnitType });
                }}
              />
            </div> */}
            <div class="form-group">
              <label>Room description</label>
              <input
                type="text"
                class="form-control"
                placeholder="A fancy and spacious room with the best amenities"
                value={self.state.newUnitType.description || self.state.unitTypeInfo.description || ''}
                onChange={(event) => {
                  var newUnitType = self.state.newUnitType;
                  newUnitType.description = event.target.value
                  self.setState({ newUnitType: newUnitType });
                }}
                required
              />
            </div>
            <div class="form-group">
              <label>Minimum Guests</label>
              <input
                type="number"
                class="form-control"
                required
                value={self.state.newUnitType.minGuests || self.state.unitTypeInfo.minGuests || ''}
                onChange={(event) => {
                  var newUnitType = self.state.newUnitType;
                  newUnitType.minGuests = event.target.value
                  self.setState({ newUnitType: newUnitType });
                }}
              />
            </div>
            <div class="form-group">
              <label>Maximum Guests</label>
              <input
                type="number"
                class="form-control"
                required
                value={self.state.newUnitType.maxGuests || self.state.unitTypeInfo.maxGuests || ''}
                onChange={(event) => {
                  var newUnitType = self.state.newUnitType;
                  newUnitType.maxGuests = event.target.value
                  self.setState({ newUnitType: newUnitType });
                }}
              />
            </div>
            <div class="form-group">
              <label>Price</label>
              <div class="input-group">
                <input
                  type="text"
                  class="form-control"
                  placeholder="Price per night, including taxes"
                  required
                  value={self.state.newUnitType.price || self.state.unitTypeInfo.price || ''}
                  onChange={(event) => {
                    var newUnitType = self.state.newUnitType;
                    newUnitType.price = event.target.value
                    self.setState({ newUnitType: newUnitType });
                  }}
                />
                <div class="input-group-btn">
                  <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    {self.state.newUnitType.currency || 'USD'} <span class="caret"></span>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-right">
                    <li onClick={() => {
                      var newUnitType = self.state.newUnitType;
                      newUnitType.currency = 'USD'
                      self.setState({ newUnitType: newUnitType });
                    }}><a>USD</a></li>
                    <li onClick={() => {
                      var newUnitType = self.state.newUnitType;
                      newUnitType.currency = 'Lif'
                      self.setState({ newUnitType: newUnitType });
                    }}><a>Lif</a></li>
                  </ul>
                </div>
              </div>
            </div>
            </div>}
            <div class="form-group">
              <label>Your Wallet Password</label>
              <div class="input-group">
                <input
                  type={self.state.showPassword ? "text" : "password"}
                  class="form-control"
                  defaultValue={self.state.password}
                  required
                  onChange={(event) => {
                    self.setState({ password: event.target.value, addHotelUnitTypeError: false });
                  }}
                />
                <span class="input-group-addon">
                  {self.state.showPassword ?
                    <span class="fa fa-eye" onClick={() => self.setState({showPassword: false})}></span>
                  :
                    <span class="fa fa-eye-slash" onClick={() => self.setState({showPassword: true})}></span>
                  }
                </span>
              </div>
            </div>
            <button type="submit" class="btn btn-primary btn-block">Update Room Type</button>
            {(self.state.addHotelUnitTypeError)
              ? <p class="bg-danger" style={{padding: "10px", marginTop: "5px"}}>An error occurred adding the hotel room, is that the correct password?</p>
              : null}
                      </form>
          }
          </div>

      var editHotelUnitType =
      <form class="box" onSubmit={(e) => {e.preventDefault(); self.editHotelUnitType()}}>
        <h3>
          Edit Room Type
          <div class="pull-right">
            <button type="button" class="btn btn-link" onClick={() => self.setState({section: 'hotels', hotelSection: 'list'})}>Back to hotels</button>
          </div>
        </h3>
        <h4>{self.state.hotel.name}</h4>
        <hr></hr>
        {(self.state.editHotelUnitTypeError)
          ? <p class="bg-danger" style={{padding: "10px", marginTop: "5px"}}>An error occurred updating the hotel room, is that the correct password?</p>
          : null}
        <div class="form-group">
          <label>Room name</label>
          <input
            type="text"
            class="form-control"
            placeholder="Privilege Double Room with Balcony"
            autoFocus="true"
            required
            value={self.state.editUnit.name}
            onChange={(event) => {
              var editUnit = self.state.editUnit;
              editUnit.name = event.target.value
              self.setState({ editUnit: editUnit });
            }}
          />
        </div>
        <div class="form-group">
          <label>Room description</label>
          <input
            type="text"
            class="form-control"
            placeholder="A fancy and spacious room with the best amenities"
            required
            value={self.state.editUnit.description}
            onChange={(event) => {
              var editUnit = self.state.editUnit;
              editUnit.description = event.target.value
              self.setState({ editUnit: editUnit });
            }}
          />
        </div>
        <div class="form-group">
          <label>Max Guests</label>
          <input
            type="number"
            class="form-control"
            required
            value={self.state.editUnit.maxGuests}
            onChange={(event) => {
              var editUnit = self.state.editUnit;
              editUnit.maxGuests = event.target.value
              self.setState({ editUnit: editUnit });
            }}
          />
        </div>
        <div class="form-group">
          <label>Price</label>
          <div class="input-group">
            <input
              type="text"
              class="form-control"
              required
              value={self.state.editUnit.price}
              onChange={(event) => {
                var editUnit = self.state.editUnit;
                editUnit.price = event.target.value
                self.setState({ editUnit: editUnit });
              }}
            />
            <div class="input-group-btn">
              <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                {self.state.editUnit.currency} <span class="caret"></span>
              </button>
              <ul class="dropdown-menu dropdown-menu-right">
                <li onClick={() => {
                  var editUnit = self.state.editUnit;
                  editUnit.currency = 'USD'
                  self.setState({ editUnit: editUnit });
                }}><a>USD</a></li>
                <li onClick={() => {
                  var editUnit = self.state.editUnit;
                  editUnit.currency = 'Lif'
                  self.setState({ editUnit: editUnit });
                }}><a>Lif</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label>Your Wallet Password</label>
          <div class="input-group">
            <input
              type={self.state.showPassword ? "text" : "password"}
              class="form-control"
              required
              defaultValue={self.state.password}
              onChange={(event) => {
                self.setState({ password: event.target.value, editHotelUnitTypeError: false });
              }}
            />
            <span class="input-group-addon">
              {self.state.showPassword ?
                <span class="fa fa-eye" onClick={() => self.setState({showPassword: false})}></span>
              :
                <span class="fa fa-eye-slash" onClick={() => self.setState({showPassword: true})}></span>
              }
            </span>
          </div>
        </div>
        <button type="submit" class="btn btn-primary btn-block">Update Hotel Room</button>
        {(self.state.editHotelUnitTypeError)
          ? <p class="bg-danger" style={{padding: "10px", marginTop: "5px"}}>An error occurred updating the hotel room, is that the correct password?</p>
          : null}
      </form>


      let editHotelUnitFunctions = [
        {value: 'setUnitActive', label: 'Active'},
        {value: 'setCurrencyCode', label: 'Currency Code'},
        {value: 'setDefaultLifPrice', label: 'Default Lif Price'},
        {value: 'setDefaultPrice', label: 'Default Price'},
        {value: 'setUnitSpecialLifPrice', label: 'Special Lif Price'},
        {value: 'setUnitSpecialPrice', label: 'Special Price'}
      ]

      var editHotelUnit =
      <div>
      {self.state.unit &&
      <form class="box" onSubmit={(e) => {e.preventDefault(); self.editHotelUnit()}}>
        <h3>
          Edit Hotel Room
          <div class="pull-right">
            <button type="button" class="btn btn-link" onClick={() => self.setState({section: 'hotels', hotelSection: 'list'})}>Back to hotels</button>
          </div>
        </h3>
        <h4>{self.state.hotel.name} {self.state.unit.substring(2,6)}</h4>
        <div class="form-group">
          <Select
            name="Edit Parameter"
            clearable={false}
            value={self.state.editHotelUnitFunction}
            autoFocus="true"
            options={editHotelUnitFunctions}
            onChange={(e) => {
              self.setState({ editHotelUnitFunction: e.value });
            }}
          />
        </div>
        <hr></hr>
        {(self.state.editHotelUnitTypeError)
          ? <p class="bg-danger" style={{padding: "10px", marginTop: "5px"}}>An error occurred updating the hotel room, is that the correct password?</p>
          : null}
        {{
          setUnitActive: (
            <div class="form-group">
              <label>Active</label>
              <input
                type="checkbox"
                class="form-control"
                autoFocus="true"
                checked={self.state.unitInfo.active}
                onChange={(event) => {
                  self.setState({unitInfo: Object.assign(self.state.unitInfo, {active: event.target.checked}) });
                }}
              />
            </div>
          ),
          setCurrencyCode: (
            <div></div>
          ),
          setDefaultLifPrice: (
            <div></div>
          ),
          setDefaultPrice: (
            <div></div>
          ),
          setUnitSpecialLifPrice: (
            <div></div>
          ),
          setUnitSpecialPrice: (
            <div></div>
          ),
        }[self.state.editHotelUnitFunction]}
        <div class="form-group">
          <label>Your Wallet Password</label>
          <div class="input-group">
            <input
              type={self.state.showPassword ? "text" : "password"}
              class="form-control"
              required
              defaultValue={self.state.password}
              onChange={(event) => {
                self.setState({ password: event.target.value, editHotelUnitTypeError: false });
              }}
            />
            <span class="input-group-addon">
              {self.state.showPassword ?
                <span class="fa fa-eye" onClick={() => self.setState({showPassword: false})}></span>
              :
                <span class="fa fa-eye-slash" onClick={() => self.setState({showPassword: true})}></span>
              }
            </span>
          </div>
        </div>
        <button type="submit" class="btn btn-primary btn-block">Update Hotel Room</button>
        {(self.state.editHotelUnitTypeError)
          ? <p class="bg-danger" style={{padding: "10px", marginTop: "5px"}}>An error occurred updating the hotel room, is that the correct password?</p>
          : null}
      </form>}
      </div>


      var hotels =
        <div class="box">
          <h3>
            Hotels
            <div class="pull-right">
              <button class="btn btn-primary" onClick={() => self.setState({section: 'hotels', hotelSection: 'new'})}>+ New hotel</button>
            </div>
          </h3>
          <div class="form-group">
            <label>Choose a hotel</label>
            {self.state.hotels ?
              <Select
                name="Hotels"
                clearable={false}
                options={self.state.hotelOptions}
                onChange={ (val) => self.loadHotel(val.value)}
                value={self.state.hotel.address}
              />
            :
              <div>No hotels, click the button on the right to add one.</div>
            }
          </div>
          {self.state.hotel.address != ''
          ? <div>
              <h3>{self.state.hotel.name}</h3>
              <p>{self.state.hotel.description}</p>
              {(self.state.hotel.lineOne != '')
                ? <h4>Address: {self.state.hotel.lineOne}</h4>
                : null
              }
              {(self.state.hotel.zip != '')
                ? <h4>Zip: {self.state.hotel.zip}</h4>
                : null
              }
              {(self.state.hotel.country != '')
                ? <h4>Country: {self.state.hotel.country}</h4>
                : null
              }
              {(self.state.hotel.latitude != '-180.00000' || self.state.hotel.longitude != '-90.00000')
                ? <h4>Location: LAT ({self.state.hotel.latitude}) - LONG ({self.state.hotel.longitude})</h4>
                : null
              }
              <div><button class="btn btn-primary btn-block" onClick={() => self.setState({section: 'hotels', hotelSection: 'edit'})}>Edit hotel details</button></div>

              <hr />

              <h3>
                Rooms
                <div class="pull-right">
                  <button class="btn btn-primary btn-sm"
                          onClick={() => self.setState({section: 'addHotelUnitType'})}>
                    + Room Type
                  </button>
                  <button class="btn btn-primary btn-sm"
                          onClick={() => self.setState({section: 'addHotelUnit'})}>
                    + Hotel Room
                  </button>
                </div>
              </h3>
              <table class="table table-striped table-hover">
                <thead>
                  <tr>
                    <th class="text-center">Type</th>
                    <th class="text-center">ID</th>
                    <th class="text-center">Description</th>
                    <th class="text-center">Guests</th>
                    <th class="text-center">Price</th>
                    <th class="text-center">Active</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(self.state.hotel.units).map(function(unit, i){
                    console.log('unit');
                    console.log(unit[1]);
                    let entryTypeInfo = self.state.hotel.unitTypes[unit[1].unitType].info
                    return (
                      <tr key={'unit'+i} class="pointer" onClick={() => console.log(unit)}>
                        <td class="text-center">{unit[1].unitType}</td>
                        <td class="text-center">{unit[0].substring(2,6)}</td>
                        <td class="shortCell">{entryTypeInfo.description}</td>
                        <td class="text-center">{entryTypeInfo.maxGuests}</td>
                        <td class="text-center">{unit[1].defaultPrice}{unit[1].currencyCode}</td>
                        <td class="text-center">{unit[1].active}</td>
                        <td class="text-center">
                          <button class="btn btn-primary btn-sm"
                                  onClick={() => self.setState({section: 'editHotelUnit', unit: unit[0], unitInfo: unit[1]})}>
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          : null}
        </div>

        var hotelBookings =
          <div class="box">
            <h2>Hotel Bookings</h2>
            <table class="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Hotel Name</th>
                  <th>Room Type</th>
                  <th>Room Name</th>
                  <th>From Day</th>
                  <th>To Day</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {self.state.bookings.map(function(booking, i){
                  return (
                    <tr key={'booking'+i} class="pointer" onClick={() => self.setState({transaction: booking})}>
                      <td>{booking.hotelName}</td>
                      <td>{booking.unitType}</td>
                      <td>{booking.unitName}</td>
                        <td>{wtUserLib.utils.formatDate(parseInt(booking.publicCall.params[2].value))}</td>
                        <td>{wtUserLib.utils.formatDate(parseInt(booking.publicCall.params[2].value)+parseInt(booking.publicCall.params[3].value))}</td>
                      <td>Accepted</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

      var blockchain =
        <div class="box">
          <h2>Transactions</h2>
          <table class="table table-striped table-hover">
            <thead>
              <tr>
                <th style={{width: '30px'}}>Block</th>
                <th>Hash</th>
                <th>From</th>
                <th>To</th>
                <th style={{width: '30px'}}>Value</th>
                <th style={{width: '40px'}}>Gas</th>
                <th style={{width: '50px'}}>Function</th>
              </tr>
            </thead>
            <tbody>
              {self.state.txs.map(function(tx, i){
                return (
                  <tr key={'tx'+i} class="pointer" onClick={() => self.setState({transaction: tx})}>
                    <td style={{width: '30px'}}>{tx.blockNumber}</td>
                    <td class="shortCell">{tx.hash}</td>
                    <td class="shortCell">{tx.from}</td>
                    <td class="shortCell">{tx.to}</td>
                    <td style={{width: '30px'}}>{parseInt(tx.value)}</td>
                    <td style={{width: '40px'}}>{tx.gas}</td>
                    <td style={{width: '50px'}}>{tx.decoded ? tx.decoded.name : 'Common TX'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <hr />
          <div>
            <small>
              <div class="pull-left">
                Winding Tree index address: {self.state.indexAddress}
              </div>
              <div class="pull-right">
                <a onClick={() => self.deployIndex()}>Re-deploy Index</a>
              </div>
            </small>
            <div class="clearfix" />
          </div>
        </div>

      function decodeData(data){
        if (data)
          return(
            <div>
              <h4>Function: {data.name}</h4>
              {data.params.map(function(param, i){
                if (param.decoded){
                  return <h4 key={param.name+i}>{param.name}: <br></br>
                    <div style={{marginLeft: i*10}}>
                      {decodeData(param.decoded)}
                    </div>
                  </h4>;
                } else {
                  return <h4 key={param.name+i}>{param.name}: {param.value}</h4>;
                }
              })}
            </div>
          )
      }

      const modalTransaction =
        <ReactModal
          isOpen={this.state.transaction.hash}
          style={{
            content : {
              top                   : '40%',
              left                  : '50%',
              right                 : 'auto',
              bottom                : 'auto',
              marginRight           : '-50%',
              maxHeight             : '80%',
              transform             : 'translate(-50%, -50%)'
            }
          }}
        >
          <span class="fa fa-2x fa-times pull-right" onClick={() => this.setState({transaction: {}})}></span>
          <h3>Transaction <br></br> <small>{self.state.transaction.hash}</small></h3>
          <h4>From: {self.state.transaction.from}</h4>
          <h4>To: {self.state.transaction.to}</h4>
          <h4>Value: {parseInt(self.state.transaction.value)}</h4>
          <h4>Gas: {self.state.transaction.gas}</h4>
          {decodeData(self.state.transaction.decoded)}
        </ReactModal>

      return(
        <div class={self.state.loading ? "loading" : ""}>
          <div class="row">
            {modalTransaction}
            <div class="col-md-2 text-center">
              {actions}
            </div>
            <div class="col-md-10">
              {self.state.section == 'blockchain' ?
                <div>{blockchain}</div>
              : self.state.section == 'hotels' && self.state.hotelSection == 'edit' ?
                <div>{editHotel}</div>
              : self.state.section == 'hotels' && self.state.hotelSection == 'new' ?
                <div>{createHotel}</div>
              : self.state.section == 'hotels' && self.state.hotelSection == 'list' ?
                <div>{hotels}</div>
              : (self.state.section == 'addHotelUnitType' || self.state.createNewUnitType) ?
                <div>{addHotelUnitType}</div>
              : self.state.section == 'addHotelUnit' ?
                <div>{addHotelUnit}</div>
              : self.state.section == 'editHotelUnitType' ?
                <div>{editHotelUnitType}</div>
              : self.state.section == 'editHotelUnit' ?
                <div>{editHotelUnit}</div>
              : <div>{hotelBookings}</div>}
            </div>
          </div>
        </div>
      )
    }

}
