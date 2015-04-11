
// Används inte.... lite försök att leka lite med resize på canvasen....

// Passing Canvas resizeable 
/*angular.module('myApp.directives', []).directive('onresize', function ($window) {
    console.log("Kommer nånsin in här?");
    return function (scope, element) {
        console.log("Inne");
        var w = angular.element($window);
        console.log("HEJ");
        scope.getWindowDimensions = function () {
            return {
                'h': w.height(),
                'w': w.width()
            };
        };
        scope.$watch(scope.getWindowDimensions, function (newValue, oldValue) {
            scope.windowHeight = newValue.h;
            scope.windowWidth = newValue.w;

            scope.style = function () {
                if(newValue.w < 900)
                    return {'width': (newValue.w+(newValue.w/10)-180) + 'px', 'margin-left':-10+'%','margin-right':10+'%'};    
                else
                    return {'width': 900 + 'px'};   
            };

        }, true);

        w.bind('resize', function () {
            console.log("Height: apply");
            scope.$apply();
        });
    }
})*/