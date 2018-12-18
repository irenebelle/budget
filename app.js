//BUDGET CONTROLLER
let budgetController = (function () {

    //expense model
    let Expense = function (id, description, value){
        this.id = id;
        this.description=description;
        this.value = value;
        this.percentage = -1;

    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if(totalIncome>0) {
            this.percentage = Math.round((this.value/totalIncome)*100);
        } else {
            this.percentage = -1;
        } 
    }

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    //income model
    const Income = function (id, description, value){
        this.id = id;
        this.description=description;
        this.value = value;

    };

    let calculateTotal = function(type) {
        let sum=0;
        data.allItems[type].forEach(element => {
            sum += element.value;
            
        });
        data.totals[type] = sum;
    }



    
//data scructure
    let data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget:0,
        persentage:-1
    }

    return {
        addItem: function (type, des, val) {
            let newItem, ID;
            
            //Create new id
            if(data.allItems[type].length >0 ) {
                ID = data.allItems[type][data.allItems[type].length-1].id+1;
            } else {
                ID = 0;
            }
           

            //Create new item based on 'inc' or 'exp' type
            if(type === 'exp') {
                newItem =  new Expense(ID, des, val);
            } else if (type === 'inc'){
                newItem =  new Income(ID, des, val);

            }

            //push in into data structure
            data.allItems[type].push(newItem);

            //return a new element
            return newItem;


        },

        deleteItem: function (type, id) {
            let ids, index;
            ids  =  data.allItems[type].map(function(element){
                return element.id;

            });
            index = ids.indexOf(id);
            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }

        },

        calculateBudget: function () {
            calculateTotal('exp');
            calculateTotal('inc');
            data.budget = data.totals.inc - data.totals.exp;
            if(data.totals.inc > 0) {
                data.persentage = Math.round((data.totals.exp/data.totals.inc)*100);

            } else {
                data.persentage = -1;
            }
        },

        calculatePercentage: function() {
            
            data.allItems.exp.forEach(function(element) {
                
                if(data.totals['inc']>0) {
                    element.percentage = Math.round((element.value/data.totals['inc'])*100);
                } else {
                   element.percentage = -1;
                } 
                

                //element.calcPercentage(data.totals['inc']);
            });
        },

        getPercentages: function() {
            let allPercentages = data.allItems.exp.map(element => {
                return element.percentage;
                //return element.getPercentage();
            });
            return allPercentages;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpense: data.totals.exp,
                persentage: data.persentage
            }
        },

        storeData: function() {
            localStorage.setItem('budget', JSON.stringify(data));
        },

        getData: function() {
            let storedData;
            storedData = JSON.parse(localStorage.getItem('budget'));
            if(storedData) {
                data = storedData;
                return storedData;
            } else {
                return data;
            }
           
        },
        testing: function() {
            console.log(data);
        }
    }
    
})();

