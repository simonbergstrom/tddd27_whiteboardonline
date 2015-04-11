var services = angular.module('myApp.services', []); 

// Passing Canvas data 
services.service('canvasData', function () {
        var property = 'First';

        return {
            getProperty: function () {
                return property;
            },
            setProperty: function(value) {
                property = value;
            }
        };
    });

