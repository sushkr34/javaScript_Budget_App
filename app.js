//budget controller
var budgetController = (function () {

    var Expense = function (id, description, value) { // construction name has captial letters 
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage=-1;
    };

    Expense.prototype.calcPercentage = function(totalIncome){
        if (totalIncome>0 ){
        this.percentage= Math.round((this.value/totalIncome)*100);
        }else{
            this.percentage=-1;
        }
    }
    Expense.prototype.getPercentage= function(){
        return this.percentage;
    }

    var Income = function (id, description, value) { // construction name has captial letters 
        this.id = id;
        this.description = description;
        this.value = value
    }

     var calculateTotal=  function(type){
         var sum=0;
         data.allItems[type].forEach(function(cur){
            sum =sum+cur.value;
         });
         data.totatls[type]= sum;
     }
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totatls: {
            exp: 0,
            inc: 0
        },
        budget:0,
        percentage:-1
    };
    return {
        addItem: function (type, des, val) {
            var newItem, ID;
            //create new id 
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            //create new item 
            if (type === 'exp') {
                newItem = new Expense(ID, des, val)
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }// push in data structure
            data.allItems[type].push(newItem)
            return newItem;
        },
        deleteItem : function(type, id ){

            var ids = data.allItems[type].map(function(current){
                return current.id;
            })
             var index= ids.indexOf(id);
             if ( index !== -1){
                data.allItems[type].splice(index,1);
             }
        },

        calculateBuget:  function(){
            //calculate tottal incom and expense 
            calculateTotal('exp');
            calculateTotal('inc');
            // calulate the budget income- expenses
            data.budget = data.totatls.inc-data.totatls.exp;
            // calculate the percentage 
            if (data.totatls.inc >0){
            data.percentage= Math.round ((data.totatls.exp/data.totatls.inc ) * 100 );
            } else {
                data.percentage= -1;
            }
        },
        calculatePercentage : function(){
            data.allItems.exp.forEach(function(current){
                current.calcPercentage(data.totatls.inc);
           });
        },
        getPercentage: function(){
            var allPercentage =data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            })
            return allPercentage;
        },
        getBudget: function(){
            return {
                budget:data.budget,
                totalInc:data.totatls.inc,
                totalExp : data.totatls.exp,
                percentage:data.percentage
            }
        },
        testing: function () {
            console.log(data)
        }
    }

})();//iffe function (returns object that needs to be public )

//ui controller 
var UIController = (function () {
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel:'.budget__value',
        incomeLabel:'.budget__income--value',
        expensesLabel:'.budget__expenses--value',
        percentageLabel:'.budget__expenses--percentage',
        container:'.container',
        expensePercLabel:'.item__percentage',
        dateLabel:'.budget__title--month'
    }

    var formatNumber=  function ( num,type){
        var numSplit,int,dec,sign;
        num = Math.abs(num);
        num=num.toFixed(2);

        numSplit=num.split('.');
        int=numSplit[0];
        if(int.length>3){
            int= int.substr(0,int.length-3)+','+int.substr(int.length-3,3)
        }
        dec =numSplit[1];
        type === 'exp' ? sign='-' : sign='+';
        return sign+' '+int+'.'+dec;
    };
    
    var nodeListForEach = function(list,callback){
        for (var i=0 ;i<list.length;i++){
            callback(list[i],i)
        }
    }
    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value,// will be inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },
        addListItem: function (obj, type) {
            //create html string with placeholder text
            var html, newHtml, element;

            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = ' <div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === 'exp') {
                element = DOMstrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            //replace the placeholder text with some acual data 
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%',formatNumber(obj.value,type));
            // insert the html into the dom 
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        deleteListItem : function(selectorId){
            var el=  document.getElementById(selectorId)
           el.parentNode.removeChild(el);
        },
        clearFields: function () {
            var fields, fieldsArray;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            fieldsArray = Array.prototype.slice.call(fields);
            fieldsArray.forEach(function (current, index, array) {
                current.value = "";

            });
            fieldsArray[0].focus();
        },
        displayBuget: function(obj){
            var type;
            obj.budget >0 ? type='inc' :type='exp'; 

            document.querySelector(DOMstrings.budgetLabel).textContent=formatNumber(obj.budget,type);
            document.querySelector(DOMstrings.incomeLabel).textContent=obj.totalInc;
            document.querySelector(DOMstrings.expensesLabel).textContent=obj.totalExp;
            if( obj.percentage >0 ){
                document.querySelector(DOMstrings.percentageLabel).textContent=obj.percentage+ '%';

            }else {
                document.querySelector(DOMstrings.percentageLabel).textContent='---';

            }

        },
        displayPercentage: function(percentages){
            var fields= document.querySelectorAll(DOMstrings.expensePercLabel);


            nodeListForEach(fields,function(current,index){
                if (percentages[index]>0){
                current.textContent=percentages[index]+"%"
                }else {
                    current.textContent='---'
                }
            })
        },
        displayMonth:function(){
            var now =new Date();
            var months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
            var year = now.getFullYear();
            var month =months[now.getMonth()];
            document.querySelector(DOMstrings.dateLabel).textContent=month+' ,'+year;

        },

        changedType: function(){
            var fields= document.querySelectorAll(
                DOMstrings.inputType+','+
                DOMstrings.inputDescription+','+
                DOMstrings.inputValue
                );
                nodeListForEach(fields,function (current){
                    current.classList.toggle('red-focus');
                })
                document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
            
        },
        getDOMstrings: function () {
            return DOMstrings;
        }
    };

})();






//global app controller
var controller = (function (budgetCtrl, UICntrl) {

    var setUpEventListner = function () {
        var DOM = UICntrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', cntrlAddItem);
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                cntrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change',UICntrl.changedType)
    };
    var updateBudget = function () {
        //1. calculate the budget 
        budgetCtrl.calculateBuget();
        //2. return the budget
        var budget = budgetCtrl.getBudget();
        //3. display the budget on the ui 
      UICntrl.displayBuget(budget);

    }
    var updatePercentage = function(){
        //1.calc percentage 
        budgetCtrl.calculatePercentage();
        //2/ read percentage from the budget controller 
        var percentages= budgetCtrl.getPercentage();
        //3. update the ui with the new percentage 
        UICntrl.displayPercentage(percentages);
    }
    var cntrlAddItem = function () {
        var input, newItem;
        //1. get filled data
        input = UICntrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            //2. add item to the budget controller 
            newItem = budgetController.addItem(input.type, input.description, input.value)
            //3. add item to the ui 
            UIController.addListItem((newItem), input.type);
            //4.clear fields 
            UIController.clearFields();
            //5. calculate and update budget 
            updateBudget();
            //6. calculate and update percentage 
            updatePercentage();
        }
    };

     var ctrlDeleteItem=  function(event){
        var itemId,splitId,type,id;
        itemId=event.target.parentNode.parentNode.parentNode.parentNode.id;
        console.log(itemId)
        if (itemId){
            splitId=itemId.split('-');
            type=splitId[0];
            id= parseInt(splitId[1]);
            //1. delete item from data structure 
            budgetCtrl.deleteItem(type,id);
            //2. delete the item from ui 
            UICntrl.deleteListItem(itemId);
            //3. update and show the new 
            updateBudget();
            //4. update percentage 
            updatePercentage();
        }
     };

    return {
        init: function () {
            console.log('started');
            UICntrl.displayMonth();
            UICntrl.displayBuget({
                budget:0,
                totalInc:0,
                totalExp:0,
                percentage:-1
            })
            setUpEventListner();

        }
    }

})(budgetController, UIController);

controller.init();