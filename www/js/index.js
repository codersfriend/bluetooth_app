var app = {
//    macAddress: "54:A5:95:E4:66:01",
    macAddress: "null",  // get your mac address from bluetoothSerial.list
    chars: "",

/*
    Application constructor
 */
    initialize: function() {
        this.bindEvents();
        console.log("Starting SimpleSerial app");
    },
/*
    bind any events that are required on startup to listeners:
*/
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        connectButton.addEventListener('touchend', app.manageConnection, false);
        discoverButton.addEventListener('touchend', app.discoverDevice, false);
    },

    macAddressOnChange: function(event) {
      app.display("Selected MAC address is " + event.value);
      app.macAddress = event.value;
    },

/*
    this runs when the device is ready for user interaction:
*/
    onDeviceReady: function() {
        // check to see if Bluetooth is turned on.
        // this function is called only
        //if isEnabled(), below, returns success:
        var listPorts = function() {
            // list the available BT ports:
            bluetoothSerial.list(
                function(results) {
                    //app.display(JSON.stringify(results));

                    var selMac = document.getElementById("macID");
                    var item;
                    for(item in results) {
                      app.display("ID " + results[item].id + " name " + results[item].name);

                      var option = document.createElement("option");
                      option.text = results[item].name;
                      option.value = results[item].id;
                      selMac.add(option);
                    }
                },

                function(error) {
                    app.display(JSON.stringify(error));
                }
            );
        }

        // if isEnabled returns failure, this function is called:
        var notEnabled = function() {
            app.display("Bluetooth is not enabled.")
        }

         // check if Bluetooth is on:
        bluetoothSerial.isEnabled(
            listPorts,
            notEnabled
        );
    },

    discoverDevice: function() {
      document.getElementById("progressBar").style.visibility = 'visible';

      var select = document.getElementById('macID');
      while(select.options.length > 1) {
        select.remove(1);
      }
      app.clear();
      app.display("Start Searching Bluetooth Device.");

      bluetoothSerial.setDeviceDiscoveredListener(function(device) {
        var selMac = document.getElementById("macID");
        var option = document.createElement("option");
        option.text = device.name;
        option.value = device.id;
        selMac.add(option);

        console.log('Found: '+device.id);
        app.display("Newly Found Device Name [" + device.name + "] ID " + device.id);
      });

      bluetoothSerial.discoverUnpaired(function(devices) {
        devices.forEach(function(device) {
          console.log(device.id);
        })
        app.display("Search Bluetooth Device Successfull.");
        document.getElementById("progressBar").style.visibility = 'hidden';
      }, function(error) {
        console.log("Failed to find any blue tooth device");
        app.display("Failed to find any blue tooth device");
        document.getElementById("progressBar").style.visibility = 'hidden';
      });

    },
/*
    Connects if not connected, and disconnects if connected:
*/
    manageConnection: function() {

        // connect() will get called only if isConnected() (below)
        // returns failure. In other words, if not connected, then connect:
        var connect = function () {
            if(app.macAddress == "null" || app.macAddress == null) {
              app.display("Please select a MAC Address First");
              return;
            }

            document.getElementById("progressBar").style.visibility = 'visible';
            // if not connected, do this:
            // clear the screen and display an attempt to connect
            app.clear();
            app.display("Attempting to connect. " +
                "Make sure the serial port is open on the target device.");
            // attempt to connect:
            bluetoothSerial.connect(
                app.macAddress,  // device to connect to
                app.openPort,    // start listening if you succeed
                app.showError    // show the error if you fail
            );
        };

        // disconnect() will get called only if isConnected() (below)
        // returns success  In other words, if  connected, then disconnect:
        var disconnect = function () {
            app.display("attempting to disconnect");
            // if connected, do this:
            bluetoothSerial.disconnect(
                app.closePort,     // stop listening to the port
                app.showError      // show the error if you fail
            );
        };

        // here's the real action of the manageConnection function:
        bluetoothSerial.isConnected(disconnect, connect);
    },
/*
    subscribes to a Bluetooth serial listener for newline
    and changes the button:
*/
    openPort: function() {
        document.getElementById("progressBar").style.visibility = 'hidden';
        // if you get a good Bluetooth serial connection:
        app.display("Connected to: " + app.macAddress);
        // change the button's name:
        connectButton.innerHTML = "Disconnect";
        // set up a listener to listen for newlines
        // and display any new data that's come in since
        // the last newline:
        bluetoothSerial.subscribe('\n', function (data) {
            app.clear();
            app.display(data);
        });

        bluetoothSerial.write("hello, world",
          function(data){
            app.display("bluetooth write success. " + data);
          },
          function(error){
            app.display("bluetooth write failed. " + error);
          }
        );


    },

/*
    unsubscribes from any Bluetooth serial listener and changes the button:
*/
    closePort: function() {
        // if you get a good Bluetooth serial connection:
        app.display("Disconnected from: " + app.macAddress);
        // change the button's name:
        connectButton.innerHTML = "Connect";
        // unsubscribe from listening:
        bluetoothSerial.unsubscribe(
                function (data) {
                    app.display(data);
                },
                app.showError
        );
    },
/*
    appends @error to the message div:
*/
    showError: function(error) {
        app.display(error);
        document.getElementById("progressBar").style.visibility = 'hidden';
    },

/*
    appends @message to the message div:
*/
    display: function(message) {
        var display = document.getElementById("message"), // the message div
            lineBreak = document.createElement("br"),     // a line break
            label = document.createTextNode(message);     // create the label

        display.appendChild(lineBreak);          // add a line break
        display.appendChild(label);              // add the message node
    },
/*
    clears the message div:
*/
    clear: function() {
        var display = document.getElementById("message");
        display.innerHTML = "";
    }
};      // end of app
