var _ = require("lodash");

var arr = [1, 2, 3, 4, 5]; // splitting 2's

var paginationSample = {
    "1": [0, 9],
    "2": [10, 19],
    "3": [],
};

var pagination = {}; // Key= page No , value = array;

var paginator = _.chunk(arr, 2);

//console.log("Chunk ", paginator);

paginator.map((pageData, i) => {
    var pageNo = i + 1;
    pagination[pageNo] = pageData;
})

function extractPageData(pageNo) {
    return pagination[pageNo.toString()];
}

console.log("Pagination ", pagination);

console.log("DAta" , extractPageData(3));


function scannsdata(barcode){
    wh.then(res =>{
        if($scope.order.isSkWarhouse === false){
            res = res.filter(el => {
                el.areaDoc === $scope.order.asnAreaId;
            })
        }
    })
}