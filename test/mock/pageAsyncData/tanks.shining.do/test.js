let a = 1;
module.exports = function(req, res) {
    return {
        url: a++
    }

}