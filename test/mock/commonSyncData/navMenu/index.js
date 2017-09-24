var menu = {
    childsList: [
        require('./tank')
    ]
};

menu.childsList.forEach((child, index) => {
    child.id = index;
    child.childsList.forEach((subChild) => {
        subChild.id = 1;
    });
});

module.exports = menu;