//UI CONTROLLER
let UIController  = (function() {
    let DOMStrings = {
        inputType : '.add__type',
        inputDescription : '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        persentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'

    }

    let  formatNumber = function (number, type, int, dec) {
        let num, numSplit;

        num = Math.abs(number);
        num = num.toFixed(2);
        numSplit =  num.split('.');
        int = numSplit[0];
        dec = numSplit[1];
        if(int.length>3) {
           int =  int.substr(0, int.length-3) + ',' + int.substr(int.length-3,int.length);
        }

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;


        //return num;

    };

    let nodeListForEach = function(list, callback) {
        for(let i=0; i<list.length; i++) {
            callback(list[i], i);
        }
    };



    return {
        getInput: function () {
            return {
                 type: document.querySelector(DOMStrings.inputType).value,
                 description: document.querySelector(DOMStrings.inputDescription).value,
                 value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },
        addListItem: function(obj, type) {
            let html, element;
            if(type === 'inc') {
                element = DOMStrings.incomeContainer;
                       html = `<div class="item clearfix" id="inc-${obj.id}">
                            <div class="item__description">${obj.description}</div>
                            <div class="right clearfix">
                                <div class="item__value">${formatNumber(obj.value, type)}</div>
                                <div class="item__delete">
                                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                                </div>
                            </div>
                        </div>`;
             } else if (type === 'exp') {
                element = DOMStrings.expenseContainer;

                     html =  `<div class="item clearfix" id="exp-${obj.id}">
                            <div class="item__description">${obj.description}</div>
                            <div class="right clearfix">
                                <div class="item__value">${formatNumber(obj.value, type)}</div>
                                <div class="item__percentage"></div>
                                <div class="item__delete">
                                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                                </div>
                            </div>
                        </div>`;
           }
           document.querySelector(element).insertAdjacentHTML('beforeend', html);

        },

        deleteListItem: function (selectorID) {
            let el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);

        },

        showItems: function (dataArray, type)  {
            for(let i=0; i<dataArray.length; i++) {
                this.addListItem(dataArray[i], type); 
            }
            

        },

        clearFields: function () {
           let fields, filedsArray;
           fields =  document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
           filedsArray = Array.prototype.slice.call(fields);

           filedsArray.forEach(element => {
               element.value = '';
               
           });

           filedsArray[0].focus();


        },

        displayBudget: function (obj) {
            let type;

            obj.budget >= 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalIncome, 'inc');
            document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExpense, 'exp');
          if(obj.persentage>0) {
            document.querySelector(DOMStrings.persentageLabel).textContent = obj.persentage + '%';

          } else {
            document.querySelector(DOMStrings.persentageLabel).textContent = '--';

          }
        },

        displayPercentage: function(percentages) {
            let fields = document.querySelectorAll(DOMStrings.expPercLabel);
            

            nodeListForEach(fields, function(current, index) {
                if(percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '--';
                }
                
            });

        },

        displayMonth: function () {
            let now, year, month;

            now =  new Date();
            year = now.getFullYear();
            month = now.getMonth();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;


        },
        changeType: function() {
            let fields = document.querySelectorAll(
                DOMStrings.inputType + ',' +
                DOMStrings.inputDescription + ',' +
                DOMStrings.inputValue
            );

            nodeListForEach(fields, element => {
                element.classList.toggle('red-focus');
            });

            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');


        },

        getDOMstrings: function () {
            return DOMStrings;

        }
    };

}) ();


//GLOBAL APP CONTROLLER
let controller = (function(budgetCtrl, UICtrl) {

    let setUpEventListeners = function () {

        let DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event){
            if(event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
    
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);

    };



    let updateBudget = function () {
       budgetCtrl.calculateBudget();
       let budget =  budgetCtrl.getBudget();
       UICtrl.displayBudget(budget);
      
    };


    let updatePersentage = function () {
        budgetCtrl.calculatePercentage();
        let percentages = budgetCtrl.getPercentages();
        
        UICtrl.displayPercentage(percentages);
    };
   

    let ctrlAddItem = function () {

        let input, newItem;

        //1.get the field input data
        input = UICtrl.getInput();

        if(input.description!=='' && !isNaN(input.value) && input.value>0) {
            //2. add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //3. add item to UI
            UICtrl.addListItem(newItem, input.type);

            //4. clear fileds
            UICtrl.clearFields();

            //5. calculate an update budget
            updateBudget();

            //6. calculate and update percentage
            updatePersentage();

            budgetCtrl.storeData();

        }

    };

    let ctrlDeleteItem = function(event) {
        let itemId, splitId, type, ID;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemId) {
          
            splitId = itemId.split('-');
            type = splitId[0];
            ID = parseInt(splitId[1]);
            budgetCtrl.deleteItem(type, ID);
            UICtrl.deleteListItem(itemId);
            updateBudget();
            updatePersentage();
            budgetCtrl.storeData();
        }
    };

    return {
        init: function () {
            let data = budgetCtrl.getData();
            let obj;
            if(data) {
                obj = {
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpense: data.totals.exp,
                persentage: data.persentage
                };

                UICtrl.showItems(data.allItems.inc, 'inc');
                UICtrl.showItems(data.allItems.exp, 'exp');
                updatePersentage();

            } else {
                obj = {
                    budget: 0,
                    totalIncome: 0,
                    totalExpense: 0,
                    persentage: -1
            }
        }
            
            UICtrl.displayBudget(obj);
            UICtrl.displayMonth();
            
           setUpEventListeners();

        }
    };

  

}) (budgetController, UIController);

controller.init();